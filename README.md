# おしゃれして しゅっぱつ！

「おしゃれして しゅっぱつ！」は、2歳後半〜3歳前後の子どもがタップだけで遊べる、触る絵本風の着せ替えごっこWebゲームです。

キャラクターに、ぼうし・ふく・くつ・もちものを選んであげて、最後に「しゅっぱーつ！」を押すと、おでかけ先に合わせた短いごほうび演出が始まります。

## 対象年齢

- 2歳後半〜3歳前後
- 文字が読める前でも、絵・色・反応で遊べる想定
- やさしい反応だけで進むごっこ遊び

## 主な遊び方

1. 画面上部の「きょうは こうえん！」などのおでかけ先を見る
2. おでかけ先カードをタップして、こうえん・あめのひ・ねんねを切り替える
3. 下の選択パネルで、ぼうし・ふく・くつ・もちものをサムネイルから直接選ぶ
4. 着せ替えるたびに、キャラクターが少し動き、短い反応が出る
5. 「しゅっぱーつ！」をタップする
6. 選んだ服装のまま、ごほうび演出を見る
7. 「もういっかい」で着せ替えに戻る

## 起動方法

初回は依存関係をインストールします。

```bash
npm install
```

開発サーバーを起動します。

```bash
npm run dev
```

表示されたURLを、PC・Androidタブレット・iPhoneのブラウザで開いて遊びます。

## 開発用コマンド

```bash
npm install
npm run dev
npm run assets
npm run build
```

- `npm run dev`: 開発サーバーを起動します
- `npm run assets`: `public/assets/` 配下の SVG 一式を再生成します
- `npm run build`: TypeScriptの型確認と本番用ビルドを実行します
- `npm run preview`: ビルド結果をローカルで確認します

## 画像アセット

着せ替えと背景は `public/assets/` 配下の SVG を `img` レイヤーとして重ねています。各パスは `src/data.ts` から `public/assets/` 配下の相対パスで参照します。

```text
public/assets/
  character/base.svg
  character/face.svg
  hats/none.svg
  hats/yellow_hat.svg
  hats/rain_hat.svg
  hats/sleep_cap.svg
  clothes/daily.svg
  clothes/park_hoodie.svg
  clothes/rain_coat.svg
  clothes/pajamas.svg
  shoes/normal.svg
  shoes/sneakers.svg
  shoes/rain_boots.svg
  shoes/fluffy_socks.svg
  items/none.svg
  items/backpack.svg
  items/umbrella.svg
  items/plush.svg
  backgrounds/park.svg
  backgrounds/rain.svg
  backgrounds/sleep.svg
  overlays/park_birds.svg
  overlays/rain_drops.svg
  overlays/sleep_stars.svg
  overlays/confetti.svg
```

### SVG 規約

- すべて `viewBox="0 0 800 1000"` にそろえます
- キャラクターの足の中心を `(400, 800)` に合わせます
- 服・靴・帽子・もちものは、同じ座標系でキャラクターに重なる位置へ描きます
- SVG は単独ファイルにして、インライン色指定だけで完結させます

### 画像生成プログラム

`tools/generate_assets.mjs` は Node ESM だけで動く決定論的な SVG 生成スクリプトです。

```bash
npm run assets
```

実行すると `public/assets/` 配下のキャラクター・装備・背景・オーバーレイ SVG 一式を generator の内容で上書きします。配色、座標、装飾、顔安全領域は `tools/generate_assets.mjs` の JS オブジェクトに集約しています。

SVG への恒久編集は `tools/generate_assets.mjs` 側に反映します。手元で SVG を直接調整した内容も、次回 `npm run assets` では generator の内容になります。

### AI 画像素材で差し替える

`src/overrideAssets/<category>/<id>.png` または `.webp` を置くと、同じキーの SVG 表示がその画像に差し替わります。例: `src/overrideAssets/hats/yellow_hat.png` は `hats/yellow_hat.svg` の代わりに使われます。

- 既存 SVG はそのままで差し替えられます
- 推奨サイズは `800x1000 px` (4:5)、透過 PNG または WebP です
- AI 画像でも、目 `y = 271`、口 `y = 318`、もちものは `cx = 400` 正面を避ける顔安全領域を守ります
- `src/overrideAssets/.gitkeep` は差し替え用ディレクトリを保持するためのファイルです

### 画像レイヤー方式と顔の保護

背景・オーバーレイ・キャラクターはすべて `<img>` レイヤーで表示します。`LayerImage` と各サムネイルは `resolveAsset(asset)` を通して、PNG / WebP / SVG を同じレイヤー方式で扱います。

キャラクターは `<img>` レイヤーを下から順に重ねて作っています。

1. 背景 (`backgrounds/`)
2. 相性で増える後ろのオーバーレイ (`overlays/...`)
3. キャラクター本体 `character/base.svg` (体・手足・髪・頭の輪郭。顔のパーツは持ちません)
4. ふく (`clothes/`)
5. くつ (`shoes/`)
6. ぼうし (`hats/`)
7. もちもの (`items/`)
8. **顔 `character/face.svg` (目・頬・口) — `character-face` の `z-index: 6` で守ります**
9. ごほうび時の前面オーバーレイ (紙吹雪など)

顔は専用レイヤーで最前面に置くため、ぼうしやもちものが顔の上に重なっても目と口は隠れません。それでも見た目が崩れないよう、新しいSVGは下記の安全領域を空けてください。

- 目: `y ≈ 271` (左右 `x = 358 / 442`)
- 頬: `y ≈ 307`
- 口: `y ≈ 318`

各カテゴリの推奨領域:

- ぼうしは最下端 `y ≤ 240` (目より上)
- ふくは最上端 `y ≥ 380` (顎より下)
- くつは `y ≥ 690` (足元のみ)
- もちものは顔正面 `cx = 400` を避け、体の横 (`x < 290` または `x > 510`) や頭の上に配置

### オーバーレイ演出

各アイテムには必要に応じて `worldEffect` と `rewardEffect` を設定します。

- 着せ替え中は、おでかけ先と相性のよい選択が増えると、選んだアイテムの `worldEffect` を背景側に重ねます
- ごほうび中は、選んだアイテムの `worldEffect` を背景側に、`rewardEffect` を前面側に重ねます
- こうえんは鳥、あめのひは雨粒、ねんねは星の SVG overlay で見分けられるようにしています

### アイテム追加手順

1. `public/assets/` の該当カテゴリに SVG を追加します
2. `src/data.ts` の `itemsByCategory` に `asset` を追加します
3. おでかけ先に合わせた演出を付ける場合は `worldEffect` に overlay SVG を指定します
4. ごほうび演出を付ける場合は `rewardEffect` に overlay SVG を指定します
5. 新しいおでかけ先を追加する場合は `destinations` に `bgAsset` と `matchItems` を追加します

## GitHub Pagesで公開する場合のメモ

Viteの `base` は、初回MVPでは `./` にしています。GitHub Pagesでリポジトリのサブパスに公開しても、相対パスで読み込めるようにするためです。

公開する場合は、通常どおり `npm run build` で生成される `dist` をGitHub Pagesに配置します。GitHub Actionsで自動公開する場合も、ビルド成果物は `dist` です。

## ホーム画面保存の想定

iPhone / Androidでホーム画面に保存して遊びやすいように、以下を入れています。

- スマホ向けviewport
- `theme-color`
- `apple-mobile-web-app-capable`
- `mobile-web-app-capable`
- `manifest.webmanifest`
- 簡易SVGアイコン

Service Workerや完全オフライン対応は、今後の追加候補です。

## 初回MVPで実装している内容

- おでかけ先: こうえん、あめのひ、ねんね
- 着せ替えカテゴリ: ぼうし、ふく、くつ、もちもの
- 各カテゴリ4種類のアイテム
- 各カテゴリの4つのサムネイルから直接選ぶ、タップだけのシンプル操作
- 顔を最前面に守るレイヤー構造
- おでかけ先とアイテムの相性による追加演出
- 「しゅっぱーつ！」後のごほうび演出
- Web Audio APIによる簡単な効果音
- 音ON/しずか、リセット、おでかけ先カード切り替え
- スマホ縦画面とタブレット横画面を意識したレスポンシブCSS

## 今後追加すると良さそうな要素

- おでかけ先の追加
- アイテムの追加
- キャラクターの表情パターン追加
- ごほうび演出の種類追加
- 親が選べる音量調整
- Service Workerによる完全オフライン対応

## 注意事項

- 幼児向けの静的Webアプリとして完結しています
- 音は端末やブラウザ設定に合わせて再生されます
- 音が鳴る前でも、画面の反応だけで遊べます
