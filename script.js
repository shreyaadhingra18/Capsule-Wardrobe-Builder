let wardrobe = JSON.parse(localStorage.getItem("wardrobe")) || [];

const form = document.getElementById("item-form");
const grid = document.getElementById("wardrobe-grid");
const recentGrid = document.getElementById("recent-grid");
const colorInput = document.getElementById("item-color");
const introScreen = document.getElementById("intro-screen");

function hideIntroScreen() {
    if (introScreen) {
        introScreen.classList.add("hide");
    }
}

if (introScreen) {
    setTimeout(hideIntroScreen, 2200);
    introScreen.addEventListener("click", hideIntroScreen);
}

function saveWardrobe() {
    localStorage.setItem("wardrobe", JSON.stringify(wardrobe));
}

function updateStats() {

    const topCategories = ["top", "shirt", "t-shirt", "hoodie"];

    document.getElementById("total-items").textContent = wardrobe.length;

    document.getElementById("tops-count").textContent =
        wardrobe.filter(item =>
            topCategories.includes(item.category)
        ).length;

    document.getElementById("bottoms-count").textContent =
        wardrobe.filter(item =>
            item.category === "jeans"
        ).length;

    document.getElementById("shoes-count").textContent =
        wardrobe.filter(item =>
            item.category === "shoes"
        ).length;
}

function renderRecentItems(){

    if(!recentGrid) return;

    const recent = wardrobe.slice(-4).reverse();

    recentGrid.innerHTML = recent.map(item => `

        <div class="recent-card">

            <strong>${item.name}</strong>
            <div class="color-dot" style="background:${item.color}"></div>


        </div>

    `).join("");
}

function renderWardrobe(){

    if(!grid) return;

    grid.innerHTML = "";

    wardrobe.forEach((item,index)=>{

        const card = document.createElement("div");

        card.className="item-card";
        card.style.background = item.color;
        card.style.boxShadow = `0 0 10px ${item.color}`;
        card.innerHTML=`

            ${item.image ?
            `<img src="${item.image}" class="wardrobe-image">`
            :
            `<div class="placeholder-image"></div>`
            }

            <h3>${item.name}</h3>
            <div class="color-dot" style="background:${item.color}"></div>
            <div class="card-buttons">
            <button class="edit-btn" onclick="editItem(${index})">
            ✏️ Edit
            </button>
            <button class="delete-btn" onclick="deleteItem(${index})">
        🗑️ Delete
            </button>
            </div>

        `;

        grid.appendChild(card);

    });

    updateStats();
    renderRecentItems();
}

function deleteItem(index){

    wardrobe.splice(index,1);

    saveWardrobe();

    renderWardrobe();

}

function editItem(index){

    const item = wardrobe[index];

    const newName = prompt("Item name",item.name);

    if(newName){

        item.name=newName;

    }

    saveWardrobe();

    renderWardrobe();

}

form.addEventListener("submit",function(e){

    e.preventDefault();

    const file=document.getElementById("item-image").files[0];

    const reader=new FileReader();

    reader.onload=function(){

        wardrobe.push({

            name:document.getElementById("item-name").value,

            category:document.getElementById("item-category").value,

            color:colorInput.value,

            warmth:document.getElementById("item-warmth").value,

            image:file ? reader.result : ""

        });

        saveWardrobe();

        renderWardrobe();

        form.reset();

    };

    if(file){

        reader.readAsDataURL(file);

    }

    else{

        reader.onload();

    }

});

renderWardrobe();

function filterByWarmth(warmth) {
    return wardrobe.filter(item => item.warmth === warmth);
}

function getRandomItem(items) {

    if(items.length === 0) return null;

    return items[Math.floor(Math.random() * items.length)];

}

function suggestOutfit(temp){

    let warmth;

    if(temp <= 10){
        warmth = "heavy";
    }else if(temp <= 20){
        warmth = "medium";
    }else{
        warmth = "light";
    }

    const clothes = wardrobe.filter(item => item.warmth === warmth);

    if(clothes.length === 0){
        return [];
    }

    return clothes;
}
function displaySuggestedOutfit(outfit){

    const container=document.getElementById("suggested-outfit");

    container.innerHTML="";

    if(outfit.length===0){

        container.innerHTML="<p>No matching outfit found.</p>";

        return;

    }

    outfit.forEach(item=>{

        container.innerHTML+=`

        <div class="outfit-card">

            ${
                item.image ?

                `<img src="${item.image}" class="outfit-image">`

                :

                `<div class="outfit-placeholder" style="background:${item.color}"></div>`
            }

            <h4>${item.name}</h4>


        </div>

        `;

    });

}

function updateOutfitMessage(temp){

    const msg=document.getElementById("outfit-message");

    if(temp>25){

        msg.textContent="☀️ Warm weather. Light clothing is recommended.";

    }

    else if(temp>15){

        msg.textContent="🌤 Mild weather. A light layer is a good idea.";

    }

    else{

        msg.textContent="❄️ Cold weather. Wear warm layers.";

    }

}

async function getWeather(){

    if(!navigator.geolocation){

        document.getElementById("weather-text").textContent="Location unavailable";

        return;

    }

    navigator.geolocation.getCurrentPosition(async(position)=>{

        try{

            const lat=position.coords.latitude;

            const lon=position.coords.longitude;

            const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;

            const response=await fetch(url);

            const data=await response.json();

            const temp=Math.round(data.current.temperature_2m);

            document.getElementById("temperature").textContent=`${temp}°C`;

            let weather="Clear";

            const code=data.current.weather_code;

            if(code>=0 && code<=3){

                weather="Sunny";

            }

            else if(code<60){

                weather="Cloudy";

            }

            else{

                weather="Rainy";

            }

            document.getElementById("weather-text").textContent=weather;

            const outfit=suggestOutfit(temp);

            displaySuggestedOutfit(outfit);

            updateOutfitMessage(temp);

        }

        catch{

            document.getElementById("weather-text").textContent="Weather unavailable";

        }

    },

    ()=>{

        document.getElementById("weather-text").textContent="Location denied";

    });

}


renderWardrobe();

getWeather();
