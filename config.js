/* ============================================================
   設定ファイル / File konfigurasi
   ------------------------------------------------------------
   ★本番運用（共有DB＋ログイン）にする手順:
   1. https://supabase.com で無料プロジェクトを作成
   2. Project Settings > API から URL と anon public key をコピー
   3. 下の SUPABASE_URL と SUPABASE_ANON_KEY に貼り付け
   4. supabase/schema.sql を Supabase の SQL Editor で実行
   これで全ユーザーのデータが同期される本番モードになります。

   ★空のままにすると「デモモード」で動作します（ブラウザ内サンプルデータ）。
      GitHub Pages 公開後、まずデモで動作確認 → 後でSupabaseに接続できます。
   ============================================================ */
window.APP_CONFIG = {
  SUPABASE_URL: "",       // 例: "https://xxxxxxxx.supabase.co"
  SUPABASE_ANON_KEY: "",  // 例: "eyJhbGciOi..."
  ORG_NAME: "株式会社YSタレント"
};
