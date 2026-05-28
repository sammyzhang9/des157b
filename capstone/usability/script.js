(function () {
    'use strict';

    const STORAGE_KEY = 'portfolioUsabilityOverlayDismissed';
    const CLEAR_HOLD_MS = 3000;
    const BLUR_RAMP_MS = 4000;
    const AUTO_ADVANCE_MS = CLEAR_HOLD_MS + BLUR_RAMP_MS + 1500;
    const FOLD_ANIMATION_MS = 900;
    const LET_GO_ANIMATION_MS = 700;

    const overlay = document.getElementById('usability-overlay');
    const closeButton = document.getElementById('overlay-close');
    const introScreen = document.getElementById('intro-screen');
    const openJarBtn = document.getElementById('open-jar-btn');
    const memoryScreen = document.getElementById('memory-screen');
    const collectedScreen = document.getElementById('collected-screen');

    const timestampEl = document.getElementById('memory-timestamp');
    const phraseEl = document.getElementById('memory-phrase');
    const imageEl = document.getElementById('memory-image');
    const imageWrap = document.getElementById('memory-image-wrap');
    const prevSide = document.getElementById('memory-prev');
    const nextSide = document.getElementById('memory-next');
    const foldBtn = document.getElementById('fold-memory-btn');
    const letGoBtn = document.getElementById('let-it-go-btn');
    const progressEl = document.getElementById('memory-progress');
    const foldStar = document.getElementById('fold-star');
    const collectedReflection = document.getElementById('collected-reflection');
    const collectedStars = document.getElementById('collected-stars');
    const collectedList = document.getElementById('collected-list');

    let currentIndex = 0;
    let savedMemories = [];
    let heavyBlurTimer = null;
    let advanceTimer = null;
    let isInteracting = false;

    memoryScreen.style.setProperty('--blur-delay', (CLEAR_HOLD_MS / 1000) + 's');
    memoryScreen.style.setProperty('--blur-duration', (BLUR_RAMP_MS / 1000) + 's');

    function showScreen(screenEl) {
        document.querySelectorAll('.screen').forEach(function (screen) {
            const active = screen === screenEl;
            screen.hidden = !active;
            screen.classList.toggle('is-active', active);
            screen.setAttribute('aria-hidden', active ? 'false' : 'true');
        });
    }

    function showIntroScreen() {
        introScreen.classList.add('is-active');
        introScreen.removeAttribute('aria-hidden');
        showScreen(introScreen);
    }

    function dismissOverlay(remember) {
        overlay.classList.add('is-hidden');
        overlay.setAttribute('aria-hidden', 'true');
        showIntroScreen();

        if (remember) {
            sessionStorage.setItem(STORAGE_KEY, 'true');
        }
    }

    function clearMemoryTimers() {
        if (heavyBlurTimer) {
            clearTimeout(heavyBlurTimer);
            heavyBlurTimer = null;
        }
        if (advanceTimer) {
            clearTimeout(advanceTimer);
            advanceTimer = null;
        }
    }

    function resetBlurState() {
        memoryScreen.classList.remove('is-ramping', 'is-heavy-blur', 'is-fading-out', 'is-folding', 'is-interacting');
        phraseEl.style.filter = '';
        phraseEl.style.opacity = '';
        imageWrap.style.filter = '';
        imageWrap.style.opacity = '';
        void memoryScreen.offsetWidth;
        foldStar.hidden = true;
        foldStar.classList.remove('is-active');
        foldStar.setAttribute('aria-hidden', 'true');
    }

    function startBlurRamp() {
        clearMemoryTimers();
        resetBlurState();
        memoryScreen.classList.add('is-ramping');

        heavyBlurTimer = setTimeout(function () {
            memoryScreen.classList.remove('is-ramping');
            memoryScreen.classList.add('is-heavy-blur');
        }, CLEAR_HOLD_MS + BLUR_RAMP_MS);

        advanceTimer = setTimeout(function () {
            fadeOutAndAdvance('timeout');
        }, AUTO_ADVANCE_MS);
    }

    function setSideImage(container, memory) {
        const img = container.querySelector('img');
        if (!memory) {
            container.setAttribute('aria-hidden', 'true');
            img.removeAttribute('src');
            img.alt = '';
            return;
        }
        container.removeAttribute('aria-hidden');
        img.src = memory.image;
        img.alt = '';
    }

    function updateProgress() {
        progressEl.textContent = savedMemories.length + '/' + MAX_SAVED_MEMORIES;
    }

    function setControlsEnabled(enabled) {
        foldBtn.disabled = !enabled || savedMemories.length >= MAX_SAVED_MEMORIES;
        letGoBtn.disabled = !enabled;
    }

    function renderMemory(index) {
        const memory = MEMORIES[index];
        if (!memory) {
            finishExperience();
            return;
        }

        timestampEl.textContent = memory.timestamp;
        phraseEl.textContent = memory.phrase;
        imageEl.src = memory.image;
        imageEl.alt = memory.phrase;

        setSideImage(prevSide, MEMORIES[index - 1]);
        setSideImage(nextSide, MEMORIES[index + 1]);

        updateProgress();
        setControlsEnabled(true);
        startBlurRamp();
    }

    function fadeOutAndAdvance(reason) {
        if (isInteracting && reason !== 'timeout') {
            return;
        }

        isInteracting = true;
        clearMemoryTimers();
        memoryScreen.classList.remove('is-ramping', 'is-heavy-blur');
        memoryScreen.classList.add('is-interacting', 'is-fading-out');
        setControlsEnabled(false);

        const delay = reason === 'let-go' ? LET_GO_ANIMATION_MS : 700;

        setTimeout(function () {
            isInteracting = false;
            memoryScreen.classList.remove('is-interacting');
            currentIndex += 1;
            renderMemory(currentIndex);
        }, delay);
    }

    function saveCurrentMemory() {
        const memory = MEMORIES[currentIndex];
        if (!memory || savedMemories.length >= MAX_SAVED_MEMORIES) {
            return false;
        }

        savedMemories.push(memory);
        updateProgress();
        return true;
    }

    function playFoldAnimation(memory, onComplete) {
        clearMemoryTimers();
        memoryScreen.classList.add('is-interacting', 'is-folding');
        setControlsEnabled(false);

        foldStar.style.setProperty('--star-color', memory.starColor);
        foldStar.hidden = false;
        foldStar.setAttribute('aria-hidden', 'false');
        foldStar.classList.add('is-active');

        setTimeout(function () {
            foldStar.classList.remove('is-active');
            foldStar.hidden = true;
            foldStar.setAttribute('aria-hidden', 'true');
            memoryScreen.classList.remove('is-folding', 'is-interacting');
            onComplete();
        }, FOLD_ANIMATION_MS);
    }

    function buildReflection() {
        const counts = {};

        savedMemories.forEach(function (memory) {
            memory.traits.forEach(function (trait) {
                counts[trait] = (counts[trait] || 0) + 1;
            });
        });

        const sorted = Object.entries(counts).sort(function (a, b) {
            return b[1] - a[1];
        });

        if (!sorted.length) {
            return 'You moved through the memories without keeping any.';
        }

        const topTrait = sorted[0][0];
        return 'You kept ' + savedMemories.length + ' memories — most shaped by ' + topTrait + '.';
    }

    function finishExperience() {
        clearMemoryTimers();
        collectedReflection.textContent = buildReflection();
        collectedStars.innerHTML = '';
        collectedList.innerHTML = '';

        savedMemories.forEach(function (memory, index) {
            const star = document.createElement('span');
            star.className = 'collected-star';
            star.style.backgroundColor = memory.starColor;
            star.style.animationDelay = (index * 0.08) + 's';
            star.setAttribute('aria-hidden', 'true');
            collectedStars.appendChild(star);

            const item = document.createElement('li');
            item.innerHTML =
                '<strong>' + memory.timestamp + '</strong>' +
                memory.phrase +
                ' <em>(' + memory.traits.join(', ') + ')</em>';
            collectedList.appendChild(item);
        });

        showScreen(collectedScreen);
    }

    function goToNextAfterFold() {
        currentIndex += 1;

        if (savedMemories.length >= MAX_SAVED_MEMORIES) {
            finishExperience();
            return;
        }

        if (currentIndex >= MEMORIES.length) {
            finishExperience();
            return;
        }

        renderMemory(currentIndex);
    }

    function startMemoryCarousel() {
        currentIndex = 0;
        savedMemories = [];
        showScreen(memoryScreen);
        renderMemory(currentIndex);
    }

    function handleFold() {
        if (isInteracting || savedMemories.length >= MAX_SAVED_MEMORIES) {
            return;
        }

        const memory = MEMORIES[currentIndex];
        if (!memory) {
            return;
        }

        isInteracting = true;
        if (!saveCurrentMemory()) {
            isInteracting = false;
            return;
        }

        playFoldAnimation(memory, function () {
            isInteracting = false;
            goToNextAfterFold();
        });
    }

    function handleLetGo() {
        if (isInteracting) {
            return;
        }
        fadeOutAndAdvance('let-go');
    }

    closeButton.addEventListener('click', function () {
        dismissOverlay(true);
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !overlay.classList.contains('is-hidden')) {
            dismissOverlay(true);
        }
    });

    openJarBtn.addEventListener('click', startMemoryCarousel);
    foldBtn.addEventListener('click', handleFold);
    letGoBtn.addEventListener('click', handleLetGo);

    if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
        overlay.classList.add('is-hidden');
        overlay.setAttribute('aria-hidden', 'true');
        showIntroScreen();
    } else {
        overlay.setAttribute('aria-hidden', 'false');
        introScreen.setAttribute('aria-hidden', 'true');
        closeButton.focus();
    }
})();
