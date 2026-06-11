const video = document.getElementById("ditto-video");
const loading = document.getElementById("loading");
const lyric = document.getElementById("lyric");
const memoryStage = document.getElementById("memory-stage");

const MAIN_LYRIC = "말해줘 say it back, say it ditto";
const TEMP_LYRIC = "아침은 너무 멀어 so say it ditto";

let isShowingTempMessage = false;
let tempMessageTimeout = null;

function hideLoading() {
  loading.classList.add("hidden");

  video.play().catch(() => {});
}

video.addEventListener("canplaythrough", hideLoading, { once: true });
video.addEventListener("loadeddata", hideLoading, { once: true });

video.addEventListener("timeupdate", () => {
  if (isShowingTempMessage) return;

  const pulse = 0.75 + 0.25 * Math.sin(video.currentTime * 2);
  lyric.style.opacity = pulse;
});


// clicking jumps to a random moment in the video and changes text.
memoryStage.addEventListener("click", () => {
  if (!Number.isFinite(video.duration) || video.duration <= 0) return;

  video.currentTime = Math.random() * video.duration;

  isShowingTempMessage = true;
  lyric.textContent = TEMP_LYRIC;
  lyric.style.opacity = 1;

  if (tempMessageTimeout) clearTimeout(tempMessageTimeout);

  tempMessageTimeout = setTimeout(() => {
    lyric.textContent = MAIN_LYRIC;
    isShowingTempMessage = false;
  }, 1500);
});
