# おしゃれして しゅっぱつ！

「おしゃれして しゅっぱつ！」は、2歳後半〜3歳前後の子どもがタップだけで遊べる、触る絵本風の着せ替えごっこWebゲームです。

キャラクターに、ぼうし・ふく・くつを選んであげて、最後に「しゅっぱーつ！」を押すと、選んだ組み合わせに合わせたごほうび演出が始まります。

## 対象年齢

- 2歳後半〜3歳前後
- 文字が読める前でも、絵・色・反応で遊べる想定
- やさしい反応だけで進むごっこ遊び

## 主な遊び方

1. 画面上部の「きょうは こうえん！」などのおでかけ先を見る
2. おでかけ先カードをタップして、こうえん・あめのひ・ねんねを切り替える
3. 下の選択パネルで、ぼうしを3つの大きなサムネイルから選ぶ
4. 「つぎ」を押して、ふく・くつを順番に選ぶ
5. しゅっぱつ前の確認で、選んだ3つの小さなアイコンを見る
6. 「しゅっぱーつ！」をタップする
7. 選んだ頭・体・足に合うごほうび画像を見る
8. 「もういっかい」で最初のぼうし選びに戻る

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
npm run pwa
npm run build
```

- `npm run dev`: 開発サーバーを起動します
- `npm run assets`: `public/assets/` 配下の SVG 一式を再生成します
- `npm run pwa`: Android/iPhone向けのPNGアイコンと共通QRを生成します
- `npm run build`: TypeScriptの型確認と本番用ビルドを実行します
- `npm run preview`: ビルド結果をローカルで確認します

## 画像アセット

着せ替えと背景は `public/assets/` 配下の PNG / SVG を `img` レイヤーとして重ねています。各パスは `src/data.ts` から `public/assets/` 配下の相対パスで参照します。

現在のアプリ初期表示は、Codex の `$imagegen` で生成した PNG 素材を `public/assets/generated/` から読み込みます。既存 SVG は削除せず、バックアップ・座標設計・フォールバック資料として残しています。

```text
public/assets/generated/
  _smoke/smoke-test.png
  character/character-base.png
  outfits/outfit-everyday.png
  outfits/outfit-park.png
  outfits/outfit-rain.png
  outfits/outfit-sleep.png
  hats/hat-none.png
  hats/hat-park.png
  hats/hat-rain.png
  hats/hat-sleep.png
  shoes/shoes-normal.png
  shoes/shoes-sneakers.png
  shoes/shoes-rain-boots.png
  shoes/shoes-fluffy-socks.png
  items/item-none.png
  items/item-backpack.png
  items/item-umbrella.png
  items/item-plushie.png
  backgrounds/background-park.png
  backgrounds/background-rain.png
  backgrounds/background-sleep.png
  effects/effect-sparkle.png
  effects/effect-hearts.png
  effects/effect-stars.png
  parts/
    heads/head-park.png
    heads/head-rain.png
    heads/head-sleep.png
    bodies/body-park.png
    bodies/body-rain.png
    bodies/body-sleep.png
    feet/feet-park.png
    feet/feet-rain.png
    feet/feet-sleep.png
  reward/
    reward-h{headTheme}-b{bodyTheme}-f{feetTheme}.png
```

生成 PNG は完全オリジナルの幼児向け玩具風イラストとして作成しています。既存キャラクター、市販人形、公式ロゴ、商品名、ブランドに似せた造形は使いません。アプリ内にも既存キャラクター名・商品名・ロゴは出しません。

現行の着せ替え表示は、`generated/fullbody/` の全身PNGを直接表示する方式から、`generated/reward/` にある27パターンの完成済みPNGを1枚絵として表示する方式へ変更しています。通常画面・出発後ともに、選択された頭・体・足のテーマに応じた `reward-h{headTheme}-b{bodyTheme}-f{feetTheme}.png` を表示します。3ブロック合成（heads / bodies / feet を別々に重ねる方式）は、独立生成された部位画像どうしの首・腰・足元の接続点が画像座標系で揃わず幼児向けに不自然になったため採用していません。出発後は通常画面と同じ画像のまま、CSSアニメーション（park は `walkPark`、rain は `rainJump`、sleep は `sleepSway`）と前面オーバーレイ（紙吹雪）を重ねて差別化します。`generated/parts/` の頭・体・足の部位画像9枚は、当初の3ブロック合成方式の素材として保持していますが、現在の表示には使っていません。

`public/assets/generated/parts/` は次の3系統です。

```text
public/assets/generated/parts/
  heads/
    head-park.png
    head-rain.png
    head-sleep.png
  bodies/
    body-park.png
    body-rain.png
    body-sleep.png
  feet/
    feet-park.png
    feet-rain.png
    feet-sleep.png
```

`public/assets/generated/reward/` は、頭・体・足のテーマ名をファイル名に含めます。

```text
public/assets/generated/reward/
  reward-hpark-bpark-fpark.png
  ...
  reward-hsleep-bsleep-fsleep.png
```

持ち物は既存データと画像を保持していますが、今回の通常表示・手順・ごほうび画像の対象は、ぼうし・ふく・くつの3カテゴリです。既存の `generated/fullbody/`、`generated/hats/`、`generated/outfits/`、`generated/shoes/`、`generated/items/`、およびSVG素材は、フォールバック資料・座標設計資料として残しています。

幼児向け UI 方針:

- タップ対象を大きく、選択肢は3つずつに絞る
- 色と形で分かるサムネイルを使う
- 反応は短く、やさしく、強い点滅を避ける
- 顔と表情が常に見えるように、帽子・持ち物は顔安全領域を避ける

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

#### お人形風ビジュアル要素

generator はベタ塗りの CSS 図形感を弱めるために、次のお人形寄りのディテールを追加しています。`docs/art_reference/kawaii_character_sheet.png` は雰囲気の参考用で、アプリには含めません。市販人形や公式キャラクターと誤認される造形は禁止です。

- 大きめの目と二重ハイライト、控えめなまつげ、口元のピンク (`character/face.svg`)
- 髪のリボン、サイドの後れ毛、髪色のシャインライン (`character/base.svg`)
- 帽子の蝶結びリボンと小さなハート飾り (`hats/`)
- 服のフリル・レース・蝶結び・小さな花あしらい (`clothes/`)
- 靴のリボン・てんとう虫風スポット・ふんわりラッフル (`shoes/`)
- リュック / かさのチャーム、ぬいぐるみの頭リボンと頬の赤み (`items/`)
- 背景の花畑・うす雲・虹・ベッド枕・ナイトランプ (`backgrounds/`)
- オーバーレイの星・ハート・"Z" などのソフト演出 (`overlays/`)

#### 安全領域 assert

generator は各 SVG に `data-draw-bounds` を付け、書き出し前に下記をチェックします。違反したら `face safe zone violated: <id>` で停止します。

- ぼうし: 描画下端 y ≤ 240
- ふく: 描画上端 y ≥ 380
- くつ: 描画上端 y ≥ 690
- もちもの: 顔正面矩形 (`x = 370〜430`, `y = 200〜340`) と交差しない
- viewBox は `0 0 800 1000` 固定

### AI 画像素材で差し替える

現在は `src/data.ts` の通常アセットパスを `generated/...png` に切り替えているため、初期表示は `public/assets/generated/` の AI 生成 PNG を使います。

追加実験として1カテゴリだけ差し替える場合は、`src/overrideAssets/<category>/<id>.png` または `.webp` を置くと、同じキーの SVG 表示に使われます。例: `src/overrideAssets/hats/yellow_hat.png` は `hats/yellow_hat.svg` の表示に使われます。

```text
src/overrideAssets/
  README.md
  hats/.gitkeep
  clothes/.gitkeep
  shoes/.gitkeep
  items/.gitkeep
  backgrounds/.gitkeep
  overlays/.gitkeep
```

配置例:

- `src/overrideAssets/hats/yellow_hat.png` → `public/assets/hats/yellow_hat.svg`
- `src/overrideAssets/clothes/pajamas.webp` → `public/assets/clothes/pajamas.svg`

推奨仕様:

- サイズは `800x1000 px`
- 透過 PNG または WebP
- キャラクターの足中心を `(400, 800)` に合わせる
- 顔安全領域を守る
- 帽子・服・靴・持ち物は既存SVGと同じ座標系に合わせる
- 背景・オーバーレイは `800x1000 px` の画角に合わせる

AI画像は開発時に準備し、実行時は外部APIなしの静的アプリとして動かします。追加実験で未生成カテゴリを扱う場合は、SVG基準素材をフォールバックとして表示できます。

採用チェック:

- 顔と表情が見える
- アイテムの形が幼児に分かる
- 背景透過が自然
- スマホ縦・タブレット横で見える
- 光や動きがやさしい

### AI 画像生成プロンプト雛形

実際の画像生成は開発時の制作工程で行い、アプリ実行時は静的ファイルだけで動きます。下記は基準SVGと同じ座標系へ合わせるための雛形です。

帽子用:

```text
Create a toddler-friendly dress-up hat asset for a static web game. 800x1000 px, transparent background, soft rounded shape, gentle colors, centered in the same coordinate system as the reference SVG. Keep the lower edge at y <= 240, leave the face safe area clear, align with the child character head, clean edges, simple readable silhouette.
```

服用:

```text
Create a toddler-friendly outfit layer for a static dress-up web game. 800x1000 px, transparent background, soft fabric texture, simple readable shape, aligned to the reference SVG coordinate system. Clothing starts around y >= 380, feet center remains at (400, 800), face safe area remains clear, gentle colors, clean alpha edges.
```

靴用:

```text
Create a pair of toddler-friendly shoes for a static dress-up web game. 800x1000 px, transparent background, simple rounded shoes, aligned to the reference SVG coordinate system. Place shoes around y >= 690, feet center at (400, 800), soft colors, clear silhouette, clean alpha edges.
```

持ち物用:

```text
Create a toddler-friendly handheld item layer for a static dress-up web game. 800x1000 px, transparent background, simple readable object, aligned to the reference SVG coordinate system. Place the item beside the body or above the head, keep the face safe area clear, soft colors, clean alpha edges, easy for a two-year-old child to recognize.
```

背景用:

```text
Create a gentle background for a toddler dress-up outing scene. 800x1000 px, full-frame background, soft colors, calm composition, clear ground area around y = 800 for the character feet, simple visual shapes, readable on phone portrait and tablet landscape, gentle lighting.
```

オーバーレイ用:

```text
Create a gentle transparent overlay for a toddler web game reward scene. 800x1000 px, transparent background, sparse decorations, soft movement-ready shapes, clear center face area, calm colors, readable on phone portrait and tablet landscape, clean alpha edges.
```

### 画像レイヤー方式と顔の保護

背景・オーバーレイ・キャラクターはすべて `<img>` レイヤーで表示します。`LayerImage` と各サムネイルは `resolveAsset(asset)` を通して、PNG / WebP / SVG を同じレイヤー方式で扱います。

通常画面のキャラクターは、全身PNGではなく完成済み部位パーツを下から順に重ねます。

1. 背景 (`generated/backgrounds/`)
2. 相性で増える後ろのオーバーレイ (`overlays/...`)
3. 足パーツ (`generated/parts/feet/`)
4. 体パーツ (`generated/parts/bodies/`)
5. 頭パーツ (`generated/parts/heads/`)
6. ごほうび時の薄い前面オーバーレイ (紙吹雪など)

「しゅっぱーつ！」後は、通常画面の3ブロック合成を使わず、選択中の `partTheme` から `reward-h{headTheme}-b{bodyTheme}-f{feetTheme}.png` を組み立てて、完成済みreward画像1枚を表示します。

部位PNGとreward PNGは、帽子が目や口を隠さず、顔・服・足元が見えるように作っています。`character/base.svg` と `character/face.svg`、`generated/character/character-base.png`、旧個別レイヤーPNGは、SVG版や旧方式のバックアップ・フォールバック資料として残しています。

新しい SVG または PNG を追加するときは、下記の安全領域を空けてください。

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

公開URLは以下を想定しています。

```text
https://fzr400r3en2-sys.github.io/osyare_syuppatsu/
```

`main` に push すると `.github/workflows/deploy-pages.yml` が `npm run build` を実行し、`dist` をGitHub Pagesへ公開します。QRコードは `public/install-qr.svg` と `docs/install-qr.svg` に生成されます。

```bash
npm run pwa
```

## ホーム画面保存の想定

iPhone / Androidでホーム画面に保存して遊びやすいように、以下を入れています。

- スマホ向けviewport
- `theme-color`
- `apple-mobile-web-app-capable`
- `mobile-web-app-capable`
- `manifest.webmanifest`
- 192px / 512px / maskable PNGアイコン
- Service Worker (`public/sw.js`)
- Android Chrome のインストール候補が出たときの「入れる」ボタン

iPhone はSafariでQRを開き、共有メニューからホーム画面に追加します。Android はChromeでQRを開き、画面右上またはアプリ内の「入れる」ボタンからインストールします。

## 初回MVPで実装している内容

- おでかけ先: こうえん、あめのひ、ねんね
- 着せ替えカテゴリ: ぼうし、ふく、くつ
- 各カテゴリ3種類の表示アイテム
- ぼうし・ふく・くつを一部位ずつ選ぶ、タップだけのシンプル操作
- 頭・体・足の3ブロック生成PNGレイヤー構造
- 選択中の3テーマに対応する27パターンのreward画像表示
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
