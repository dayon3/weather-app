// Global app controller
const api = {
  key: "a94952c15772c2f368eea23448812a8b",
  base: "https://api.openweathermap.org/data/2.5/",
  imgBase: "https://openweathermap.org/img/wn/",
};
let long;
let lat;

const searchBox = document.querySelector(".search-field");
const button = document.querySelector(".btn");
const callToAction = document.querySelector(".cta-btn");
const locationTimezone = document.querySelector(".location-timezone");
const locationTime = document.querySelector(".location-time");
const currentTemp = document.querySelector(".current-temperature");
const currentDesc = document.querySelector(".current-desc");
const currentIcon = document.querySelector(".current-icon");
const cloudinessNode = document.querySelector(".cloudiness");
const humidityNode = document.querySelector(".humidity");
const windSpeedNode = document.querySelector(".wind-speed");
const visibilityNode = document.querySelector(".visibility");

const details = document.querySelector(".details");
const nextDaysList = document.querySelector(".next-days__list");
const nextDaysPanel = document.querySelector(".next-days__panel");

searchBox.addEventListener("keypress", setQuery);
button.addEventListener("click", setQuery);
callToAction.addEventListener("click", setQuery);

setInterval(() => {
  myTimer();
}, 1000);

function myTimer() {
  let today = new Date();
  locationTime.textContent = today;
}

function setQuery(event) {
  if (event.srcElement.className === "cta-btn") {
    callToAction.style.display = "none";
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        long = position.coords.longitude;
        lat = position.coords.latitude;

        const apiUrl = `${api.base}onecall?lat=${lat}&lon=${long}&exclude=minutely,hourly&appid=${api.key}&units=metric`;
        renderLoader(details);
        getMyLocation(apiUrl);
      });
    }
  } else if (event.keyCode === 13 || event.type === "click") {
    event.preventDefault();
    callToAction.style.display = "none";

    const city = searchBox.value;
    if (city) {
      const url = `${api.base}weather?q=${city}&units=metric&appid=${api.key}`;
      renderLoader(details);
      getResults(url);
    }
    // clear input field
    searchBox.value = "";
  }
}

async function getMyLocation(url) {
  const weather = await fetch(url);
  const weatherData = await weather.json();
  clearLoader();
  displayMyLocation(weatherData);
}

async function getResults(url) {
  const weather = await fetch(url);
  const weatherData = await weather.json();
  clearLoader();
  displayResults(weatherData);
}

function displayResults(weather) {
  nextDaysPanel.style.display = "none";
  locationTimezone.textContent = `${weather.name}, ${weather.sys.country}`;
  currentTemp.innerHTML = `${Math.round(weather.main.temp)}<span>&deg;</span>`;
  currentIcon.src = `${api.imgBase}${weather.weather[0].icon}@2x.png`;
  currentDesc.textContent = `${weather.weather[0].description}`;
  cloudinessNode.textContent = `${weather.clouds.all}%`;
  humidityNode.textContent = `${weather.main.humidity}%`;
  windSpeedNode.textContent = `${weather.wind.speed} metre/sec`;
  visibilityNode.textContent = `${weather.visibility} metres`;
}

function displayMyLocation(weatherData) {
  const {
    temp,
    clouds,
    humidity,
    wind_speed,
    visibility,
    weather,
  } = weatherData.current;
  // Set DOM Elements from the API
  locationTimezone.textContent = weatherData.timezone;
  currentTemp.innerHTML = `${Math.round(temp)}<span>&deg;</span>`;
  currentIcon.src = `${api.imgBase}${weather[0].icon}@2x.png`;
  currentDesc.textContent = weather[0].description;
  cloudinessNode.textContent = `${clouds}%`;
  humidityNode.textContent = `${humidity}%`;
  windSpeedNode.textContent = `${wind_speed} meter/sec`;
  visibilityNode.textContent = `${visibility} metres`;

  weatherData.daily.forEach((el) => {
    const icon = el.weather[0].icon;
    const description = el.weather[0].description;
    const tempMin = Math.floor(el.temp.min);
    const tempMax = Math.floor(el.temp.max);
    const date = new Date(el.dt * 1000);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const nextDay = `<li>
                <span>${days[date.getDay()]}, ${
      months[date.getMonth()]
    } ${date.getDate()}</span
                ><div><img src="${
                  api.imgBase
                }${icon}.png" alt="weather icon" /><span>${tempMin} / ${tempMax}&deg;C</span></div>
              </li>`;

    nextDaysList.insertAdjacentHTML("beforeend", nextDay);
  });
}

const renderLoader = (parent) => {
  const loader = `<div class="loader"><div></div><div></div></div>`;
  parent.insertAdjacentHTML("afterbegin", loader);
};

const clearLoader = () => {
  const loader = document.querySelector(".loader");
  if (loader) loader.parentElement.removeChild(loader);
};
