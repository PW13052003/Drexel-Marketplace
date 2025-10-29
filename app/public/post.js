/*
    Client side code for posting
*/

let submitButton = document.getElementById("submit");
let titleInput = document.getElementById("title");
let descriptionInput = document.getElementById("description");
let errorMessage = document.getElementById("errorMessage");
function submit(){
    let date = new Date(); // gets the current date
    let dateString = date.getFullYear() + "-" + (date.getMonth() + 1)+ "-" + date.getDate() + " ";
    dateString += date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    console.log(dateString);
    let title = titleInput.value;
    let description = descriptionInput.value;
    if(title.length < 1 || title.length > 20){
        errorMessage.textContent = "Title must be 1-20 characters";
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