const urlParams = new URLSearchParams(window.location.search);
const post_id = urlParams.get("post_id");
loadPage();
async function loadPage() {

    if (!post_id) {
        alert("Invalid Post ID.");
        window.location.href = "index.html";
    }

    await checkEligibility(post_id);
    await loadReviews(post_id);
}

async function checkEligibility(post_id) {
    const msg = document.getElementById("eligibilityMessage");
    const reviewSection = document.getElementById("reviewSection");
    const response = await fetch(`/reviews/eligibility/${post_id}`);
    const data = await response.json();

    if (!response.ok) {
        msg.textContent = "Error checking eligibility!";
        reviewSection.style.display = "none";
        return;
    }

    //msg.textContent = `Eligibility -> hasPurchased: ${data.hasPurchased}, alreadyReviewed: ${data.alreadyReviewed}, isSeller: ${data.isSeller}`;

    if (data.canReview) {
        reviewSection.style.display = "block";
        setupReviewSubmit(post_id);
    }

    else {
        reviewSection.style.display = "none"
    }
}

function setupReviewSubmit(post_id) {
    document.getElementById("submitReview").onclick = async() => {
        const rating = document.getElementById("rating").value;
        const text = document.getElementById("review_text").value;
        const msg = document.getElementById("reviewMessage");

        if (!rating) {
            msg.textContent = "Select a rating:";
            return;
        }

        const res = await fetch("/addReview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                post_id: post_id,
                rating: parseInt(rating),
                review_text: text
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            msg.textContent = data.message;
        }

        else {
            msg.style.color = "green";
            msg.textContent = "Review added!";
            window.location.href = "/purchases.html";
            loadReviews(post_id);
            checkEligibility(post_id);

        }
    }; 
}

async function loadReviews(post_id) {
    const list = document.getElementById("reviewsList");
    list.innerHTML = "";
    
    const res = await fetch(`/reviews/product/${post_id}`);
    const data = await res.json();
    /*
    if (!res.ok) {
        list.textContent = "Error loading reviews!";
        return;
    }

    if (data.reviews.length === 0) {
        list.textContent = "No reviews yet!";
        return;
    }
    */
    data.reviews.forEach(r => {
        const box = document.createElement("div");
        box.classList.add("reviewBox");
        
        box.innerHTML = `
            ${r.rating}/5 <br>
            <strong>${r.first_name} ${r.last_name}</strong><br>
            ${r.review_text ? r.review_text : "(No text review)"}<br>
            <small>${new Date(r.created_at).toLocaleString()}</small>
            `;

            list.appendChild(box);
    });
}