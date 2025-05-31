/**
 * APLICACIÓN DEL CLIMA
 * ===================
 * Aplicación web para consultar el clima actual y pronóstico de 7 días
 * Características: Modo oscuro/claro, búsqueda por ciudad, datos detallados
 * APIs: Open-Meteo (clima y geocodificación)
 * Idioma: Español
 */

// ========================================
// VARIABLES GLOBALES
// ========================================

/**
 * Cache temporal para almacenar los datos meteorológicos obtenidos de la API
 * Se actualiza cada vez que se hace una nueva consulta
 * @type {Object}
 */
let weatherData = {};

/**
 * Estado actual del tema de la aplicación
 * false = modo claro, true = modo oscuro
 * @type {boolean}
 */
let isDarkMode = false;

// ========================================
// GESTIÓN DE TEMAS
// ========================================

/**
 * Alterna entre modo claro y oscuro de la aplicación
 * - Cambia el estado de isDarkMode
 * - Añade/remueve clase CSS 'dark-mode' del body
 * - Actualiza icono del botón (🌙 para claro, ☀️ para oscuro)
 * - Guarda preferencia en sessionStorage
 */
function toggleTheme() {
    // Cambiar estado del tema
    isDarkMode = !isDarkMode;
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (isDarkMode) {
        // Activar modo oscuro
        body.classList.add('dark-mode');
        themeIcon.textContent = '☀️'; // Icono de sol para indicar "cambiar a claro"
        sessionStorage.setItem('darkMode', 'true');
    } else {
        // Activar modo claro
        body.classList.remove('dark-mode');
        themeIcon.textContent = '🌙'; // Icono de luna para indicar "cambiar a oscuro"
        sessionStorage.setItem('darkMode', 'false');
    }
}

/**
 * Carga el tema guardado al inicializar la aplicación
 * Lee la preferencia desde sessionStorage y aplica el tema correspondiente
 * Se ejecuta automáticamente al cargar la página
 */
function loadTheme() {
    const savedTheme = sessionStorage.getItem('darkMode');
    
    if (savedTheme === 'true') {
        // Cargar modo oscuro
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        document.getElementById('themeIcon').textContent = '☀️';
    } else {
        // Cargar modo claro (por defecto)
        isDarkMode = false;
        document.body.classList.remove('dark-mode');
        document.getElementById('themeIcon').textContent = '🌙';
    }
}

// ========================================
// FUNCIÓN PRINCIPAL DEL CLIMA
// ========================================

/**
 * Función principal para obtener y mostrar datos meteorológicos
 * Proceso:
 * 1. Valida entrada del usuario
 * 2. Busca coordenadas de la ciudad (Geocoding API)
 * 3. Obtiene datos del clima (Weather API)
 * 4. Muestra los datos en la interfaz
 * 
 * APIs utilizadas:
 * - Geocoding: https://geocoding-api.open-meteo.com/v1/search
 * - Weather: https://api.open-meteo.com/v1/forecast
 */
async function getWeather() {
    // Obtener y validar entrada del usuario
    const city = document.getElementById('cityInput').value.trim();
    
    if (!city) {
        showError('Por favor ingresa el nombre de una ciudad');
        return;
    }

    // Mostrar indicador de carga
    showLoading();

    try {
        // PASO 1: Obtener coordenadas de la ciudad usando Geocoding API
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es&format=json`);
        
        if (!geoResponse.ok) {
            throw new Error(`Error al buscar la ciudad (HTTP ${geoResponse.status})`);
        }

        const geoData = await geoResponse.json();
        
        // Verificar si se encontró la ciudad
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Ciudad no encontrada. Intenta con otro nombre o verifica la escritura.');
        }

        // Extraer datos de ubicación
        const location = geoData.results[0];
        const { latitude, longitude, name, country, admin1 } = location;

        // PASO 2: Obtener datos meteorológicos usando las coordenadas
        // Parámetros de la API:
        // - current: datos actuales (temp, humedad, viento, etc.)
        // - daily: pronóstico de 7 días
        // - timezone: ajuste automático de zona horaria
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`
        );

        if (!weatherResponse.ok) {
            throw new Error(`Error al obtener datos del clima (HTTP ${weatherResponse.status})`);
        }

        // PASO 3: Procesar y mostrar datos
        weatherData = await weatherResponse.json();
        displayWeather(weatherData, name, country, admin1);

    } catch (error) {
        // Manejo de errores: mostrar mensaje al usuario y log para debugging
        console.error('Error en getWeather:', error);
        showError(error.message || 'Ocurrió un error al procesar la solicitud.');
    }
}

// ========================================
// RENDERIZADO DE DATOS METEOROLÓGICOS
// ========================================

/**
 * Renderiza los datos meteorológicos en HTML
 * Genera interfaz completa con clima actual y pronóstico de 7 días
 * 
 * @param {Object} data - Datos meteorológicos de la API
 * @param {string} cityName - Nombre de la ciudad
 * @param {string} country - País
 * @param {string} region - Región/estado
 */
function displayWeather(data, cityName, country, region) {
    const current = data.current;  // Datos del clima actual
    const daily = data.daily;      // Datos del pronóstico diario

    const weatherContainer = document.getElementById('weatherData');

    // Ajustar color del título del pronóstico según el tema actual
    const forecastTitleColor = document.body.classList.contains('dark-mode') ? '#e0e0e0' : '#333';

    // Generar HTML completo de la interfaz meteorológica
    const weatherHTML = `
        <!-- CLIMA ACTUAL -->
        <div class="current-weather">
            <!-- Ubicación completa -->
            <h2>📍 ${cityName}${region ? ', ' + region : ''}${country ? ', ' + country : ''}</h2>
            
            <!-- Temperatura principal -->
            <div class="current-temp">${Math.round(current.temperature_2m)}°C</div>
            
            <!-- Descripción del clima y sensación térmica -->
            <p>${getWeatherDescription(current.weather_code)}</p>
            <p>Sensación térmica: ${Math.round(current.apparent_temperature)}°C</p>
            
            <!-- Detalles meteorológicos en tarjetas -->
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

        <!-- PRONÓSTICO DE 7 DÍAS -->
        <h3 style="margin: 25px 0 15px 0; color: ${forecastTitleColor};">📅 Pronóstico de 7 días</h3>
        <div class="forecast">
            ${daily.time.map((date, index) => `
                <div class="forecast-card">
                    <!-- Fecha formateada (Hoy, Mañana, o día de la semana) -->
                    <h4>${formatDate(date)}</h4>
                    
                    <!-- Icono del clima -->
                    <div style="font-size: 1.5rem; margin: 10px 0;">
                        ${getWeatherIcon(daily.weather_code[index])}
                    </div>
                    
                    <!-- Temperaturas máxima y mínima -->
                    <p><strong>${Math.round(daily.temperature_2m_max[index])}°</strong> / ${Math.round(daily.temperature_2m_min[index])}°</p>
                    
                    <!-- Detalles adicionales: precipitación y viento -->
                    <p style="font-size: 0.9rem; margin-top: 5px;">
                        💧 ${daily.precipitation_sum[index]} mm<br>
                        💨 ${Math.round(daily.wind_speed_10m_max[index])} km/h
                    </p>
                </div>
            `).join('')}
        </div>
    `;

    // Insertar HTML generado en el contenedor
    weatherContainer.innerHTML = weatherHTML;
}

// ========================================
// FUNCIONES DE UTILIDAD METEOROLÓGICA
// ========================================

/**
 * Convierte códigos numéricos de clima en descripciones legibles con emojis
 * Basado en los códigos WMO (World Meteorological Organization)
 * 
 * @param {number} code - Código de condición meteorológica (0-99)
 * @returns {string} Descripción con emoji correspondiente
 */
function getWeatherDescription(code) {
    const descriptions = {
        // Cielo despejado y nublado (0-3)
        0: '☀️ Cielo despejado', 
        1: '🌤️ Mayormente despejado', 
        2: '⛅ Parcialmente nublado',
        3: '☁️ Nublado', 
        
        // Niebla (45-48)
        45: '🌫️ Niebla', 
        48: '🌫️ Niebla con escarcha',
        
        // Llovizna (51-57)
        51: '🌦️ Llovizna ligera', 
        53: '🌦️ Llovizna moderada', 
        55: '🌦️ Llovizna intensa',
        56: '🌨️ Llovizna helada ligera', 
        57: '🌨️ Llovizna helada densa',
        
        // Lluvia (61-67)
        61: '🌧️ Lluvia ligera', 
        63: '🌧️ Lluvia moderada', 
        65: '🌧️ Lluvia intensa',
        66: '🌧️ Lluvia helada ligera', 
        67: '🌧️ Lluvia helada intensa',
        
        // Nieve (71-77)
        71: '🌨️ Nieve ligera', 
        73: '🌨️ Nieve moderada', 
        75: '🌨️ Nieve intensa',
        77: '❄️ Granos de nieve', 
        
        // Chubascos (80-86)
        80: '🌦️ Chubascos ligeros', 
        81: '🌧️ Chubascos moderados',
        82: '⛈️ Chubascos violentos', 
        85: '🌨️ Chubascos de nieve ligeros', 
        86: '🌨️ Chubascos de nieve intensos',
        
        // Tormentas (95-99)
        95: '⛈️ Tormenta: Ligera o moderada', 
        96: '⛈️ Tormenta con granizo ligero', 
        99: '⛈️ Tormenta con granizo intenso'
    };
    
    // Retornar descripción o valor por defecto
    return descriptions[code] || '🌤️ Clima variable';
}

/**
 * Obtiene el emoji correspondiente a una condición meteorológica
 * Versión simplificada de getWeatherDescription() solo para iconos
 * 
 * @param {number} code - Código de condición meteorológica
 * @returns {string} Emoji representativo
 */
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

/**
 * Convierte grados de dirección del viento en puntos cardinales
 * Divide los 360° en 8 secciones de 45° cada una
 * 
 * @param {number} degrees - Dirección del viento en grados (0-360)
 * @returns {string} Punto cardinal (N, NE, E, SE, S, SO, O, NO)
 */
function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    // Calcular índice: dividir grados entre 45, redondear y aplicar módulo 8
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

/**
 * Formatea fechas para el pronóstico de manera amigable
 * Convierte fechas ISO en texto legible en español
 * 
 * @param {string} dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {string} Fecha formateada ("Hoy", "Mañana", o "día, número")
 */
function formatDate(dateString) {
    // Crear objeto Date agregando hora 00:00:00 para evitar problemas de zona horaria
    const date = new Date(dateString + 'T00:00:00');
    
    // Obtener fecha actual y de mañana para comparación
    const today = new Date();
    today.setHours(0,0,0,0); // Normalizar a medianoche
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Determinar etiqueta apropiada
    if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Mañana';
    } else {
        // Formato: "lun 15" (día de semana abreviado + número)
        return date.toLocaleDateString('es-ES', { 
            weekday: 'short', 
            day: 'numeric'
        }).replace('.', ''); // Remover punto del día de la semana
    }
}

// ========================================
// FUNCIONES DE ESTADO DE LA INTERFAZ
// ========================================

/**
 * Muestra un indicador de carga mientras se obtienen los datos
 * Reemplaza el contenido del contenedor con spinner animado
 */
function showLoading() {
    const weatherContainer = document.getElementById('weatherData');
    weatherContainer.innerHTML = `
        <div class="loading">
            <!-- Spinner giratorio usando CSS animation -->
            <div style="animation: spin 1s linear infinite; display: inline-block;">🌀</div>
            Obteniendo datos del clima...
        </div>
    `;
}

/**
 * Muestra mensajes de error al usuario
 * Reemplaza el contenido del contenedor con mensaje de error
 * 
 * @param {string} message - Mensaje de error a mostrar
 */
function showError(message) {
    const weatherContainer = document.getElementById('weatherData');
    weatherContainer.innerHTML = `
        <div class="error">
            ❌ ${message}
        </div>
    `;
}

// ========================================
// INICIALIZACIÓN Y EVENT LISTENERS
// ========================================

/**
 * Inicialización de la aplicación
 * Se ejecuta cuando el DOM está completamente cargado
 */
document.addEventListener('DOMContentLoaded', () => {
    // Cargar tema guardado
    loadTheme();

    // Configurar eventos del campo de búsqueda
    const cityInput = document.getElementById('cityInput');
    if (cityInput) {
        // Permitir búsqueda presionando Enter
        cityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                getWeather();
            }
        });
        
        // Cargar clima de Bogotá por defecto al iniciar
        cityInput.value = 'Bogotá';
        getWeather();
    }
});

// ========================================
// EXPOSICIÓN DE FUNCIONES GLOBALES
// ========================================

/**
 * Exponer funciones para uso desde HTML
 * Permite llamar las funciones desde botones y otros elementos HTML
 */
window.toggleTheme = toggleTheme;  // Para botón de cambio de tema
window.getWeather = getWeather;    // Para botón de búsqueda
