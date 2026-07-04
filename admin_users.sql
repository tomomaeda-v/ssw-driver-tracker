-- ============================================================
-- アカウント管理画面用ポリシー / Policies for in-app account management
-- Supabase の SQL Editor で実行してください（auth_schema.sql 実行後）。
--   YST/FTI の管理者が、アプリ内から app_users（役割・範囲の対応表）を
--   追加・変更・削除できるようにします。
-- ============================================================

-- 管理者(yst/fti)は app_users を全件 参照・追加・更新・削除できる
drop policy if exists app_users_admin_all on app_users;
create policy app_users_admin_all on app_users
  for all
  using ( public.app_role() in ('yst','fti') )
  with check ( public.app_role() in ('yst','fti') );

-- ※ 一般ユーザーが自分の行だけ読める既存ポリシー(app_users_self_read)はそのまま有効です。

-- ============================================================
-- 【重要】メール認証なしで即ログインできるようにする設定（SQLではなく画面操作）
--
--   Supabase Dashboard ▸ Authentication ▸ Sign In / Providers ▸ Email
--   →「Confirm email」を OFF にして Save
--
--   これにより、アプリの「新規登録」タブおよび「アカウント管理」画面で
--   作成したアカウントは、確認メールなしで即ログイン可能になります。
-- ============================================================

-- ※ アカウント管理画面の「削除」は app_users（アクセス権）のみを削除します。
--    認証ユーザー本体の削除は Dashboard ▸ Authentication ▸ Users から行ってください。
