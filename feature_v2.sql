-- ============================================================
-- 外免切替 強化 ＋ 課題管理(PDCA) / 自動車学校ロール追加
-- Supabase の SQL Editor で実行（auth_schema.sql 実行後）
-- ============================================================

-- 1) 役割に「自動車学校(school)」を追加
alter table app_users drop constraint if exists app_users_role_check;
alter table app_users add constraint app_users_role_check
  check (role in ('yst','fti','company','self','school'));

-- 2) candidates 参照ポリシーに school（全件閲覧）を追加
drop policy if exists cand_select on candidates;
create policy cand_select on candidates for select using (
      app_role() in ('yst','fti','school')
   or (app_role() = 'self'    and id = app_candidate())
   or (app_role() = 'company' and company_id = app_company())
);
drop policy if exists cand_update on candidates;
create policy cand_update on candidates for update using (
      app_role() in ('yst','fti','school')
   or (app_role() = 'self' and id = app_candidate())
) with check (
      app_role() in ('yst','fti','school')
   or (app_role() = 'self' and id = app_candidate())
);

-- 3) 課題管理テーブル（YST/FTI/自動車学校で共有）
create table if not exists issues (
  id             uuid primary key default gen_random_uuid(),
  step           text,          -- step1 / step2 / step3 / future
  title          text not null,
  content        text,
  impact         text,
  countermeasure text,
  owner          text,          -- YST / FTI / 自動車学校 など
  status         text default '対応中',  -- 新規 / 対応中 / 対応済 / 監視中
  updates        jsonb default '[]'::jsonb, -- 改善ログ [{date,by,note}]
  sort           int default 100,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
alter table issues enable row level security;

drop trigger if exists trg_issues_updated on issues;
create trigger trg_issues_updated before update on issues
  for each row execute function set_updated_at();

-- YST / FTI / 自動車学校 のみ閲覧・編集可
drop policy if exists issues_rw on issues;
create policy issues_rw on issues for all
  using ( app_role() in ('yst','fti','school') )
  with check ( app_role() in ('yst','fti','school') );

-- 4) 報告書の課題を初期登録（重複実行を避けるため一旦クリア）
delete from issues;
insert into issues (step,title,content,impact,countermeasure,owner,status,sort) values
-- STEP① 事前審査
('step1','書類不備（インドネシア警察発行）','免許クラス記載ミスなど現地警察発行書類の誤記が複数件発生','受験不可・やり直しによる時間ロス','FTI経由でフォーマット指示＋2社ダブルチェックで対応','FTI','対応済',11),
('step1','パスポート・書類要件','パスポート発行日により現地免許取得後3ヶ月経過が確認できず不受理となるケース','書類審査通過まで複数回かかるリスク','事前確認フローを強化（発行日と取得日の突合）','FTI',  '対応中',12),
('step1','深視力検査','準中型以上に必須(3回平均誤差20mm以下)。鮫洲は府中より難しい傾向','複数回受験が必要なケースあり','民間施設での事前練習を推奨。実施状況を要管理','自動車学校','監視中',13),
-- STEP② 学科
('step2','出題範囲が広く毎回変動','標識・牽引・雪道・バス優先通行帯など広範囲から毎回異なる出題','特定分野だけの対策では不十分','YST教育チーム授業＋対策アプリ自主学習を推奨','YST','対応中',21),
('step2','1点差での不合格が頻発','44点(合格45点)での不合格が複数名・複数回発生','繰り返し受験による時間・費用ロス','アプリ使用頻度・模擬試験結果の把握を徹底（本アプリで管理）','YST','対応中',22),
('step2','入国前学習管理の不備（最重要）','週1オンライン授業の出席率が低く欠席者の自学状況も不明。知識確認対策も同様の懸念','入国後のスタートが遅れる','入国前学習の出席率・自学・対策アプリを可視化し管理','YST','対応中',23),
-- STEP③ 技能
('step3','逆走（右折後に対向車線へ）','T字路・交差点の右折時に対向車線へ進入。左側通行の意識不足','検定中止（即不合格）','入国前から左側通行・右折手順を習慣化。学校で重点指導','自動車学校','対応中',31),
('step3','坂道発進での後退（最多）','クラッチ操作不十分で車両が後方へ。最多・複数名で繰り返し発生','重い減点〜中止','坂道発進を事前練習に重点組込み。反復練習','自動車学校','対応中',32),
('step3','クランク・S字での脱輪','狭路の内輪差の感覚不足。複数回脱輪のケース','重い減点〜中止','内輪差感覚の事前練習。学校コースで反復','自動車学校','対応中',33),
('step3','速度不足（直線50km/h未達）','直線で指定速度まで加速できず40km/h前後にとどまる','20点減点','直線での加速指導を追加','自動車学校','対応中',34),
('step3','一時停止・安全不確認','停止線での完全停止不足、早発進、目視不足（ミラーのみ）','重い減点〜中止／減点蓄積','停止＋目視動作の型を入国前から習慣化','自動車学校','対応中',35),
-- 今後の最重要課題
('future','試験場混雑の深刻化（府中）','技能試験の予約が取りにくく不合格後の次回まで間隔が空く。在留期限(入国後6ヶ月)で断念ケースも','外免切替を断念するリスク','入国前に仕上げ受験回数を最小化。予約戦略を検討','YST','監視中',41),
('future','入国前育成の徹底（4取り組み）','①日本語授業の出席率向上と可視化 ②対策アプリ活用の管理・報告ルール化 ③左側通行・安全確認の習慣化 ④坂道発進等頻出課題の重点事前練習','入国後開始では手遅れリスク','本アプリで①〜④を継続管理しPDCAで改善','YST/FTI/自動車学校','対応中',42);

-- 5) 本番デモ用：一部候補者の外免データを3STEP構造で充実（任意）
update candidates set license = license || jsonb_build_object(
  'final_result','inprog','s1_doc_status','ok','s1_depth_status','retry','s1_depth_retries',1,
  'written_attempts','[{"date":"2026-05-20","score":"47","result":"pass"}]'::jsonb,
  'skill_attempts','[{"date":"2026-06-10","points":"60","result":"fail","fails":["sakamichi","dasharin"]},{"date":"2026-06-25","points":"66","result":"fail","fails":["sakamichi","ichiji"]}]'::jsonb
) where id='p3';
update candidates set license = license || jsonb_build_object(
  'final_result','inprog','s1_doc_status','ok','s1_doc_defects',1,
  'written_attempts','[{"date":"2025-03-10","score":"43","result":"fail"},{"date":"2025-05-18","score":"44","result":"fail"}]'::jsonb
) where id='p2';
update candidates set license = license || jsonb_build_object(
  'final_result','acquired','s1_doc_status','ok','s1_depth_status','ok',
  'written_attempts','[{"date":"2026-02-20","score":"48","result":"pass"}]'::jsonb,
  'skill_attempts','[{"date":"2026-03-25","points":"75","result":"pass","fails":[]}]'::jsonb
) where id='p5';

-- 6) テスト用「自動車学校」ユーザー対応（Auth は school@ds.test で作成）
insert into app_users(email,role) values ('school@ds.test','school')
  on conflict (email) do update set role=excluded.role, company_id=null, candidate_id=null;
