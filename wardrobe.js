let wardrobe = JSON.parse(localStorage.getItem("wardrobe")) || [];

const grid = document.getElementById("wardrobe-grid");

function saveWardrobe(){
    localStorage.setItem("wardrobe",JSON.stringify(wardrobe));
}

function deleteItem(index){
    wardrobe.splice(index,1);
    saveWardrobe();
    renderWardrobe();
}

function editItem(index){
    const item=wardrobe[index];
    const newName=prompt("Item name:",item.name);

    if(newName){
        item.name=newName;
    }

    saveWardrobe();
    renderWardrobe();
}

function renderWardrobe(items=wardrobe){

    grid.innerHTML="";

    items.forEach((item,index)=>{

        const card=document.createElement("div");

        card.className="item-card";

        card.style.boxShadow=`0 0 12px ${item.color}`;

        card.innerHTML=`

        ${
            item.image
            ?
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

}

function searchItems(){

    const value=document.getElementById("search").value.toLowerCase();

    renderWardrobe(

        wardrobe.filter(item=>

            item.name.toLowerCase().includes(value)

        )

    );

}

function filterCategory(){

    const category=document.getElementById("category-filter").value;

    if(category==="all"){
        renderWardrobe();
        return;
    }

    renderWardrobe(

        wardrobe.filter(item=>

            item.category===category

        )

    );

}

renderWardrobe();