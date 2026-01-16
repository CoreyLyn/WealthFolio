-- ============================================
-- 完整修复 family_invitations 表的 RLS 策略
-- 请在 Supabase SQL Editor 中执行
-- ============================================

-- 1. 确保辅助函数存在
CREATE OR REPLACE FUNCTION public.is_family_member(family_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = family_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- 2. 删除现有策略
DROP POLICY IF EXISTS "Invitees can view their invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Family admins can create invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Invitees can update invitation status" ON public.family_invitations;
DROP POLICY IF EXISTS "Inviters can cancel invitations" ON public.family_invitations;

-- 3. 确保 RLS 已启用
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;

-- 4. 创建 SELECT 策略
-- 注意：使用 auth.jwt() 获取 email 更可靠
CREATE POLICY "Invitees can view their invitations" ON public.family_invitations
  FOR SELECT 
  TO authenticated
  USING (
    invitee_email = auth.jwt() ->> 'email'
    OR inviter_id = auth.uid()
    OR public.is_family_admin(family_id)
  );

-- 5. 创建 INSERT 策略
CREATE POLICY "Family admins can create invitations" ON public.family_invitations
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_family_admin(family_id));

-- 6. 创建 UPDATE 策略
CREATE POLICY "Invitees can update invitation status" ON public.family_invitations
  FOR UPDATE 
  TO authenticated
  USING (
    invitee_email = auth.jwt() ->> 'email'
    OR inviter_id = auth.uid()
  );

-- 7. 创建 DELETE 策略
CREATE POLICY "Inviters can cancel invitations" ON public.family_invitations
  FOR DELETE 
  TO authenticated
  USING (
    inviter_id = auth.uid() OR public.is_family_admin(family_id)
  );

-- 8. 验证策略
SELECT tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'family_invitations'
ORDER BY policyname;
