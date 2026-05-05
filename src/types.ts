export type DestinationId = "park" | "rain" | "sleep";

export type CategoryId = "hat" | "clothes" | "shoes" | "item";

export type SoundName = "dress" | "sparkle" | "launch" | "reset" | "toggle";

export interface CategoryDefinition {
  id: CategoryId;
  label: string;
  iconClass: string;
}

export interface DressItem {
  id: string;
  category: CategoryId;
  name: string;
  shortName: string;
  asset: string;
  worldEffect?: string;
  rewardEffect?: string;
}

export type SelectionIndexes = Record<CategoryId, number>;

export type SelectedItems = Record<CategoryId, DressItem>;

export interface Destination {
  id: DestinationId;
  title: string;
  shortTitle: string;
  sceneryLabel: string;
  bgAsset: string;
  rewardLine: string;
  matchItems: Record<CategoryId, string>;
  matchLines: {
    one: string;
    two: string;
    three: string;
  };
}
