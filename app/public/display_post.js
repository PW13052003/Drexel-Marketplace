function goToProfile(userID) {
    window.location.href = `/viewprofile/${userID}`;
}


function purchase(postID) {
    fetch("/purchase",{
        method:"POST",
        headers: {
        "Content-type": "application/json"
        },
        // TODO: once authentication is set up change the userID to get the current userID
        body: JSON.stringify({ post_id: postID }),
        }).then(response => {
        console.log("Response received:", response.status);
        return response.json();
        })
        .then(data => {
            console.log(data);
            errorMessage.textContent = data.message;
    
        }).catch(error => {
            console.log(error);
        });
}

function goToPost(postID) {
    window.location.href = `view_post.html?post_id=${postID}`;
}

// displays a single post. If it is on the search page, have an option to view the post on a seperate page
export function displayPost(post, isSearchPage) {
    let postDiv = document.createElement("div");
        postDiv.id = post.id;
        let postTitle = document.createElement("h3");
        postTitle.textContent = post.title;
        postDiv.append(postTitle);

        let timePosted = document.createElement("p");
        timePosted.textContent = post.time_posted.slice(0, 10);
        postDiv.append(timePosted);
        let imageDiv = document.createElement("div");

        let priceDesc = document.createElement("p");
        priceDesc.textContent = "$" + post.price;
        postDiv.append(priceDesc);
        
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
        if(!post.sold) {
            let purchaseBtn = document.createElement("button");
            purchaseBtn.textContent = "purchase";
            purchaseBtn.addEventListener("click", () => purchase(post.id));
            postDiv.append(purchaseBtn);
        }
        

        let profileBtn = document.createElement("button");
        profileBtn.textContent = "View seller profile";
        profileBtn.addEventListener("click", () => goToProfile([post.user_id]));
        postDiv.append(profileBtn);

        if(isSearchPage) {
            let viewPostBtn = document.createElement("button");
            viewPostBtn.textContent="View Post";
            viewPostBtn.addEventListener("click", () => goToPost([post.user_id]));
            postDiv.append(viewPostBtn);
        }else{
            let statusText = document.createElement("p");
            if(post.sold){
                statusText.textContent = "Status: sold";
            }else{
                statusText.textContent = "Status: for sale";
            }
            postDiv.append(statusText);
        }
        return postDiv;
}

