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
  { id: "item", label: "もちもの", iconClass: "icon-item" },
];

export const itemsByCategory: Record<CategoryId, DressItem[]> = {
  hat: [
    { id: "none", category: "hat", name: "なし", shortName: "なし" },
    { id: "yellow-hat", category: "hat", name: "きいろいぼうし", shortName: "きいろ" },
    { id: "rain-hat", category: "hat", name: "あめのぼうし", shortName: "あめ" },
    { id: "sleep-cap", category: "hat", name: "ねんねぼうし", shortName: "ねんね" },
  ],
  clothes: [
    { id: "daily", category: "clothes", name: "ふだんぎ", shortName: "ふだんぎ" },
    { id: "park-hoodie", category: "clothes", name: "こうえんパーカー", shortName: "パーカー" },
    { id: "rain-coat", category: "clothes", name: "あめのコート", shortName: "コート" },
    { id: "pajamas", category: "clothes", name: "パジャマ", shortName: "パジャマ" },
  ],
  shoes: [
    { id: "normal-shoes", category: "shoes", name: "ふつうのくつ", shortName: "くつ" },
    { id: "sneakers", category: "shoes", name: "スニーカー", shortName: "スニーカー" },
    { id: "rain-boots", category: "shoes", name: "ながぐつ", shortName: "ながぐつ" },
    { id: "fluffy-socks", category: "shoes", name: "もこもこくつした", shortName: "もこもこ" },
  ],
  item: [
    { id: "none", category: "item", name: "なし", shortName: "なし" },
    { id: "backpack", category: "item", name: "リュック", shortName: "リュック" },
    { id: "umbrella", category: "item", name: "かさ", shortName: "かさ" },
    { id: "plush", category: "item", name: "ぬいぐるみ", shortName: "ぬいぐるみ" },
  ],
};

export const destinations: Destination[] = [
  {
    id: "park",
    title: "きょうは こうえん！",
    shortTitle: "こうえん",
    sceneryLabel: "こうえんのけしき",
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
  hat: 0,
  clothes: 0,
  shoes: 0,
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
