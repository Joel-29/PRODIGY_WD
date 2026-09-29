const state = { unit: "celsius", latitude: 13.0827, longitude: 80.2707, location: "Chennai, India" };
const $ = (id) => document.getElementById(id);
const weatherCodes = {
  0: ["Clear sky", "☀"], 1: ["Mainly clear", "◒"], 2: ["Partly cloudy", "◐"], 3: ["Overcast", "☁"],
  45: ["Foggy", "≋"], 48: ["Rime fog", "≋"], 51: ["Light drizzle", "╱"], 53: ["Drizzle", "╱"], 55: ["Heavy drizzle", "╱"],
  61: ["Light rain", "◒"], 63: ["Rain", "◒"], 65: ["Heavy rain", "◒"], 71: ["Light snow", "✧"], 73: ["Snow", "✧"], 75: ["Heavy snow", "✧"],
  80: ["Rain showers", "◒"], 81: ["Rain showers", "◒"], 82: ["Heavy showers", "◒"], 95: ["Thunderstorm", "ϟ"], 96: ["Storm & hail", "ϟ"], 99: ["Storm & hail", "ϟ"]
};
const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const displayTemp = (value) => Math.round(value);
const formatTime = (value) => new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const setMessage = (message = "") => { $("form-message").textContent = message; };

function renderForecast(data) {
  const list = $("forecast-list");
  list.innerHTML = data.daily.time.slice(0, 6).map((date, index) => {
    const code = weatherCodes[data.daily.weather_code[index]] || ["Variable", "◐"];
    const day = index === 0 ? "Today" : new Date(`${date}T12:00:00`).toLocaleDateString([], { weekday: "short" });
    return `<div class="forecast-row"><span>${day}</span><span class="forecast-icon">${code[1]}</span><span class="forecast-temp">${displayTemp(data.daily.temperature_2m_max[index])}° <small>${displayTemp(data.daily.temperature_2m_min[index])}°</small></span><span class="forecast-condition">${code[0]}</span></div>`;
  }).join("");
}

async function loadWeather() {
  document.querySelector(".weather-layout").classList.add("is-loading");
  setMessage("Fetching current conditions...");
  const temperatureUnit = state.unit === "celsius" ? "celsius" : "fahrenheit";
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${state.latitude}&longitude=${state.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timezone=auto&temperature_unit=${temperatureUnit}&wind_speed_unit=kmh`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather service unavailable.");
    const data = await response.json();
    const current = data.current;
    const code = weatherCodes[current.weather_code] || ["Variable conditions", "◐"];
    $("location-label").textContent = state.location;
    $("temperature").textContent = Math.round(current.temperature_2m);
    $("feels-like").textContent = Math.round(current.apparent_temperature);
    $("condition").textContent = code[0];
    $("weather-symbol").textContent = code[1];
    $("high").textContent = Math.round(data.daily.temperature_2m_max[0]);
    $("low").textContent = Math.round(data.daily.temperature_2m_min[0]);
    $("humidity").textContent = current.relative_humidity_2m;
    $("wind").textContent = Math.round(current.wind_speed_10m);
    $("wind-direction").textContent = `${directions[Math.round(current.wind_direction_10m / 45) % 8]} direction`;
    $("rain").textContent = data.daily.precipitation_sum[0].toFixed(1);
    $("sunrise").textContent = formatTime(data.daily.sunrise[0]);
    $("sunset").textContent = formatTime(data.daily.sunset[0]);
    $("day-label").textContent = new Date(`${data.daily.time[0]}T12:00:00`).toLocaleDateString([], { weekday: "short" });
    $("observed-time").textContent = `Updated ${formatTime(current.time)}`;
    renderForecast(data);
    setMessage("");
  } catch (error) {
    setMessage(error.message || "Could not load weather. Try again.");
  } finally { document.querySelector(".weather-layout").classList.remove("is-loading"); }
}

async function searchLocation(event) {
  event.preventDefault();
  const query = $("location-input").value.trim();
  if (!query) { setMessage("Enter a city or town to search."); return; }
  setMessage("Finding that place...");
  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
    const data = await response.json();
    if (!data.results?.length) throw new Error("We couldn't find that place.");
    const place = data.results[0];
    state.latitude = place.latitude; state.longitude = place.longitude;
    state.location = [place.name, place.country].filter(Boolean).join(", ");
    await loadWeather();
  } catch (error) { setMessage(error.message || "Search failed. Please try again."); }
}

function useLocation() {
  if (!navigator.geolocation) { setMessage("Location is not supported by this browser."); return; }
  setMessage("Requesting your location...");
  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    state.latitude = coords.latitude; state.longitude = coords.longitude; state.location = "Your location";
    await loadWeather();
  }, () => setMessage("Location access was denied. Search for a city instead."));
}

$("today").textContent = new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
$("search-form").addEventListener("submit", searchLocation);
$("location-button").addEventListener("click", useLocation);
$("unit-toggle").addEventListener("click", () => {
  state.unit = state.unit === "celsius" ? "fahrenheit" : "celsius";
  $("unit-toggle").innerHTML = state.unit === "celsius" ? "°C <span>/ °F</span>" : "°F <span>/ °C</span>";
  $("unit-toggle").setAttribute("aria-label", `Switch to ${state.unit === "celsius" ? "Fahrenheit" : "Celsius"}`);
  loadWeather();
});
loadWeather();
