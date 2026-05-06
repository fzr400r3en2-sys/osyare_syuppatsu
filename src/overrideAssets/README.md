# overrideAssets

AI画像へ段階移行するための差し替え置き場です。アプリ実行時は外部APIなしで、ここに置いた画像をViteビルドへ含めます。

## 置き場所

`public/assets/` のSVGと同じカテゴリ、同じファイル名で配置します。拡張子は `.png` または `.webp` です。

```text
src/overrideAssets/
  hats/yellow_hat.png
  clothes/pajamas.webp
  shoes/rain_boots.png
  items/umbrella.webp
  backgrounds/park.png
  overlays/confetti.webp
```

例:

- `src/overrideAssets/hats/yellow_hat.png` → `public/assets/hats/yellow_hat.svg` の表示に使います
- `src/overrideAssets/clothes/pajamas.webp` → `public/assets/clothes/pajamas.svg` の表示に使います

## 推奨仕様

- サイズ: `800x1000 px`
- 形式: 透過PNG または WebP
- 座標: キャラ足中心を `(400, 800)` に合わせます
- 顔: 目 `y = 271`、口 `y = 318` の安全領域を空けます
- 帽子・服・靴・持ち物: 既存SVGと同じ座標系に合わせます
- 背景・オーバーレイ: `viewBox="0 0 800 1000"` の画角に合わせます

## 制作の流れ

1. `npm run assets` で基準SVGを再生成します
2. 基準SVGを位置合わせの見本にします
3. 開発時にAI画像を作成します
4. このディレクトリへ同じキー名で配置します
5. `npm run build` で静的ファイルとして公開できます

生成前はSVG基準素材のまま表示します。画像が準備できたカテゴリから順に追加します。
