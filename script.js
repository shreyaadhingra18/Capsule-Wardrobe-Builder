let wardrobe = JSON.parse(localStorage.getItem("wardrobe")) || [];

const form = document.getElementById("item-form");
const grid = document.getElementById("wardrobe-grid");
const recentGrid = document.getElementById("recent-grid");

function saveWardrobe() {
    localStorage.setItem("wardrobe", JSON.stringify(wardrobe));
}

function updateStats() {

    document.getElementById("total-items").textContent = wardrobe.length;

    document.getElementById("tops-count").textContent =
        wardrobe.filter(item => item.category === "top").length;

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

            <p>${item.category}</p>

        </div>

    `).join("");
}

function renderWardrobe(){

    if(!grid) return;

    grid.innerHTML = "";

    wardrobe.forEach((item,index)=>{

        const card = document.createElement("div");

        card.className="item-card";

        card.innerHTML=`

            ${item.image ?
            `<img src="${item.image}" class="wardrobe-image">`
            :
            `<div class="placeholder-image"></div>`
            }

            <h3>${item.name}</h3>

            <p>${item.category}</p>

            <small>${item.warmth}</small>

            <div class="card-buttons">

                <button onclick="editItem(${index})">
                    ✏️
                </button>

                <button onclick="deleteItem(${index})">
                    🗑️
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

            color:document.getElementById("item-color").value,

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