-- ============================================================
-- 認証 ＋ 役割別アクセス制御 (RLS) / Auth & Row Level Security
-- Supabase の SQL Editor で実行してください（schema.sql 実行後）。
--   YST/FTI = 全件 / 企業 = 自社の内定者のみ / 本人 = 自分のみ
-- ============================================================

-- 1) ユーザー対応表: 認証メール → 役割・範囲
create table if not exists app_users (
  email        text primary key,
  role         text not null check (role in ('yst','fti','company','self')),
  company_id   text references companies(id),
  candidate_id text references candidates(id),
  note         text
);
alter table app_users enable row level security;

-- 自分の行だけ読める（フロントでの役割判定に使用）
drop policy if exists app_users_self_read on app_users;
create policy app_users_self_read on app_users
  for select using (email = auth.email());

-- 2) 現在ユーザーの役割・範囲を返すヘルパ（RLS再帰回避のため SECURITY DEFINER）
create or replace function public.app_role() returns text
  language sql stable security definer set search_path = public as
$$ select role from app_users where email = auth.email() limit 1 $$;

create or replace function public.app_company() returns text
  language sql stable security definer set search_path = public as
$$ select company_id from app_users where email = auth.email() limit 1 $$;

create or replace function public.app_candidate() returns text
  language sql stable security definer set search_path = public as
$$ select candidate_id from app_users where email = auth.email() limit 1 $$;

-- 3) 旧・全開放ポリシーを削除（簡易設定の解除）
drop policy if exists anon_all_companies  on companies;
drop policy if exists anon_all_candidates on candidates;

-- 4) candidates: 役割別ポリシー
drop policy if exists cand_select on candidates;
create policy cand_select on candidates for select using (
      app_role() in ('yst','fti')
   or (app_role() = 'self'    and id = app_candidate())
   or (app_role() = 'company' and company_id = app_company())
);

drop policy if exists cand_update on candidates;
create policy cand_update on candidates for update using (
      app_role() in ('yst','fti')
   or (app_role() = 'self' and id = app_candidate())
) with check (
      app_role() in ('yst','fti')
   or (app_role() = 'self' and id = app_candidate())
);

drop policy if exists cand_insert on candidates;
create policy cand_insert on candidates for insert
  with check ( app_role() in ('yst','fti') );

drop policy if exists cand_delete on candidates;
create policy cand_delete on candidates for delete
  using ( app_role() in ('yst','fti') );

-- 5) companies: ログイン済みなら社名を参照可（表示用）。編集は管理者のみ。
drop policy if exists comp_select on companies;
create policy comp_select on companies for select
  using ( app_role() is not null );

drop policy if exists comp_write on companies;
create policy comp_write on companies for all
  using ( app_role() in ('yst','fti') )
  with check ( app_role() in ('yst','fti') );

-- ============================================================
-- 6) ユーザー登録のしかた（メール/コードに置き換えて使用）
--    ※認証アカウント本体は Supabase の Authentication 画面で作成します。
--      ここでは「メール → 役割・範囲」の対応だけを登録します。
--
--   ・管理者(YST):   insert into app_users(email,role) values ('admin@example.com','yst');
--   ・管理者(FTI):   insert into app_users(email,role) values ('fti@example.com','fti');
--   ・企業:          insert into app_users(email,role,company_id) values ('hr@tokyo-log.co.jp','company','c1');
--   ・本人(コード):  本人のログインコードを <コード>@ssw-code.local というメールとして
--                    Authentication 画面で作成し（Auto Confirm を有効化）、対応を登録:
--                    insert into app_users(email,role,candidate_id)
--                      values ('agus7h2k9x@ssw-code.local','self','p1');
-- ============================================================
