let postsDiv = document.getElementById("postDisplay");
let searchBar = document.getElementById("searchBar");
let submitButton = document.getElementById("submit");

let newCheckbox = document.getElementById("new");
let usedCheckbox = document.getElementById("used");

let minPriceInput = document.getElementById("minPrice");
let maxPriceInput = document.getElementById("maxPrice");

let clothingCheckbox = document.getElementById("clothing");
let electronicsCheckbox = document.getElementById("electronics");
let homeCheckbox = document.getElementById("home");
let furnitureCheckbox = document.getElementById("furniture");
let otherCheckbox = document.getElementById("other");


function GetMostRecentPosts() {
    let titleText = searchBar.value;
    let isNew = newCheckbox.checked;
    let isUsed = usedCheckbox.checked;
    let minPrice = minPriceInput.value;
    let maxPrice = maxPriceInput.value;
    let isClothing = clothingCheckbox.checked;
    let isElectronics = electronicsCheckbox.checked;
    let isHome = homeCheckbox.checked;
    let isFurniture = furnitureCheckbox.checked;
    let isOther = otherCheckbox.checked;
    
    let url = `/search?titleText=${titleText}&isNew=${isNew}&isUsed=${isUsed}&minPrice=${minPrice}&maxPrice=${maxPrice}&isClothing=
    ${isClothing}&isElectronics=${isElectronics}&isHome=${isHome}&isFurniture=${isFurniture}&isOther=${isOther}`;
    fetch(url).then((response) => {
    response.json().then(body => {
        console.log(body);
        for(let row of body.rows){
            console.log(row);
        }
        
    }).catch(error => {
            // will be executed if attempt
            // to parse body as JSON crashes
            //message.textContent = "something went wrong";
            console.log("Inner error:", error);
            });
    }).catch(error => {
        console.log(error);
    });
    
}

GetMostRecentPosts();
submitButton.addEventListener("click", GetMostRecentPosts);