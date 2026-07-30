let wardrobe = JSON.parse(localStorage.getItem("wardrobe")) || [];
let outfits = JSON.parse(localStorage.getItem("outfits")) || [];
let activeFilter = "all";
let selectedIndexes = [];
let editingId = null;

const builder = document.getElementById("outfit-builder");
const builderTitle = document.getElementById("builder-title");
const form = document.getElementById("outfit-form");
const outfitGrid = document.getElementById("outfit-grid");
const wardrobePicker = document.getElementById("wardrobe-picker");
const selectedItems = document.getElementById("selected-items");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const todayCard = document.getElementById("today-card");
const ideasGrid = document.getElementById("ideas-grid");
const outfitCount = document.getElementById("outfit-count");

outfits = outfits.map((outfit, index) => ({
    id: outfit.id || Date.now() + index,
    name: outfit.name || "Untitled Outfit",
    description: outfit.description || "",
    date: outfit.date || "",
    temp: outfit.temp || "",
    itemIndexes: outfit.itemIndexes || [],
    items: outfit.items || [],
    favorite: Boolean(outfit.favorite),
    createdAt: outfit.createdAt || Date.now() + index
}));
saveOutfits();

function saveOutfits() {
    localStorage.setItem("outfits", JSON.stringify(outfits));
}

function refreshIcons() {
    if (window.lucide) {
        lucide.createIcons();
    }
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatDate(value) {
    if (!value) return "Not planned";
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function itemVisual(item) {
    if (item.image) {
        return `<img src="${item.image}" alt="${escapeHtml(item.name)}">`;
    }

    return `<div class="item-placeholder" style="background:${item.color || "#555"}"></div>`;
}

function openBuilder(outfit = null, startingIndexes = []) {
    editingId = outfit ? outfit.id : null;
    selectedIndexes = outfit ? outfit.itemIndexes || [] : startingIndexes;

    builderTitle.textContent = outfit ? "Edit Outfit" : "Create Outfit";
    document.getElementById("outfit-name").value = outfit ? outfit.name : "";
    document.getElementById("outfit-description").value = outfit ? outfit.description || "" : "";
    document.getElementById("outfit-date").value = outfit ? outfit.date || "" : "";
    document.getElementById("outfit-temp").value = outfit ? outfit.temp || "" : "";

    builder.classList.remove("hidden");
    renderPicker();
    renderSelectedItems();
}

function closeBuilder() {
    builder.classList.add("hidden");
    editingId = null;
    selectedIndexes = [];
    form.reset();
    renderPicker();
    renderSelectedItems();
}

function renderPicker() {
    if (wardrobe.length === 0) {
        wardrobePicker.innerHTML = `
            <div class="empty-state">
                <p>Add wardrobe items first, then build outfits here.</p>
                <a href="index.html">Add Item</a>
            </div>
        `;
        return;
    }

    wardrobePicker.innerHTML = wardrobe.map((item, index) => `
        <button type="button" class="picker-item ${selectedIndexes.includes(index) ? "selected" : ""}" data-index="${index}">
            ${itemVisual(item)}
            <span>${escapeHtml(item.name)}</span>
        </button>
    `).join("");
}

function renderSelectedItems() {
    if (selectedIndexes.length === 0) {
        selectedItems.innerHTML = `<p class="muted">Choose items from your wardrobe.</p>`;
        return;
    }

    selectedItems.innerHTML = selectedIndexes.map(index => {
        const item = wardrobe[index];
        if (!item) return "";

        return `
            <div class="selected-item">
                ${itemVisual(item)}
                <span>${escapeHtml(item.name)}</span>
            </div>
        `;
    }).join("");
}

function getVisibleOutfits() {
    const query = searchInput.value.trim().toLowerCase();

    let visible = outfits.filter(outfit => {
        const matchesSearch = outfit.name.toLowerCase().includes(query) ||
            (outfit.description || "").toLowerCase().includes(query);
        const matchesFilter =
            activeFilter === "all" ||
            (activeFilter === "favorites" && outfit.favorite) ||
            (activeFilter === "planned" && outfit.date);

        return matchesSearch && matchesFilter;
    });

    visible = [...visible].sort((a, b) => {
        if (sortSelect.value === "oldest") return a.createdAt - b.createdAt;
        if (sortSelect.value === "az") return a.name.localeCompare(b.name);
        if (sortSelect.value === "favorites") return Number(b.favorite) - Number(a.favorite);
        return b.createdAt - a.createdAt;
    });

    return visible;
}

function renderOutfits() {
    const visible = getVisibleOutfits();
    outfitCount.textContent = `${visible.length} ${visible.length === 1 ? "outfit" : "outfits"}`;

    if (visible.length === 0) {
        outfitGrid.innerHTML = `
            <div class="empty-state wide">
                <p>No outfits match this view.</p>
                <button type="button" class="save-btn" id="empty-create">Create Outfit</button>
            </div>
        `;
        refreshIcons();
        return;
    }

    outfitGrid.innerHTML = visible.map(outfit => `
        <article class="outfit-card" data-id="${outfit.id}">
            <button type="button" class="favorite-btn ${outfit.favorite ? "active" : ""}" data-action="favorite" aria-label="Favorite outfit">
                <i data-lucide="heart"></i>
            </button>
            <div class="outfit-images">
                ${outfit.items.map(itemVisual).join("")}
            </div>
            <h3>${escapeHtml(outfit.name)}</h3>
            <p>${escapeHtml(outfit.description || "Ready when you are.")}</p>
            <div class="outfit-meta">
                <span><i data-lucide="calendar"></i>${formatDate(outfit.date)}</span>
                <span><i data-lucide="thermometer"></i>${outfit.temp ? `${outfit.temp}C` : "Any weather"}</span>
            </div>
            <div class="card-buttons">
                <button type="button" class="wear-btn" data-action="wear">Wear</button>
                <button type="button" class="edit-btn" data-action="edit">Edit</button>
                <button type="button" class="delete-btn" data-action="delete">Delete</button>
            </div>
        </article>
    `).join("");

    refreshIcons();
}

function renderToday() {
    const todayId = Number(localStorage.getItem("todayOutfitId"));
    const outfit = outfits.find(item => item.id === todayId);

    if (!outfit) {
        todayCard.innerHTML = `
            <div class="empty-state wide">
                <p>No outfit selected for today.</p>
                <button type="button" class="save-btn" id="today-create">Create Outfit</button>
            </div>
        `;
        return;
    }

    todayCard.innerHTML = `
        <div class="today-images">
            ${outfit.items.map(itemVisual).join("")}
        </div>
        <div class="today-info">
            <h3>${escapeHtml(outfit.name)}</h3>
            <p>${escapeHtml(outfit.description || "Selected for today.")}</p>
            <div class="outfit-meta">
                <span><i data-lucide="calendar"></i>${formatDate(outfit.date)}</span>
                <span><i data-lucide="thermometer"></i>${outfit.temp ? `${outfit.temp}C` : "Any weather"}</span>
            </div>
        </div>
    `;

    refreshIcons();
}

function buildIdeas() {
    if (wardrobe.length < 2) {
        ideasGrid.innerHTML = `
            <div class="empty-state wide">
                <p>Add at least two wardrobe items to generate outfit ideas.</p>
            </div>
        `;
        return;
    }

    const tops = wardrobe
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => ["top", "shirt", "t-shirt", "hoodie", "outerwear"].includes(item.category));
    const bottoms = wardrobe
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => ["jeans", "trousers", "shorts"].includes(item.category));
    const shoes = wardrobe
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.category === "shoes");

    const ideas = [];
    const topPool = tops.length ? tops : wardrobe.map((item, index) => ({ item, index }));
    const bottomPool = bottoms.length ? bottoms : wardrobe.map((item, index) => ({ item, index }));
    const shoePool = shoes.length ? shoes : [];

    for (let i = 0; i < 4; i++) {
        const pieces = [
            topPool[i % topPool.length],
            bottomPool[(i + 1) % bottomPool.length],
            shoePool[i % shoePool.length]
        ].filter(Boolean);

        const uniquePieces = pieces.filter((piece, index, array) =>
            array.findIndex(match => match.index === piece.index) === index
        );

        ideas.push(uniquePieces);
    }

    ideasGrid.innerHTML = ideas.map((idea, index) => `
        <button type="button" class="idea-card" data-idea="${index}">
            <div>
                ${idea.map(({ item }) => itemVisual(item)).join("")}
            </div>
            <span>Use Idea</span>
        </button>
    `).join("");

    ideasGrid.dataset.ideas = JSON.stringify(ideas.map(idea => idea.map(piece => piece.index)));
    refreshIcons();
}

function createOutfitFromIdea(indexes) {
    openBuilder(null, indexes);
}

wardrobePicker.addEventListener("click", event => {
    const button = event.target.closest(".picker-item");
    if (!button) return;

    const index = Number(button.dataset.index);
    if (selectedIndexes.includes(index)) {
        selectedIndexes = selectedIndexes.filter(itemIndex => itemIndex !== index);
    } else {
        selectedIndexes.push(index);
    }

    renderPicker();
    renderSelectedItems();
});

form.addEventListener("submit", event => {
    event.preventDefault();

    if (selectedIndexes.length === 0) {
        alert("Choose at least one wardrobe item.");
        return;
    }

    const outfit = {
        id: editingId || Date.now(),
        name: document.getElementById("outfit-name").value.trim(),
        description: document.getElementById("outfit-description").value.trim(),
        date: document.getElementById("outfit-date").value,
        temp: document.getElementById("outfit-temp").value,
        itemIndexes: selectedIndexes,
        items: selectedIndexes.map(index => wardrobe[index]).filter(Boolean),
        favorite: editingId ? outfits.find(item => item.id === editingId)?.favorite || false : false,
        createdAt: editingId ? outfits.find(item => item.id === editingId)?.createdAt || Date.now() : Date.now()
    };

    if (editingId) {
        outfits = outfits.map(item => item.id === editingId ? outfit : item);
    } else {
        outfits.push(outfit);
    }

    saveOutfits();
    closeBuilder();
    renderOutfits();
    renderToday();
});

outfitGrid.addEventListener("click", event => {
    const emptyCreate = event.target.closest("#empty-create");
    if (emptyCreate) {
        openBuilder();
        return;
    }

    const card = event.target.closest(".outfit-card");
    const actionButton = event.target.closest("[data-action]");
    if (!card || !actionButton) return;

    const id = Number(card.dataset.id);
    const outfit = outfits.find(item => item.id === id);
    if (!outfit) return;

    if (actionButton.dataset.action === "favorite") {
        outfit.favorite = !outfit.favorite;
    }

    if (actionButton.dataset.action === "wear") {
        localStorage.setItem("todayOutfitId", id);
        renderToday();
    }

    if (actionButton.dataset.action === "edit") {
        openBuilder(outfit);
        return;
    }

    if (actionButton.dataset.action === "delete" && confirm("Delete this outfit?")) {
        outfits = outfits.filter(item => item.id !== id);
        if (Number(localStorage.getItem("todayOutfitId")) === id) {
            localStorage.removeItem("todayOutfitId");
        }
    }

    saveOutfits();
    renderOutfits();
    renderToday();
});

ideasGrid.addEventListener("click", event => {
    const card = event.target.closest(".idea-card");
    if (!card) return;

    const ideas = JSON.parse(ideasGrid.dataset.ideas || "[]");
    createOutfitFromIdea(ideas[Number(card.dataset.idea)] || []);
});

todayCard.addEventListener("click", event => {
    if (event.target.closest("#today-create")) {
        openBuilder();
    }
});

document.getElementById("open-builder").addEventListener("click", () => openBuilder());
document.getElementById("close-builder").addEventListener("click", closeBuilder);
document.getElementById("clear-selection").addEventListener("click", () => {
    selectedIndexes = [];
    renderPicker();
    renderSelectedItems();
});

document.getElementById("clear-today").addEventListener("click", () => {
    localStorage.removeItem("todayOutfitId");
    renderToday();
});

document.getElementById("refresh-ideas").addEventListener("click", buildIdeas);

document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelector(".tab.active").classList.remove("active");
        tab.classList.add("active");
        activeFilter = tab.dataset.filter;
        renderOutfits();
    });
});

document.querySelectorAll(".view-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelector(".view-btn.active").classList.remove("active");
        button.classList.add("active");
        outfitGrid.classList.toggle("list-view", button.getAttribute("aria-label") === "List view");
    });
});

searchInput.addEventListener("input", renderOutfits);
sortSelect.addEventListener("change", renderOutfits);

renderPicker();
renderSelectedItems();
renderToday();
renderOutfits();
buildIdeas();
refreshIcons();
