# When's My Shabbos? 🕯️

**Find Shabbat Candle Lighting Times Worldwide | Interactive Jewish Sabbath Times Finder**

A beautiful, fast, and accurate web application that helps you find Shabbat (Shabbos) candle lighting and Havdalah times for any location in the world. Perfect for travelers, students, and anyone who needs reliable Jewish Sabbath times.

## 🌟 Features

- 🗺️ **Interactive World Map** - Click anywhere to find Shabbat times instantly
- 📍 **Automatic Location Detection** - Uses your device's GPS for accurate local times
- 🕯️ **Candle Lighting Times** - Precise Friday night candle lighting times
- ⭐ **Havdalah Times** - Saturday night Shabbat end times
- 📖 **Weekly Torah Portion** - Current Parsha for the week
- 📅 **Accurate Jewish Calendar** - Powered by HebCal API
- 📱 **Mobile Responsive** - Works perfectly on phones, tablets, and desktops
- ⚡ **Fast & Lightweight** - No heavy frameworks, loads in milliseconds
- 🌍 **Global Coverage** - Accurate times for every location worldwide
- ♿ **Accessible** - WCAG compliant with keyboard navigation support

## Setup

### Prerequisites

- A MapTiler API key (free tier available)
- A modern web browser with location services enabled

### Getting Your MapTiler API Key

1. Go to [MapTiler Cloud](https://cloud.maptiler.com/)
2. Sign up for a free account
3. Navigate to your account dashboard
4. Copy your API key

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/greasemonkey-dev/WhensMyShabbos.git
   cd WhensMyShabbos
   ```

2. Open `main.js` in a text editor

3. Replace `YOUR_MAPTILER_API_KEY_HERE` with your actual MapTiler API key:
   ```javascript
   const MAPTILER_API_KEY = 'your-actual-api-key-here';
   ```

4. Start a local web server:
   ```bash
   npm start
   ```
   Or use Python:
   ```bash
   python3 -m http.server 8000
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Usage

1. When you first open the app, it will request permission to access your location
2. Once granted, the map will center on your location and display the upcoming Shabbos times
3. Click anywhere on the map to get Shabbos times for that location
4. The info panel shows:
   - Candle lighting time
   - Havdalah time
   - Weekly Parsha
   - The date of Shabbos

## 🛠️ Technologies Used

- **MapTiler SDK** - Interactive map interface with worldwide coverage
- **HebCal API** - Accurate Jewish calendar data and Shabbat times
- **Vanilla JavaScript** - Fast, lightweight, no framework dependencies
- **Modern CSS3** - Beautiful gradients, animations, and responsive design
- **HTML5** - Semantic markup with accessibility features
- **Progressive Web App (PWA)** - Installable on mobile devices

## 🎯 Use Cases

- **Travelers** - Find Shabbat times in any city you're visiting
- **Students** - Quick access to candle lighting times on campus
- **Families** - Plan your Shabbat preparations accurately
- **Jewish Communities** - Share accurate times with your congregation
- **Event Planners** - Schedule events around Shabbat times

## 🔍 SEO Keywords

Shabbos times, Shabbat times, candle lighting times, Havdalah times, Jewish calendar, Torah portion, Parsha, Friday night candles, Sabbath times, zmanim finder, kosher times, Jewish holidays, Shabbat finder, Sabbath calculator, Jewish time finder, candle lighting calculator

## API Credits

- Map tiles and geocoding by [MapTiler](https://www.maptiler.com/)
- Jewish calendar data from [HebCal](https://www.hebcal.com/)

## License

MIT
