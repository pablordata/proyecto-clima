# 🌤️ Pronóstico del Tiempo Interactivo

Una aplicación web moderna y responsive para consultar el pronóstico del tiempo actual y de los próximos 7 días para cualquier ciudad, utilizando la API de Open-Meteo. Incluye un selector de tema claro/oscuro y está diseñada con un enfoque en la experiencia de usuario.

## 📜 Descripción

Este proyecto es una página web que permite a los usuarios obtener información meteorológica detallada. Al ingresar el nombre de una ciudad, la aplicación realiza una consulta a la API de Open-Meteo para obtener primero las coordenadas geográficas y luego los datos del clima. Muestra el clima actual, incluyendo temperatura, sensación térmica, descripción del clima, humedad, precipitación, velocidad y dirección del viento. Además, presenta un pronóstico para los siguientes 7 días.

La interfaz cuenta con un diseño atractivo que utiliza gradientes y un efecto "glassmorphism" para algunos elementos. También incluye una funcionalidad para cambiar entre un tema claro y uno oscuro, cuya preferencia se guarda en `sessionStorage`.

## ✨ Características

*   **Consulta de Clima por Ciudad:** Ingresa cualquier ciudad para ver su pronóstico.
*   **Clima Actual Detallado:**
    *   Temperatura y sensación térmica.
    *   Descripción textual del clima (ej: "Cielo despejado", "Lluvia ligera").
    *   Icono representativo del clima.
    *   Humedad relativa.
    *   Precipitación.
    *   Velocidad y dirección del viento.
*   **Pronóstico de 7 Días:**
    *   Fecha (mostrando "Hoy", "Mañana" o el día de la semana).
    *   Icono del clima para cada día.
    *   Temperaturas máxima y mínima.
    *   Precipitación acumulada y velocidad máxima del viento.
*   **Tema Claro y Oscuro:** Botón para alternar entre modos, con persistencia en la sesión actual del navegador.
*   **Responsive Design:** Adaptable a diferentes tamaños de pantalla (móvil, tablet, escritorio).
*   **Carga por Defecto:** Muestra el clima de "Bogotá" al cargar la página inicialmente.
*   **Manejo de Estados:**
    *   Mensaje de bienvenida/instrucción inicial.
    *   Indicador de carga mientras se obtienen los datos.
    *   Mensajes de error claros si la ciudad no se encuentra o hay problemas con la API.
*   **Información del Proyecto:** Sección con detalles del profesor y estudiantes.
*   **Enlaces Sociales:** Espacio para enlaces relevantes (ej. sitio web, GitHub).

## 🛠️ Tecnologías Utilizadas

*   **HTML5:** Para la estructura semántica del contenido.
*   **CSS3:** Para el diseño y la presentación visual.
    *   Flexbox y Grid para el layout.
    *   Variables CSS para temización.
    *   Media Queries para responsividad.
    *   Transiciones y animaciones sutiles.
    *   `backdrop-filter` para efectos de "glassmorphism".
*   **JavaScript (ES6+):** Para la lógica de la aplicación.
    *   `async/await` para manejar operaciones asíncronas (llamadas a la API).
    *   `fetch` API para realizar solicitudes HTTP.
    *   Manipulación del DOM para actualizar dinámicamente el contenido.
    *   `sessionStorage` para persistir la preferencia del tema.
*   **Open-Meteo API:**
    *   Geocoding API: Para convertir nombres de ciudades en coordenadas.
    *   Forecast API: Para obtener los datos meteorológicos.

## 🚀 Cómo Empezar

1.  **Clonar el repositorio (o descargar los archivos):**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_DIRECTORIO>
    ```
    Si no usas Git, simplemente descarga el ZIP y extráelo.

2.  **Estructura de Archivos:**
    Asegúrate de que los archivos estén organizados de la siguiente manera:
    ```
    .
    ├── index.html
    ├── css/
    │   └── style.css
    ├── js/
    │   └── script.js
    └── README.md
    ```

3.  **Abrir en el Navegador:**
    Abre el archivo `index.html` en tu navegador web preferido (Chrome, Firefox, Edge, Safari). No se requiere un servidor web local, ya que es una aplicación puramente del lado del cliente.

## 📖 Uso

1.  Al cargar la página, se mostrará automáticamente el pronóstico del tiempo para Bogotá.
2.  En el campo de texto "Ingresa una ciudad", escribe el nombre de la ciudad para la cual deseas ver el clima (ej: `Madrid`, `Londres`, `Tokyo`).
3.  Haz clic en el botón "🔍 Buscar Clima" o presiona la tecla `Enter`.
4.  La sección de datos del clima se actualizará con la información de la ciudad ingresada.
5.  Puedes cambiar entre el tema claro y oscuro haciendo clic en el botón con el ícono 🌙 (luna) o ☀️ (sol) ubicado en la esquina superior derecha del encabezado.

## 🧑‍🏫 Información del Equipo

*   **Profesora:** Maria Hernandez
    *   **Asignatura:** Introducción A Los Lenguajes De Internet
*   **Estudiantes:**
    *   Pablo Rivera
    *   Robinson Zuñiga

### 🔗 Enlaces del Proyecto
*   **Sitio Web (Ejemplo):** [UCompensar Ingeniería de Software](https://ucompensar.edu.co/programas/ingenieria-de-software-virtual/)

## 💡 Posibles Mejoras Futuras

*   **Autocompletado de Ciudades:** Sugerir ciudades mientras el usuario escribe.
*   **Geolocalización:** Opción para obtener el clima de la ubicación actual del usuario.
*   **Unidades Personalizables:** Permitir al usuario elegir entre Celsius/Fahrenheit, km/h / mph.
*   **Guardar Ciudades Favoritas:** Usar `localStorage` para recordar las ciudades buscadas con frecuencia.
*   **Mapas Interactivos:** Integrar un mapa para visualizar la ubicación o datos meteorológicos.
*   **Traducciones (i18n):** Soportar múltiples idiomas.

## 📄 Licencia

Este proyecto es para fines educativos. Puedes usar el código libremente. Si deseas definir una licencia formal, considera una como [MIT](https://opensource.org/licenses/MIT).

## 📸 Screenshot

![Image Alt](https://github.com/pablordata/proyecto-clima/blob/202be952ca89688bacc9214c6a506fd3ed8a507f/assets/tema-claro.png)


