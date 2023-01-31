export const setPlaceholderText = () => {
  const input = document.getElementById("searchBar__text");
  window.innerWidth < 400
    ? (input.placeholder = "City, State, Country")
    : (input.placeholder = "City, State, Country, Zip Code");
};

export const addSpinner = (el) => {
  animateButton(el);
  setTimeout(animateButton, 1000, el);
};

const animateButton = (el) => {
  el.classList.toggle("none");
  el.nextElementSibling.classList.toggle("block");
  el.nextElementSibling.classList.toggle("none");
};

export const displayError = (headerMsg, srMsg) => {
  updateWeatherLocationHeader(headerMsg);
  updateScreenReaderConfirmation(srMsg);
};

export const displayApiError = (statusCode) => {
  const properMsg = toProperCase(statusCode.message);
  updateWeatherLocationHeader(properMsg);
  updateScreenReaderConfirmation(`${properMsg}. Please try again.`);
};

const toProperCase = (text) => {
  const words = text.split(" ");
  const properWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return properWords.join(" ");
};

const updateWeatherLocationHeader = (msg) => {
  const h1 = document.getElementById("currentForecast__location");
  if (msg.indexOf("Lat:") !== -1 && msg.indexOf("Long:") !== -1) {
    const newMsg = msg.replaceAll(": ", ":");
    const msgArray = newMsg.split(" ");
    const mapArray = msgArray.map((m) => {
      return m.replace(":", ": ");
    });
    const lat =
      mapArray[0].indexOf("-") === -1
        ? mapArray[0].slice(0, 10)
        : mapArray[0].slice(0, 11);
    const lon =
      mapArray[1].indexOf("-") === -1
        ? mapArray[1].slice(0, 11)
        : mapArray[1].slice(0, 12);
    h1.textContent = `${lat} | ${lon}`;
  } else {
    h1.textContent = msg;
  }
};

export const updateScreenReaderConfirmation = (msg) => {
  document.getElementById("confirmation").textContent = msg;
};

export const updateDisplay = (weatherJson, locationObj) => {
  fadeDisplay();
  clearDisplay();
  const weatherClass = getWeatherClass(weatherJson.current.weather[0].icon);
  setBGImage(weatherClass);
  const screenReaderWeather = buildScreenReaderWeather(
    weatherJson,
    locationObj
  );
  updateScreenReaderConfirmation(screenReaderWeather);
  updateWeatherLocationHeader(locationObj.getName());
  const ccArray = createCurrentConditionsDiv(
    weatherJson,
    locationObj.getUnit()
  );
  displayCurrentConditions(ccArray);
  displaySixDayForecast(weatherJson);
  setFocusOnSearch();
  fadeDisplay();
};

const fadeDisplay = () => {
  const current = document.getElementById("currentForecast");
  current.classList.toggle("zero-vis");
  current.classList.toggle("fade-in");
  const daily = document.getElementById("dailyForecast");
  daily.classList.toggle("zero-vis");
  daily.classList.toggle("fade-in");
};

const clearDisplay = () => {
  const currentConditions = document.getElementById(
    "currentForecast__forecast"
  );
  deleteContents(currentConditions);
  const dailyForecastContent = document.getElementById(
    "dailyForecast__contents"
  );
  deleteContents(dailyForecastContent);
};

const deleteContents = (parentElement) => {
  let child = parentElement.lastElementChild;
  while (child) {
    parentElement.removeChild(child);
    child = parentElement.lastElementChild;
  }
};

const getWeatherClass = (icon) => {
  const firstTwoChars = icon.slice(0, 2);
  const lastChar = icon.slice(2);
  const weatherLookUp = {
    "09": "snow",
    10: "rain",
    11: "rain",
    13: "snow",
    50: "fog",
  };
  let weatherClass;
  if (weatherLookUp[firstTwoChars]) {
    weatherClass = weatherLookUp[firstTwoChars];
  } else if (lastChar === "d") {
    weatherClass = "clouds";
  } else {
    weatherClass = "night";
  }
  return weatherClass;
};

const setBGImage = (weatherClass) => {
  document.documentElement.classList.add(weatherClass);
  document.documentElement.classList.forEach((img) => {
    if (img !== weatherClass) document.documentElement.classList.remove(img);
  });
};

const buildScreenReaderWeather = (weatherJson, locationObj) => {
  const location = locationObj.getName();
  const unit = locationObj.getUnit();
  const tempUnit = unit === "imperial" ? "Fahrenheit" : "Celsius";
  return `${weatherJson.current.weather[0].description} and ${Math.round(
    Number(weatherJson.current.temp)
  )} ${tempUnit} in ${location}`;
};

const setFocusOnSearch = () => {
  document.getElementById("searchBar__text").focus();
};

const createCurrentConditionsDiv = (weatherObj, unit) => {
  const tempUnit = unit === "imperial" ? "F" : "C";
  const windUnit = unit === "imperial" ? "mph" : "m/s";
  const icon = createMainImgDiv(
    weatherObj.current.weather[0].icon,
    weatherObj.current.weather[0].description
  );
  const temp = createEl(
    "div",
    "temp",
    `${Math.round(Number(weatherObj.current.temp))}°`,
    tempUnit
  );
  const properDesc = toProperCase(weatherObj.current.weather[0].description);
  const desc = createEl("div", "desc", properDesc);
  const feels = createEl(
    "div",
    "feels",
    `Feels Like ${Math.round(Number(weatherObj.current.feels_like))}°`
  );
  const maxTemp = createEl(
    "div",
    "maxTemp",
    `High ${Math.round(Number(weatherObj.daily[0].temp.max))}°`
  );
  const minTemp = createEl(
    "div",
    "minTemp",
    `Low ${Math.round(Number(weatherObj.daily[0].temp.min))}°`
  );
  const humidity = createEl(
    "div",
    "humidity",
    `Humidity ${weatherObj.current.humidity}%`
  );
  const wind = createEl(
    "div",
    "wind",
    `Wind ${Math.round(Number(weatherObj.current.wind_speed))} ${windUnit}`
  );
  return [icon, temp, desc, feels, maxTemp, minTemp, humidity, wind];
};

const createMainImgDiv = (icon, altText) => {
  const iconDiv = createEl("div", "icon");
  iconDiv.id = "icon";
  const faIcon = iconToFA(icon);
  faIcon.ariaHidden = true;
  faIcon.title = altText;
  iconDiv.appendChild(faIcon);
  return iconDiv;
};

const createEl = (elType, elClass, elText, unit) => {
  const div = document.createElement(elType);
  div.className = elClass;
  if (elText) {
    div.textContent = elText;
  }
  if (elClass === "temp") {
    const unitDiv = document.createElement("div");
    unitDiv.className = "unit";
    unitDiv.textContent = unit;
    div.appendChild(unitDiv);
  }
  return div;
};

const iconToFA = (icon) => {
  const i = document.createElement("i");
  const firstTwoChars = icon.slice(0, 2);
  const lastChar = icon.slice(2);
  switch (firstTwoChars) {
    case "01":
      if (lastChar === "d") {
        i.classList.add("fa-solid", "fa-sun");
      } else {
        i.classList.add("fa-solid", "fa-moon");
      }
      break;
    case "02":
      if (lastChar === "d") {
        i.classList.add("fa-solid", "fa-cloud-sun");
      } else {
        i.classList.add("fa-solid", "fa-cloud-moon");
      }
      break;
    case "03":
      i.classList.add("fa-solid", "fa-cloud");
      break;
    case "04":
      i.classList.add("fa-solid", "fa-cloud-meatball");
      break;
    case "09":
      i.classList.add("fa-solid", "fa-cloud-rain");
      break;
    case "10":
      if (lastChar === "d") {
        i.classList.add("fa-solid", "fa-cloud-sun-rain");
      } else {
        i.classList.add("fa-solid", "fa-cloud-moon-rain");
      }
      break;
    case "11":
      i.classList.add("fa-solid", "fa-poo-storm");
      break;
    case "13":
      i.classList.add("fa-regular", "fa-snowflake");
      break;
    case "50":
      i.classList.add("fa-solid", "fa-smog");
      break;
    default:
      i.classList.add("fa-regular", "fa-question-circle");
  }
  return i;
};

const displayCurrentConditions = (currentConditionsArray) => {
  const ccContainer = document.getElementById("currentForecast__forecast");
  currentConditionsArray.forEach((cc) => {
    ccContainer.appendChild(cc);
  });
};

const displaySixDayForecast = (weatherJson) => {
  for (let i = 1; i <= 6; i++) {
    const dfArray = createDailyForecastDiv(weatherJson.daily[i]);
    displayDailyForecast(dfArray);
  }
};

const createDailyForecastDiv = (dayWeather) => {
  const dayAbbreviationText = getDayAbbreviation(dayWeather.dt);
  const dayAbbreviation = createEl("p", "dayAbbreviation", dayAbbreviationText);
  const dayIcon = createDailyForecastIcon(
    dayWeather.weather[0].icon,
    dayWeather.weather[0].description
  );
  const dayHigh = createEl(
    "p",
    "dayHigh",
    `${Math.round(Number(dayWeather.temp.max))}°`
  );
  const dayLow = createEl(
    "p",
    "dayLow",
    `${Math.round(Number(dayWeather.temp.min))}°`
  );
  return [dayAbbreviation, dayIcon, dayHigh, dayLow];
};

const getDayAbbreviation = (data) => {
  const dateObj = new Date(data * 1000);
  const utcString = dateObj.toUTCString();
  return utcString.slice(0, 3).toUpperCase();
};

const createDailyForecastIcon = (icon, text) => {
  const img = document.createElement("img");
  if (window.innerWidth < 768 || window.innerHeight < 1025) {
    img.src = `https://openweathermap.org/img/wn/${icon}.png`;
  } else {
    img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }
  img.alt = text;
  return img;
};

const displayDailyForecast = (dfArray) => {
  const dayDiv = createEl("div", "forecastDay");
  dfArray.forEach((el) => {
    dayDiv.appendChild(el);
  });
  const dailyForecastContainer = document.getElementById(
    "dailyForecast__contents"
  );
  dailyForecastContainer.appendChild(dayDiv);
};