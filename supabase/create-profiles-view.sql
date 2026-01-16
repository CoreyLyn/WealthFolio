-- ============================================
-- 创建 profiles 视图，暴露 auth.users 的基本信息
-- 请在 Supabase SQL Editor 中执行
-- ============================================

-- 1. 创建 profiles 视图
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
  id,
  email,
  created_at
FROM auth.users;

-- 2. 赋予已认证用户查询权限
GRANT SELECT ON public.profiles TO authenticated;

-- 3. 为 profiles 创建 RLS（视图不支持 RLS，所以需要用函数或直接暴露基本信息）
-- 注意：这样所有认证用户都可以看到其他用户的邮箱
-- 如果需要限制，可以创建表并同步数据

-- 4. 验证视图已创建
SELECT * FROM public.profiles LIMIT 3;
