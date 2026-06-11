const ACTIVE_WIDTH = 560;
const INACTIVE_WIDTH = 340;
const REEL_GAP = 24;

let movies = [];
let activeIndex = 0;

const reelTrack = document.getElementById("reel-track");
const timelineEl = document.getElementById("timeline");
const ratingEl = document.getElementById("rating");
const reviewEl = document.getElementById("review");
const titleEl = document.getElementById("title");
const dateEl = document.getElementById("date");
const prevBtn = document.querySelector(".nav--prev");
const nextBtn = document.querySelector(".nav--next");
const archiveEl = document.querySelector(".archive");

const STAR_SVG = `
  <svg class="star" viewBox="0 0 11 11" aria-hidden="true">
    <path d="M5.5 0L6.8 4H11L7.6 6.5L8.9 10.5L5.5 8L2.1 10.5L3.4 6.5L0 4H4.2L5.5 0Z"/>
  </svg>
`;


async function loadMovies() {
  try {
    const response = await fetch("movies.json");

    if (!response.ok) {
      throw new Error(`Could not load movies.json (${response.status})`);
    }

    movies = await response.json();
    renderReel();
    renderTimeline();
    setActive(0);
  } catch (error) {
    console.error(error);
    archiveEl.classList.add("archive--error");
    reviewEl.textContent = "Could not load your movie archive. Try opening with Live Server.";
  }
}


function renderReel() {
  reelTrack.innerHTML = "";

  movies.forEach((movie, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "reel__item";
    item.dataset.index = index;
    item.setAttribute("aria-label", `Watch ${movie.title}`);

    const video = document.createElement("video");
    video.src = movie.videoSrc;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";

    item.appendChild(video);

    item.addEventListener("click", () => {
      if (index !== activeIndex) {
        setActive(index);
      }
    });

    reelTrack.appendChild(item);
  });
}


function renderTimeline() {
  timelineEl.innerHTML = "";

  movies.forEach((movie, index) => {
    const tick = document.createElement("button");
    tick.type = "button";
    tick.className = "timeline__tick";
    tick.dataset.index = index;
    tick.setAttribute("role", "tab");
    tick.setAttribute("aria-label", movie.title);

    const tooltip = document.createElement("span");
    tooltip.className = "timeline__tooltip";
    tooltip.textContent = movie.title;
    tick.appendChild(tooltip);

    tick.addEventListener("click", () => {
      setActive(index);
    });

    timelineEl.appendChild(tick);
  });
}

function getItemWidth(index) {
  return index === activeIndex ? ACTIVE_WIDTH : INACTIVE_WIDTH;
}

function centerTrack() {
  const viewport = reelTrack.parentElement;
  const viewportWidth = viewport.offsetWidth;

  let offset = viewportWidth / 2;

  for (let i = 0; i < activeIndex; i += 1) {
    offset -= getItemWidth(i) + REEL_GAP;
  }

  offset -= getItemWidth(activeIndex) / 2;

  reelTrack.style.transform = `translateX(${offset}px)`;
}


function syncVideos() {
  const items = reelTrack.querySelectorAll(".reel__item");

  items.forEach((item, index) => {
    const video = item.querySelector("video");

    if (index === activeIndex) {
      video.play().catch(() => {
      });
    } else {
      video.pause();
    }
  });
}


function updateMetadata() {
  const movie = movies[activeIndex];

  ratingEl.innerHTML = "";
  ratingEl.setAttribute("aria-label", `${movie.rating} out of 5 stars`);

  for (let i = 1; i <= 5; i += 1) {
    const starWrap = document.createElement("span");
    starWrap.innerHTML = STAR_SVG;
    const star = starWrap.firstElementChild;
    star.classList.add(i <= movie.rating ? "star--filled" : "star--empty");
    ratingEl.appendChild(star);
  }

  reviewEl.textContent = movie.review;
  titleEl.textContent = movie.title;
  dateEl.textContent = movie.watchedDate;
}


function setActive(index) {
  if (movies.length === 0) {
    return;
  }

  activeIndex = Math.max(0, Math.min(index, movies.length - 1));

  const reelItems = reelTrack.querySelectorAll(".reel__item");
  const timelineTicks = timelineEl.querySelectorAll(".timeline__tick");

  reelItems.forEach((item, i) => {
    item.classList.toggle("is-active", i === activeIndex);
    item.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
  });

  timelineTicks.forEach((tick, i) => {
    tick.classList.toggle("is-active", i === activeIndex);
    tick.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
  });

  centerTrack();
  updateMetadata();
  syncVideos();
}

prevBtn.addEventListener("click", () => {
  setActive(activeIndex - 1);
});

nextBtn.addEventListener("click", () => {
  setActive(activeIndex + 1);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    setActive(activeIndex - 1);
  } else if (event.key === "ArrowRight") {
    setActive(activeIndex + 1);
  }
});

window.addEventListener("resize", () => {
  if (movies.length > 0) {
    centerTrack();
  }
});

loadMovies();
