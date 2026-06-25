-- ============================================================
-- 特定技能ドライバー 進捗管理 / Supabase スキーマ
-- Supabase の SQL Editor に貼り付けて実行してください。
-- (Project > SQL Editor > New query > 全文貼り付け > Run)
-- ============================================================

-- ---------- テーブル ----------
create table if not exists companies (
  id   text primary key,
  name text not null
);

create table if not exists candidates (
  id           text primary key,
  name_ja      text,
  name_id      text,
  company_id   text references companies(id),
  intake_date  date,
  entry_date   date,
  status       text,            -- pre / injp / work
  coe          text,
  visa         text,
  flight       text,
  housing      text,
  jft          jsonb default '{}'::jsonb,   -- 日本語(JFT)
  ssw          jsonb default '{}'::jsonb,   -- 特定技能試験 (課題①: next_exam, attempts[score])
  license      jsonb default '{}'::jsonb,   -- 外免切替 (課題②: app_installed, app_freq, mocks[])
  jp           jsonb default '{}'::jsonb,   -- 日本語学習 (課題③: lessons[attended], self_study[], prep_status)
  updated_at   timestamptz default now()
);

-- 更新時刻を自動更新
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_candidates_updated on candidates;
create trigger trg_candidates_updated before update on candidates
  for each row execute function set_updated_at();

-- ============================================================
-- 行レベルセキュリティ (RLS)
-- ============================================================
alter table companies  enable row level security;
alter table candidates enable row level security;

-- ------------------------------------------------------------
-- 【クイックスタート】内部利用・URL非公開を前提に anon で読み書き許可
--   ※まず動かして確認したい場合はこちら。
-- ------------------------------------------------------------
drop policy if exists anon_all_companies  on companies;
drop policy if exists anon_all_candidates on candidates;
create policy anon_all_companies  on companies  for all using (true) with check (true);
create policy anon_all_candidates on candidates for all using (true) with check (true);

-- ------------------------------------------------------------
-- 【本番推奨】Supabase Auth を使う場合は上の anon ポリシーを削除し、
--   下記のように authenticated のみ許可に変更してください。
--   (フロント側に Supabase Auth ログインを追加する拡張が必要)
--
-- drop policy if exists anon_all_companies  on companies;
-- drop policy if exists anon_all_candidates on candidates;
-- create policy auth_read_companies  on companies  for select using (auth.role() = 'authenticated');
-- create policy auth_rw_candidates   on candidates for all
--   using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
-- ============================================================

-- companies
insert into companies (id,name) values ('c1','東京ロジスティクス株式会社') on conflict (id) do nothing;
insert into companies (id,name) values ('c2','関西運輸サービス株式会社') on conflict (id) do nothing;
insert into companies (id,name) values ('c3','中部物流株式会社') on conflict (id) do nothing;

-- candidates
insert into candidates (id,name_ja,name_id,company_id,intake_date,entry_date,status,coe,visa,flight,housing,jft,ssw,license,jp) values ('p1','アグス・サントソ','Agus Santoso','c1','2025-03-15','2026-02-01','pre','applied','審査中','未手配','手配済','{"acquired":true,"level":"A2","score":"215/250","date":"2024-11-20"}'::jsonb,'{"status":"pass","next_exam":"","attempts":[{"date":"2025-03-10","result":"pass","score":"78/100","note":"一発合格"}]}'::jsonb,'{"application_date":"","written_date":"","skill_date":"","result":"notyet","app_installed":true,"app_freq":4,"app_lastused":"2026-06-20","mocks":[{"date":"2026-06-05","score":7,"total":10},{"date":"2026-06-18","score":9,"total":10}]}'::jsonb,'{"lessons":[{"date":"2026-05-08","attended":true,"reason":""},{"date":"2026-05-15","attended":true,"reason":""},{"date":"2026-05-22","attended":false,"reason":"仕事(残業)"},{"date":"2026-05-29","attended":true,"reason":""},{"date":"2026-06-05","attended":true,"reason":""},{"date":"2026-06-12","attended":true,"reason":""}],"self_study":[{"date":"2026-05-23","minutes":40,"content":"アプリで復習"},{"date":"2026-06-08","minutes":60,"content":"漢字N4"}],"prep_status":"inprog"}'::jsonb) on conflict (id) do nothing;
insert into candidates (id,name_ja,name_id,company_id,intake_date,entry_date,status,coe,visa,flight,housing,jft,ssw,license,jp) values ('p2','デウィ・レスタリ','Dewi Lestari','c1','2025-04-02','2026-03-01','pre','applied','審査中','未手配','未手配','{"acquired":true,"level":"A2","score":"205/250","date":"2024-12-10"}'::jsonb,'{"status":"fail","next_exam":"2026-07-12","attempts":[{"date":"2025-03-10","result":"fail","score":"61/100","note":"あと一歩"},{"date":"2025-05-18","result":"fail","score":"68/100","note":"長文で失点"}]}'::jsonb,'{"application_date":"","written_date":"","skill_date":"","result":"notyet","app_installed":false,"app_freq":0,"app_lastused":"","mocks":[]}'::jsonb,'{"lessons":[{"date":"2026-05-08","attended":false,"reason":"仕事"},{"date":"2026-05-15","attended":false,"reason":"仕事"},{"date":"2026-05-22","attended":true,"reason":""},{"date":"2026-05-29","attended":false,"reason":"体調不良"},{"date":"2026-06-05","attended":false,"reason":"仕事"},{"date":"2026-06-12","attended":true,"reason":""}],"self_study":[],"prep_status":"notyet"}'::jsonb) on conflict (id) do nothing;
insert into candidates (id,name_ja,name_id,company_id,intake_date,entry_date,status,coe,visa,flight,housing,jft,ssw,license,jp) values ('p3','ブディ・ウタモ','Budi Utomo','c2','2025-02-20','2025-12-01','injp','done','特定活動','完了','手配済','{"acquired":true,"level":"A2","score":"230/250","date":"2024-10-05"}'::jsonb,'{"status":"pass","next_exam":"","attempts":[{"date":"2025-03-10","result":"pass","score":"85/100","note":""}]}'::jsonb,'{"application_date":"2026-04-10","written_date":"2026-05-20","skill_date":"2026-06-30","result":"inprog","app_installed":true,"app_freq":5,"app_lastused":"2026-06-22","mocks":[{"date":"2026-05-01","score":6,"total":10},{"date":"2026-05-15","score":8,"total":10},{"date":"2026-06-10","score":9,"total":10}]}'::jsonb,'{"lessons":[{"date":"2026-05-08","attended":true,"reason":""},{"date":"2026-05-15","attended":true,"reason":""},{"date":"2026-05-22","attended":true,"reason":""},{"date":"2026-05-29","attended":true,"reason":""}],"self_study":[{"date":"2026-06-01","minutes":90,"content":"運転ルール用語"}],"prep_status":"inprog"}'::jsonb) on conflict (id) do nothing;
insert into candidates (id,name_ja,name_id,company_id,intake_date,entry_date,status,coe,visa,flight,housing,jft,ssw,license,jp) values ('p4','シティ・ヌルハリザ','Siti Nurhaliza','c2','2025-05-10','2026-04-01','pre','applied','準備中','未手配','未手配','{"acquired":true,"level":"A2","score":"200/250","date":"2025-01-15"}'::jsonb,'{"status":"notyet","next_exam":"2026-08-09","attempts":[]}'::jsonb,'{"application_date":"","written_date":"","skill_date":"","result":"notyet","app_installed":true,"app_freq":1,"app_lastused":"2026-05-30","mocks":[{"date":"2026-05-29","score":5,"total":10}]}'::jsonb,'{"lessons":[{"date":"2026-05-08","attended":true,"reason":""},{"date":"2026-05-15","attended":false,"reason":"仕事"},{"date":"2026-05-22","attended":true,"reason":""},{"date":"2026-05-29","attended":true,"reason":""},{"date":"2026-06-05","attended":true,"reason":""},{"date":"2026-06-12","attended":false,"reason":"家庭の事情"}],"self_study":[{"date":"2026-06-02","minutes":30,"content":"会話練習"}],"prep_status":"inprog"}'::jsonb) on conflict (id) do nothing;
insert into candidates (id,name_ja,name_id,company_id,intake_date,entry_date,status,coe,visa,flight,housing,jft,ssw,license,jp) values ('p5','リョ・ハルトノ','Rio Hartono','c3','2025-01-30','2025-11-01','work','done','特定技能1号','完了','手配済','{"acquired":true,"level":"A2","score":"240/250","date":"2024-09-01"}'::jsonb,'{"status":"pass","next_exam":"","attempts":[{"date":"2025-03-10","result":"pass","score":"90/100","note":""}]}'::jsonb,'{"application_date":"2026-01-15","written_date":"2026-02-20","skill_date":"2026-03-25","result":"done","app_installed":true,"app_freq":3,"app_lastused":"2026-03-20","mocks":[{"date":"2026-02-01","score":8,"total":10},{"date":"2026-02-15","score":9,"total":10}]}'::jsonb,'{"lessons":[{"date":"2026-05-08","attended":true,"reason":""},{"date":"2026-05-15","attended":true,"reason":""}],"self_study":[{"date":"2026-05-20","minutes":45,"content":"業務日本語"}],"prep_status":"done"}'::jsonb) on conflict (id) do nothing;