import { useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "./audio";
import {
  categoryOrder,
  destinations,
  getCompatibilityScore,
  getSelectedItems,
  initialSelections,
  itemsByCategory,
} from "./data";
import type {
  AssetPath,
  CategoryDefinition,
  CategoryId,
  Destination,
  DressItem,
  PartTheme,
  SelectedItems,
  SelectionIndexes,
} from "./types";

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
const finalStepIndex = categoryOrder.length;
const fallbackPartTheme: PartTheme = "park";
const hiddenOptionIds: Partial<Record<CategoryId, Set<string>>> = {
  hat: new Set(["none"]),
  clothes: new Set(["daily"]),
  shoes: new Set(["normal-shoes"]),
};

const categoryGuidance: Record<CategoryId, string> = {
  hat: "ぼうしを えらぼう",
  clothes: "ふくを えらぼう",
  shoes: "くつを えらぼう",
  item: "もちものを えらぼう",
};

const categoryPickedText: Record<CategoryId, string> = {
  hat: "ぼうし いいね！",
  clothes: "ふく いいね！",
  shoes: "くつ いいね！",
  item: "もちもの いいね！",
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function assetKey(asset: AssetPath) {
  return asset.replace(/\.(svg|png|webp)$/i, "");
}

function resolveAsset(asset: AssetPath) {
  return overrideAssets.get(assetKey(asset)) ?? `${assetRoot}${asset}`;
}

function uniqueAssets(assets: Array<AssetPath | undefined>) {
  return Array.from(new Set(assets.filter((asset): asset is AssetPath => Boolean(asset))));
}

function selectedItemList(selectedItems: SelectedItems) {
  return categoryOrder.map((category) => selectedItems[category.id]);
}

function getPartTheme(item: DressItem): PartTheme {
  return item.partTheme ?? fallbackPartTheme;
}

function getRewardAsset(headTheme: PartTheme, bodyTheme: PartTheme, feetTheme: PartTheme): AssetPath {
  return `generated/reward/reward-h${headTheme}-b${bodyTheme}-f${feetTheme}.png` as AssetPath;
}

function getCharacterAsset(selectedItems: SelectedItems): AssetPath {
  return getRewardAsset(
    getPartTheme(selectedItems.hat),
    getPartTheme(selectedItems.clothes),
    getPartTheme(selectedItems.shoes),
  );
}

const warnedMissingAssets = new Set<string>();
function warnMissingAsset(asset: AssetPath) {
  if (!import.meta.env.DEV) return;
  if (warnedMissingAssets.has(asset)) return;
  warnedMissingAssets.add(asset);
  console.warn(`[character] missing image: ${asset}`);
}

function getVisibleCategoryItems(categoryId: CategoryId) {
  const hiddenIds = hiddenOptionIds[categoryId];

  return itemsByCategory[categoryId]
    .map((item, itemIndex) => ({ item, itemIndex }))
    .filter(({ item }) => !hiddenIds?.has(item.id));
}

function LayerImage({ asset, className }: { asset: AssetPath; className: string }) {
  const assetClassName = assetKey(asset)
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
  const label = `${selectedItems.hat.name}、${selectedItems.clothes.name}、${selectedItems.shoes.name}`;
  const characterAsset = getCharacterAsset(selectedItems);
  const characterAssetClassName = assetKey(characterAsset)
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase();
  const modeClass = isReward ? "character-image-reward" : "character-image-dress";

  return (
    <div
      className={`character character-${destination.id} ${isReward ? "character-reward" : ""} ${
        isCharging ? "character-charging" : ""
      }`}
      role="img"
      aria-label={`おでかけのじゅんびをしたこども。${label}`}
    >
      <img
        className={`stage-layer character-image ${modeClass} asset-${characterAssetClassName}`}
        src={resolveAsset(characterAsset)}
        alt=""
        draggable={false}
        onError={() => warnMissingAsset(characterAsset)}
      />
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

function StepProgress({
  selections,
  currentCategoryIndex,
  isFinalStep,
}: {
  selections: SelectionIndexes;
  currentCategoryIndex: number;
  isFinalStep: boolean;
}) {
  return (
    <div className="step-progress" aria-label="じゅんびのじゅんばん">
      <div className="step-dots" aria-hidden="true">
        {categoryOrder.map((category) => {
          const isCurrent = !isFinalStep && categoryOrder[currentCategoryIndex].id === category.id;
          const isPicked = selections[category.id] !== initialSelections[category.id];
          const selectedItem = itemsByCategory[category.id][selections[category.id]];

          return (
            <span
              key={category.id}
              className={`step-dot step-${category.id} ${isCurrent ? "is-current" : ""} ${
                isPicked ? "is-picked" : ""
              }`}
            >
              <img src={resolveAsset(selectedItem.asset)} alt="" draggable={false} />
            </span>
          );
        })}
      </div>
      <span className="step-count">{isFinalStep ? "できたよ" : `${currentCategoryIndex + 1}/${finalStepIndex}`}</span>
    </div>
  );
}

function CurrentCategorySelector({
  category,
  selectedIndex,
  onSelect,
}: {
  category: CategoryDefinition;
  selectedIndex: number;
  onSelect: (itemIndex: number) => void;
}) {
  const items = itemsByCategory[category.id];
  const visibleItems = getVisibleCategoryItems(category.id);
  const selectedItem = items[selectedIndex] ?? visibleItems[0]?.item;
  const headingItem = visibleItems.some(({ item }) => item.id === selectedItem.id) ? selectedItem : visibleItems[0].item;

  return (
    <div className={`current-category category-${category.id}`}>
      <div className="current-heading">
        <span className={`category-mark ${category.iconClass}`} aria-hidden="true">
          <img src={resolveAsset(headingItem.asset)} alt="" draggable={false} />
        </span>
        <h2>{categoryGuidance[category.id]}</h2>
      </div>
      <div className="option-grid" role="group" aria-label={`${category.label}をえらぶ`}>
        {visibleItems.map(({ item, itemIndex }) => {
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
      </div>
    </div>
  );
}

function ConfirmationStep({ selectedItems }: { selectedItems: SelectedItems }) {
  return (
    <div className="confirmation-step">
      <div className="current-heading final-heading">
        <span className="category-mark icon-ready" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
        <h2>これで おでかけ！</h2>
      </div>
      <div className="selected-summary" aria-label="えらんだもの">
        {categoryOrder.map((category) => {
          const item = selectedItems[category.id];

          return <SummaryItem key={category.id} category={category} item={item} />;
        })}
      </div>
    </div>
  );
}

function SummaryItem({ category, item }: { category: CategoryDefinition; item: DressItem }) {
  return (
    <div className={`summary-card summary-${category.id} item-${item.id}`}>
      <span className="summary-thumb" aria-hidden="true">
        <img src={resolveAsset(item.asset)} alt="" draggable={false} />
      </span>
      <span className="summary-label">{category.label}</span>
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
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [isReward, setIsReward] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [reactionText, setReactionText] = useState(categoryGuidance[categoryOrder[0].id]);
  const [reactionKey, setReactionKey] = useState(0);
  const chargeTimerRef = useRef<number | null>(null);

  const destination = destinations[destinationIndex];
  const currentCategory = categoryOrder[currentCategoryIndex] ?? categoryOrder[0];
  const isFinalStep = currentCategoryIndex >= finalStepIndex;
  const selectedItems = useMemo(() => getSelectedItems(selections), [selections]);
  const compatibilityScore = useMemo(
    () => getCompatibilityScore(selectedItems, destination),
    [destination, selectedItems],
  );

  function clearChargeTimer() {
    if (chargeTimerRef.current !== null) {
      window.clearTimeout(chargeTimerRef.current);
      chargeTimerRef.current = null;
    }
  }

  useEffect(() => () => clearChargeTimer(), []);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

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
    const nextItem = itemsByCategory[categoryId][itemIndex];

    setSelections(nextSelections);
    setIsReward(false);
    setIsCharging(false);
    clearChargeTimer();
    showReaction(nextItem.id === "none" ? categoryGuidance[categoryId] : categoryPickedText[categoryId], "dress");
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
    setCurrentCategoryIndex(0);
    setIsReward(false);
    setIsCharging(false);
    showReaction(categoryGuidance[categoryOrder[0].id], "reset");
  }

  function goNextStep() {
    if (isFinalStep) {
      return;
    }

    const nextIndex = Math.min(currentCategoryIndex + 1, finalStepIndex);
    clearChargeTimer();
    setIsReward(false);
    setIsCharging(false);
    setCurrentCategoryIndex(nextIndex);
    showReaction(nextIndex === finalStepIndex ? "これで おでかけ！" : categoryGuidance[categoryOrder[nextIndex].id], "toggle");
  }

  function goBackStep() {
    if (currentCategoryIndex === 0) {
      return;
    }

    const nextIndex = currentCategoryIndex - 1;
    clearChargeTimer();
    setIsReward(false);
    setIsCharging(false);
    setCurrentCategoryIndex(nextIndex);
    showReaction(categoryGuidance[categoryOrder[nextIndex].id], "toggle");
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
    setCurrentCategoryIndex(0);
    setIsReward(false);
    setIsCharging(false);
    showReaction(categoryGuidance[categoryOrder[0].id], "reset");
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

  function installApp() {
    if (!installPrompt) {
      return;
    }

    installPrompt.prompt().catch(() => undefined);
    installPrompt.userChoice.finally(() => setInstallPrompt(null));
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
          {installPrompt ? (
            <button type="button" className="parent-button install-button" onClick={installApp} aria-label="アプリとして入れる">
              入れる
            </button>
          ) : null}
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
        <ReactionBubble text={reactionText} reactionKey={reactionKey} compatibilityScore={compatibilityScore} />
      </section>

      <footer className={`bottom-controls ${isReward ? "reward-controls" : ""}`}>
        {isReward ? (
          <button type="button" className="again-button" onClick={playAgain} aria-label="もういっかい遊ぶ">
            もういっかい
          </button>
        ) : (
          <div className={`step-panel ${isFinalStep ? "is-final-step" : ""}`}>
            <StepProgress selections={selections} currentCategoryIndex={currentCategoryIndex} isFinalStep={isFinalStep} />
            {isFinalStep ? (
              <ConfirmationStep selectedItems={selectedItems} />
            ) : (
              <CurrentCategorySelector
                category={currentCategory}
                selectedIndex={selections[currentCategory.id]}
                onSelect={(itemIndex) => selectCategoryItem(currentCategory.id, itemIndex)}
              />
            )}
            <div className="step-actions">
              <button
                type="button"
                className="back-button"
                onClick={goBackStep}
                disabled={currentCategoryIndex === 0 || isCharging}
                aria-label="ひとつまえにもどる"
              >
                もどる
              </button>
              {isFinalStep ? (
                <button
                  type="button"
                  className="launch-button"
                  onClick={launchReward}
                  aria-label="しゅっぱつする"
                  disabled={isCharging}
                >
                  しゅっぱーつ！
                </button>
              ) : (
                <button type="button" className="next-button" onClick={goNextStep} disabled={isCharging} aria-label="つぎへ">
                  つぎ
                </button>
              )}
            </div>
          </div>
        )}
      </footer>
    </main>
  );
}
