-- ============================================
-- 完整修复 RLS 策略问题
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- 首先查看当前所有 families 相关的策略
SELECT tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'families';

-- ============================================
-- 删除并重新创建 families 表的所有策略
-- ============================================

-- 删除所有现有策略
DROP POLICY IF EXISTS "Users can view families they belong to" ON public.families;
DROP POLICY IF EXISTS "Users can create families" ON public.families;
DROP POLICY IF EXISTS "Family owners can update family" ON public.families;
DROP POLICY IF EXISTS "Family owners can delete family" ON public.families;

-- 确保 RLS 已启用
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- 重新创建 INSERT 策略 - 已认证用户可以创建家庭
CREATE POLICY "Users can create families" ON public.families
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- 重新创建 SELECT 策略
CREATE POLICY "Users can view families they belong to" ON public.families
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = families.id
        AND family_members.user_id = auth.uid()
    )
    OR created_by = auth.uid()  -- 创建者也可以查看（即使还没添加为成员）
  );

-- 重新创建 UPDATE 策略
CREATE POLICY "Family owners can update family" ON public.families
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = families.id
        AND family_members.user_id = auth.uid()
        AND family_members.role = 'owner'
    )
  );

-- 重新创建 DELETE 策略
CREATE POLICY "Family owners can delete family" ON public.families
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = families.id
        AND family_members.user_id = auth.uid()
        AND family_members.role = 'owner'
    )
  );

-- ============================================
-- 修复 family_members 表的策略
-- ============================================

DROP POLICY IF EXISTS "Users can view members of their families" ON public.family_members;
DROP POLICY IF EXISTS "Family admins can add members" ON public.family_members;
DROP POLICY IF EXISTS "Family owners can update member roles" ON public.family_members;
DROP POLICY IF EXISTS "Members can leave family" ON public.family_members;

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- SELECT 策略
CREATE POLICY "Users can view members of their families" ON public.family_members
  FOR SELECT 
  TO authenticated
  USING (public.is_family_member(family_id));

-- INSERT 策略 - 关键修复：允许创建者添加自己为 owner
CREATE POLICY "Family admins can add members" ON public.family_members
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    public.is_family_admin(family_id)
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

-- UPDATE 策略
CREATE POLICY "Family owners can update member roles" ON public.family_members
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'owner'
    )
  );

-- DELETE 策略
CREATE POLICY "Members can leave family" ON public.family_members
  FOR DELETE 
  TO authenticated
  USING (
    user_id = auth.uid() OR public.is_family_admin(family_id)
  );

-- ============================================
-- 验证策略已创建
-- ============================================
SELECT tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('families', 'family_members')
ORDER BY tablename, policyname;
