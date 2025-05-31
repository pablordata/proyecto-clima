let weatherData = {};
let isDarkMode = false;

// Función para cambiar entre modo claro y oscuro
function toggleTheme() {
    isDarkMode = !isDarkMode;
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (isDarkMode) {
        body.classList.add('dark-mode');
        themeIcon.textContent = '☀️';
        // Usar variable en memoria en lugar de localStorage
        sessionStorage.setItem('darkMode', 'true');
    } else {
        body.classList.remove('dark-mode');
        themeIcon.textContent = '🌙';
        sessionStorage.setItem('darkMode', 'false');
    }
}

// Cargar tema guardado al iniciar
function loadTheme() {
    const savedTheme = sessionStorage.getItem('darkMode');
    if (savedTheme === 'true') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        document.getElementById('themeIcon').textContent = '☀️';
    } else {
        isDarkMode = false;
        document.body.classList.remove('dark-mode');
        document.getElementById('themeIcon').textContent = '🌙';
    }
}

async function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    
    if (!city) {
        showError('Por favor ingresa el nombre de una ciudad');
        return;
    }

    showLoading();

    try {
        // Primero obtenemos las coordenadas de la ciudad
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es&format=json`);
        
        if (!geoResponse.ok) {
            throw new Error(`Error al buscar la ciudad (HTTP ${geoResponse.status})`);
        }

        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Ciudad no encontrada. Intenta con otro nombre o verifica la escritura.');
        }

        const location = geoData.results[0];
        const { latitude, longitude, name, country, admin1 } = location;

        // CORRECCIÓN: Cambiar ¤ por & en la URL
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`
        );

        if (!weatherResponse.ok) {
            throw new Error(`Error al obtener datos del clima (HTTP ${weatherResponse.status})`);
        }

        weatherData = await weatherResponse.json();
        displayWeather(weatherData, name, country, admin1);

    } catch (error) {
        console.error('Error en getWeather:', error);
        showError(error.message || 'Ocurrió un error al procesar la solicitud.');
    }
}

function displayWeather(data, cityName, country, region) {
    const current = data.current;
    const daily = data.daily;
    const weatherContainer = document.getElementById('weatherData');

    // Determinar color de texto basado en el modo actual para el H3
    const forecastTitleColor = document.body.classList.contains('dark-mode') ? '#e0e0e0' : '#333';

    const weatherHTML = `
        <div class="current-weather">
            <h2>📍 ${cityName}${region ? ', ' + region : ''}${country ? ', ' + country : ''}</h2>
            <div class="current-temp">${Math.round(current.temperature_2m)}°C</div>
            <p>${getWeatherDescription(current.weather_code)}</p>
            <p>Sensación térmica: ${Math.round(current.apparent_temperature)}°C</p>
            
            <div class="weather-details">
                <div class="weather-card">
                    <h4>💧 Humedad</h4>
                    <p>${current.relative_humidity_2m}%</p>
                </div>
                <div class="weather-card">
                    <h4>🌧️ Precipitación</h4>
                    <p>${current.precipitation} mm</p>
                </div>
                <div class="weather-card">
                    <h4>💨 Viento</h4>
                    <p>${Math.round(current.wind_speed_10m)} km/h</p>
                </div>
                <div class="weather-card">
                    <h4>🧭 Dirección</h4>
                    <p>${getWindDirection(current.wind_direction_10m)}</p>
                </div>
            </div>
        </div>

        <h3 style="margin: 25px 0 15px 0; color: ${forecastTitleColor};">📅 Pronóstico de 7 días</h3>
        <div class="forecast">
            ${daily.time.map((date, index) => `
                <div class="forecast-card">
                    <h4>${formatDate(date)}</h4>
                    <div style="font-size: 1.5rem; margin: 10px 0;">
                        ${getWeatherIcon(daily.weather_code[index])}
                    </div>
                    <p><strong>${Math.round(daily.temperature_2m_max[index])}°</strong> / ${Math.round(daily.temperature_2m_min[index])}°</p>
                    <p style="font-size: 0.9rem; margin-top: 5px;">
                        💧 ${daily.precipitation_sum[index]} mm<br>
                        💨 ${Math.round(daily.wind_speed_10m_max[index])} km/h
                    </p>
                </div>
            `).join('')}
        </div>
    `;

    weatherContainer.innerHTML = weatherHTML;
}

function getWeatherDescription(code) {
    const descriptions = {
        0: '☀️ Cielo despejado', 1: '🌤️ Mayormente despejado', 2: '⛅ Parcialmente nublado',
        3: '☁️ Nublado', 45: '🌫️ Niebla', 48: '🌫️ Niebla con escarcha',
        51: '🌦️ Llovizna ligera', 53: '🌦️ Llovizna moderada', 55: '🌦️ Llovizna intensa',
        56: '🌨️ Llovizna helada ligera', 57: '🌨️ Llovizna helada densa',
        61: '🌧️ Lluvia ligera', 63: '🌧️ Lluvia moderada', 65: '🌧️ Lluvia intensa',
        66: '🌧️ Lluvia helada ligera', 67: '🌧️ Lluvia helada intensa',
        71: '🌨️ Nieve ligera', 73: '🌨️ Nieve moderada', 75: '🌨️ Nieve intensa',
        77: '❄️ Granos de nieve', 80: '🌦️ Chubascos ligeros', 81: '🌧️ Chubascos moderados',
        82: '⛈️ Chubascos violentos', 85: '🌨️ Chubascos de nieve ligeros', 86: '🌨️ Chubascos de nieve intensos',
        95: '⛈️ Tormenta: Ligera o moderada', 
        96: '⛈️ Tormenta con granizo ligero', 99: '⛈️ Tormenta con granizo intenso'
    };
    return descriptions[code] || '🌤️ Clima variable';
}

function getWeatherIcon(code) {
    const icons = {
        0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
        51: '🌦️', 53: '🌦️', 55: '🌦️', 56: '🌨️', 57: '🌨️',
        61: '🌧️', 63: '🌧️', 65: '🌧️', 66: '🌧️', 67: '🌧️',
        71: '🌨️', 73: '🌨️', 75: '🌨️', 77: '❄️',
        80: '🌦️', 81: '🌧️', 82: '⛈️', 85: '🌨️', 86: '🌨️',
        95: '⛈️', 96: '⛈️', 99: '⛈️'
    };
    return icons[code] || '🌤️';
}

function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Mañana';
    } else {
        return date.toLocaleDateString('es-ES', { 
            weekday: 'short', 
            day: 'numeric'
        }).replace('.', '');
    }
}

function showLoading() {
    const weatherContainer = document.getElementById('weatherData');
    weatherContainer.innerHTML = `
        <div class="loading">
            <div style="animation: spin 1s linear infinite; display: inline-block;">🌀</div>
            Obteniendo datos del clima...
        </div>
    `;
}

function showError(message) {
    const weatherContainer = document.getElementById('weatherData');
    weatherContainer.innerHTML = `
        <div class="error">
            ❌ ${message}
        </div>
    `;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();

    const cityInput = document.getElementById('cityInput');
    if (cityInput) {
        cityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                getWeather();
            }
        });
        
        // Cargar clima de Bogotá por defecto
        cityInput.value = 'Bogotá';
        getWeather();
    }
});

// Exponer funciones globales
window.toggleTheme = toggleTheme;
window.getWeather = getWeather;