let wardrobe = JSON.parse(localStorage.getItem('wardrobe')) || [];

function saveWardrobe() {
  localStorage.setItem('wardrobe', JSON.stringify(wardrobe));
}

function renderWardrobe() {
  const grid = document.getElementById('wardrobe-grid');
  grid.innerHTML = wardrobe.map(item => `
    <div class="item-card" style="background:${item.color}">
      ${item.name}
    </div>
  `).join('');
}

document.getElementById('item-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('item-name').value;
  const category = document.getElementById('item-category').value;
  const color = document.getElementById('item-color').value;

  wardrobe.push({ name, category, color });
  saveWardrobe();
  renderWardrobe();
  e.target.reset();
});

async function getWeather() {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&temperature_unit=fahrenheit`;
    const res = await fetch(url);
    const data = await res.json();
    document.getElementById('weather-text').textContent =
      `${Math.round(data.current.temperature_2m)}°F right now`;
  }, () => {
    document.getElementById('weather-text').textContent = 'Could not get weather.';
  });
}

renderWardrobe();
getWeather();