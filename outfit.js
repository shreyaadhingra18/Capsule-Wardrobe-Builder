let outfits = JSON.parse(localStorage.getItem("outfits")) || [];

const outfitGrid = document.getElementById("outfit-grid");

function saveOutfits() {
    localStorage.setItem("outfits", JSON.stringify(outfits));
}

function renderOutfits(items = outfits) {

    outfitGrid.innerHTML = "";

    items.forEach((outfit, index) => {

        const card = document.createElement("div");

        card.className = "outfit-card";

        card.innerHTML = `

            <div class="outfit-images">

                ${outfit.items.map(item => `
                    <img src="${item.image}" alt="${item.name}">
                `).join("")}

            </div>

            <h3>${outfit.name}</h3>

            <p>${outfit.description || ""}</p>

            <div class="outfit-meta">

                <span>${outfit.weather || ""}</span>

                <span>${outfit.date || ""}</span>

            </div>

            <div class="card-buttons">

                <button class="wear-btn"
                    onclick="wearOutfit(${index})">

                    Wear

                </button>

                <button class="edit-btn"
                    onclick="editOutfit(${index})">

                    Edit

                </button>

                <button class="delete-btn"
                    onclick="deleteOutfit(${index})">

                    Delete

                </button>

            </div>

        `;

        outfitGrid.appendChild(card);

    });

}

function searchOutfits() {

    const value = document
        .getElementById("search")
        .value
        .toLowerCase();

    const filtered = outfits.filter(outfit =>
        outfit.name.toLowerCase().includes(value)
    );

    renderOutfits(filtered);

}

function deleteOutfit(index) {

    if(confirm("Delete this outfit?")){

        outfits.splice(index,1);

        saveOutfits();

        renderOutfits();

    }

}

function editOutfit(index){

    const newName = prompt(
        "Outfit name:",
        outfits[index].name
    );

    if(newName){

        outfits[index].name = newName;

        saveOutfits();

        renderOutfits();

    }

}

function wearOutfit(index){

    localStorage.setItem(
        "todayOutfit",
        JSON.stringify(outfits[index])
    );

    alert("Outfit selected for today!");

}

document
.getElementById("search")
.addEventListener("input", searchOutfits);

renderOutfits();

lucide.createIcons();