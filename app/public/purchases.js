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
function displayCurrentPurchases() {
    numPagesCurrent = Math.ceil(currentPurchases.length / purchasesPerPage);
    currentPage = 1;
    let startIndex = purchasesPerPage * (currentPage - 1);
    let endIndex = purchasesPerPage * (currentPage) - 1;
    currentPurchasesDiv.textContent = "";
    let pageNav = document.createElement("div");

    for(let i = 1; i <= numPagesCurrent; i++) {
        let pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        pageBtn.addEventListener("click", () => changePage(i));
        pageNav.append(pageBtn);
    }
    currentPurchasesDiv.append(pageNav);
    for(let currentIndex = startIndex; currentIndex <= endIndex && currentIndex < currentPurchases.length; currentIndex++){
        let purchase = currentPurchases[currentIndex];
        console.log(purchase);
        let purchaseDiv = document.createElement("div");
        let profileBtn = document.createElement("button");
        profileBtn.textContent = "View seller profile";
        profileBtn.addEventListener("click", () => goToProfile(purchase.seller_id));
        purchaseDiv.append(profileBtn);
        let reviewBtn = document.createElement("button");
        reviewBtn.textContent = "Review Seller";
        reviewBtn.addEventListener("click", () => reviewSeller(purchase.post_id));
        purchaseDiv.append(reviewBtn);
        currentPurchasesDiv.append(purchaseDiv);
    }
}

function displayCompletedPurchases() {
    console.log(completedPurchases);
    numPagesCompleted = Math.ceil(completedPurchases.length / purchasesPerPage);
    currentPageCompleted = 1;
    let startIndex = purchasesPerPage * (currentPageCompleted - 1);
    let endIndex = purchasesPerPage * (currentPageCompleted) - 1;
    completedPurchasesDiv.textContent = "";
    let pageNav = document.createElement("div");

    for(let i = 1; i <= numPagesCompleted; i++) {
        let pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        pageBtn.addEventListener("click", () => changeCompletedPage(i));
        pageNav.append(pageBtn);
    }
    completedPurchasesDiv.append(pageNav);
    for(let currentIndex = startIndex; currentIndex <= endIndex && currentIndex < completedPurchases.length; currentIndex++){
        let purchase = completedPurchases[currentIndex];
        console.log(purchase);
        let purchaseDiv = document.createElement("div");
        let profileBtn = document.createElement("button");
        profileBtn.textContent = "View seller profile";
        profileBtn.addEventListener("click", () => goToProfile(purchase.seller_id));
        purchaseDiv.append(profileBtn);
        completedPurchasesDiv.append(purchaseDiv);
    }
}
function displayPurchases(purchases) {
    for(let purchase of purchases) {
        if(purchase.completed) {
            completedPurchases.push(purchase);
        }else{
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
        console.log(body);
        if(body.length != 0){

            displayPurchases(body.purchases);
        }else{
            errorMessage.textContent = "Currently no purchases to display";
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
    
