import React, { useState, useEffect } from 'react';
import './WeatherApp.css';

const WeatherApp = () => {
    const [city, setCity] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [savedCities, setSavedCities] = useState([]);

    const apiKey = "a8e9c2f6244f370c8974cc1bcb5821f9";
    const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

    const getWeatherIcon = (weatherMain) => {
        const icons = {
            Clouds: 'clouds.png',
            Clear: 'clear.png',
            Rain: 'rain.png',
            Drizzle: 'drizzle.png',
            Mist: 'mist.png',
            Snow: 'snow.png',
            Thunderstorm: 'thunderstorm.png'
        };
        return `/images/${icons[weatherMain] || 'clouds.png'}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!city) return;

        setIsLoading(true);
        setError(false);

        try {
            const response = await fetch(`${apiUrl}${city}&appid=${apiKey}`);
            if (!response.ok) throw new Error('City not found');
            
            const data = await response.json();
            setWeatherData({
                city: data.name,
                temp: Math.round(data.main.temp),
                humidity: data.main.humidity,
                wind: data.wind.speed,
                pressure: data.main.pressure,
                visibility: data.visibility/1000,
                feels_like: Math.round(data.main.feels_like),
                weather: data.weather[0].main,
                sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
                sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString()
            });
        } catch (err) {
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const saveCity = () => {
        if (!city || savedCities.some(c => c.city.toLowerCase() === city.toLowerCase())) return;
        const newCity = { 
            city, 
            timestamp: new Date().toLocaleString(),
            temp: weatherData?.temp 
        };
        setSavedCities([newCity, ...savedCities]);
        localStorage.setItem('savedCities', JSON.stringify([newCity, ...savedCities]));
    };

    const removeCity = (cityName) => {
        const updatedCities = savedCities.filter(item => item.city !== cityName);
        setSavedCities(updatedCities);
        localStorage.setItem('savedCities', JSON.stringify(updatedCities));
    };

    useEffect(() => {
        const storedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
        setSavedCities(storedCities);
    }, []);

    return (
        <div className="card">
            <div className="weather-side">
                <form className="search-box" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="🔍 Search city..."
                        value={city}
                        onChange={(e) => setCity(e.target.value.trim())}
                    />
                    <button type="submit">Search</button>
                </form>

                {error && <div className="error-message">Invalid city name!</div>}
                {isLoading && <div className="loading-spinner"></div>}

                {weatherData && !error && !isLoading && (
                    <div className="weather-info">
                        <div className="main-info">
                            <img src={getWeatherIcon(weatherData.weather)} alt="Weather" />
                            <h1>{weatherData.temp}°C</h1>
                            <h2>{weatherData.city}</h2>
                            <p className="condition">{weatherData.weather}</p>
                        </div>

                        <div className="detailed-info">
                            <div className="info-item">
                                <span>Feels like</span>
                                <span>{weatherData.feels_like}°C</span>
                            </div>
                            <div className="info-item">
                                <span>Humidity</span>
                                <span>{weatherData.humidity}%</span>
                            </div>
                            <div className="info-item">
                                <span>Wind</span>
                                <span>{weatherData.wind} km/h</span>
                            </div>
                            <div className="info-item">
                                <span>Pressure</span>
                                <span>{weatherData.pressure} hPa</span>
                            </div>
                            <div className="info-item">
                                <span>Visibility</span>
                                <span>{weatherData.visibility} km</span>
                            </div>
                            <div className="info-item">
                                <span>Sunrise</span>
                                <span>{weatherData.sunrise}</span>
                            </div>
                            <div className="info-item">
                                <span>Sunset</span>
                                <span>{weatherData.sunset}</span>
                            </div>
                        </div>
                        <button onClick={saveCity} className="save-btn">
                            ★ Save City
                        </button>
                    </div>
                )}
            </div>

            <div className="saved-side">
                <h3>Saved Locations ({savedCities.length})</h3>
                <div className="saved-list">
                    {savedCities.map((savedCity, index) => (
                        <div key={index} className="saved-item">
                            <div>
                                <h4>{savedCity.city}</h4>
                                <p>{savedCity.temp}°C · {savedCity.timestamp}</p>
                            </div>
                            <button onClick={() => removeCity(savedCity.city)}>×</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeatherApp; 