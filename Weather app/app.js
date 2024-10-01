const apiKey = 'be239583751f1a66f092c975aa7aa259';
const input = document.getElementById("cityInput");
let markers = [];

// Default setting

window.onload = function() {
    const defaultCity = 'Amsterdam'; // Set your default city here
    fetchWeatherData(defaultCity); 
};

// Get user input (City)

input.addEventListener("keydown", function(event) {
  
  if (event.key === "Enter") {

    const inputValue = input.value;

    console.log(inputValue);

    input.value = '';

    fetchWeatherData(inputValue)

  }
});

// fetch data from api

async function fetchWeatherData(city) {

 const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

 try{

    const response = await fetch(apiUrl);

    if (!response.ok){
        throw new Error(`HTTP error! Status:= ${response.status}`);
    }

    const data = await response.json();

    const lat = data.coord.lat;
    const lon = data.coord.lon;

    
    markers.forEach(marker => {
    map.removeLayer(marker);
    });

    markers = [];

  
    const newMarker = L.marker([lat, lon]).addTo(map);
  
  
    markers.push(newMarker);

    fetchAirQualityIndex(lat, lon);
    console.log(data);
    displayWeather(data);

 } catch (error) {

    console.error('error fetching weather data', error);

 }

};

async function fetchAirQualityIndex (lat, lon) {

    const apiUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`

    try{

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status:= ${response.status}`);
        }

        const uvIndex = await response.json();
        displayUvIndex(uvIndex);



    } catch (error) {
        console.error('error fetching UV index data', error);
    }
   
 };
// Display data


function displayUvIndex(uvIndex) {
    // Extract individual pollution components
    const so2 = uvIndex.list[0].components.so2;
    const no2 = uvIndex.list[0].components.no2;
    const o3 = uvIndex.list[0].components.o3;
    const pm2_5 = uvIndex.list[0].components.pm2_5;
  
    // Display the pollution components
    document.getElementById('so2').innerHTML = so2;
    document.getElementById('no2').innerHTML = no2;
    document.getElementById('o3').innerHTML = o3;
    document.getElementById('pm2_5').innerHTML = pm2_5;
  
    // Extract the AQI value
    const aqi = uvIndex.list[0].main.aqi;
  
    // Function to map AQI value to a readable label and muted background color
    function getAirQualityText(aqi) {
      let description;
      let bgColor;
  
      switch(aqi) {
        case 1:
          description = "Good";
          bgColor = "#4d774e"; // Muted green
          break;
        case 2:
          description = "Fair";
          bgColor = "#b3b34d"; // Muted yellow
          break;
        case 3:
          description = "Moderate";
          bgColor = "#b38f4d"; // Muted orange
          break;
        case 4:
          description = "Poor";
          bgColor = "#a34d4d"; // Muted red
          break;
        case 5:
          description = "Very Poor";
          bgColor = "#7d4d7d"; // Muted purple
          break;
        default:
          description = "Unknown";
          bgColor = "#595959"; // Muted gray for unknown
      }
  
      return { description, bgColor };
    }
  
    // Get air quality description and background color
    const airQuality = getAirQualityText(aqi);
  
    // Display the AQI information with description and background color
    const airQualityH1 = document.getElementById('aqi');
    airQualityH1.innerHTML = `Air Quality: ${airQuality.description}`;
    airQualityH1.style.backgroundColor = airQuality.bgColor; // Set muted background color
    airQualityH1.style.color = "black"; // Ensure the text is visible
    airQualityH1.style.padding = "10px"; // Optional: Add padding for better visibility
  }
  


function displayWeather(data){
    // create content
    const city = data.name;
    const temperature = Math.round(data.main.temp - 273.15);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const pressure = data.main.pressure;
    const feelsLike = Math.round(data.main.feels_like - 273.15);
    const visibility = data.visibility / 1000;
     // Get the icon code and construct the URL

    const iconCode = data.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // get date 
    
    const unixCurrentTime = data.dt + data.timezone;

    const dateObj = new Date(unixCurrentTime * 1000);
    const utcString = dateObj.toUTCString();

    // Sunrise & Sunset

    const unixSunrise = data.sys.sunrise + data.timezone;

    const dateObjSunrise = new Date(unixSunrise * 1000);
    const utcStringSunrise = dateObjSunrise.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Set to false for 24-hour format
    });
    
    const unixSunset = data.sys.sunset + data.timezone;

    const dateObjSunset = new Date(unixSunset * 1000);
    const utcStringSunset = dateObjSunset.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Set to false for 24-hour format
    });

    // set content
    document.getElementById('city').innerHTML = city;
    document.getElementById('temperature').innerHTML = temperature + '&deg;C';
    document.getElementById('description').innerHTML = description;
    document.getElementById('date').innerHTML = utcString;
    document.getElementById('humidity').innerHTML = humidity + '%';
    document.getElementById('pressure').innerHTML = pressure + ' hpa';
    document.getElementById('feelsLike').innerHTML = feelsLike + '&deg;C';
    document.getElementById('visibility').innerHTML = visibility + ' km';
    document.getElementById('sunrise').innerHTML = utcStringSunrise;
    document.getElementById('sunset').innerHTML = utcStringSunset;
    document.getElementById('weatherIcon').src = iconUrl;
    // document.getElementById('').innerHTML = ;
    
    
}


// Interactive map


async function reverseGeocode(lat, lon) {
  const mapApi = '032c967501924b3d84881defde3533d5';
  const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${mapApi}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.results.length > 0) {

      const city = data.results[0].components.city || data.results[0].components.town || data.results[0].components.village;
      fetchWeatherData(city);

    } else {
      throw new Error('No city found for the given coordinates');
    }
  } catch (error) {
    console.error('Error during reverse geocoding', error);
  }
}


var map = L.map('map').setView([0, 0], 1);
L.tileLayer('https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=DQ0cKf0DRfU6pRCXE8Z1', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
}).addTo(map);

// Function to handle map click
function onMapClick(e) {
  // Save latitude and longitude, rounded to 4 decimal places
  let lat = parseFloat(e.latlng.lat.toFixed(4));
  let lon = parseFloat(e.latlng.lng.toFixed(4));
  
  console.log(lat, lon);
  
  // Fetch weather data
  reverseGeocode(lat, lon);
  
  // Remove existing markers from the map
  markers.forEach(marker => {
    map.removeLayer(marker);
  });

  // Clear the markers array
  markers = [];

  // Create a new marker at the clicked location and add it to the map
  const newMarker = L.marker([lat, lon]).addTo(map);
  
  // Store the new marker in the array
  markers.push(newMarker);
}

map.on('click', onMapClick);

