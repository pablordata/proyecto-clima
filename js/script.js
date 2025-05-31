/**
 * @file script.js
 * @description Contiene la lógica principal para la aplicación de pronóstico del tiempo,
 *              incluyendo el cambio de tema, la obtención de datos de la API de Open-Meteo,
 *              y la visualización de la información del clima.
 */

/**
 * @global
 * @type {object}
 * @description Almacena los datos del clima obtenidos de la API. Inicialmente es un objeto vacío.
 */
let weatherData = {};

/**
 * @global
 * @type {boolean}
 * @description Indica si el modo oscuro está activo. Inicialmente `false`.
 */
let isDarkMode = false;

/**
 * @function toggleTheme
 * @description Cambia entre el modo claro y oscuro de la aplicación.
 * Actualiza la clase del body, el ícono del tema y guarda la preferencia en `sessionStorage`.
 */
function toggleTheme() {
    isDarkMode = !isDarkMode; // Invierte el estado actual del modo oscuro
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (isDarkMode) {
        body.classList.add('dark-mode'); // Aplica la clase para estilos de modo oscuro
        themeIcon.textContent = '☀️'; // Cambia el ícono a sol (indicando modo claro para el próximo toggle)
        sessionStorage.setItem('darkMode', 'true'); // Guarda la preferencia en sessionStorage
    } else {
        body.classList.remove('dark-mode'); // Remueve la clase de modo oscuro
        themeIcon.textContent = '🌙'; // Cambia el ícono a luna (indicando modo oscuro para el próximo toggle)
        sessionStorage.setItem('darkMode', 'false'); // Guarda la preferencia en sessionStorage
    }
}

/**
 * @function loadTheme
 * @description Carga el tema (claro/oscuro) guardado en `sessionStorage` al iniciar la página.
 * Si existe una preferencia guardada, la aplica.
 */
function loadTheme() {
    const savedTheme = sessionStorage.getItem('darkMode');
    if (savedTheme === 'true') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        document.getElementById('themeIcon').textContent = '☀️';
    } else {
        // No es necesario establecer isDarkMode = false explícitamente aquí,
        // ya que es el valor por defecto si savedTheme no es 'true'.
        // Se mantiene por claridad y consistencia con el toggle.
        isDarkMode = false;
        document.body.classList.remove('dark-mode');
        document.getElementById('themeIcon').textContent = '🌙';
    }
}

/**
 * @async
 * @function getWeather
 * @description Obtiene los datos del clima para la ciudad ingresada por el usuario.
 * Primero realiza una llamada a la API de geocodificación de Open-Meteo para obtener las coordenadas
 * de la ciudad, y luego utiliza esas coordenadas para obtener el pronóstico del tiempo.
 * Maneja errores y actualiza la interfaz de usuario con los resultados o mensajes de error.
 */
async function getWeather() {
    const city = document.getElementById('cityInput').value.trim(); // Obtiene y limpia el valor del input
    
    if (!city) {
        showError('Por favor ingresa el nombre de una ciudad'); // Muestra error si el campo está vacío
        return;
    }

    showLoading(); // Muestra indicador de carga

    try {
        // 1. Obtener coordenadas de la ciudad usando la API de geocodificación
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es&format=json`);
        
        if (!geoResponse.ok) {
            // Si la respuesta HTTP no es exitosa (ej. 404, 500)
            throw new Error(`Error al buscar la ciudad (HTTP ${geoResponse.status})`);
        }

        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            // Si la API de geocodificación no encuentra la ciudad
            throw new Error('Ciudad no encontrada. Intenta con otro nombre o verifica la escritura.');
        }

        const location = geoData.results[0];
        const { latitude, longitude, name, country, admin1 } = location; // Extrae datos de la ubicación

        // 2. Obtener datos del clima usando las coordenadas
        // La URL original tenía un '¤', se asume que es un error tipográfico y debería ser '&'.
        // El código provisto ya tiene la corrección, usando '&'.
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}¤t=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`
        );

        if (!weatherResponse.ok) {
            // Si la respuesta HTTP de la API del clima no es exitosa
            throw new Error(`Error al obtener datos del clima (HTTP ${weatherResponse.status})`);
        }

        weatherData = await weatherResponse.json(); // Almacena los datos del clima en la variable global
        displayWeather(weatherData, name, country, admin1); // Muestra los datos del clima

    } catch (error) {
        console.error('Error en getWeather:', error);
        showError(error.message || 'Ocurrió un error al procesar la solicitud.'); // Muestra mensaje de error genérico o específico
    }
}

/**
 * @function displayWeather
 * @description Renderiza los datos del clima en la interfaz de usuario.
 * @param {object} data - Objeto con los datos del clima de la API de Open-Meteo.
 * @param {string} cityName - Nombre de la ciudad.
 * @param {string} country - Nombre del país.
 * @param {string} [region] - Nombre de la región/estado (opcional).
 */
function displayWeather(data, cityName, country, region) {
    const current = data.current; // Datos del clima actual
    const daily = data.daily;     // Datos del pronóstico diario
    const weatherContainer = document.getElementById('weatherData'); // Contenedor para mostrar el clima

    // Determina el color del título del pronóstico basado en el modo actual (claro/oscuro)
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

    weatherContainer.innerHTML = weatherHTML; // Inserta el HTML generado en el contenedor
}

/**
 * @function getWeatherDescription
 * @description Devuelve una descripción textual del clima basada en el código WMO.
 * @param {number} code - Código del clima (WMO Weather interpretation codes).
 * @returns {string} Descripción textual del clima.
 */
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
    return descriptions[code] || '🌤️ Clima variable'; // Devuelve descripción o un valor por defecto
}

/**
 * @function getWeatherIcon
 * @description Devuelve un ícono (emoji) representativo del clima basado en el código WMO.
 * @param {number} code - Código del clima (WMO Weather interpretation codes).
 * @returns {string} Emoji del clima.
 */
function getWeatherIcon(code) {
    const icons = { // Mapeo de códigos WMO a emojis
        0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
        51: '🌦️', 53: '🌦️', 55: '🌦️', 56: '🌨️', 57: '🌨️',
        61: '🌧️', 63: '🌧️', 65: '🌧️', 66: '🌧️', 67: '🌧️',
        71: '🌨️', 73: '🌨️', 75: '🌨️', 77: '❄️',
        80: '🌦️', 81: '🌧️', 82: '⛈️', 85: '🌨️', 86: '🌨️',
        95: '⛈️', 96: '⛈️', 99: '⛈️'
    };
    return icons[code] || '🌤️'; // Devuelve ícono o un valor por defecto
}

/**
 * @function getWindDirection
 * @description Convierte grados de dirección del viento a una dirección cardinal (N, NE, E, etc.).
 * @param {number} degrees - Dirección del viento en grados (0-360).
 * @returns {string} Dirección cardinal del viento.
 */
function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    // Divide los 360 grados en 8 segmentos de 45 grados cada uno.
    // Math.round(degrees / 45) da un valor de 0 a 8.
    // El % 8 asegura que si degrees es 360 (o cercano), resulte en índice 0 (Norte).
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

/**
 * @function formatDate
 * @description Formatea una cadena de fecha (YYYY-MM-DD) a un formato más legible.
 * Muestra "Hoy", "Mañana" o "DíaSem, DíaMes" (ej. "Lun, 15").
 * @param {string} dateString - Fecha en formato "YYYY-MM-DD".
 * @returns {string} Fecha formateada.
 */
function formatDate(dateString) {
    // Se añade 'T00:00:00' para asegurar que la fecha se interprete en la zona horaria local
    // y no como UTC, lo que podría causar problemas de "un día antes/después".
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0); // Normaliza 'today' a medianoche para comparaciones precisas
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Calcula 'tomorrow'

    if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Mañana';
    } else {
        // Formato: "Lun. 15" -> se quita el punto con replace.
        return date.toLocaleDateString('es-ES', { 
            weekday: 'short', // Día de la semana abreviado (ej. "Lun")
            day: 'numeric'    // Día del mes (ej. "15")
        }).replace('.', ''); // Elimina el punto que algunas localizaciones añaden después de la abreviatura del día.
    }
}

/**
 * @function showLoading
 * @description Muestra un mensaje de carga en el contenedor de datos del clima.
 */
function showLoading() {
    const weatherContainer = document.getElementById('weatherData');
    weatherContainer.innerHTML = `
        <div class="loading">
            <div style="animation: spin 1s linear infinite; display: inline-block;">🌀</div>
            Obteniendo datos del clima...
        </div>
    `;
}

/**
 * @function showError
 * @description Muestra un mensaje de error en el contenedor de datos del clima.
 * @param {string} message - El mensaje de error a mostrar.
 */
function showError(message) {
    const weatherContainer = document.getElementById('weatherData');
    weatherContainer.innerHTML = `
        <div class="error">
            ❌ ${message}
        </div>
    `;
}

// --- Event Listeners ---

/**
 * @event DOMContentLoaded
 * @description Se ejecuta cuando el contenido HTML inicial ha sido completamente cargado y parseado.
 * Inicializa el tema y configura los listeners de eventos.
 */
document.addEventListener('DOMContentLoaded', () => {
    loadTheme(); // Carga el tema guardado

    const cityInput = document.getElementById('cityInput');
    if (cityInput) {
        // Listener para buscar clima al presionar "Enter" en el input de ciudad
        cityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                getWeather();
            }
        });
        
        // Cargar clima de Bogotá por defecto al iniciar la página
        cityInput.value = 'Bogotá';
        getWeather(); // Llama a getWeather para cargar los datos iniciales
    }
});

// --- Exposición de funciones globales ---
// Para que puedan ser llamadas desde atributos `onclick` en el HTML.

/**
 * @global
 * @description Expone la función `toggleTheme` al objeto `window` para acceso global.
 */
window.toggleTheme = toggleTheme;

/**
 * @global
 * @description Expone la función `getWeather` al objeto `window` para acceso global.
 */
window.getWeather = getWeather;
