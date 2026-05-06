import type {
  CategoryDefinition,
  CategoryId,
  Destination,
  DressItem,
  SelectedItems,
  SelectionIndexes,
} from "./types";

export const categoryOrder: CategoryDefinition[] = [
  { id: "hat", label: "ぼうし", iconClass: "icon-hat" },
  { id: "clothes", label: "ふく", iconClass: "icon-clothes" },
  { id: "shoes", label: "くつ", iconClass: "icon-shoes" },
];

const parkEffect = "overlays/park_birds.svg";
const rainEffect = "overlays/rain_drops.svg";
const sleepEffect = "overlays/sleep_stars.svg";
const rewardEffect = "overlays/confetti.svg";

export const itemsByCategory: Record<CategoryId, DressItem[]> = {
  hat: [
    {
      id: "none",
      category: "hat",
      name: "そのまま",
      shortName: "そのまま",
      asset: "generated/hats/hat-none.png",
      partTheme: "park",
      partAsset: "generated/parts/heads/head-park.png",
    },
    {
      id: "yellow-hat",
      category: "hat",
      name: "きいろいぼうし",
      shortName: "きいろ",
      asset: "generated/hats/hat-park.png",
      partTheme: "park",
      partAsset: "generated/parts/heads/head-park.png",
      worldEffect: parkEffect,
      rewardEffect,
    },
    {
      id: "rain-hat",
      category: "hat",
      name: "あめのぼうし",
      shortName: "あめ",
      asset: "generated/hats/hat-rain.png",
      partTheme: "rain",
      partAsset: "generated/parts/heads/head-rain.png",
      worldEffect: rainEffect,
      rewardEffect,
    },
    {
      id: "sleep-cap",
      category: "hat",
      name: "ねんねぼうし",
      shortName: "ねんね",
      asset: "generated/hats/hat-sleep.png",
      partTheme: "sleep",
      partAsset: "generated/parts/heads/head-sleep.png",
      worldEffect: sleepEffect,
      rewardEffect,
    },
  ],
  clothes: [
    {
      id: "daily",
      category: "clothes",
      name: "ふだんぎ",
      shortName: "ふだんぎ",
      asset: "generated/outfits/outfit-everyday.png",
      partTheme: "park",
      partAsset: "generated/parts/bodies/body-park.png",
      fullbodyAsset: "generated/fullbody/fullbody-everyday.png",
    },
    {
      id: "park-hoodie",
      category: "clothes",
      name: "こうえんパーカー",
      shortName: "パーカー",
      asset: "generated/outfits/outfit-park.png",
      partTheme: "park",
      partAsset: "generated/parts/bodies/body-park.png",
      fullbodyAsset: "generated/fullbody/fullbody-park.png",
      worldEffect: parkEffect,
      rewardEffect,
    },
    {
      id: "rain-coat",
      category: "clothes",
      name: "あめのコート",
      shortName: "コート",
      asset: "generated/outfits/outfit-rain.png",
      partTheme: "rain",
      partAsset: "generated/parts/bodies/body-rain.png",
      fullbodyAsset: "generated/fullbody/fullbody-rain.png",
      worldEffect: rainEffect,
      rewardEffect,
    },
    {
      id: "pajamas",
      category: "clothes",
      name: "パジャマ",
      shortName: "パジャマ",
      asset: "generated/outfits/outfit-sleep.png",
      partTheme: "sleep",
      partAsset: "generated/parts/bodies/body-sleep.png",
      fullbodyAsset: "generated/fullbody/fullbody-sleep.png",
      worldEffect: sleepEffect,
      rewardEffect,
    },
  ],
  shoes: [
    {
      id: "normal-shoes",
      category: "shoes",
      name: "ふつうのくつ",
      shortName: "くつ",
      asset: "generated/shoes/shoes-normal.png",
      partTheme: "park",
      partAsset: "generated/parts/feet/feet-park.png",
    },
    {
      id: "sneakers",
      category: "shoes",
      name: "スニーカー",
      shortName: "スニーカー",
      asset: "generated/shoes/shoes-sneakers.png",
      partTheme: "park",
      partAsset: "generated/parts/feet/feet-park.png",
      worldEffect: parkEffect,
      rewardEffect,
    },
    {
      id: "rain-boots",
      category: "shoes",
      name: "ながぐつ",
      shortName: "ながぐつ",
      asset: "generated/shoes/shoes-rain-boots.png",
      partTheme: "rain",
      partAsset: "generated/parts/feet/feet-rain.png",
      worldEffect: rainEffect,
      rewardEffect,
    },
    {
      id: "fluffy-socks",
      category: "shoes",
      name: "もこもこくつした",
      shortName: "もこもこ",
      asset: "generated/shoes/shoes-fluffy-socks.png",
      partTheme: "sleep",
      partAsset: "generated/parts/feet/feet-sleep.png",
      worldEffect: sleepEffect,
      rewardEffect,
    },
  ],
  item: [
    {
      id: "none",
      category: "item",
      name: "そのまま",
      shortName: "そのまま",
      asset: "generated/items/item-none.png",
    },
    {
      id: "backpack",
      category: "item",
      name: "リュック",
      shortName: "リュック",
      asset: "generated/items/item-backpack.png",
      worldEffect: parkEffect,
      rewardEffect,
    },
    {
      id: "umbrella",
      category: "item",
      name: "かさ",
      shortName: "かさ",
      asset: "generated/items/item-umbrella.png",
      worldEffect: rainEffect,
      rewardEffect,
    },
    {
      id: "plush",
      category: "item",
      name: "ぬいぐるみ",
      shortName: "ぬいぐるみ",
      asset: "generated/items/item-plushie.png",
      worldEffect: sleepEffect,
      rewardEffect,
    },
  ],
};

export const destinations: Destination[] = [
  {
    id: "park",
    title: "きょうは こうえん！",
    shortTitle: "こうえん",
    sceneryLabel: "こうえんのけしき",
    bgAsset: "generated/backgrounds/background-park.png",
    rewardLine: "こうえん たのしいね！",
    matchItems: {
      hat: "yellow-hat",
      clothes: "park-hoodie",
      shoes: "sneakers",
      item: "backpack",
    },
    matchLines: {
      one: "こうえん いいかんじ！",
      two: "おはなも にこにこ",
      three: "こうえん たのしいね！",
    },
  },
  {
    id: "rain",
    title: "きょうは あめのひ！",
    shortTitle: "あめのひ",
    sceneryLabel: "あめのひのけしき",
    bgAsset: "generated/backgrounds/background-rain.png",
    rewardLine: "ぴちゃぴちゃ たのしいね！",
    matchItems: {
      hat: "rain-hat",
      clothes: "rain-coat",
      shoes: "rain-boots",
      item: "umbrella",
    },
    matchLines: {
      one: "あめのひ いいね！",
      two: "みずたまり ぴちゃん",
      three: "ぴちゃぴちゃ たのしいね！",
    },
  },
  {
    id: "sleep",
    title: "きょうは ねんね！",
    shortTitle: "ねんね",
    sceneryLabel: "ねんねのけしき",
    bgAsset: "generated/backgrounds/background-sleep.png",
    rewardLine: "おやすみ すやすや",
    matchItems: {
      hat: "sleep-cap",
      clothes: "pajamas",
      shoes: "fluffy-socks",
      item: "plush",
    },
    matchLines: {
      one: "ねんね いいかんじ",
      two: "ほしが きらきら",
      three: "おやすみ すやすや",
    },
  },
];

export const initialSelections: SelectionIndexes = {
  hat: 1,
  clothes: 1,
  shoes: 1,
  item: 0,
};

export function getSelectedItems(selections: SelectionIndexes): SelectedItems {
  return {
    hat: itemsByCategory.hat[selections.hat],
    clothes: itemsByCategory.clothes[selections.clothes],
    shoes: itemsByCategory.shoes[selections.shoes],
    item: itemsByCategory.item[selections.item],
  };
}

export function getPreparedCount(selections: SelectionIndexes): number {
  return categoryOrder.filter((category) => selections[category.id] !== initialSelections[category.id]).length;
}

export function getCompatibilityScore(selectedItems: SelectedItems, destination: Destination): number {
  return categoryOrder.filter((category) => selectedItems[category.id].id === destination.matchItems[category.id]).length;
}

export function getReactionText(preparedCount: number, compatibilityScore: number, destination: Destination): string {
  if (compatibilityScore >= 3) {
    return destination.matchLines.three;
  }

  if (compatibilityScore >= 2) {
    return destination.matchLines.two;
  }

  if (compatibilityScore >= 1) {
    return destination.matchLines.one;
  }

  if (preparedCount >= 3) {
    return "もうすぐ しゅっぱつ！";
  }

  if (preparedCount === 2) {
    return "じゅんび できてきたね";
  }

  if (preparedCount === 1) {
    return "いいね！";
  }

  return "どれにする？";
}
