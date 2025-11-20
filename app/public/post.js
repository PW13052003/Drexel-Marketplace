/*
    Client side code for posting
*/

let verifiedLogin = false;
function verify() {
    return fetch("/auth/whoami")
        .then(res => res.json())
        .then(body => {
            if (body.loggedIn) {
                userID = body.user.id;
                return true;
            }
            return false;
        })
        .catch(error => {
            console.log("Verify error:", error);
            return false;
        });
}
verify().then(isLoggedIn => {
    console.log("logged in?", isLoggedIn);
    if(!isLoggedIn) {
        window.location.href = "/login.html";
        
    }else{
        verifiedLogin = true;
    }
});



        
    
let submitButton = document.getElementById("submit");
let titleInput = document.getElementById("title");
let descriptionInput = document.getElementById("description");
let priceInput = document.getElementById("price");
let categoryInput = document.getElementById("category");
let errorMessage = document.getElementById("errorMessage");
let logoutButton = document.getElementById("logout");

function logoutRequest() {
    return fetch("/auth/logout",{
    method:"POST",
    }).then(response => {
    console.log("Response received:", response.status);
        if(response.status != 200){
            console.log(response);
            return false;
        }else{
            verifiedLogin = false; // while redirecting, do not let a logged out user press submit
            return true;
        }
    })
    .catch(error => {
        console.log(error);
        return false;
    });

    
}
function logout() {
    logoutRequest().then(canLogout => { // once we know nothing went wrong logging out, redirect to login page
    if(canLogout) {
        window.location.href = "/login.html";
    }
    });
}
logoutButton.addEventListener("click", logout);

    


let imageInput = document.getElementById("images");
let imagePreview = document.getElementById("preview");
function displayUploadedImages(){
    clearImagePreview();
    console.log(imageInput.files);
    for(file of imageInput.files){
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.width = "150px";
        img.style.margin = "10px";

        preview.appendChild(img);
    }
    
}
imageInput.addEventListener("change", displayUploadedImages);

function submit(){
    if(!verifiedLogin) {console.log("not logged in"); return;} // Do not submit until the login has been verified
    // If there are no images to upload skip this step
    if(imageInput.files.length === 0){addPost([]); return;}
    // First upload the images so we can put the paths to them in the database
    const formData = new FormData();
    for (let file of imageInput.files) {
        formData.append("images", file);
    }
    fetch("/uploadImages",{
    method:"POST",
    body: formData
    }).then(response => {
    console.log("Response received:", response.status);
    if(response.status != 200){
        errorMessage.textContent = "Failed to upload images";
    }else{
        return response.json();
    }
    })
    .then(data => {
        let imagePaths = data.uploadedImages;
        // Images were uploaded, add the post to the database
        addPost(imagePaths);
        
    })
    .catch(error => {
        console.log(error);
        return;
    });

    
}

function addPost(imagePaths){
    let condition = ""
        let date = new Date(); // gets the current date
        let dateString = date.getFullYear() + "-" + (date.getMonth() + 1)+ "-" + date.getDate() + " ";
        dateString += date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        let title = titleInput.value;
        let description = descriptionInput.value;
        let price = priceInput.value;
        let selected = document.querySelector('input[name="condition"]:checked');
        if(selected){
            condition = selected.value;
        }
        let category = categoryInput.value;

        if(title.length < 1 || title.length > 20){
            errorMessage.textContent = "Title must be 1-20 characters";
            return;
        }
        /* CLIENT_SIDE VALIDATION */
        // make sure price is a number >= 0 in correct price format (using regex)
        if(isNaN(price) || price < 0 || !(/^\d+\.\d{0,2}$|^\d+$|^\.\d{0,2}$/.test(price))
        || price > 99999999.99) {
            errorMessage.textContent = "Please enter a valid price";
            return;
        }
        if( condition === "") {
            errorMessage.textContent = "Please select a condition";
            return;
        }
        if(category === "") {
            errorMessage.textContent = "Please select a category";
            return;
        }

        fetch("/createPost",{
        method:"POST",
        headers: {
        "Content-type": "application/json"
        },
        // TODO: once authentication is set up change the userID to get the current userID
        body: JSON.stringify({title: title, description: description, 
            date: dateString, price: price, condition: condition, category: category}),
        }).then(response => {
        console.log("Response received:", response.status);
        if(response.status != 200){
            errorMessage.textContent = "Bad request";
            return;
        }
        return response.json();
        })
        .then(data => {
            console.log("New Post ID:", data.postID);
            if(imagePaths.length > 0){
                // add the image paths to the database if there are any
                addImages(data.postID, imagePaths);
            }else{
                // no image paths to add, skip last step
                 errorMessage.textContent = "Success";
            }
            
    
        }).catch(error => {
            console.log(error);
        });
}

function addImages(postID, imagePaths){
    fetch("/addImages" ,{
        method:"POST",
        headers: {
        "Content-type": "application/json"
        },
        body : JSON.stringify({postID: postID, paths: imagePaths}),
    }).then(response => {
        console.log("Response received:", response.status);
        if(response.status != 200){
            errorMessage.textContent = "Bad request";
            return;
        }else{
            errorMessage.textContent = "Success";
        }
    }).catch(error => {
            console.log(error);
    });
    
}

submitButton.addEventListener("click", submit);
// Clear the image upload/preview so the user can pick new images without
// having to refresh
function resetFile() {
    imageInput.value = '';
    clearImagePreview();
}

function clearImagePreview() {
    while (imagePreview.firstChild) {
        imagePreview.removeChild(imagePreview.firstChild);
    }
}

let resetButton = document.getElementById("resetImages");
resetButton.addEventListener("click", resetFile);