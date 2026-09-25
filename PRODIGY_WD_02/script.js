const app = document.querySelector('.stopwatch-card');
const minutesElement = document.querySelector('#minutes');
const secondsElement = document.querySelector('#seconds');
const millisecondsElement = document.querySelector('#milliseconds');
const statusText = document.querySelector('#status-text');
const startButton = document.querySelector('#start-button');
const startLabel = document.querySelector('#start-label');
const resetButton = document.querySelector('#reset-button');
const lapButton = document.querySelector('#lap-button');
const lapCount = document.querySelector('#lap-count');
const lapList = document.querySelector('#lap-list');
const emptyState = document.querySelector('#laps-empty');

let elapsedMilliseconds = 0;
let lastLapMilliseconds = 0;
let startTimestamp = 0;
let timerId = null;

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  return {
    minutes: String(Math.floor(totalSeconds / 60)).padStart(2, '0'),
    seconds: String(totalSeconds % 60).padStart(2, '0'),
    milliseconds: String(Math.floor((milliseconds % 1000) / 10)).padStart(2, '0'),
  };
}

function renderTime() {
  const formatted = formatTime(elapsedMilliseconds);
  minutesElement.textContent = formatted.minutes;
  secondsElement.textContent = formatted.seconds;
  millisecondsElement.textContent = formatted.milliseconds;
}

function updateElapsedTime() {
  elapsedMilliseconds = performance.now() - startTimestamp;
  renderTime();
}

function setRunning(isRunning) {
  app.classList.toggle('running', isRunning);
  statusText.textContent = isRunning ? 'Running' : elapsedMilliseconds ? 'Paused' : 'Ready';
  startLabel.textContent = isRunning ? 'Pause' : 'Start';
  startButton.querySelector('.button-icon').className = `button-icon ${isRunning ? 'pause-icon' : 'play-icon'}`;
  resetButton.disabled = isRunning ? false : elapsedMilliseconds === 0;
  lapButton.disabled = !isRunning;
}

function startStopwatch() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
    elapsedMilliseconds = performance.now() - startTimestamp;
    renderTime();
    setRunning(false);
    return;
  }

  startTimestamp = performance.now() - elapsedMilliseconds;
  timerId = setInterval(updateElapsedTime, 10);
  setRunning(true);
}

function resetStopwatch() {
  clearInterval(timerId);
  timerId = null;
  elapsedMilliseconds = 0;
  lastLapMilliseconds = 0;
  lapList.replaceChildren();
  lapCount.textContent = '0 laps';
  emptyState.hidden = false;
  renderTime();
  setRunning(false);
}

function recordLap() {
  if (timerId === null) return;
  const lapMilliseconds = elapsedMilliseconds - lastLapMilliseconds;
  lastLapMilliseconds = elapsedMilliseconds;
  const formatted = formatTime(lapMilliseconds);
  const row = document.createElement('li');
  row.className = 'lap-row';
  row.innerHTML = `<span>Lap ${lapList.children.length + 1}</span><span>${formatted.minutes}:${formatted.seconds}.${formatted.milliseconds}</span>`;
  lapList.prepend(row);
  emptyState.hidden = true;
  lapCount.textContent = `${lapList.children.length} ${lapList.children.length === 1 ? 'lap' : 'laps'}`;
}

startButton.addEventListener('click', startStopwatch);
resetButton.addEventListener('click', resetStopwatch);
lapButton.addEventListener('click', recordLap);
document.addEventListener('keydown', (event) => {
  if (event.target.matches('input, textarea, select')) return;
  if (event.code === 'Space') {
    event.preventDefault();
    startStopwatch();
  }
  if (event.key.toLowerCase() === 'l') recordLap();
});

renderTime();
setRunning(false);
