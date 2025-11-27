function setupWordleGame(el) {
  if (el.dataset.wordleInitialized === "1") return;

  const raw = el.textContent.trim();
  if (!raw) return;

  if (/^100(\.0)?\s*%?$/.test(raw)) {
    el.textContent = "100% (DAMN)";          // or raw if you prefer exact original
    el.dataset.wordleInitialized = "1";
    return;
  }

  const match = raw.match(/(\d{1,3}\.\d)/);
  if (!match) return;

  let targetStr = match[1];                     // e.g. "7.5" or "84.5"

  // ⭐ If score is like "7.5", convert to "07.5"
  if (/^\d\.\d$/.test(targetStr)) {             // 1-digit.x
    targetStr = "0" + targetStr;                // -> 07.5
}

const digits = targetStr.replace('.', '').split(""); // ["0","7","5"]

if (digits.length !== 3) return;

  if (digits.length !== 3) return;

  const displayScore = `${digits[0]}${digits[1]}.${digits[2]}`;

  el.dataset.wordleInitialized = "1";

  // HISTORY GOES FIRST, GUESS ROW SECOND
  el.innerHTML = `
    <div class="score-wordle">
      <div class="score-wordle-history"></div>

      <div class="score-wordle-row guess-row">
        <input class="score-wordle-cell guess-cell" type="text" maxlength="1" data-index="0">
        <input class="score-wordle-cell guess-cell" type="text" maxlength="1" data-index="1">
        <span class="score-wordle-dot">.</span>
        <input class="score-wordle-cell guess-cell" type="text" maxlength="1" data-index="2">
        <span class="score-wordle-dot">%</span>
      </div>

      <div class="score-wordle-buttons">
        <button class="score-wordle-guess-btn">Guess</button>
        <button class="score-wordle-reveal-btn">Reveal</button>
      </div>

      <div class="score-wordle-feedback"></div>
    </div>
  `;

  const cells = Array.from(el.querySelectorAll(".guess-cell"));
  const guessButton = el.querySelector(".score-wordle-guess-btn");
  const revealButton = el.querySelector(".score-wordle-reveal-btn");
  const feedbackEl = el.querySelector(".score-wordle-feedback");
  const historyEl = el.querySelector(".score-wordle-history");

  function endGame(message) {
    feedbackEl.textContent = message;

    const guessRow = el.querySelector(".guess-row");
    const buttonsRow = el.querySelector(".score-wordle-buttons");

    if (guessRow) guessRow.remove();
    if (buttonsRow) buttonsRow.remove();
  }

  function reveal(message) {
    el.textContent = message;

    const guessRow = el.querySelector(".guess-row");
    const buttonsRow = el.querySelector(".score-wordle-buttons");

    if (guessRow) guessRow.remove();
    if (buttonsRow) buttonsRow.remove();
  }

  function getGuessDigits() {
    return cells.map(c => c.value.trim());
  }

  function checkGuess() {
    const guess = getGuessDigits();

    if (guess.some(d => d === "" || !/^\d$/.test(d))) {
      feedbackEl.textContent = "Enter all digits (0–9).";
      return;
    }

    // DO NOT COLOR THE INPUT CELLS ANYMORE
    cells.forEach(c => {
      c.classList.remove("correct", "present", "absent");
    });

    const target = [...digits];
    const used = [false, false, false];
    const colorMap = [];

    // Determine colors for history, NOT inputs
    guess.forEach((g, i) => {
      if (g === target[i]) {
        colorMap[i] = "correct";
        used[i] = true;
      }
    });

    guess.forEach((g, i) => {
      if (colorMap[i] === "correct") return;

      const idx = target.findIndex((t, j) => !used[j] && t === g);
      if (idx !== -1) {
        colorMap[i] = "present";
        used[idx] = true;
      } else {
        colorMap[i] = "absent";
      }
    });

    // CREATE HISTORY ROW ABOVE INPUT ROW
    const historyRow = document.createElement("div");
    historyRow.className = "score-wordle-history-row";

    for (let i = 0; i < 3; i++) {
      // digit cell
      const span = document.createElement("span");
      span.textContent = guess[i];
      span.className = "score-wordle-history-cell " + colorMap[i];
      historyRow.appendChild(span);

      // add dot between 2nd and 3rd digit
      if (i === 1) {
        const dotSpan = document.createElement("span");
        dotSpan.className = "score-wordle-dot";
        dotSpan.textContent = ".";
        historyRow.appendChild(dotSpan);
      }
      if (i === 2) {
        const dotSpan = document.createElement("span");
        dotSpan.className = "score-wordle-dot";
        dotSpan.textContent = "%";
        historyRow.appendChild(dotSpan);
      }
    }

    // Add to history (BOTTOM, so older → newer)
    historyEl.appendChild(historyRow);

    const isCorrect = guess.join("") === digits.join("");
    if (isCorrect) {
      endGame(`Correct! Score: ${displayScore}`);
      return; // game ends
    } else {
      feedbackEl.textContent = "❌ Try again!";
    }

    cells.forEach(c => c.value = "");
    cells[0].focus();
  }

  function revealScore() {
    reveal(`${displayScore}%`);
  }

  if (guessButton) {
    guessButton.addEventListener("click", checkGuess);
  }

  if (revealButton) {
    revealButton.addEventListener("click", revealScore);
  }

  cells.forEach((cell, idx) => {
    cell.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        checkGuess();
      } else if (/^\d$/.test(e.key) && cell.value.length === 1 && idx < cells.length - 1) {
        setTimeout(() => cells[idx + 1].focus(), 0);
      }
    });
  });
}


function processAll() {
  document
    .querySelectorAll(".total-score__score-percentage")
    .forEach(setupWordleGame);
  document.querySelectorAll('.u-success-text').forEach(el => {
    el.textContent = "";
  });
  document.querySelectorAll('.total-score__total-points').forEach(el => {
    el.textContent = "";
  });
}

const observer = new MutationObserver(processAll);

function start() {
  processAll();
  observer.observe(document.body, { childList: true, subtree: true });
}

document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", start)
  : start();
