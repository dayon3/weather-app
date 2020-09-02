// Global app controller
window.addEventListener("load", () => {
  const api = {
    key: "a94952c15772c2f368eea23448812a8b",
    base: "https://api.openweathermap.org/data/2.5/",
  };
  let long;
  let lat;

  const searchBox = document.querySelector(".search-field");
  const button = document.querySelector(".btn");
  const locationTimezone = document.querySelector(".location-timezone");
  const locationTime = document.getElementById("location-time");
  const currentTemp = document.querySelector(".current-temperature");
  const currentDesc = document.querySelector(".current-desc");
  const currentIcon = document.querySelector(".current-icon");
  searchBox.addEventListener("keypress", setQuery);
  button.addEventListener("click", (e) => {
    e.preventDefault();
    setQuery(e);
  });

  setInterval(() => {
    myTimer();
  }, 1000);

  function myTimer() {
    let today = new Date();
    locationTime.textContent = today;
  }

  function setQuery(event) {
    if (event.keyCode === 13 || event.type === "click") {
      event.preventDefault();

      const city = searchBox.value;
      if (city) {
        getResults(city);
      }

      searchBox.value = "";
    }
  }

  function getResults(query) {
    fetch(`${api.base}weather?q=${query}&units=metric&appid=${api.key}`)
      .then((weather) => {
        return weather.json();
      })
      .then(displayResults);
  }

  function displayResults(weather) {
    locationTimezone.textContent = `${weather.name}, ${weather.sys.country}`;
    currentTemp.innerHTML = `${weather.main.temp}<span>&deg;</span>`;
    currentIcon.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
    currentDesc.textContent = `${weather.weather[0].description}`;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      long = position.coords.longitude;
      lat = position.coords.latitude;

      const apiUrl = `${api.base}onecall?lat=${lat}&lon=${long}&exclude=minutely,hourly&appid=${api.key}&units=metric`;

      fetch(apiUrl)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          // console.log(data);
          const {
            temp,
            clouds,
            humidity,
            wind_speed,
            visibility,
            weather,
          } = data.current;
          // Set DOM Elements from the API
          locationTimezone.textContent = data.timezone;
          currentTemp.innerHTML = `${temp}<span>&deg;</span>`;
          currentDesc.textContent = weather[0].description;
        });
    });
  } else {
    h1.textContent = "Geolocation not supported! Upgrade your browser!";
  }
});
