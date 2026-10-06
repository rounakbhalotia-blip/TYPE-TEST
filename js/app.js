/**
 * TypePulse - Application Controller & UI Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const wordsContainer = document.getElementById('words-container');
  const caretElement = document.getElementById('caret');
  const inputCapture = document.getElementById('input-capture');
  const focusOverlay = document.getElementById('focus-overlay');
  const particleCanvas = document.getElementById('particle-canvas');
  const performanceChartCanvas = document.getElementById('performance-chart');
  const typingView = document.getElementById('typing-view');
  const resultsView = document.getElementById('results-view');
  const toastContainer = document.getElementById('toast-container');

  // Live HUD
  const liveWpmEl = document.getElementById('live-wpm');
  const liveAccEl = document.getElementById('live-acc');
  const liveTimerEl = document.getElementById('live-timer');
  const liveTimerLabelEl = document.getElementById('live-timer-label');
  const comboBadgeEl = document.getElementById('combo-badge');
  const comboCountEl = document.getElementById('combo-count');

  // Modals
  const settingsModal = document.getElementById('settings-modal');
  const statsModal = document.getElementById('stats-modal');
  const customTextModal = document.getElementById('custom-text-modal');

  // Engines
  FX.init(particleCanvas);
  const chart = new PerformanceChart(performanceChartCanvas);

  // Initialize Audio & Sound
  Sound.setProfile(Store.settings.soundProfile);
  Sound.setVolume(Store.settings.soundVolume);
  Sound.pitchVariation = Store.settings.pitchVariation;
  Sound.playErrorSound = Store.settings.errorSound;

  // Initialize Typing Engine
  Engine.init({
    wordsContainer,
    caretElement,
    inputCapture
  });

  // Current session state
  let currentPracticeWords = null;

  // --- Theme & Appearance Helpers ---
  function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    Store.saveSettings({ theme: themeName });

    // Update active swatch in settings
    document.querySelectorAll('.theme-swatch').forEach(sw => {
      sw.classList.toggle('active', sw.dataset.theme === themeName);
    });

    // Update FX palette based on theme
    const rootStyles = getComputedStyle(document.documentElement);
    const accent = rootStyles.getPropertyValue('--accent').trim();
    const sec = rootStyles.getPropertyValue('--accent-secondary').trim() || accent;
    const err = rootStyles.getPropertyValue('--error-color').trim();
    FX.setColorPalette([accent, sec, err, '#ffffff']);
  }

  function applyFont(fontName) {
    document.body.className = document.body.className.replace(/\bfont-\S+/g, '');
    document.body.classList.add(`font-${fontName}`);
    Store.saveSettings({ fontFamily: fontName });
  }

  function applyFontSize(size) {
    wordsContainer.style.fontSize = `${size}px`;
    const fontSizeDisplay = document.getElementById('font-size-display');
    if (fontSizeDisplay) fontSizeDisplay.textContent = `${size}px`;
    Store.saveSettings({ fontSize: size });
    Engine.updateCaretPosition();
  }

  function applyCaretStyle(style, smooth) {
    caretElement.className = '';
    if (smooth) caretElement.classList.add('smooth');
    if (style !== 'line') caretElement.classList.add(`style-${style}`);
    Store.saveSettings({ caretStyle: style, smoothCaret: smooth });
  }

  function showToast(message, icon = '✨') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --- Tier / Rank Calculator ---
  function getPerformanceTier(wpm, accuracy) {
    if (accuracy < 80) return { title: 'Erratic Typer', icon: '⚠️', color: '#f59e0b' };
    if (wpm >= 150) return { title: 'Godspeed Deity', icon: '👑', color: '#ec4899' };
    if (wpm >= 130) return { title: 'Transcendent', icon: '🌪️', color: '#a855f7' };
    if (wpm >= 110) return { title: 'Speed Demon', icon: '🔥', color: '#ef4444' };
    if (wpm >= 90) return { title: 'Keyboard Warrior', icon: '⚔️', color: '#f97316' };
    if (wpm >= 70) return { title: 'Speed Adept', icon: '🚀', color: '#06b6d4' };
    if (wpm >= 50) return { title: 'Swift Typist', icon: '⚡', color: '#10b981' };
    if (wpm >= 30) return { title: 'Cadence Walker', icon: '🚶', color: '#3b82f6' };
    return { title: 'Turtle Explorer', icon: '🐢', color: '#64748b' };
  }

  // --- User Level Badge Update ---
  function updateLevelDisplay() {
    const levelInfo = Store.getLevelInfo();
    const badgeEl = document.getElementById('header-level-badge');
    if (badgeEl) {
      badgeEl.innerHTML = `<span>⭐</span> Level <span class="level-num">${levelInfo.level}</span>`;
      badgeEl.title = `${levelInfo.title} (${levelInfo.currentXp} XP)`;
    }
  }

  // --- Start / Reset Test Lifecycle ---
  function startFreshTest(customText = null) {
    resultsView.classList.remove('active');
    typingView.style.display = 'block';

    const options = {
      mode: Store.settings.mode,
      timeLimit: Store.settings.timeLimit,
      wordCount: Store.settings.wordCount,
      difficulty: Store.settings.difficulty,
      includePunctuation: Store.settings.includePunctuation,
      includeNumbers: Store.settings.includeNumbers,
      blindMode: Store.settings.blindMode,
      strictMode: Store.settings.strictMode,
      customText: customText,
      practiceWords: currentPracticeWords
    };

    Engine.setupTest(options);

    // Reset Live HUD
    liveWpmEl.textContent = '0';
    liveAccEl.textContent = '100%';
    comboBadgeEl.classList.remove('visible', 'fire');

    if (Store.settings.mode === 'time') {
      liveTimerLabelEl.textContent = 'Time Left';
      liveTimerEl.textContent = `${Store.settings.timeLimit}s`;
    } else if (Store.settings.mode === 'words') {
      liveTimerLabelEl.textContent = 'Words Left';
      liveTimerEl.textContent = `${Store.settings.wordCount}`;
    } else if (Store.settings.mode === 'zen') {
      liveTimerLabelEl.textContent = 'Elapsed';
      liveTimerEl.textContent = '0s';
    } else if (Store.settings.mode === 'survival') {
      liveTimerLabelEl.textContent = 'Survival';
      liveTimerEl.textContent = '0s';
    } else {
      liveTimerLabelEl.textContent = 'Quote';
      liveTimerEl.textContent = '1/1';
    }

    focusInput();
  }

  function focusInput() {
    if (inputCapture) {
      inputCapture.focus();
    }
    focusOverlay.classList.remove('visible');
  }

  // Window Focus & Blur & Resize management
  focusOverlay.addEventListener('click', () => focusInput());
  focusOverlay.addEventListener('touchend', (e) => {
    e.preventDefault();
    focusInput();
  });
  typingView.addEventListener('click', () => focusInput());
  typingView.addEventListener('touchend', (e) => {
    if (!e.target.closest('button, select, input, a')) {
      focusInput();
    }
  });
  window.addEventListener('resize', () => {
    if (Engine.isActive || Engine.words.length > 0) {
      Engine.updateCaretPosition();
    }
  });
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      Engine.updateCaretPosition();
    }, 150);
  });

  window.addEventListener('keydown', (e) => {
    // Quick restart on Tab
    if (e.key === 'Tab') {
      e.preventDefault();
      currentPracticeWords = null;
      startFreshTest();
      return;
    }

    // Escape closes modals
    if (e.key === 'Escape') {
      closeAllModals();
      return;
    }

    // If modal is open or typing inside custom inputs, don't intercept typing
    if (settingsModal.classList.contains('open') ||
        statsModal.classList.contains('open') ||
        customTextModal.classList.contains('open') ||
        ['TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) ||
        (document.activeElement?.tagName === 'INPUT' && document.activeElement !== inputCapture)) {
      return;
    }

    // Directly forward keydown event to Engine
    if (typingView.style.display !== 'none' && !resultsView.classList.contains('active')) {
      focusOverlay.classList.remove('visible');
      Engine.handleKeyDown(e);
    }
  });

  // --- Engine Callbacks ---
  Engine.onTick = (data) => {
    if (Store.settings.showLiveWpm) {
      liveWpmEl.textContent = data.wpm;
    }
    if (Store.settings.showLiveAcc) {
      liveAccEl.textContent = `${data.accuracy}%`;
    }

    if (Engine.mode === 'time') {
      liveTimerEl.textContent = `${data.timeLeft}s`;
    } else if (Engine.mode === 'words') {
      const remaining = Math.max(0, Engine.wordCountGoal - Engine.currentWordIndex);
      liveTimerEl.textContent = `${remaining}`;
    } else {
      liveTimerEl.textContent = `${data.timeElapsed}s`;
    }
  };

  Engine.onStreakUpdate = (streak, maxStreak) => {
    if (!Store.settings.showLiveStreak) return;

    if (streak >= 5) {
      comboBadgeEl.classList.add('visible');
      comboCountEl.textContent = `${streak}x`;
      if (streak >= 30) {
        comboBadgeEl.classList.add('fire');
      } else {
        comboBadgeEl.classList.remove('fire');
      }
    } else {
      comboBadgeEl.classList.remove('visible', 'fire');
    }
  };

  Engine.onFinish = (result) => {
    // Transition to detailed result screen
    typingView.style.display = 'none';
    resultsView.classList.add('active');

    // Populate Big Hero Stats
    document.getElementById('result-wpm').textContent = result.wpm;
    document.getElementById('result-raw-wpm').textContent = result.rawWpm;
    document.getElementById('result-acc').textContent = `${result.accuracy}%`;
    document.getElementById('result-consistency').textContent = `${result.consistency}%`;
    document.getElementById('result-time').textContent = `${Math.round(result.duration)}s`;
    document.getElementById('result-max-streak').textContent = `${result.maxCombo}x`;
    document.getElementById('result-characters').textContent =
      `${result.correctChars} / ${result.incorrectChars} / ${result.extraChars} / ${result.missedChars}`;

    // Performance Rank
    const tier = getPerformanceTier(result.wpm, result.accuracy);
    const tierBadge = document.getElementById('result-tier-badge');
    tierBadge.innerHTML = `<span>${tier.icon}</span> <span>${tier.title}</span>`;
    tierBadge.style.color = tier.color;
    tierBadge.style.borderColor = tier.color;

    // Render Performance Curve Canvas Chart
    setTimeout(() => {
      chart.setData(result.timeline);
    }, 50);

    // Populate Weak Words List & Button
    const weakWordsList = document.getElementById('weak-words-container');
    const practiceWeakBtn = document.getElementById('btn-practice-weak');
    weakWordsList.innerHTML = '';

    if (result.missedWords && result.missedWords.length > 0) {
      const uniqueWeak = [...new Set(result.missedWords.map(m => m.target))];
      uniqueWeak.forEach(w => {
        const span = document.createElement('span');
        span.className = 'weak-word-tag';
        span.textContent = w;
        weakWordsList.appendChild(span);
      });
      practiceWeakBtn.style.display = 'inline-flex';
      practiceWeakBtn.onclick = () => {
        currentPracticeWords = uniqueWeak;
        showToast(`Loaded ${uniqueWeak.length} weak words for practice drill!`, '🎯');
        startFreshTest();
      };
    } else {
      weakWordsList.innerHTML = '<span style="color:var(--text-dim); font-size:0.85rem;">Zero word errors! Perfect accuracy! 🌟</span>';
      practiceWeakBtn.style.display = 'none';
    }

    // Populate Weak Keys List
    const weakKeysList = document.getElementById('weak-keys-container');
    weakKeysList.innerHTML = '';
    const sortedKeys = Object.entries(result.keyErrors || {}).sort((a, b) => b[1] - a[1]);
    if (sortedKeys.length > 0) {
      sortedKeys.slice(0, 6).forEach(([key, count]) => {
        const item = document.createElement('div');
        item.className = 'weak-key-item';
        item.innerHTML = `<span class="key-char">${key === ' ' ? 'Space' : key}</span> <span class="key-count">(${count})</span>`;
        weakKeysList.appendChild(item);
      });
    } else {
      weakKeysList.innerHTML = '<span style="color:var(--text-dim); font-size:0.85rem;">Flawless keystrokes!</span>';
    }

    // Record Result in Store (XP, Levels, Career Stats, Achievements)
    const prog = Store.recordTestResult(result);
    updateLevelDisplay();

    // Populate XP progress bar in result card
    document.getElementById('xp-earned-num').textContent = `+${prog.xpEarned} XP`;
    const levelInfo = prog.newLevelInfo;
    document.getElementById('result-level-title').textContent = `Level ${levelInfo.level} • ${levelInfo.title}`;
    const fillEl = document.getElementById('xp-progress-fill');
    fillEl.style.width = '0%';
    setTimeout(() => {
      fillEl.style.width = `${levelInfo.progress}%`;
    }, 150);

    // Toast if leveled up!
    if (prog.leveledUp) {
      setTimeout(() => {
        showToast(`🎉 LEVEL UP! You reached Level ${levelInfo.level} (${levelInfo.title})!`, '👑');
        FX.triggerConfettiStorm();
        Sound.playVictory();
      }, 600);
    }

    // Toast if achievements unlocked!
    if (prog.unlockedAchievements && prog.unlockedAchievements.length > 0) {
      prog.unlockedAchievements.forEach((ach, i) => {
        setTimeout(() => {
          showToast(`Achievement Unlocked: ${ach.icon} ${ach.title}!`, '🏆');
        }, 1200 + i * 800);
      });
    }

    // Result action buttons
    document.getElementById('btn-play-again').onclick = () => {
      currentPracticeWords = null;
      startFreshTest();
    };

    document.getElementById('btn-copy-result').onclick = () => {
      copyResultCard(result, tier);
    };

    document.getElementById('btn-export-image').onclick = () => {
      exportResultCardImage(result, tier);
    };
  };

  // --- Copy Result to Clipboard ---
  function copyResultCard(result, tier) {
    const cardText = [
      `🔥 TypePulse Typing Test 🔥`,
      `⚡ WPM: ${result.wpm} (Raw: ${result.rawWpm})`,
      `🎯 Accuracy: ${result.accuracy}%`,
      `📊 Consistency: ${result.consistency}%`,
      `🏆 Rank: ${tier.title} ${tier.icon}`,
      `⚙️ Mode: ${result.mode.toUpperCase()} | Difficulty: ${result.difficulty.toUpperCase()}`,
      `⏱️ Duration: ${Math.round(result.duration)}s | Max Streak: ${result.maxCombo}x`,
      `👉 Beat my score at TypePulse!`
    ].join('\n');

    navigator.clipboard.writeText(cardText).then(() => {
      showToast('Result summary copied to clipboard!', '📋');
    }).catch(() => {
      showToast('Copied to clipboard!', '📋');
    });
  }

  // --- Export Result as PNG Image via Canvas ---
  function exportResultCardImage(result, tier) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 450;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 450);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 450);

    // Accent frame glow
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 760, 410);

    // Brand
    ctx.fillStyle = '#00f2fe';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.fillText('TypePulse', 50, 70);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`Difficulty: ${result.difficulty.toUpperCase()}  •  Mode: ${result.mode.toUpperCase()}`, 50, 95);

    // Hero WPM
    ctx.fillStyle = '#00f2fe';
    ctx.font = 'bold 84px JetBrains Mono, monospace';
    ctx.fillText(`${result.wpm}`, 50, 190);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('WPM', 50 + ctx.measureText(`${result.wpm}`).width + 15, 150);

    // Rank Badge
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText(`${tier.icon} ${tier.title}`, 50, 235);

    // Secondary stats grid
    const stats = [
      { label: 'ACCURACY', val: `${result.accuracy}%` },
      { label: 'RAW WPM', val: `${result.rawWpm}` },
      { label: 'CONSISTENCY', val: `${result.consistency}%` },
      { label: 'MAX STREAK', val: `${result.maxCombo}x` },
      { label: 'TIME', val: `${Math.round(result.duration)}s` },
      { label: 'KEYSTROKES', val: `${result.correctChars}/${result.incorrectChars}` }
    ];

    stats.forEach((st, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = 50 + col * 240;
      const y = 300 + row * 65;

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(st.label, x, y);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 26px JetBrains Mono, monospace';
      ctx.fillText(st.val, x, y + 28);
    });

    // Download PNG
    const link = document.createElement('a');
    link.download = `typepulse-${result.wpm}wpm.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Result card image exported!', '🖼️');
  }

  // --- Sub-config and Mode Selectors ---
  function initConfigControls() {
    // Mode Buttons (Time, Words, Quote, Zen, Survival)
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        Store.saveSettings({ mode });

        // Update Sub-bars visibility
        document.getElementById('time-options-group').style.display = mode === 'time' ? 'flex' : 'none';
        document.getElementById('words-options-group').style.display = mode === 'words' ? 'flex' : 'none';

        startFreshTest();
      });
    });

    // Time Limit Buttons (15, 30, 60, 120)
    const timeButtons = document.querySelectorAll('.time-btn');
    timeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        timeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const limit = parseInt(btn.dataset.time, 10);
        Store.saveSettings({ timeLimit: limit });
        startFreshTest();
      });
    });

    // Word Count Buttons (10, 25, 50, 100)
    const wordButtons = document.querySelectorAll('.word-btn');
    wordButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        wordButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const count = parseInt(btn.dataset.words, 10);
        Store.saveSettings({ wordCount: count });
        startFreshTest();
      });
    });

    // Difficulty Buttons (Easy, Medium, Hard, Nightmare, Code)
    const diffButtons = document.querySelectorAll('.diff-btn');
    diffButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const diff = btn.dataset.diff;
        Store.saveSettings({ difficulty: diff });
        startFreshTest();
      });
    });

    // Modifiers: Punctuation & Numbers
    const punctToggle = document.getElementById('toggle-punctuation');
    if (punctToggle) {
      punctToggle.addEventListener('click', () => {
        const active = !Store.settings.includePunctuation;
        Store.saveSettings({ includePunctuation: active });
        punctToggle.classList.toggle('active', active);
        startFreshTest();
      });
    }

    const numToggle = document.getElementById('toggle-numbers');
    if (numToggle) {
      numToggle.addEventListener('click', () => {
        const active = !Store.settings.includeNumbers;
        Store.saveSettings({ includeNumbers: active });
        numToggle.classList.toggle('active', active);
        startFreshTest();
      });
    }

    // Quick Restart Buttons
    const restartBtn = document.getElementById('btn-quick-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        currentPracticeWords = null;
        startFreshTest();
      });
    }
  }

  // --- Modal Open / Close Logic ---
  function openModal(modal) {
    closeAllModals();
    modal.classList.add('open');
  }

  function closeAllModals() {
    settingsModal.classList.remove('open');
    statsModal.classList.remove('open');
    customTextModal.classList.remove('open');
  }

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAllModals();
    });
  });

  // Header Buttons
  document.getElementById('btn-open-settings').addEventListener('click', () => {
    populateSettingsUI();
    openModal(settingsModal);
  });

  document.getElementById('btn-open-stats').addEventListener('click', () => {
    populateStatsUI();
    openModal(statsModal);
  });

  document.getElementById('header-level-badge').addEventListener('click', () => {
    populateStatsUI();
    openModal(statsModal);
  });

  document.getElementById('btn-custom-text').addEventListener('click', () => {
    openModal(customTextModal);
  });

  // Sound Mute Toggle Quick Button
  const btnToggleSound = document.getElementById('btn-toggle-sound');
  btnToggleSound.addEventListener('click', () => {
    const isMuted = Sound.toggleMute();
    btnToggleSound.classList.toggle('active', !isMuted);
    btnToggleSound.title = isMuted ? 'Unmute Sound' : 'Mute Sound';
    btnToggleSound.innerHTML = isMuted ? '🔇' : '🔊';
    showToast(isMuted ? 'Sound Muted' : 'Sound Enabled', isMuted ? '🔇' : '🔊');
  });

  // Fullscreen Button
  document.getElementById('btn-fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // --- Populate Settings Modal ---
  function populateSettingsUI() {
    // Theme Swatches
    const themesContainer = document.getElementById('settings-themes-grid');
    themesContainer.innerHTML = '';
    const themeList = [
      { id: 'cyberpunk', name: 'Cyberpunk', colors: ['#00f2fe', '#ff007f'] },
      { id: 'dracula', name: 'Dracula', colors: ['#bd93f9', '#50fa7b'] },
      { id: 'matcha', name: 'Matcha', colors: ['#78c28e', '#d6af66'] },
      { id: 'typewriter', name: 'Typewriter', colors: ['#a8422b', '#2b2520'] },
      { id: 'monokai', name: 'Monokai', colors: ['#a6e22e', '#fd971f'] },
      { id: 'nord', name: 'Nord Ice', colors: ['#88c0d0', '#81a1c1'] },
      { id: 'synthwave', name: 'Synthwave', colors: ['#ff007f', '#ffb703'] },
      { id: 'coffee', name: 'Mocha', colors: ['#ce9359', '#7d6b63'] },
      { id: 'cotton_candy', name: 'Pastel', colors: ['#ffb3c6', '#b3c5ff'] },
      { id: 'matrix', name: 'Matrix', colors: ['#00ff66', '#060a07'] }
    ];

    themeList.forEach(t => {
      const sw = document.createElement('div');
      sw.className = `theme-swatch ${Store.settings.theme === t.id ? 'active' : ''}`;
      sw.dataset.theme = t.id;
      sw.innerHTML = `
        <div class="swatch-colors">
          <span class="swatch-dot" style="background:${t.colors[0]}"></span>
          <span class="swatch-dot" style="background:${t.colors[1]}"></span>
        </div>
        <span class="theme-name">${t.name}</span>
      `;
      sw.onclick = () => applyTheme(t.id);
      themesContainer.appendChild(sw);
    });

    // Font Select
    const fontSelect = document.getElementById('setting-font-family');
    fontSelect.value = Store.settings.fontFamily;
    fontSelect.onchange = (e) => applyFont(e.target.value);

    // Font Size Range
    const fontSizeRange = document.getElementById('setting-font-size');
    fontSizeRange.value = Store.settings.fontSize;
    fontSizeRange.oninput = (e) => applyFontSize(parseInt(e.target.value, 10));

    // Caret Style Select
    const caretSelect = document.getElementById('setting-caret-style');
    caretSelect.value = Store.settings.caretStyle;
    caretSelect.onchange = (e) => applyCaretStyle(e.target.value, Store.settings.smoothCaret);

    // Smooth Caret Checkbox
    const smoothCaretCheck = document.getElementById('setting-smooth-caret');
    smoothCaretCheck.checked = Store.settings.smoothCaret;
    smoothCaretCheck.onchange = (e) => applyCaretStyle(Store.settings.caretStyle, e.target.checked);

    // Particle FX Select
    const particleSelect = document.getElementById('setting-particles');
    particleSelect.value = Store.settings.particleMode;
    particleSelect.onchange = (e) => {
      FX.setMode(e.target.value);
      Store.saveSettings({ particleMode: e.target.value });
    };

    // Screen Shake
    const shakeCheck = document.getElementById('setting-screenshake');
    shakeCheck.checked = Store.settings.screenShake;
    shakeCheck.onchange = (e) => Store.saveSettings({ screenShake: e.target.checked });

    // Sound Profile Select
    const soundProfileSelect = document.getElementById('setting-sound-profile');
    soundProfileSelect.value = Store.settings.soundProfile;
    soundProfileSelect.onchange = (e) => {
      Sound.setProfile(e.target.value);
      Store.saveSettings({ soundProfile: e.target.value });
    };

    // Test Sound Button
    document.getElementById('btn-test-sound').onclick = () => {
      Sound.playKey(false);
      setTimeout(() => Sound.playKey(true), 120);
    };

    // Sound Volume
    const volumeRange = document.getElementById('setting-sound-volume');
    volumeRange.value = Math.round(Store.settings.soundVolume * 100);
    volumeRange.oninput = (e) => {
      const vol = parseInt(e.target.value, 10) / 100;
      Sound.setVolume(vol);
      Store.saveSettings({ soundVolume: vol });
    };

    // Error Sound Check
    const errorSoundCheck = document.getElementById('setting-error-sound');
    errorSoundCheck.checked = Store.settings.errorSound;
    errorSoundCheck.onchange = (e) => {
      Sound.playErrorSound = e.target.checked;
      Store.saveSettings({ errorSound: e.target.checked });
    };

    // Strict Mode Check
    const strictCheck = document.getElementById('setting-strict-mode');
    strictCheck.checked = Store.settings.strictMode;
    strictCheck.onchange = (e) => Store.saveSettings({ strictMode: e.target.checked });

    // Blind Mode Check
    const blindCheck = document.getElementById('setting-blind-mode');
    blindCheck.checked = Store.settings.blindMode;
    blindCheck.onchange = (e) => Store.saveSettings({ blindMode: e.target.checked });

    // Reset Data Button
    document.getElementById('btn-reset-data').onclick = () => {
      if (confirm('Are you sure you want to reset all stats, XP, and history? This cannot be undone.')) {
        Store.resetAllData();
        updateLevelDisplay();
        showToast('All stats have been reset.', '🔄');
        closeAllModals();
      }
    };
  }

  // --- Populate Stats & Achievements Modal ---
  function populateStatsUI() {
    const stats = Store.career;
    const levelInfo = Store.getLevelInfo();

    document.getElementById('stats-best-wpm').textContent = stats.bestWpm;
    document.getElementById('stats-avg-wpm').textContent = stats.avgWpm;
    document.getElementById('stats-avg-acc').textContent = `${stats.avgAccuracy}%`;
    document.getElementById('stats-total-tests').textContent = stats.testsCompleted;
    document.getElementById('stats-total-words').textContent = stats.totalWordsTyped;
    document.getElementById('stats-max-streak').textContent = `${stats.maxCombo}x`;

    document.getElementById('modal-level-title').textContent = `Level ${levelInfo.level} — ${levelInfo.title}`;
    document.getElementById('modal-xp-info').textContent = `${levelInfo.currentXp} XP (${Math.round(levelInfo.progress)}% to Level ${levelInfo.level + 1})`;
    document.getElementById('modal-xp-fill').style.width = `${levelInfo.progress}%`;

    // Achievements Grid
    const achContainer = document.getElementById('achievements-container');
    achContainer.innerHTML = '';
    ACHIEVEMENTS_DEF.forEach(ach => {
      const unlocked = Store.achievements.includes(ach.id);
      const card = document.createElement('div');
      card.className = `achievement-card ${unlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <div class="achievement-icon">${ach.icon}</div>
        <div>
          <div class="achievement-title">${ach.title}</div>
          <div class="achievement-desc">${ach.desc}</div>
        </div>
      `;
      achContainer.appendChild(card);
    });

    // History Table
    const histTableBody = document.querySelector('#history-table tbody');
    histTableBody.innerHTML = '';
    const history = Store.history.slice(0, 15);
    if (history.length === 0) {
      histTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-dim);">No tests recorded yet! Start typing!</td></tr>';
    } else {
      history.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.date}</td>
          <td style="color:var(--accent); font-weight:700;">${item.wpm}</td>
          <td>${item.rawWpm}</td>
          <td>${item.accuracy}%</td>
          <td>${item.consistency}%</td>
          <td><span style="text-transform:uppercase; font-size:0.75rem; background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px;">${item.difficulty}</span></td>
        `;
        histTableBody.appendChild(row);
      });
    }
  }

  // --- Custom Text Submission ---
  document.getElementById('btn-apply-custom-text').addEventListener('click', () => {
    const text = document.getElementById('custom-text-input').value.trim();
    if (text.length > 5) {
      closeAllModals();
      startFreshTest(text);
      showToast('Custom text loaded! Ready to type.', '📝');
    } else {
      alert('Please enter at least a few words to practice.');
    }
  });

  // --- Initial Setup Execution ---
  applyTheme(Store.settings.theme);
  applyFont(Store.settings.fontFamily);
  applyFontSize(Store.settings.fontSize);
  applyCaretStyle(Store.settings.caretStyle, Store.settings.smoothCaret);
  FX.setMode(Store.settings.particleMode);
  updateLevelDisplay();
  initConfigControls();

  // Highlight initial config buttons
  document.querySelectorAll(`.mode-btn[data-mode="${Store.settings.mode}"]`).forEach(b => b.classList.add('active'));
  document.querySelectorAll(`.time-btn[data-time="${Store.settings.timeLimit}"]`).forEach(b => b.classList.add('active'));
  document.querySelectorAll(`.word-btn[data-words="${Store.settings.wordCount}"]`).forEach(b => b.classList.add('active'));
  document.querySelectorAll(`.diff-btn[data-diff="${Store.settings.difficulty}"]`).forEach(b => b.classList.add('active'));

  if (Store.settings.includePunctuation) document.getElementById('toggle-punctuation')?.classList.add('active');
  if (Store.settings.includeNumbers) document.getElementById('toggle-numbers')?.classList.add('active');

  // Launch initial test!
  startFreshTest();
});
