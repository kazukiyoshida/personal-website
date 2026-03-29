# personal-website セットアップ作業ログ

## 目標

- `nuxt-blog`（既存の Nuxt + Vue.js 製個人サイト）のコンテンツを、`personal-website`（Manus が生成した React + Vite 製サイト）に移植する
- まずは `personal-website` をブラウザで表示できる状態にする

---

## 1. プロジェクト構造の確認

`personal-website` は Manus が生成したものだが、**ソースファイルのみ**がフラットにルート直下に配置されており、ビルドに必要な設定ファイルが一切なかった。

### 存在したファイル

```
personal-website/
├── App.tsx
├── Home.tsx
├── About.tsx
├── Sidebar.tsx
├── MobileSidebar.tsx
├── PostItem.tsx
├── blog-data.ts
├── index.html
├── index.css
├── ideas.md              # デザインアイデアメモ
└── *.webp                # 画像アセット
```

### 不足していたもの

- `package.json` — 依存関係の定義なし
- `tsconfig.json` — TypeScript 設定なし
- `vite.config.ts` — Vite 設定なし
- `tailwind.config.js` / `postcss.config.js` — Tailwind CSS 設定なし
- `src/` ディレクトリ構造 — `index.html` が `<script src="/src/main.tsx">` を参照しているが `src/` が存在しない
- `src/main.tsx` — エントリーポイント
- 共通コンポーネント — `ErrorBoundary`, `ThemeContext`, `NotFound`, UI ラッパー（`sonner`, `tooltip`）

---

## 2. プロジェクトのスキャフォールディング

### 技術スタック（コードから判明）

| ライブラリ | 用途 |
|---|---|
| React 18 | UI フレームワーク |
| Vite | ビルドツール |
| TypeScript | 型安全性 |
| Tailwind CSS | ユーティリティ CSS |
| framer-motion | アニメーション |
| wouter | ルーティング（軽量） |
| lucide-react | アイコン |
| sonner | トースト通知 |
| @radix-ui/react-tooltip | ツールチップ |

### 作成したファイル

```
personal-website/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx                      # エントリーポイント（新規作成）
    ├── App.tsx                       # ルートからコピー
    ├── index.css                     # Tailwind v3 用に書き換え
    ├── components/
    │   ├── ErrorBoundary.tsx         # 新規作成
    │   ├── Sidebar.tsx               # ルートからコピー
    │   ├── MobileSidebar.tsx         # ルートからコピー
    │   ├── PostItem.tsx              # ルートからコピー
    │   └── ui/
    │       ├── sonner.tsx            # 新規作成（sonner ラッパー）
    │       └── tooltip.tsx           # 新規作成（radix-ui ラッパー）
    ├── contexts/
    │   └── ThemeContext.tsx           # 新規作成
    ├── lib/
    │   └── blog-data.ts              # ルートからコピー
    └── pages/
        ├── Home.tsx                  # ルートからコピー
        ├── About.tsx                 # ルートからコピー
        └── NotFound.tsx              # 新規作成
```

---

## 3. Docker Sandbox 環境で遭遇した問題

### 3-1. esbuild SIGILL（Illegal Instruction）エラー

**症状**: `npm install` 時に esbuild の postinstall スクリプトが SIGILL で失敗

**原因**: Docker Sandbox が ARM64 (aarch64) Linux 環境で、esbuild の Go バイナリが使用する CPU 命令（crypto/FIPS 関連）がエミュレーション環境でサポートされていない

**試したこと**:
1. `npm install --ignore-scripts` → esbuild バイナリの検証をスキップしてインストール成功
2. `@esbuild/linux-arm64` パッケージを明示インストール → バイナリ自体が SIGILL
3. `esbuild-wasm` をインストール → WASM バイナリが壊れていた
4. esbuild のバージョンを下げてテスト:
   - **0.17.19**: 動作する（古い Go で FIPS crypto を使わない）
   - **0.18.20**: 動作する
   - **0.19.12**: 動作する
   - **0.20+**: SIGILL で動作しない

**解決策**: `esbuild: "0.19.12"` を `overrides` で固定

```json
{
  "devDependencies": {
    "esbuild": "0.19.12",
    "vite": "^5.4.11"
  },
  "overrides": {
    "esbuild": "0.19.12"
  }
}
```

### 3-2. esbuild と Vite のバージョン互換性

**症状**: esbuild 0.17.19 + Vite 5 で `Invalid option in context() call: "tsconfigRaw"` エラー

**原因**: Vite 5 が使用する esbuild API オプション（`tsconfigRaw`）が esbuild 0.17 にはまだ存在しない

**解決策**: esbuild を 0.19.12 に上げることで解決

### 3-3. Tailwind CSS v4 → v3 へのダウングレード

**症状**: 元のコードが Tailwind CSS v4 の構文（`@import "tailwindcss"`, `@theme inline`, `@custom-variant`）を使用

**原因**: Tailwind CSS v4 は `@tailwindcss/vite` プラグインを使い、Vite 6+ が必要。Vite 6 は esbuild 0.25+ を要求するが、それが SIGILL で動かない

**解決策**: Tailwind CSS v3 にダウングレードし、CSS を書き換え

- `@import "tailwindcss"` → `@tailwind base; @tailwind components; @tailwind utilities;`
- `@import "tw-animate-css"` → 削除（Tailwind v3 では不要）
- `@theme inline { ... }` → 削除
- `@custom-variant dark (...)` → 削除
- `@apply border-border outline-ring/50` → プレーン CSS に置換
- `@apply bg-background text-foreground` → プレーン CSS に置換
- `@apply cursor-pointer` → プレーン CSS に置換
- `tailwind.config.js` と `postcss.config.js` を新規作成

### 3-4. Playwright MCP — Chrome が見つからない

**症状**: `browserType.launchPersistentContext: Chromium distribution 'chrome' is not found at /opt/google/chrome/chrome`

**原因**: Playwright MCP サーバーが `/opt/google/chrome/chrome` に Chrome を期待するが、Docker Sandbox にはインストールされていない

**解決策**:

1. `npx playwright install chromium` で Chromium をダウンロード（`~/.cache/ms-playwright/chromium-1208/`）
2. シンボリックリンクではなく**ラッパースクリプト**を作成（後述の sandbox 問題のため）

### 3-5. Playwright MCP — Chrome sandbox エラー

**症状**: `Chromium sandboxing failed! No usable sandbox!`

**原因**: Docker コンテナ内では unprivileged user namespaces が無効化されており、Chromium のサンドボックスが機能しない

**試したこと**:
1. `sysctl -w kernel.apparmor_restrict_unprivileged_userns=0` → 効果なし
2. SUID sandbox バイナリを設置して `CHROME_DEVEL_SANDBOX` 環境変数を設定 → 効果なし

**解決策**: `/opt/google/chrome/chrome` にラッパースクリプトを配置して `--no-sandbox` フラグを追加

```bash
#!/bin/bash
exec /home/agent/.cache/ms-playwright/chromium-1208/chrome-linux/chrome --no-sandbox "$@"
```

### 3-6. Playwright MCP — システムライブラリ不足

**症状**: `Host system is missing dependencies to run browsers`

**解決策**: 必要なライブラリを apt でインストール

```bash
sudo apt-get install -y libglib2.0-0t64 libatk1.0-0t64 libatk-bridge2.0-0t64 \
  libdbus-1-3 libcups2t64 libxcb1 libxkbcommon0 libatspi2.0-0t64 libx11-6 \
  libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 libgbm1 \
  libcairo2 libpango-1.0-0 libasound2t64
```

### 3-7. 外部リソースの読み込みエラー（ファイアウォール制限）

**症状**:
- Google Fonts が読み込めず日本語フォントが適用されない
- サイドバー背景画像（CloudFront CDN）が読み込めない

**原因**: Docker Sandbox のファイアウォールが外部ドメインへのアクセスを制限

**対応**: 開発環境限定の問題として許容。実際のデプロイ環境では問題なし

---

## 4. 最終的な動作状態

- `http://localhost:5174/` で Vite dev サーバーが起動
- ホームページ：記事一覧、タグフィルタ、検索が動作
- About ページ：プロフィール、スキル、タイムラインが表示
- サイドバー：プロフィール、SNSリンク、ナビゲーションが動作
- モバイル表示：ハンバーガーメニューが動作

残りのコンソールエラー:
- `ERR_CERT_AUTHORITY_INVALID` — Google Fonts（ファイアウォール制限）
- `ERR_CERT_AUTHORITY_INVALID` — サイドバー背景画像（ファイアウォール制限）

---

## 5. 今後の Docker Sandbox 環境向け Tips まとめ

| 問題 | 回避策 |
|---|---|
| esbuild SIGILL | esbuild 0.19.12 以下を `overrides` で固定 |
| Vite 6 が動かない | Vite 5 にダウングレード |
| Tailwind CSS v4 が使えない | v3 にダウングレードして CSS 構文を書き換え |
| Playwright Chrome が見つからない | `npx playwright install chromium` 後にラッパースクリプト作成 |
| Chrome sandbox エラー | ラッパースクリプトで `--no-sandbox` を付与 |
| Playwright 用システムライブラリ不足 | `apt-get install` で個別インストール |
| 外部リソース読み込み不可 | ファイアウォール制限。ローカルアセットに置換するか許容 |

---

## 6. ブログ記事の移植（完了）

### 6-1. Astro Content Collections の導入

- `src/content/config.ts` でコンテンツコレクションのスキーマを定義
- スキーマ: `title`, `date`, `tags`, `excerpt`, `draft`, `lang`, `postSlug`
- Shiki (github-dark テーマ) によるコードブロックのシンタックスハイライトを設定

### 6-2. Markdown 記事の移植

- nuxt-blog の 10 記事を `src/content/blog/{slug}/ja.md` に移植
- 各記事に frontmatter（title, date, tags, excerpt, lang, postSlug）を付与
- 画像は `public/images/blog/` にコピーし、Markdown 内のパスを書き換え
- 英語・中国語のプレースホルダー（en.md, zh.md）を各記事に作成（30ファイル = 10記事 × 3言語）
- ドラフト記事（monolith-to-microservices）は `draft: true` で除外

### 6-3. ブログ記事詳細ページの実装

- `src/pages/blog/[slug].astro` で動的ルーティング
- 各言語版の Content を Astro サーバーサイドでレンダリングし、`data-lang` 属性の div に格納
- クライアントサイド JS で localStorage の `lang` 値に基づいて表示言語を切り替え
- `BlogPostHeader.tsx` React コンポーネントでタイトル・日付・タグ・パンくずを表示
- nanostores の言語切り替えに連動（`langchange` カスタムイベント + polling）

### 6-4. Markdown 表示スタイル（Terminal Noir テーマ）

- `global.css` に `.prose` クラスでマークダウン用スタイルを追加
- h2, h3, h4, p, a, strong, ul, ol, li, blockquote, code, pre, img, hr, table をスタイリング
- コードブロック: github-dark テーマ + ボーダー付きラウンド角
- リンク: アンバーカラー + 下線アニメーション
- 引用: アンバーの左ボーダー + 背景色

### 6-5. BlogList の更新

- `blog-data.ts` の `id` を Content Collections の `postSlug` と一致させた
- `BlogList.tsx` のリンクを `<a href="/blog/{post.id}">` に変更

### 6-6. Astro 4.x へのダウングレード

- Astro 5.x は Vite 6 + esbuild 0.25+ が必要だが、sandbox の ARM64 環境で SIGILL
- Astro 4.16.19 + Vite 5.4.21 + esbuild 0.19.12 の組み合わせに変更
- esbuild は esbuild-wasm で代替（ネイティブバイナリが SIGILL するため）

### 6-7. 動作確認

- PC (1280×800): ブログ一覧、記事詳細ともに正常表示
- SP (375×812): モバイルヘッダー、記事一覧、記事詳細ともに正常表示
- Shiki によるコードブロックのシンタックスハイライトが動作

---

## 7. 記事を追加する手順

1. `src/content/blog/{slug}/` ディレクトリを作成
2. `ja.md` を作成し、以下の frontmatter を書く:
   ```yaml
   ---
   title: "記事タイトル"
   date: "YYYY-MM-DD"
   tags: ["Tag1", "Tag2"]
   excerpt: "記事の概要"
   lang: "ja"
   postSlug: "slug-name"
   ---
   ```
3. Markdown 本文を書く
4. 必要に応じて `en.md`, `zh.md` を作成（翻訳版）
5. `src/lib/blog-data.ts` の `posts` 配列に新しい記事のメタデータを追加
6. 画像は `public/images/blog/` に配置

---

## 8. 次のステップ

- [x] `nuxt-blog` のコンテンツ（Markdown 記事）を `personal-website` に移植
- [x] ブログ記事の個別ページ表示機能を実装
- [x] Markdown レンダリング対応
- [ ] 実際の SNS リンクやプロフィール情報の更新
- [ ] デプロイ設定
- [ ] blog-data.ts を廃止して Content Collections から一覧データを自動生成する（将来改善）
