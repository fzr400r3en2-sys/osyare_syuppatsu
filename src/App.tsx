import { useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "./audio";
import {
  categoryOrder,
  destinations,
  getCompatibilityScore,
  getPreparedCount,
  getReactionText,
  getSelectedItems,
  initialSelections,
  itemsByCategory,
} from "./data";
import type { CategoryDefinition, CategoryId, Destination, SelectedItems, SelectionIndexes } from "./types";

const overrideModules = import.meta.glob<string>("./overrideAssets/**/*.{png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
});
const overrideAssets = new Map<string, string>(
  Object.entries(overrideModules).map(([path, url]) => [
    path.replace("./overrideAssets/", "").replace(/\.(png|webp)$/i, ""),
    url,
  ]),
);
const assetRoot = `${import.meta.env.BASE_URL}assets/`;
const rewardOverlayAsset = "overlays/confetti.svg";

function resolveAsset(asset: string) {
  return overrideAssets.get(asset.replace(/\.svg$/i, "")) ?? `${assetRoot}${asset}`;
}

function uniqueAssets(assets: Array<string | undefined>) {
  return Array.from(new Set(assets.filter((asset): asset is string => Boolean(asset))));
}

function selectedItemList(selectedItems: SelectedItems) {
  return categoryOrder.map((category) => selectedItems[category.id]);
}

function LayerImage({ asset, className }: { asset: string; className: string }) {
  const assetClassName = asset
    .replace(/\.svg$/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase();

  return (
    <img
      className={`stage-layer ${className} asset-${assetClassName}`}
      src={resolveAsset(asset)}
      alt=""
      draggable={false}
    />
  );
}

function SceneDecorations({
  selectedItems,
  destination,
  compatibilityScore,
  isReward,
}: {
  selectedItems: SelectedItems;
  destination: Destination;
  compatibilityScore: number;
  isReward: boolean;
}) {
  const items = selectedItemList(selectedItems);
  const overlayBackAssets = isReward
    ? uniqueAssets(items.map((item) => item.worldEffect))
    : uniqueAssets(
        items
          .filter((item) => destination.matchItems[item.category] === item.id && compatibilityScore >= 2)
          .map((item) => item.worldEffect),
      );
  const overlayFrontAssets = isReward ? uniqueAssets([...items.map((item) => item.rewardEffect), rewardOverlayAsset]) : [];

  return (
    <>
      <LayerImage asset={destination.bgAsset} className="layer-background" />
      {overlayBackAssets.map((asset) => (
        <LayerImage key={`back-${asset}`} asset={asset} className="layer-overlay-back" />
      ))}
      {overlayFrontAssets.map((asset) => (
        <LayerImage key={`front-${asset}`} asset={asset} className="layer-overlay-front" />
      ))}
    </>
  );
}

function Character({
  selectedItems,
  destination,
  isReward,
  isCharging,
}: {
  selectedItems: SelectedItems;
  destination: Destination;
  isReward: boolean;
  isCharging: boolean;
}) {
  const label = `${selectedItems.hat.name}、${selectedItems.clothes.name}、${selectedItems.shoes.name}、${selectedItems.item.name}`;

  return (
    <div
      className={`character character-${destination.id} ${isReward ? "character-reward" : ""} ${
        isCharging ? "character-charging" : ""
      }`}
      role="img"
      aria-label={`おでかけのじゅんびをしたこども。${label}`}
    >
      <LayerImage asset="character/base.svg" className="character-base" />
      <LayerImage asset={selectedItems.clothes.asset} className="character-clothes" />
      <LayerImage asset={selectedItems.shoes.asset} className="character-shoes" />
      <LayerImage asset={selectedItems.hat.asset} className="character-hat" />
      <LayerImage asset={selectedItems.item.asset} className="character-item" />
      {/* 顔は専用レイヤーで最後に重ね、装備画像の上から目・頬・口を守ります。 */}
      <LayerImage asset="character/face.svg" className="character-face" />
    </div>
  );
}

function ReactionBubble({
  text,
  reactionKey,
  compatibilityScore,
}: {
  text: string;
  reactionKey: number;
  compatibilityScore: number;
}) {
  return (
    <div className={`reaction-bubble match-score-${Math.min(compatibilityScore, 3)}`} aria-live="polite" aria-atomic="true">
      <div key={reactionKey} className="reaction-pop">
        <span className="reaction-icon icon-star" aria-hidden="true">
          ★
        </span>
        <span className="reaction-text">{text}</span>
        <span className="reaction-icon icon-heart" aria-hidden="true">
          ♥
        </span>
      </div>
    </div>
  );
}

function PreparedTracker({
  selections,
  preparedCount,
}: {
  selections: SelectionIndexes;
  preparedCount: number;
}) {
  return (
    <div className={`prepared-tracker prepared-count-${preparedCount}`} aria-label={`じゅんび ${preparedCount}こ`}>
      <span className="prepared-label">じゅんび</span>
      <div className="prepared-steps" aria-hidden="true">
        {categoryOrder.map((category) => {
          const isFilled = selections[category.id] !== initialSelections[category.id];

          return (
            <span
              key={category.id}
              className={`prepared-step prepared-${category.id} ${isFilled ? "is-filled" : "is-empty"}`}
            >
              <span />
            </span>
          );
        })}
      </div>
      <span className="prepared-count">{preparedCount}/4</span>
    </div>
  );
}

function CategorySelector({
  category,
  selectedIndex,
  onSelect,
}: {
  category: CategoryDefinition;
  selectedIndex: number;
  onSelect: (itemIndex: number) => void;
}) {
  const items = itemsByCategory[category.id];

  return (
    <div className={`category-row category-${category.id}`}>
      <span className="category-label">{category.label}</span>
      <span className="option-grid" role="group" aria-label={`${category.label}をえらぶ`}>
        {items.map((item, itemIndex) => {
          const isSelected = itemIndex === selectedIndex;

          return (
            <button
              key={item.id}
              type="button"
              className={`option-button option-${category.id} item-${item.id} ${isSelected ? "is-selected" : ""}`}
              onClick={() => onSelect(itemIndex)}
              aria-label={`${category.label}: ${item.name}`}
              aria-pressed={isSelected}
            >
              <span className="option-thumb" aria-hidden="true">
                <img src={resolveAsset(item.asset)} alt="" draggable={false} />
              </span>
              <span className="option-name">{item.shortName}</span>
            </button>
          );
        })}
      </span>
    </div>
  );
}

function ChargeLights() {
  return (
    <div className="charge-lights" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

export default function App() {
  const [destinationIndex, setDestinationIndex] = useState(0);
  const [selections, setSelections] = useState<SelectionIndexes>(initialSelections);
  const [soundOn, setSoundOn] = useState(true);
  const [isReward, setIsReward] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  const [reactionText, setReactionText] = useState("どれにする？");
  const [reactionKey, setReactionKey] = useState(0);
  const chargeTimerRef = useRef<number | null>(null);

  const destination = destinations[destinationIndex];
  const selectedItems = useMemo(() => getSelectedItems(selections), [selections]);
  const compatibilityScore = useMemo(
    () => getCompatibilityScore(selectedItems, destination),
    [destination, selectedItems],
  );
  const preparedCount = useMemo(() => getPreparedCount(selections), [selections]);

  function clearChargeTimer() {
    if (chargeTimerRef.current !== null) {
      window.clearTimeout(chargeTimerRef.current);
      chargeTimerRef.current = null;
    }
  }

  useEffect(() => () => clearChargeTimer(), []);

  useEffect(() => {
    if (!isReward) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setIsReward(false);
      setReactionText("もういちど えらぼう");
      setReactionKey((current) => current + 1);
    }, 7800);

    return () => window.clearTimeout(timerId);
  }, [isReward]);

  function showReaction(text: string, soundName: "dress" | "sparkle" | "launch" | "reset" | "toggle") {
    setReactionText(text);
    setReactionKey((current) => current + 1);
    playSound(soundName, soundOn);
  }

  function selectCategoryItem(categoryId: CategoryId, itemIndex: number) {
    const nextSelections = {
      ...selections,
      [categoryId]: itemIndex,
    };
    const nextItems = getSelectedItems(nextSelections);
    const nextScore = getCompatibilityScore(nextItems, destination);
    const nextPreparedCount = getPreparedCount(nextSelections);

    setSelections(nextSelections);
    setIsReward(false);
    setIsCharging(false);
    clearChargeTimer();
    showReaction(
      getReactionText(nextPreparedCount, nextScore, destination),
      nextScore >= 2 || nextScore > compatibilityScore ? "sparkle" : "dress",
    );
  }

  function nextDestination() {
    const nextIndex = (destinationIndex + 1) % destinations.length;
    const nextDestinationValue = destinations[nextIndex];
    clearChargeTimer();
    setDestinationIndex(nextIndex);
    setIsReward(false);
    setIsCharging(false);
    showReaction(nextDestinationValue.title, "sparkle");
  }

  function resetDressUp() {
    clearChargeTimer();
    setSelections(initialSelections);
    setIsReward(false);
    setIsCharging(false);
    showReaction("さいしょに もどそう", "reset");
  }

  function launchReward() {
    if (isReward || isCharging) {
      return;
    }

    clearChargeTimer();
    setIsCharging(true);
    showReaction("しゅっぱーつ！", "launch");
    chargeTimerRef.current = window.setTimeout(() => {
      chargeTimerRef.current = null;
      setIsCharging(false);
      setIsReward(true);
      showReaction(destination.rewardLine, "sparkle");
    }, 1200);
  }

  function playAgain() {
    clearChargeTimer();
    setSelections(initialSelections);
    setIsReward(false);
    setIsCharging(false);
    showReaction("もういちど えらぼう", "reset");
  }

  function toggleSound() {
    setSoundOn((current) => {
      const next = !current;
      if (!current) {
        playSound("toggle", true);
      }
      return next;
    });
  }

  return (
    <main
      className={`app destination-${destination.id} ${isReward ? "reward-mode" : "dress-mode"} ${
        isCharging ? "is-charging" : ""
      }`}
    >
      <header className="top-bar">
        <div className="title-area">
          <h1>おしゃれして しゅっぱつ！</h1>
          <button
            type="button"
            className="destination-card"
            onClick={nextDestination}
            aria-label={`おでかけをかえる。${destination.title}`}
          >
            <span className="destination-thumb" aria-hidden="true">
              <img src={resolveAsset(destination.bgAsset)} alt="" draggable={false} />
            </span>
            <span className="destination-title">{destination.title}</span>
          </button>
        </div>
        <div className="parent-controls" aria-label="おとなのそうさ">
          <button
            type="button"
            className={`parent-button sound-button ${soundOn ? "is-on" : "is-off"}`}
            onClick={toggleSound}
            aria-label={soundOn ? "音をしずかにする" : "音をならす"}
          >
            {soundOn ? "おとON" : "しずか"}
          </button>
          <button type="button" className="parent-button reset-button" onClick={resetDressUp} aria-label="さいしょにもどす">
            <span aria-hidden="true">↺</span>
          </button>
        </div>
      </header>

      <section className={`stage match-level-${Math.min(compatibilityScore, 3)}`} aria-label={destination.sceneryLabel}>
        <SceneDecorations
          selectedItems={selectedItems}
          destination={destination}
          compatibilityScore={compatibilityScore}
          isReward={isReward}
        />
        <Character selectedItems={selectedItems} destination={destination} isReward={isReward} isCharging={isCharging} />
        {isCharging ? <ChargeLights /> : null}
        <PreparedTracker selections={selections} preparedCount={preparedCount} />
        <ReactionBubble text={reactionText} reactionKey={reactionKey} compatibilityScore={compatibilityScore} />
      </section>

      <footer className={`bottom-controls ${isReward ? "reward-controls" : ""}`}>
        {isReward ? (
          <button type="button" className="again-button" onClick={playAgain} aria-label="もういっかい遊ぶ">
            もういっかい
          </button>
        ) : (
          <>
            <div className="category-panel">
              {categoryOrder.map((category) => (
                <CategorySelector
                  key={category.id}
                  category={category}
                  selectedIndex={selections[category.id]}
                  onSelect={(itemIndex) => selectCategoryItem(category.id, itemIndex)}
                />
              ))}
            </div>
            <button
              type="button"
              className="launch-button"
              onClick={launchReward}
              aria-label="しゅっぱつする"
              disabled={isCharging}
            >
              しゅっぱーつ！
            </button>
          </>
        )}
      </footer>
    </main>
  );
}
