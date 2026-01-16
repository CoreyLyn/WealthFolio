-- WealthFolio Family Feature Schema
-- Run this in Supabase SQL Editor AFTER the initial schema.sql

-- ============================================
-- 1. Families table
-- ============================================
CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Family Members table
-- ============================================
CREATE TYPE family_role AS ENUM ('owner', 'admin', 'member');

CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role family_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- ============================================
-- 3. Family Invitations table
-- ============================================
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');

CREATE TABLE IF NOT EXISTS public.family_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status invitation_status NOT NULL DEFAULT 'pending',
  role family_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  responded_at TIMESTAMPTZ
);

-- ============================================
-- 4. Add family_id to existing tables
-- ============================================
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE SET NULL;
ALTER TABLE public.liabilities ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE SET NULL;
ALTER TABLE public.snapshots ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE SET NULL;

-- ============================================
-- 5. Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_family_id ON public.family_invitations(family_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_invitee_email ON public.family_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_family_invitations_invitee_id ON public.family_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_assets_family_id ON public.assets(family_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_family_id ON public.liabilities(family_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_family_id ON public.snapshots(family_id);

-- ============================================
-- 6. Enable RLS
-- ============================================
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. Helper function: Check if user is family member
-- ============================================
CREATE OR REPLACE FUNCTION public.is_family_member(family_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = family_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if user is family admin or owner
CREATE OR REPLACE FUNCTION public.is_family_admin(family_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = family_uuid 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. RLS Policies for families
-- ============================================
CREATE POLICY "Users can view families they belong to" ON public.families
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = families.id
        AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create families" ON public.families
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Family owners can update family" ON public.families
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = families.id
        AND family_members.user_id = auth.uid()
        AND family_members.role = 'owner'
    )
  );

CREATE POLICY "Family owners can delete family" ON public.families
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = families.id
        AND family_members.user_id = auth.uid()
        AND family_members.role = 'owner'
    )
  );

-- ============================================
-- 9. RLS Policies for family_members
-- ============================================
CREATE POLICY "Users can view members of their families" ON public.family_members
  FOR SELECT USING (public.is_family_member(family_id));

CREATE POLICY "Family admins can add members" ON public.family_members
  FOR INSERT WITH CHECK (
    -- 家庭管理员可以添加成员
    public.is_family_admin(family_id)
    -- 或者家庭创建者可以将自己添加为 owner（用于初始创建）
    OR (
      user_id = auth.uid()
      AND role = 'owner'
      AND EXISTS (
        SELECT 1 FROM public.families
        WHERE families.id = family_id
          AND families.created_by = auth.uid()
      )
    )
  );

CREATE POLICY "Family owners can update member roles" ON public.family_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'owner'
    )
  );

CREATE POLICY "Members can leave family" ON public.family_members
  FOR DELETE USING (
    user_id = auth.uid() OR public.is_family_admin(family_id)
  );

-- ============================================
-- 10. RLS Policies for family_invitations
-- ============================================
CREATE POLICY "Invitees can view their invitations" ON public.family_invitations
  FOR SELECT USING (
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR inviter_id = auth.uid()
    OR public.is_family_admin(family_id)
  );

CREATE POLICY "Family admins can create invitations" ON public.family_invitations
  FOR INSERT WITH CHECK (public.is_family_admin(family_id));

CREATE POLICY "Invitees can update invitation status" ON public.family_invitations
  FOR UPDATE USING (
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR inviter_id = auth.uid()
  );

CREATE POLICY "Inviters can cancel invitations" ON public.family_invitations
  FOR DELETE USING (
    inviter_id = auth.uid() OR public.is_family_admin(family_id)
  );

-- ============================================
-- 11. Update existing asset/liability/snapshot policies
-- ============================================
-- Drop old policies first
DROP POLICY IF EXISTS "Users can view own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can insert own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can update own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can delete own assets" ON public.assets;

DROP POLICY IF EXISTS "Users can view own liabilities" ON public.liabilities;
DROP POLICY IF EXISTS "Users can insert own liabilities" ON public.liabilities;
DROP POLICY IF EXISTS "Users can update own liabilities" ON public.liabilities;
DROP POLICY IF EXISTS "Users can delete own liabilities" ON public.liabilities;

DROP POLICY IF EXISTS "Users can view own snapshots" ON public.snapshots;
DROP POLICY IF EXISTS "Users can insert own snapshots" ON public.snapshots;
DROP POLICY IF EXISTS "Users can update own snapshots" ON public.snapshots;
DROP POLICY IF EXISTS "Users can delete own snapshots" ON public.snapshots;

-- New policies: personal OR family data
CREATE POLICY "Users can view assets" ON public.assets
  FOR SELECT USING (
    auth.uid() = user_id
    OR (family_id IS NOT NULL AND public.is_family_member(family_id))
  );

CREATE POLICY "Users can insert assets" ON public.assets
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (family_id IS NULL OR public.is_family_member(family_id))
  );

CREATE POLICY "Users can update assets" ON public.assets
  FOR UPDATE USING (
    auth.uid() = user_id
    OR (family_id IS NOT NULL AND public.is_family_admin(family_id))
  );

CREATE POLICY "Users can delete assets" ON public.assets
  FOR DELETE USING (
    auth.uid() = user_id
    OR (family_id IS NOT NULL AND public.is_family_admin(family_id))
  );

-- Liabilities
CREATE POLICY "Users can view liabilities" ON public.liabilities
  FOR SELECT USING (
    auth.uid() = user_id
    OR (family_id IS NOT NULL AND public.is_family_member(family_id))
  );

CREATE POLICY "Users can insert liabilities" ON public.liabilities
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (family_id IS NULL OR public.is_family_member(family_id))
  );

CREATE POLICY "Users can update liabilities" ON public.liabilities
  FOR UPDATE USING (
    auth.uid() = user_id
    OR (family_id IS NOT NULL AND public.is_family_admin(family_id))
  );

CREATE POLICY "Users can delete liabilities" ON public.liabilities
  FOR DELETE USING (
    auth.uid() = user_id
    OR (family_id IS NOT NULL AND public.is_family_admin(family_id))
  );

-- Snapshots
CREATE POLICY "Users can view snapshots" ON public.snapshots
  FOR SELECT USING (
    auth.uid() = user_id
    OR (family_id IS NOT NULL AND public.is_family_member(family_id))
  );

CREATE POLICY "Users can insert snapshots" ON public.snapshots
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (family_id IS NULL OR public.is_family_member(family_id))
  );

CREATE POLICY "Users can update snapshots" ON public.snapshots
  FOR UPDATE USING (
    auth.uid() = user_id
    OR (family_id IS NOT NULL AND public.is_family_admin(family_id))
  );

CREATE POLICY "Users can delete snapshots" ON public.snapshots
  FOR DELETE USING (
    auth.uid() = user_id
    OR (family_id IS NOT NULL AND public.is_family_admin(family_id))
  );

-- ============================================
-- 12. Updated_at trigger for families
-- ============================================
DROP TRIGGER IF EXISTS update_families_updated_at ON public.families;
CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON public.families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
