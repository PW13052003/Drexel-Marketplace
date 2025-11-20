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
let errorMessage = document.getElementById("errorMessage");
let currentPosts = [];
const postsPerPage = 5;
let currentPage = 1;
let numPages = 0;

function changePage(newPageNum) {
    currentPage = newPageNum;
    displayPosts();
}
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
    
    let userID = 2; // Placeholder
    let url = `/search?titleText=${titleText}&isNew=${isNew}&isUsed=${isUsed}&minPrice=${minPrice}&maxPrice=${maxPrice}&isClothing=
    ${isClothing}&isElectronics=${isElectronics}&isHome=${isHome}&isFurniture=${isFurniture}&isOther=${isOther}&userID=${userID}`;
    fetch(url).then((response) => {
    response.json().then(body => {
        console.log(body);
        currentPosts = body.rows;
        if(currentPosts.length != 0){
            numPages = Math.ceil(currentPosts.length / postsPerPage);
            currentPage = 1;
            displayPosts();
        }else{
            errorMessage.textContent = "Currently no posts to display";
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

function displayPosts(){
    let startIndex = postsPerPage * (currentPage - 1);
    let endIndex = postsPerPage * (currentPage) - 1;
    postsDiv.textContent = "";
    let pageNav = document.createElement("div");

        for(let i = 1; i <= numPages; i++) {
            let pageBtn = document.createElement("button");
            pageBtn.textContent = i;
            pageBtn.addEventListener("click", () => changePage(i));
            pageNav.append(pageBtn);
        }
        postsDiv.append(pageNav);
    for(let currentIndex = startIndex; currentIndex <= endIndex; currentIndex++){
        let post = currentPosts[currentIndex];
        let postDiv = document.createElement("div");
        postDiv.id = post.id;
        let postTitle = document.createElement("h3");
        postTitle.textContent = post.title;
        postDiv.append(postTitle);
        postsDiv.append(postDiv);

        let timePosted = document.createElement("p");
        timePosted.textContent = post.time_posted.slice(0, 10);
        postDiv.append(timePosted);
        let imageDiv = document.createElement("div");

        let conditionDesc = document.createElement("p");
        conditionDesc.textContent = "Condition: " + post.condition;
        postDiv.append(conditionDesc);
        
        let url = `/getImages?postID=${post.id}`;
        fetch(url).then((response) => {
        response.json().then(body => {
            let imagePaths = body.images;
            for(let path of imagePaths){
                const img = document.createElement("img");
                img.src = path.imagepath;
                img.style.width = "150px";
                img.style.margin = "10px";
                imageDiv.append(img);
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
        postDiv.append(imageDiv);
        let desc = document.createElement("p");
        desc.textContent = post.post_description;
        postDiv.append(desc);
        let purchaseBtn = document.createElement("button");
        purchaseBtn.textContent = "purchase";
        postDiv.append(purchaseBtn);
        let profileBtn = document.createElement("button");
        profileBtn.textContent = "View seller profile";
        postDiv.append(profileBtn);

        
    }    
    let pageNavBottom = document.createElement("div");

        for(let i = 1; i <= numPages; i++) {
            let pageBtn = document.createElement("button");
            pageBtn.textContent = i;
            pageBtn.addEventListener("click", () => changePage(i));
            pageNavBottom.append(pageBtn);
        }
        postsDiv.append(pageNavBottom);
}

GetMostRecentPosts();
submitButton.addEventListener("click", GetMostRecentPosts);