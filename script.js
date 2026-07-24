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
  const warmth = document.getElementById('item-warmth').value;
  const image = document.getElementById('item-image').files[0];

  wardrobe.push({ name, category, color, warmth, image });
  saveWardrobe();
  renderWardrobe();
  e.target.reset();
});
function filterWardrobeByWarmth(warmth) {
    return wardrobe.filter(item => item.warmth === warmth);
}

function suggestOutfit(temperature) {
    let warmth;

    if (temperature < 50) {
        warmth = "heavy";
    } else if (temperature < 70) {
        warmth = "medium";
    } else {
        warmth = "light";
    }

    // Get all clothes matching the warmth
    const suggestedItems = filterWardrobeByWarmth(warmth);

    // Pick one item from each category
    const top = suggestedItems.find(item => item.category === "Top");
    const bottom = suggestedItems.find(item => item.category === "Bottom");
    const jacket = suggestedItems.find(item => item.category === "Jacket");

    // Build the outfit
    const outfit = [];

    if (top) {
        outfit.push(top);
    }

    if (bottom) {
        outfit.push(bottom);
    }

    // Only add jacket when it's cold
    if (temperature < 50 && jacket) {
        outfit.push(jacket);
    }

    return outfit;
}
  

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