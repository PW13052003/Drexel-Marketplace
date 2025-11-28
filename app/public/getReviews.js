
let sellerReviewDiv = document.getElementById("sellerReviews");
let sellerRatingText = document.getElementById("userRating");
async function getSellerReviews(seller_id) {
    if(!sellerReviewDiv || !sellerRatingText) {
        console.log("Error displaying seller reviews");
        return;
    }
    const response = await fetch(`/reviews/seller/${seller_id}`);
    const data = await response.json();

    if (!response.ok) {
        console.log("error");
        return;
    }

    console.log(data);
    if(data.total_reviews > 0) {
        sellerRatingText.textContent = `Rating: ${data.average_rating}/5.0`;
        for(let review of data.reviews) {
            let reviewDiv = document.createElement("div");
            let reviewerName = document.createElement("h3");
            reviewerName.textContent = "Review from " + review.first_name + " " + review.last_name + "";
            reviewerName.textContent = `Review from ${review.first_name} ${review.last_name} on ${review.created_at.slice(0, 10)}`;
            reviewDiv.append(reviewerName);

            let ratingText = document.createElement("h5");
            ratingText.textContent = "Rating: " + review.rating;
            reviewDiv.append(ratingText);

            let reviewText = document.createElement("p");
            reviewText.textContent = review.review_text;
            reviewDiv.append(reviewText);


            sellerReviewDiv.append(reviewDiv);
        }
    }else{
        sellerRatingText.textContent = "No current rating (no reviews)";
        sellerReviewDiv.textContent = "No current seller reviews";

    }

}

const path = window.location.pathname;


const sellerID = path.split("/").pop();

const sellerIDNum = Number(sellerID);

getSellerReviews(sellerIDNum);