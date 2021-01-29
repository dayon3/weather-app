// Global app controller
const api = {
  key: "a94952c15772c2f368eea23448812a8b",
  base: "https://api.openweathermap.org/data/2.5/",
  imgBase: "https://openweathermap.org/img/wn/",
};

const searchBox = document.querySelector(".search-field"),
  button = document.querySelector(".btn"),
  callToAction = document.querySelector(".cta-btn"),
  locationTimezone = document.querySelector(".location-timezone"),
  locationTime = document.querySelector(".location-time"),
  currentTemp = document.querySelector(".current-temperature"),
  currentDesc = document.querySelector(".current-desc"),
  currentIcon = document.querySelector(".current-icon"),
  cloudinessNode = document.querySelector(".cloudiness"),
  humidityNode = document.querySelector(".humidity"),
  windSpeedNode = document.querySelector(".wind-speed"),
  visibilityNode = document.querySelector(".visibility"),
  details = document.querySelector(".details"),
  recentSearchList = document.querySelector(".recent-search__list"),
  nextDaysList = document.querySelector(".next-days__list"),
  nextDaysPanel = document.querySelector(".next-days__panel"),
  listItem = document.querySelector(".list-item");

window.addEventListener("load", recentSearch);
searchBox.addEventListener("keypress", setQuery);
button.addEventListener("click", setQuery);
callToAction.addEventListener("click", setQuery);

setInterval(myTimer, 1000);

function myTimer() {
  let today = new Date().toLocaleTimeString("en-US", {
    weekday: "short",
    month: "short",
    year: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  locationTime.textContent = today;
}

function setQuery(event) {
  let long;
  let lat;
  if (event.srcElement.className === "cta-btn") {
    // remove button
    callToAction.style.display = "none";
    // render loading spinner
    renderLoader(details);
    // get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        long = position.coords.longitude;
        lat = position.coords.latitude;

        const apiUrl = `${api.base}onecall?lat=${lat}&lon=${long}&exclude=minutely,hourly&appid=${api.key}&units=metric`;
        getMyLocation(apiUrl);
      });
    }
  } else if (event.keyCode === 13 || event.type === "click") {
    event.preventDefault();
    callToAction.style.display = "none";

    const city = searchBox.value;
    if (city) {
      const url = `${api.base}weather?q=${city}&units=metric&appid=${api.key}`;
      locationTimezone.textContent = "";
      renderLoader(details);
      getResults(url, city);
    }
    // clear input field
    searchBox.value = "";
  }
}

async function getMyLocation(url) {
  try {
    const weather = await fetch(url);
    const weatherData = await weather.json();
    clearLoader();
    displayMyLocation(weatherData);
  } catch (error) {
    clearLoader();
    console.log(error);
  }
}

async function getResults(url, city) {
  try {
    const weather = await fetch(url);
    const weatherData = await weather.json();
    let cityData = JSON.stringify(weatherData);
    let cityName = city.charAt(0).toUpperCase() + city.slice(1);
    localStorage.setItem(`${cityName}`, cityData);
    clearLoader();
    displayResults(weatherData);
    recentSearch();
  } catch (error) {
    if (error) {
      clearLoader();
      locationTimezone.textContent = `Check your internet connection!`;
      currentTemp.innerHTML = "";
      currentIcon.style.display = "none";
    }
    console.log(error);
  }
}

function displayResults(weather) {
  nextDaysPanel.style.display = "none";
  locationTimezone.textContent = `${weather.name}, ${weather.sys.country}`;
  currentTemp.innerHTML = `${Math.round(weather.main.temp)}<span>&deg;C</span>`;
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
  // Set DOM Elements from API data
  locationTimezone.textContent = weatherData.timezone
    .split("/")
    .reverse()
    .join(", ");
  currentTemp.innerHTML = `${Math.round(temp)}<span>&deg;C</span>`;
  currentIcon.src = `${api.imgBase}${weather[0].icon}@2x.png`;
  currentDesc.textContent = weather[0].description;
  cloudinessNode.textContent = `${clouds}%`;
  humidityNode.textContent = `${humidity}%`;
  windSpeedNode.textContent = `${wind_speed} meter/sec`;
  visibilityNode.textContent = `${visibility} metres`;

  weatherData.daily.forEach((el) => {
    const icon = el.weather[0].icon;
    const tempMin = Math.round(el.temp.min);
    const tempMax = Math.round(el.temp.max);
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
                }${icon}.png" alt="weather icon" /><span>${tempMin}&deg;C / ${tempMax}&deg;C</span></div>
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

function recentSearch() {
  let listItem = (city) => {
    return `
      <li class="list-item" data-itemid=${city}>
        <p>${city}</p>
        <button class="list-delete tooltip">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="25px" height="25px"><path fill="#E04F5F" d="M504.1,256C504.1,119,393,7.9,256,7.9C119,7.9,7.9,119,7.9,256C7.9,393,119,504.1,256,504.1C393,504.1,504.1,393,504.1,256z"/><path fill="#FFF" d="M285,256l72.5-84.2c7.9-9.2,6.9-23-2.3-31c-9.2-7.9-23-6.9-30.9,2.3L256,222.4l-68.2-79.2c-7.9-9.2-21.8-10.2-31-2.3c-9.2,7.9-10.2,21.8-2.3,31L227,256l-72.5,84.2c-7.9,9.2-6.9,23,2.3,31c4.1,3.6,9.2,5.3,14.3,5.3c6.2,0,12.3-2.6,16.6-7.6l68.2-79.2l68.2,79.2c4.3,5,10.5,7.6,16.6,7.6c5.1,0,10.2-1.7,14.3-5.3c9.2-7.9,10.2-21.8,2.3-31L285,256z"/></svg>
          <span class="tooltiptext tooltip-bottom">Clear</span>
        </button>
      </li>`;
  };

  // get results from previous search
  if (localStorage.length) {
    recentSearchList.innerHTML = null;
    Object.keys(localStorage).forEach((city) => {
      recentSearchList.insertAdjacentHTML("afterbegin", listItem(city));
    });
  } else {
    recentSearchList.innerHTML =
      "<li><small>No recent search history</small></li>";
  }
}

function deleteItem(id) {
  const item = document.querySelector(`[data-itemid=${id}]`);
  item.parentElement.removeChild(item);
}

// remove recent search item
async function deleteCity(city) {
  localStorage.removeItem(`${city}`);
}

recentSearchList.addEventListener("click", (event) => {
  const id = event.target.closest(".list-item").dataset.itemid;

  if (event.target.matches(".list-delete, .list-delete *")) {
    // Delete from localstorage
    deleteCity(`${id}`);

    // Delete from UI
    deleteItem(id);
  } else if (event.target.matches(".list-item, .list-item *")) {
    callToAction.style.display = "none";
    const data = localStorage.getItem(`${id}`);
    const localData = JSON.parse(data);
    displayResults(localData);
  }
});
