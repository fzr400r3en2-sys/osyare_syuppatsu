import { useEffect, useMemo, useState } from "react";
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

function SceneDecorations({
  destination,
  compatibilityScore,
  isReward,
}: {
  destination: Destination;
  compatibilityScore: number;
  isReward: boolean;
}) {
  const matchLevel = Math.min(compatibilityScore, 3);

  return (
    <div
      className={`scene-decor scene-${destination.id} match-level-${matchLevel} ${isReward ? "reward-active" : ""}`}
      aria-hidden="true"
    >
      <span className="sun-or-moon" />
      <span className="cloud cloud-one" />
      <span className="cloud cloud-two" />
      <span className="slide-shape" />
      <span className="puddle puddle-one" />
      <span className="puddle puddle-two" />
      <span className="rain-drop drop-one" />
      <span className="rain-drop drop-two" />
      <span className="rain-drop drop-three" />
      <span className="star-dot star-one" />
      <span className="star-dot star-two" />
      <span className="star-dot star-three" />
      <span className="flower flower-one" />
      <span className="flower flower-two" />
      <span className="flower flower-three" />
      <span className="soft-hill hill-one" />
      <span className="soft-hill hill-two" />
    </div>
  );
}

function Character({
  selectedItems,
  destination,
  isReward,
  compatibilityScore,
}: {
  selectedItems: SelectedItems;
  destination: Destination;
  isReward: boolean;
  compatibilityScore: number;
}) {
  const label = `${selectedItems.hat.name}、${selectedItems.clothes.name}、${selectedItems.shoes.name}、${selectedItems.item.name}`;

  return (
    <div className="character-frame">
      <div
        className={`character character-${destination.id} prop-${selectedItems.item.id} ${
          isReward ? "character-reward" : ""
        } match-score-${Math.min(compatibilityScore, 3)}`}
        role="img"
        aria-label={`おでかけのじゅんびをしたこども。${label}`}
      >
        <div className="character-shadow" />
        <div className={`prop prop-wear-${selectedItems.item.id}`} aria-hidden="true">
          <span className="prop-part prop-main" />
          <span className="prop-part prop-top" />
          <span className="prop-part prop-line" />
          <span className="prop-part prop-handle" />
        </div>
        <div className="body-back" aria-hidden="true">
          <span className="arm arm-left" />
          <span className="arm arm-right" />
        </div>
        <div className={`hat hat-${selectedItems.hat.id}`} aria-hidden="true">
          <span className="hat-part hat-top" />
          <span className="hat-part hat-brim" />
          <span className="hat-part hat-pom" />
        </div>
        <div className="head">
          <span className="hair hair-left" />
          <span className="hair hair-right" />
          <span className="eye eye-left" />
          <span className="eye eye-right" />
          <span className="cheek cheek-left" />
          <span className="cheek cheek-right" />
          <span className="mouth" />
        </div>
        <div className={`torso clothes-${selectedItems.clothes.id}`} aria-hidden="true">
          <span className="hood" />
          <span className="collar collar-left" />
          <span className="collar collar-right" />
          <span className="zipper" />
          <span className="pocket" />
          <span className="clothes-dot dot-one" />
          <span className="clothes-dot dot-two" />
          <span className="clothes-dot dot-three" />
        </div>
        <div className="legs" aria-hidden="true">
          <span className="leg leg-left" />
          <span className="leg leg-right" />
        </div>
        <div className={`feet shoes-${selectedItems.shoes.id}`} aria-hidden="true">
          <span className="foot foot-left" />
          <span className="foot foot-right" />
          <span className="sock-cuff cuff-left" />
          <span className="sock-cuff cuff-right" />
        </div>
      </div>
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

function CategoryButton({
  category,
  item,
  onClick,
}: {
  category: CategoryDefinition;
  item: SelectedItems[CategoryId];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`category-button ${category.iconClass} selected-${item.id}`}
      onClick={onClick}
      aria-label={`${category.label}をかえる。いまは${item.name}`}
    >
      <span className="button-icon" aria-hidden="true">
        <span />
      </span>
      <span className="button-label">{category.label}</span>
      <span className="button-item">{item.shortName}</span>
    </button>
  );
}

export default function App() {
  const [destinationIndex, setDestinationIndex] = useState(0);
  const [selections, setSelections] = useState<SelectionIndexes>(initialSelections);
  const [soundOn, setSoundOn] = useState(true);
  const [isReward, setIsReward] = useState(false);
  const [reactionText, setReactionText] = useState("どれにする？");
  const [reactionKey, setReactionKey] = useState(0);

  const destination = destinations[destinationIndex];
  const selectedItems = useMemo(() => getSelectedItems(selections), [selections]);
  const compatibilityScore = useMemo(
    () => getCompatibilityScore(selectedItems, destination),
    [destination, selectedItems],
  );
  const preparedCount = useMemo(() => getPreparedCount(selections), [selections]);

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

  function cycleCategory(categoryId: CategoryId) {
    const itemList = itemsByCategory[categoryId];
    const nextSelections = {
      ...selections,
      [categoryId]: (selections[categoryId] + 1) % itemList.length,
    };
    const nextItems = getSelectedItems(nextSelections);
    const nextScore = getCompatibilityScore(nextItems, destination);
    const nextPreparedCount = getPreparedCount(nextSelections);

    setSelections(nextSelections);
    showReaction(
      getReactionText(nextPreparedCount, nextScore, destination),
      nextScore >= 2 || nextScore > compatibilityScore ? "sparkle" : "dress",
    );
  }

  function nextDestination() {
    const nextIndex = (destinationIndex + 1) % destinations.length;
    const nextDestinationValue = destinations[nextIndex];
    setDestinationIndex(nextIndex);
    setIsReward(false);
    showReaction(nextDestinationValue.title, "sparkle");
  }

  function resetDressUp() {
    setSelections(initialSelections);
    setIsReward(false);
    showReaction("すっきり えらぼう", "reset");
  }

  function launchReward() {
    setIsReward(true);
    showReaction(destination.rewardLine, "launch");
  }

  function playAgain() {
    setIsReward(false);
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
    <main className={`app destination-${destination.id} ${isReward ? "reward-mode" : "dress-mode"}`}>
      <header className="top-bar">
        <div className="title-area">
          <h1>おしゃれして しゅっぱつ！</h1>
          <p className="destination-badge" aria-label={destination.sceneryLabel}>
            {destination.title}
          </p>
        </div>
        <div className="parent-controls" aria-label="おとなのそうさ">
          <button
            type="button"
            className={`parent-button sound-button ${soundOn ? "is-on" : "is-off"}`}
            onClick={toggleSound}
            aria-label={soundOn ? "音をオフにする" : "音をオンにする"}
          >
            {soundOn ? "おとON" : "おとOFF"}
          </button>
          <button type="button" className="parent-button" onClick={resetDressUp} aria-label="服をリセットする">
            リセット
          </button>
          <button
            type="button"
            className="parent-button next-button"
            onClick={nextDestination}
            aria-label="つぎのおでかけにする"
          >
            つぎのおでかけ
          </button>
        </div>
      </header>

      <section className={`stage match-level-${Math.min(compatibilityScore, 3)}`} aria-label="きせかえのばしょ">
        <SceneDecorations destination={destination} compatibilityScore={compatibilityScore} isReward={isReward} />
        <ReactionBubble text={reactionText} reactionKey={reactionKey} compatibilityScore={compatibilityScore} />
        <div className="stage-center">
          <Character
            selectedItems={selectedItems}
            destination={destination}
            isReward={isReward}
            compatibilityScore={compatibilityScore}
          />
        </div>
      </section>

      <footer className={`bottom-controls ${isReward ? "reward-controls" : ""}`}>
        {isReward ? (
          <button type="button" className="again-button" onClick={playAgain} aria-label="もういっかい遊ぶ">
            もういっかい
          </button>
        ) : (
          <>
            {categoryOrder.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                item={selectedItems[category.id]}
                onClick={() => cycleCategory(category.id)}
              />
            ))}
            <button type="button" className="launch-button" onClick={launchReward} aria-label="しゅっぱつする">
              しゅっぱーつ！
            </button>
          </>
        )}
      </footer>
    </main>
  );
}
