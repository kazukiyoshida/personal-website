# kazuki yoshida - Personal Website

Terminal Noir デザインの個人サイト／エンジニアリングブログ。
Astro + React + Tailwind CSS で構築。

## 技術スタック

- **フレームワーク**: [Astro](https://astro.build/) (静的サイトジェネレーター)
- **UI**: React (インタラクティブな部分のみ Island として使用)
- **スタイリング**: Tailwind CSS + カスタム CSS
- **フォント**: JetBrains Mono / IBM Plex Sans JP
- **カラー**: OKLCH カラースペース、アンバー (#F5A623) アクセント

## プロジェクト構成

```
src/
├── components/
│   ├── Sidebar.astro        # デスクトップ固定サイドバー (Astro)
│   ├── MobileSidebar.tsx     # モバイルヘッダー (React island)
│   └── BlogList.tsx          # ブログ一覧・検索・フィルタ (React island)
├── layouts/
│   └── Layout.astro          # ベースレイアウト (HTML, フォント読み込み)
├── lib/
│   └── blog-data.ts          # ブログ記事データ・タグカラー定義
├── pages/
│   ├── index.astro           # トップページ (ブログ一覧)
│   ├── about.astro           # About ページ
│   └── 404.astro             # 404 ページ
└── styles/
    └── global.css            # グローバル CSS (デザインシステム)
```

## 開発

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動 (http://localhost:4321)
npm run dev

# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

## アーキテクチャ

Astro の **Island Architecture** を採用しています。

- **静的コンポーネント** (Astro): Sidebar、About ページ、404 ページなど、インタラクティビティが不要な部分は Astro コンポーネントとしてビルド時に HTML を生成。JavaScript は送信されません。
- **React Island** (`client:load`): ブログのタグフィルタ・検索、モバイルメニューの開閉など、クライアント側の状態管理が必要な部分のみ React コンポーネントとしてハイドレーションされます。

## ブログ記事の追加

`src/lib/blog-data.ts` の `posts` 配列に新しいエントリを追加してください。

```typescript
{
  id: "your-post-id",
  title: "記事タイトル",
  date: "YYYY/MM/DD",
  tags: ["Tag1", "Tag2"],
  excerpt: "記事の概要",
}
```

新しいタグを使用する場合は、`tagColors` にカラー定義を追加してください。
