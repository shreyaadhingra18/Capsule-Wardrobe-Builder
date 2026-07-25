let wardrobe = JSON.parse(localStorage.getItem('wardrobe')) || [];

function saveWardrobe() {
  localStorage.setItem('wardrobe', JSON.stringify(wardrobe));
}

function renderWardrobe() {
  const grid = document.getElementById('wardrobe-grid');

  grid.innerHTML = wardrobe.map((item, index) => `
    <div class="item-card" style="background:${item.color}">
      <h4>${item.name}</h4>
      <p>${item.category}</p>

      <button onclick="editItem(${index})">Edit</button>
      <button onclick="deleteItem(${index})">Delete</button>
    </div>
  `).join('');
}
function deleteItem(index) {
    wardrobe.splice(index, 1);   // Remove one item

    saveWardrobe();
   
   function editItem(index) {

    const item = wardrobe[index];

    const newName = prompt("Enter new name:", item.name);

    if (newName) {
        item.name = newName;
    }

    saveWardrobe();
    renderWardrobe();
} renderWardrobe();
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

    const outfitMessage = document.getElementById('outfit-message');
    if(temperature>=70){
        outfitMessage.textContent = "It's warm outside! You can wear light clothes.";
    }
    else if(temperature>=50 && temperature<70){
        outfitMessage.textContent = "It's a bit chilly! Consider wearing medium-weight clothes.";
    }
    else{
        outfitMessage.textContent = "It's cold outside! Make sure to wear warm layers.";
    }
    return outfit;

}
function displaySuggestedOutfit(outfit) {
    const outfitContainer = document.getElementById('suggested-outfit');
    outfitContainer.innerHTML = outfit.map(item => `
        <div class="item-card" style="background:${item.color}">
            ${item.name}
        </div>
    `).join('');
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
  const temp = data.current.temperature_2m;

document.getElementById("weather-text").textContent =
    `${Math.round(temp)}°F right now`;

const outfit = suggestOutfit(temp);
displaySuggestedOutfit(outfit);
}

renderWardrobe();
getWeather();