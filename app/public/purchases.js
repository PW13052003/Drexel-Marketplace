let currentPurchases = [];
let completedPurchases = [];
const purchasesPerPage = 10;
let currentPage = 1;
let currentPageCompleted = 1;
let numPagesCurrent = 0;
let numPagesCompleted = 0;
let errorMessage = document.getElementById("error");
let currentPurchasesDiv = document.getElementById("currentPurchases");
let completedPurchasesDiv = document.getElementById("completedPurchases");

function goToProfile(userID) {
    window.location.href = `/viewprofile/${userID}`;
}

function reviewSeller(postID) {
    window.location.href = `rate.html?post_id=${postID}`;
}

function goToPost(postID) {
    window.location.href = `view_post.html?post_id=${postID}`;
}

// --- Helper to style pagination buttons ---
function createPaginationButton(pageNumber, isActive, onClickHandler) {
    let btn = document.createElement("button");
    btn.textContent = pageNumber;
    btn.className = isActive 
        ? "px-3 py-1 bg-blue-700 text-white border border-blue-700 rounded-md text-sm font-medium mx-1"
        : "px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-medium mx-1 hover:bg-gray-50";
    btn.addEventListener("click", onClickHandler);
    return btn;
}

function displayCurrentPurchases() {
    numPagesCurrent = Math.ceil(currentPurchases.length / purchasesPerPage);
    let startIndex = purchasesPerPage * (currentPage - 1);
    let endIndex = purchasesPerPage * (currentPage) - 1;
    
    currentPurchasesDiv.textContent = "";

    // 1. Render Pagination (if needed)
    if (numPagesCurrent > 1) {
        let pageNav = document.createElement("div");
        pageNav.className = "flex justify-center mb-4";
        for(let i = 1; i <= numPagesCurrent; i++) {
            pageNav.append(createPaginationButton(i, i === currentPage, () => changePage(i)));
        }
        currentPurchasesDiv.append(pageNav);
    }

    // 2. Render Items
    for(let currentIndex = startIndex; currentIndex <= endIndex && currentIndex < currentPurchases.length; currentIndex++){
        let purchase = currentPurchases[currentIndex];
        
        // Create the main card container
        let purchaseDiv = document.createElement("div");
        purchaseDiv.className = "bg-white border border-gray-200 rounded-lg p-5 mb-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:shadow-md";

        let url = `/getPostTitle?post_id=${purchase.post_id}`;
        
        fetch(url).then((response) => {
            response.json().then(body => {
                let titles = body.titles;
                if(titles.length > 0){
                    
                    // -- LEFT SIDE: Title --
                    let titleHeader = document.createElement("h3");
                    titleHeader.textContent = titles[0].title;
                    titleHeader.className = "text-lg font-bold text-gray-900";
                    purchaseDiv.append(titleHeader);

                    // -- RIGHT SIDE: Button Group --
                    let btnGroup = document.createElement("div");
                    btnGroup.className = "flex flex-wrap items-center gap-3 w-full md:w-auto";

                    // 1. View Seller Profile (Link Style)
                    let profileBtn = document.createElement("button");
                    profileBtn.textContent = "View Seller Profile";
                    profileBtn.className = "text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline mr-2";
                    profileBtn.addEventListener("click", () => goToProfile(purchase.seller_id));
                    btnGroup.append(profileBtn);

                    // 2. View Post (Outline Button)
                    let viewPostBtn = document.createElement("button");
                    viewPostBtn.textContent = "View Post";
                    viewPostBtn.className = "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
                    viewPostBtn.addEventListener("click", () => goToPost([purchase.post_id]));
                    btnGroup.append(viewPostBtn);
                    
                    // 3. Review Seller (Primary Blue Button)
                    let reviewBtn = document.createElement("button");
                    reviewBtn.textContent = "Review Seller";
                    reviewBtn.className = "px-4 py-2 text-sm font-medium text-white bg-blue-700 border border-transparent rounded-md hover:bg-blue-800 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
                    reviewBtn.addEventListener("click", () => reviewSeller(purchase.post_id));
                    btnGroup.append(reviewBtn);

                    // Append the group to the main card
                    purchaseDiv.append(btnGroup);
                }
            }).catch(error => {
                console.log("Inner error:", error);
            });
        }).catch(error => {
            console.log(error);
        });

        currentPurchasesDiv.append(purchaseDiv);
    }
}

function displayCompletedPurchases() {
    numPagesCompleted = Math.ceil(completedPurchases.length / purchasesPerPage);
    let startIndex = purchasesPerPage * (currentPageCompleted - 1);
    let endIndex = purchasesPerPage * (currentPageCompleted) - 1;
    
    completedPurchasesDiv.textContent = "";

    // 1. Render Pagination
    if (numPagesCompleted > 1) {
        let pageNav = document.createElement("div");
        pageNav.className = "flex justify-center mb-4";
        for(let i = 1; i <= numPagesCompleted; i++) {
            pageNav.append(createPaginationButton(i, i === currentPageCompleted, () => changeCompletedPage(i)));
        }
        completedPurchasesDiv.append(pageNav);
    }

    // 2. Render Items
    for(let currentIndex = startIndex; currentIndex <= endIndex && currentIndex < completedPurchases.length; currentIndex++){
        let purchase = completedPurchases[currentIndex];
        
        let purchaseDiv = document.createElement("div");
        // Added opacity-75 to distinguish completed items slightly
        purchaseDiv.className = "bg-white border border-gray-200 rounded-lg p-5 mb-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:shadow-md opacity-90";

        let url = `/getPostTitle?post_id=${purchase.post_id}`;
        
        fetch(url).then((response) => {
            response.json().then(body => {
                let titles = body.titles;
                if(titles.length > 0){
                    
                    // -- LEFT SIDE --
                    let titleHeader = document.createElement("h3");
                    titleHeader.textContent = titles[0].title;
                    titleHeader.className = "text-lg font-bold text-gray-900";
                    purchaseDiv.append(titleHeader);

                    // -- RIGHT SIDE --
                    let btnGroup = document.createElement("div");
                    btnGroup.className = "flex flex-wrap items-center gap-3 w-full md:w-auto";

                    // 1. View Seller Profile
                    let profileBtn = document.createElement("button");
                    profileBtn.textContent = "View Seller Profile";
                    profileBtn.className = "text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline mr-2";
                    profileBtn.addEventListener("click", () => goToProfile(purchase.seller_id));
                    btnGroup.append(profileBtn);

                    // 2. View Post
                    let viewPostBtn = document.createElement("button");
                    viewPostBtn.textContent = "View Post";
                    viewPostBtn.className = "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition";
                    viewPostBtn.addEventListener("click", () => goToPost([purchase.post_id]));
                    btnGroup.append(viewPostBtn);
                    
                    // (Optional) Re-review button or just leave it out for completed
                    // If you want to allow changing review, uncomment below:
                    /*
                    let reviewBtn = document.createElement("button");
                    reviewBtn.textContent = "Update Review";
                    reviewBtn.className = "px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition";
                    reviewBtn.addEventListener("click", () => reviewSeller(purchase.post_id));
                    btnGroup.append(reviewBtn);
                    */

                    purchaseDiv.append(btnGroup);
                }
            }).catch(error => {
                console.log("Inner error:", error);
            });
        }).catch(error => {
            console.log(error);
        });

        completedPurchasesDiv.append(purchaseDiv);
    }
}

function displayPurchases(purchases) {
    for(let purchase of purchases) {
        if(purchase.completed) {
            completedPurchases.push(purchase);
        } else {
            currentPurchases.push(purchase);
        }
    }
    displayCurrentPurchases();
    displayCompletedPurchases();
}

function changePage(newPageNum) {
    currentPage = newPageNum;
    displayCurrentPurchases();
}

function changeCompletedPage(newPageNum) {
    currentPageCompleted = newPageNum;
    displayCompletedPurchases();
}

let url = "/myPurchases";
fetch(url).then((response) => {
    response.json().then(body => {
        if(body.purchases && body.purchases.length != 0){
             displayPurchases(body.purchases);
        } else if (Array.isArray(body) && body.length != 0) {
             displayPurchases(body);
        } else {
            errorMessage.textContent = "Currently no purchases to display";
            errorMessage.className = "text-center text-gray-500 py-8";
        }
    }).catch(error => {
        console.log("Inner error:", error);
    });
}).catch(error => {
    console.log(error);
});