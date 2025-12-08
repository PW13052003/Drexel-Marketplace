function goToProfile(userID) {
    window.location.href = `/viewprofile/${userID}`;
}

function purchase(postID) {
    fetch("/purchase", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({ post_id: postID }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        alert(data.message);
    })
    .catch(error => console.log(error));
}

function goToPost(postID) {
    window.location.href = `view_post.html?post_id=${postID}`;
}

export function displayPost(post, isSearchPage) {
    // Card container
    let postDiv = document.createElement("div");
    postDiv.className =
        "bg-white shadow-lg rounded-xl p-5 mb-6 border border-gray-200";

    // Title
    let postTitle = document.createElement("h3");
    postTitle.textContent = post.title;
    postTitle.className = "text-xl font-semibold text-blue-800";
    postDiv.append(postTitle);

    // Time posted
    let timePosted = document.createElement("p");
    timePosted.textContent = `Posted: ${post.time_posted.slice(0, 10)}`;
    timePosted.className = "text-gray-500 text-sm mb-2";
    postDiv.append(timePosted);

    // Price
    let priceDesc = document.createElement("p");
    priceDesc.textContent = "$" + post.price;
    priceDesc.className = "text-lg font-bold text-green-700";
    postDiv.append(priceDesc);

    // Condition
    let conditionDesc = document.createElement("p");
    conditionDesc.textContent = "Condition: " + post.condition;
    conditionDesc.className = "text-gray-700 mb-2";
    postDiv.append(conditionDesc);

    // Image container
    let imageDiv = document.createElement("div");
    imageDiv.className = "flex flex-wrap gap-3 my-3";

    // Fetch images
    let url = `/getImages?postID=${post.id}`;
    fetch(url)
        .then(response => response.json())
        .then(body => {
            let imagePaths = body.images;
            console.log(imagePaths);
            for (let path of imagePaths) {
                console.log(path);
                const img = document.createElement("img");
                img.src = path.imagepath;
                img.className = "w-28 h-28 object-cover rounded-md border";
                imageDiv.append(img);
            }
        })
        .catch(error => console.log(error));

    postDiv.append(imageDiv);

    // Description
    let desc = document.createElement("p");
    desc.textContent = post.post_description;
    desc.className = "text-gray-800 mb-4";
    postDiv.append(desc);

    // Button container
    let btnContainer = document.createElement("div");
    btnContainer.className = "flex gap-3 mt-4 flex-wrap";

    // Purchase button
    if (!post.sold) {
        let purchaseBtn = document.createElement("button");
        purchaseBtn.textContent = "Purchase";
        purchaseBtn.className =
            "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow";
        purchaseBtn.onclick = () => purchase(post.id);
        btnContainer.append(purchaseBtn);
    }

    // View seller profile
    let profileBtn = document.createElement("button");
    profileBtn.textContent = "View Seller Profile";
    profileBtn.className =
        "bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow";
    profileBtn.onclick = () => goToProfile(post.user_id);
    btnContainer.append(profileBtn);

    // Search page: include “View Post”
    if (isSearchPage) {
        let viewPostBtn = document.createElement("button");
        viewPostBtn.textContent = "View Post";
        viewPostBtn.className =
            "bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow";
        viewPostBtn.onclick = () => goToPost(post.id);
        btnContainer.append(viewPostBtn);
    } else {
        let statusText = document.createElement("p");
        statusText.textContent = post.sold ? "Status: Sold" : "Status: For Sale";
        statusText.className = "mt-2 font-semibold";
        postDiv.append(statusText);
    }

    postDiv.append(btnContainer);

    return postDiv;
}
