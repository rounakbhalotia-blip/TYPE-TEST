/**
 * TypePulse - Core Typing Engine
 * Handles word generation, real-time input analysis, smooth caret,
 * streak combos, metric calculations, and test lifecycle.
 */

class TypingEngine {
  constructor() {
    this.words = [];
    this.currentWordIndex = 0;
    this.currentLetterIndex = 0;
    this.userInput = []; // Array of strings for each word
    this.isActive = false;
    this.isFinished = false;

    // Timing
    this.startTime = null;
    this.endTime = null;
    this.timerInterval = null;
    this.timeElapsed = 0;
    this.timeLimit = 30; // seconds

    // Mode & Settings
    this.mode = 'time'; // 'time', 'words', 'quote', 'zen', 'survival'
    this.wordCountGoal = 25;
    this.difficulty = 'medium';
    this.includePunctuation = false;
    this.includeNumbers = false;
    this.blindMode = false;
    this.strictMode = false;
    this.customText = null;

    // Performance tracking
    this.correctChars = 0;
    this.incorrectChars = 0;
    this.extraChars = 0;
    this.missedChars = 0;
    this.totalKeystrokes = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.streakMilestone = 25;

    // Granular analysis
    this.keyErrors = {}; // { 'a': 3, 'p': 1 }
    this.missedWords = []; // [ { word: 'example', typed: 'exmaple' } ]
    this.timeline = []; // [ { second: 1, wpm: 75, rawWpm: 80, errors: 0 } ]
    this.secondErrorBuffer = 0;
    this.wpmSamples = [];

    // DOM Elements cache
    this.wordsContainer = null;
    this.caretElement = null;
    this.inputCapture = null;

    // Callbacks
    this.onTick = null;
    this.onFinish = null;
    this.onStreakUpdate = null;
  }

  init(domElements) {
    this.wordsContainer = domElements.wordsContainer;
    this.caretElement = domElements.caretElement;
    this.inputCapture = domElements.inputCapture;

    if (this.inputCapture) {
      this.inputCapture.addEventListener('input', (e) => this.handleInput(e));
    }
  }

  setupTest(options = {}) {
    this.reset();

    this.mode = options.mode || Store.settings.mode;
    this.timeLimit = options.timeLimit || Store.settings.timeLimit;
    this.wordCountGoal = options.wordCount || Store.settings.wordCount;
    this.difficulty = options.difficulty || Store.settings.difficulty;
    this.includePunctuation = options.includePunctuation !== undefined ? options.includePunctuation : Store.settings.includePunctuation;
    this.includeNumbers = options.includeNumbers !== undefined ? options.includeNumbers : Store.settings.includeNumbers;
    this.blindMode = options.blindMode !== undefined ? options.blindMode : Store.settings.blindMode;
    this.strictMode = options.strictMode !== undefined ? options.strictMode : Store.settings.strictMode;

    if (options.customText) {
      this.words = options.customText.trim().split(/\s+/);
      this.mode = 'custom';
    } else if (this.mode === 'quote') {
      const q = getRandomQuote();
      this.quoteAuthor = q.source;
      this.words = q.text.split(' ');
    } else if (options.practiceWords && options.practiceWords.length > 0) {
      // Repeat weak words to build muscle memory
      let repeated = [];
      while (repeated.length < 30) {
        repeated = repeated.concat(options.practiceWords);
      }
      this.words = repeated.slice(0, 30).sort(() => Math.random() - 0.5);
    } else {
      let count = 60;
      if (this.mode === 'words') count = this.wordCountGoal;
      else if (this.mode === 'time') count = Math.max(70, Math.ceil(this.timeLimit * 3.5));
      else if (this.mode === 'zen' || this.mode === 'survival') count = 120;

      this.words = generateWordList(this.difficulty, count, this.includePunctuation, this.includeNumbers);
    }

    this.renderWords();
    this.updateCaretPosition();
  }

  reset() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.isActive = false;
    this.isFinished = false;
    this.startTime = null;
    this.endTime = null;
    this.timeElapsed = 0;
    this.currentWordIndex = 0;
    this.currentLetterIndex = 0;
    this.userInput = [];
    this.correctChars = 0;
    this.incorrectChars = 0;
    this.extraChars = 0;
    this.missedChars = 0;
    this.totalKeystrokes = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.keyErrors = {};
    this.missedWords = [];
    this.timeline = [];
    this.secondErrorBuffer = 0;
    this.wpmSamples = [];

    if (this.inputCapture) {
      this.inputCapture.value = '';
    }
  }

  renderWords() {
    if (!this.wordsContainer) return;
    this.wordsContainer.innerHTML = '';
    this.wordsContainer.style.transform = 'translateY(0px)';

    this.words.forEach((wordStr, wordIdx) => {
      const wordSpan = document.createElement('div');
      wordSpan.className = `word ${wordIdx === 0 ? 'active' : ''}`;
      wordSpan.dataset.index = wordIdx;

      for (let i = 0; i < wordStr.length; i++) {
        const letterSpan = document.createElement('span');
        letterSpan.className = 'letter';
        letterSpan.textContent = wordStr[i];
        letterSpan.dataset.char = wordStr[i];
        wordSpan.appendChild(letterSpan);
      }

      this.wordsContainer.appendChild(wordSpan);
    });
  }

  startTest() {
    if (this.isActive) return;
    this.isActive = true;
    this.startTime = Date.now();

    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  tick() {
    if (!this.isActive || this.isFinished) return;
    this.timeElapsed += 1;

    // Capture second timeline sample
    const stats = this.calculateLiveStats();
    this.timeline.push({
      second: this.timeElapsed,
      wpm: stats.wpm,
      rawWpm: stats.rawWpm,
      errors: this.secondErrorBuffer
    });
    this.wpmSamples.push(stats.wpm);
    this.secondErrorBuffer = 0;

    if (this.onTick) {
      this.onTick({
        timeElapsed: this.timeElapsed,
        timeLeft: this.mode === 'time' ? Math.max(0, this.timeLimit - this.timeElapsed) : 0,
        ...stats
      });
    }

    // Time mode check
    if (this.mode === 'time' && this.timeElapsed >= this.timeLimit) {
      this.finishTest();
    }
  }

  handleKeyDown(e) {
    if (this.isFinished) return;

    // Shortcut: Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }

    // Ignore modifiers and non-printable control keys
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta' || e.key === 'CapsLock' || e.key === 'Escape' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      return;
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (this.strictMode) return;

      const activeWordEl = this.wordsContainer.children[this.currentWordIndex];
      const typedWord = this.userInput[this.currentWordIndex] || '';

      if (e.ctrlKey) {
        // Ctrl+Backspace: delete entire word
        this.userInput[this.currentWordIndex] = '';
        this.currentLetterIndex = 0;
        this.updateWordDOM(activeWordEl, this.words[this.currentWordIndex], '');
        this.updateCaretPosition();
        return;
      }

      if (typedWord.length > 0) {
        // Delete last character in current word only
        this.userInput[this.currentWordIndex] = typedWord.slice(0, -1);
        this.currentLetterIndex = this.userInput[this.currentWordIndex].length;
        this.updateWordDOM(activeWordEl, this.words[this.currentWordIndex], this.userInput[this.currentWordIndex]);
        this.updateCaretPosition();
      }
      // If typedWord is empty (e.g. after space), do not go back to previous word
      return;
    }

    // Handle Space
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (!this.isActive) {
        this.startTest();
      }
      this.processCharacter(' ');
      return;
    }

    // Handle printable single character (letters, numbers, symbols)
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      if (!this.isActive) {
        this.startTest();
      }
      this.processCharacter(e.key);
      return;
    }
  }

  handleInput(e) {
    if (this.isFinished) return;
    const val = this.inputCapture.value;
    this.inputCapture.value = '';

    if (!val) return;

    for (let char of val) {
      if (!this.isActive) {
        this.startTest();
      }
      this.processCharacter(char);
    }
  }

  processCharacter(char) {
    const currentTargetWord = this.words[this.currentWordIndex];
    if (!currentTargetWord) return;

    // Handle Space (word submission)
    if (char === ' ') {
      const typedWord = this.userInput[this.currentWordIndex] || '';
      if (typedWord.length === 0) return; // Prevent multiple empty spaces

      Sound.playKey(true);
      this.totalKeystrokes++;

      // Finalize current word
      const wordEl = this.wordsContainer.children[this.currentWordIndex];
      const isWordCorrect = typedWord === currentTargetWord;

      if (!isWordCorrect) {
        wordEl.classList.add('has-error');
        this.missedWords.push({
          target: currentTargetWord,
          typed: typedWord
        });
        // Count missed characters
        if (currentTargetWord.length > typedWord.length) {
          const missedCount = currentTargetWord.length - typedWord.length;
          this.missedChars += missedCount;
        }
      }

      this.currentWordIndex += 1;
      this.currentLetterIndex = 0;

      // Check if finished by words or quote mode
      if (this.currentWordIndex >= this.words.length) {
        this.finishTest();
        return;
      }

      if (this.mode === 'words' && this.currentWordIndex >= this.wordCountGoal) {
        this.finishTest();
        return;
      }

      this.activeWordDOM(this.currentWordIndex);
      this.updateCaretPosition();
      this.checkScroll();
      return;
    }

    // Regular typed character
    this.totalKeystrokes++;
    const typedWord = (this.userInput[this.currentWordIndex] || '') + char;
    this.userInput[this.currentWordIndex] = typedWord;
    this.currentLetterIndex = typedWord.length;

    const charIndex = typedWord.length - 1;
    const targetChar = currentTargetWord[charIndex];
    const isCharCorrect = char === targetChar;

    if (isCharCorrect) {
      this.correctChars++;
      this.currentStreak++;
      if (this.currentStreak > this.maxStreak) {
        this.maxStreak = this.currentStreak;
      }

      Sound.playKey(false);

      // Caret FX particle burst
      if (this.caretElement) {
        const rect = this.caretElement.getBoundingClientRect();
        FX.spawnAtCaret(rect.left + 2, rect.top + rect.height / 2);
      }

      // Streak Chime every 25
      if (this.currentStreak > 0 && this.currentStreak % this.streakMilestone === 0) {
        Sound.playStreakChime(Math.floor(this.currentStreak / this.streakMilestone));
      }
    } else {
      this.incorrectChars++;
      this.secondErrorBuffer++;
      this.currentStreak = 0; // Streak reset!

      // Error sound & shake
      Sound.playError();
      if (Store.settings.screenShake) {
        FX.shakeElement(this.wordsContainer, 3);
      }

      // Track weak key
      const keyKey = targetChar || char;
      this.keyErrors[keyKey] = (this.keyErrors[keyKey] || 0) + 1;

      // Sudden death mode: instant game over!
      if (this.mode === 'survival') {
        this.finishTest(true);
        return;
      }
    }

    if (this.onStreakUpdate) {
      this.onStreakUpdate(this.currentStreak, this.maxStreak);
    }

    // Update DOM for active word
    const activeWordEl = this.wordsContainer.children[this.currentWordIndex];
    this.updateWordDOM(activeWordEl, currentTargetWord, typedWord);
    this.updateCaretPosition();
  }

  updateWordDOM(wordEl, targetWord, typedWord) {
    if (!wordEl) return;
    const letters = wordEl.querySelectorAll('.letter:not(.extra)');
    const extraLetters = wordEl.querySelectorAll('.letter.extra');
    extraLetters.forEach(el => el.remove());

    for (let i = 0; i < letters.length; i++) {
      const letterSpan = letters[i];
      if (i < typedWord.length) {
        if (this.blindMode) {
          letterSpan.className = 'letter typed-blind';
        } else if (typedWord[i] === targetWord[i]) {
          letterSpan.className = 'letter correct';
        } else {
          letterSpan.className = 'letter incorrect';
        }
      } else {
        letterSpan.className = 'letter';
      }
    }

    // Extra letters typed beyond target word length
    if (typedWord.length > targetWord.length) {
      this.extraChars = Math.max(this.extraChars, typedWord.length - targetWord.length);
      for (let i = targetWord.length; i < typedWord.length; i++) {
        const extraSpan = document.createElement('span');
        extraSpan.className = 'letter extra incorrect';
        extraSpan.textContent = typedWord[i];
        wordEl.appendChild(extraSpan);
      }
    }
  }

  activeWordDOM(index) {
    const prev = this.wordsContainer.querySelector('.word.active');
    if (prev) prev.classList.remove('active');

    const next = this.wordsContainer.children[index];
    if (next) next.classList.add('active');
  }

  updateCaretPosition() {
    if (!this.caretElement || !this.wordsContainer) return;

    const activeWordEl = this.wordsContainer.children[this.currentWordIndex];
    if (!activeWordEl) return;

    const letterElements = activeWordEl.querySelectorAll('.letter');
    const parentWrapper = this.wordsContainer.parentElement;
    const wrapperRect = parentWrapper ? parentWrapper.getBoundingClientRect() : this.wordsContainer.getBoundingClientRect();

    let targetRect;
    if (this.currentLetterIndex === 0) {
      const firstLetter = letterElements[0];
      if (firstLetter) {
        const fRect = firstLetter.getBoundingClientRect();
        targetRect = {
          left: fRect.left,
          top: fRect.top,
          height: fRect.height
        };
      } else {
        const wRect = activeWordEl.getBoundingClientRect();
        targetRect = { left: wRect.left, top: wRect.top, height: wRect.height };
      }
    } else if (this.currentLetterIndex <= letterElements.length) {
      const prevLetter = letterElements[this.currentLetterIndex - 1];
      if (prevLetter) {
        const pRect = prevLetter.getBoundingClientRect();
        targetRect = {
          left: pRect.right,
          top: pRect.top,
          height: pRect.height
        };
      }
    }

    if (targetRect) {
      this.caretElement.style.transform = `translate(${targetRect.left - wrapperRect.left}px, ${targetRect.top - wrapperRect.top}px)`;
      this.caretElement.style.height = `${targetRect.height || 28}px`;
    }
  }

  checkScroll() {
    if (!this.wordsContainer) return;
    const activeWord = this.wordsContainer.children[this.currentWordIndex];
    if (!activeWord) return;

    const wordTop = activeWord.offsetTop;
    const lineHeight = 50;

    if (wordTop > lineHeight * 1.5) {
      const scrollOffset = -(wordTop - lineHeight);
      this.wordsContainer.style.transform = `translateY(${scrollOffset}px)`;
    }
  }

  calculateLiveStats() {
    const elapsedMinutes = Math.max(0.005, (Date.now() - (this.startTime || Date.now())) / 60000);
    const rawWpm = Math.round((this.totalKeystrokes / 5) / elapsedMinutes);
    const netWpm = Math.max(0, Math.round(((this.correctChars) / 5) / elapsedMinutes));
    const totalAttempted = this.correctChars + this.incorrectChars;
    const accuracy = totalAttempted > 0 ? Math.round((this.correctChars / totalAttempted) * 100) : 100;

    return {
      wpm: netWpm,
      rawWpm: rawWpm,
      accuracy: accuracy
    };
  }

  calculateConsistency() {
    if (this.wpmSamples.length < 3) return 100;
    const mean = this.wpmSamples.reduce((a, b) => a + b, 0) / this.wpmSamples.length;
    if (mean === 0) return 0;

    const variance = this.wpmSamples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.wpmSamples.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / mean) * 100; // coefficient of variation
    return Math.max(0, Math.min(100, Math.round(100 - cv)));
  }

  finishTest(suddenDeathFailed = false) {
    if (this.isFinished) return;
    this.isFinished = true;
    this.isActive = false;
    this.endTime = Date.now();
    clearInterval(this.timerInterval);

    const durationSeconds = Math.max(1, (this.endTime - (this.startTime || this.endTime)) / 1000);
    const durationMinutes = durationSeconds / 60;

    const rawWpm = Math.round((this.totalKeystrokes / 5) / durationMinutes);
    const netWpm = Math.max(0, Math.round((this.correctChars / 5) / durationMinutes));
    const totalAttempted = this.correctChars + this.incorrectChars;
    const accuracy = totalAttempted > 0 ? Math.round((this.correctChars / totalAttempted) * 100) : 100;
    const consistency = this.calculateConsistency();

    // Sound and particle celebration
    if (!suddenDeathFailed) {
      Sound.playVictory();
      FX.triggerConfettiStorm();
    }

    const result = {
      wpm: netWpm,
      rawWpm: rawWpm,
      accuracy: accuracy,
      consistency: consistency,
      duration: durationSeconds,
      wordsTyped: this.currentWordIndex,
      totalChars: this.totalKeystrokes,
      correctChars: this.correctChars,
      incorrectChars: this.incorrectChars,
      extraChars: this.extraChars,
      missedChars: this.missedChars,
      maxCombo: this.maxStreak,
      mode: this.mode,
      difficulty: this.difficulty,
      keyErrors: this.keyErrors,
      missedWords: this.missedWords,
      timeline: this.timeline,
      suddenDeathFailed
    };

    if (this.onFinish) {
      this.onFinish(result);
    }
  }
}

const Engine = new TypingEngine();
