import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [locationInfo, setLocationInfo] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState('');
  const openCageKey = import.meta.env.VITE_OPENCAGE_API_KEY;
  const weatherKey = import.meta.env.VITE_WEATHER_API_KEY;


  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lon: longitude });

          try {
            // Fetch reverse geocoding location info
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${openCageKey}`
            );
            const data = await response.json();
            if (data.results.length > 0) {
              setLocationInfo(data.results[0]);
            } else {
              setLocationError('No location data found.');
            }
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
            setLocationError('Failed to fetch location details.');
          }

          try {
            // Fetch weather info from OpenWeatherMap
            const weatherRes = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherKey}&units=metric`
            );
            const weatherData = await weatherRes.json();
            if (weatherRes.ok) {
              setWeather(weatherData);
            } else {
              setWeatherError(weatherData.message || 'Failed to fetch weather data.');
            }
          } catch (error) {
            console.error('Weather fetch failed:', error);
            setWeatherError('Failed to fetch weather data.');
          }
        },
        (error) => {
          console.error('Location access denied:', error);
          setLocationError('Location access denied or unavailable.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  const getBestCityName = (components) => {
    return (
      components.city ||
      components.town ||
      components.village ||
      components.suburb ||
      components.county ||
      components.state_district ||
      'N/A'
    );
  };

  return (
    <div className="App">
      <h3>📍 Your Location Details (Powered by OpenCage)</h3>

      {coords && (
        <div className="result">
          <strong>Latitude:</strong> {coords.lat} <br />
          <strong>Longitude:</strong> {coords.lon}
        </div>
      )}

      {locationInfo && (
        <div className="result">
          <strong>City:</strong> {getBestCityName(locationInfo.components)} <br />
          <strong>State:</strong> {locationInfo.components.state || 'N/A'} <br />
          <strong>Postcode:</strong> {locationInfo.components.postcode || 'N/A'} <br />
          <strong>Country:</strong> {locationInfo.components.country || 'N/A'} <br />
          <strong>Formatted Address:</strong> {locationInfo.formatted}
        </div>
      )}

      {weather && (
        <div className="result" style={{ marginTop: '20px' }}>
          <h3>🌤️ Current Weather</h3>
          <strong>Temperature:</strong> {weather.main.temp} °C <br />
          <strong>Feels Like:</strong> {weather.main.feels_like} °C <br />
          <strong>Weather:</strong> {weather.weather[0].description} <br />
          <strong>Humidity:</strong> {weather.main.humidity} % <br />
          <strong>Wind Speed:</strong> {weather.wind.speed} m/s
        </div>
      )}

      {(locationError || weatherError) && (
        <div className="error" style={{ marginTop: '20px', color: 'red' }}>
          <strong>Error:</strong> {locationError || weatherError}
        </div>
      )}
    </div>
  );
}

export default App;
