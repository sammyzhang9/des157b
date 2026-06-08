(function () {
    'use strict';

    const CLEAR_HOLD_MS = 3000;
    const BLUR_RAMP_MS = 4000;
    const AUTO_ADVANCE_MS = CLEAR_HOLD_MS + BLUR_RAMP_MS + 1500;
    const SLIDE_TRANSITION_MS = 700;

    const introScreen = document.getElementById('intro-screen');
    const openJarBtn = document.getElementById('open-jar-btn');
    const memoryScreen = document.getElementById('memory-screen');
    const memoryContent = document.getElementById('memory-content');
    const collectedScreen = document.getElementById('collected-screen');

    const timestampEl = document.getElementById('memory-timestamp');
    const phraseEl = document.getElementById('memory-phrase');
    const imageEl = document.getElementById('memory-image');
    const imageWrap = document.getElementById('memory-image-wrap');
    const prevSide = document.getElementById('memory-prev');
    const nextSide = document.getElementById('memory-next');
    const foldBtn = document.getElementById('fold-memory-btn');
    const letGoBtn = document.getElementById('let-it-go-btn');
    const positionEl = document.getElementById('memory-position');
    const progressEl = document.getElementById('memory-progress');
    const collectedKeptReflection = document.getElementById('collected-kept-reflection');
    const collectedLetGoReflection = document.getElementById('collected-let-go-reflection');
    const collectedClosing = document.getElementById('collected-closing');
    const collectedTraits = document.getElementById('collected-traits');
    const collectedList = document.getElementById('collected-list');

    let currentIndex = 0;
    let savedMemories = [];
    let letGoMemories = [];
    let heavyBlurTimer = null;
    let advanceTimer = null;
    let isInteracting = false;

    memoryScreen.style.setProperty('--blur-delay', (CLEAR_HOLD_MS / 1000) + 's');
    memoryScreen.style.setProperty('--blur-duration', (BLUR_RAMP_MS / 1000) + 's');
    memoryScreen.style.setProperty('--slide-duration', (SLIDE_TRANSITION_MS / 1000) + 's');

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
        memoryScreen.classList.remove(
            'is-ramping',
            'is-heavy-blur',
            'is-fading-out',
            'is-interacting',
            'is-slide-out',
            'is-slide-in-pending',
            'is-slide-in'
        );
        phraseEl.style.filter = '';
        phraseEl.style.opacity = '';
        imageWrap.style.filter = '';
        imageWrap.style.opacity = '';
        void memoryScreen.offsetWidth;
    }

    function applyMemoryContent(index) {
        const memory = MEMORIES[index];
        if (!memory) {
            return false;
        }

        timestampEl.textContent = memory.timestamp;
        phraseEl.textContent = memory.phrase;
        imageEl.src = memory.image;
        imageEl.alt = memory.phrase;

        setSideImage(prevSide, MEMORIES[index - 1]);
        setSideImage(nextSide, MEMORIES[index + 1]);

        return true;
    }

    function beginMemory(index) {
        if (!applyMemoryContent(index)) {
            finishExperience();
            return;
        }

        updateProgress();
        setControlsEnabled(true);
        startBlurRamp();
    }

    function advanceToIndex(nextIndex) {
        if (!MEMORIES[nextIndex]) {
            finishExperience();
            return;
        }

        isInteracting = true;
        setControlsEnabled(false);
        clearMemoryTimers();
        resetBlurState();
        memoryScreen.classList.add('is-interacting', 'is-slide-out');

        window.setTimeout(function () {
            currentIndex = nextIndex;
            applyMemoryContent(currentIndex);
            memoryScreen.classList.remove('is-slide-out');
            memoryScreen.classList.add('is-slide-in-pending');
            void memoryContent.offsetWidth;
            memoryScreen.classList.remove('is-slide-in-pending');
            memoryScreen.classList.add('is-slide-in');

            window.setTimeout(function () {
                memoryScreen.classList.remove('is-interacting', 'is-slide-in');
                isInteracting = false;
                updateProgress();
                setControlsEnabled(true);
                startBlurRamp();
            }, SLIDE_TRANSITION_MS);
        }, SLIDE_TRANSITION_MS);
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
        positionEl.textContent = (currentIndex + 1) + '/' + TOTAL_MEMORIES;
        progressEl.textContent = savedMemories.length + '/' + MAX_SAVED_MEMORIES;
    }

    function setControlsEnabled(enabled) {
        foldBtn.disabled = !enabled || savedMemories.length >= MAX_SAVED_MEMORIES;
        letGoBtn.disabled = !enabled;
    }

    function renderMemory(index) {
        currentIndex = index;
        beginMemory(index);
    }

    function recordLetGoMemory() {
        const memory = MEMORIES[currentIndex];
        if (!memory) {
            return;
        }

        letGoMemories.push(memory);
    }

    function fadeOutAndAdvance(reason) {
        if (isInteracting && reason !== 'timeout') {
            return;
        }

        recordLetGoMemory();
        advanceToIndex(currentIndex + 1);
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

    function getTraitCounts() {
        const counts = {};

        savedMemories.forEach(function (memory) {
            memory.traits.forEach(function (trait) {
                counts[trait] = (counts[trait] || 0) + 1;
            });
        });

        return Object.entries(counts).sort(function (a, b) {
            return b[1] - a[1];
        });
    }

    function formatTraitList(traits) {
        if (traits.length === 1) {
            return traits[0];
        }

        if (traits.length === 2) {
            return traits[0] + ' and ' + traits[1];
        }

        return traits.slice(0, -1).join(', ') + ', and ' + traits[traits.length - 1];
    }

    function buildReflection() {
        const sorted = getTraitCounts();

        if (!sorted.length) {
            return 'you moved through the memories without keeping any.';
        }

        const topCount = sorted[0][1];
        const topTraits = sorted
            .filter(function (entry) {
                return entry[1] === topCount;
            })
            .map(function (entry) {
                return entry[0];
            });

        if (topTraits.length === 1 && TRAIT_REFLECTIONS[topTraits[0]]) {
            return savedMemories.length + ' memories — ' + TRAIT_REFLECTIONS[topTraits[0]] + '.';
        }

        return savedMemories.length + ' memories — shaped most by ' + formatTraitList(topTraits) + '.';
    }

    function renderTraitSummary() {
        collectedTraits.innerHTML = '';
        const sorted = getTraitCounts().filter(function (entry) {
            return entry[1] > 1;
        });

        sorted.forEach(function (entry) {
            const trait = entry[0];
            const count = entry[1];
            const chip = document.createElement('span');
            chip.className = 'collected-trait';
            chip.textContent = trait + ' (' + count + ')';
            collectedTraits.appendChild(chip);
        });

        collectedTraits.hidden = sorted.length === 0;
    }

    function finishExperience() {
        clearMemoryTimers();
        collectedKeptReflection.textContent = buildReflection();
        collectedLetGoReflection.innerHTML = LETTING_GO_REFLECTION.replace(
            'softer',
            '<em class="collected-screen__emphasis">softer</em>'
        );
        collectedClosing.textContent = CLOSING_STATEMENT;
        renderTraitSummary();
        collectedList.innerHTML = '';

        savedMemories.forEach(function (memory) {
            const item = document.createElement('li');
            item.className = 'collected-memory';

            const image = document.createElement('img');
            image.className = 'collected-memory__image';
            image.src = memory.image;
            image.alt = memory.phrase;

            const textWrap = document.createElement('div');
            textWrap.className = 'collected-memory__text';

            const timestamp = document.createElement('p');
            timestamp.className = 'collected-memory__timestamp';
            timestamp.textContent = memory.timestamp;

            const phrase = document.createElement('p');
            phrase.className = 'collected-memory__phrase';
            phrase.textContent = memory.phrase;

            textWrap.appendChild(timestamp);
            textWrap.appendChild(phrase);
            item.appendChild(image);
            item.appendChild(textWrap);
            collectedList.appendChild(item);
        });

        showScreen(collectedScreen);
    }

    function handleFold() {
        if (isInteracting || savedMemories.length >= MAX_SAVED_MEMORIES) {
            return;
        }

        if (!MEMORIES[currentIndex]) {
            return;
        }

        if (!saveCurrentMemory()) {
            return;
        }

        advanceToIndex(currentIndex + 1);
    }

    function startMemoryCarousel() {
        currentIndex = 0;
        savedMemories = [];
        letGoMemories = [];
        showScreen(memoryScreen);
        renderMemory(currentIndex);
    }

    function handleLetGo() {
        if (isInteracting) {
            return;
        }
        fadeOutAndAdvance('let-go');
    }

    openJarBtn.addEventListener('click', startMemoryCarousel);
    foldBtn.addEventListener('click', handleFold);
    letGoBtn.addEventListener('click', handleLetGo);

    showIntroScreen();
})();
