/*
    Client side code for posting
*/

let submitButton = document.getElementById("submit");
let titleInput = document.getElementById("title");
let descriptionInput = document.getElementById("description");
let priceInput = document.getElementById("price");
let categoryInput = document.getElementById("category");
let errorMessage = document.getElementById("errorMessage");

let imageInput = document.getElementById("images");
let imagePreview = document.getElementById("preview");
function displayUploadedImages(){
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
    // Get the input values
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
    if(isNaN(price) || price < 0 || !(/^\d+\.\d{0,2}$|^\d+$|^\.\d{0,2}$/.test(price))) {
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
    body: JSON.stringify({title: title, description: description, userID: 1, date: dateString}),
    }).then(response => {
    console.log("Response received:", response.status);
    if(response.status != 200){
        errorMessage.textContent = "Bad request";
    }else{
        errorMessage.textContent = "Success";
    }
    }).catch(error => {
        console.log(error);
    });
}

submitButton.addEventListener("click", submit);