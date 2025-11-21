function deletePost(postID) { // when clicking on the delete button of a post call this function with the post ID
  fetch('/posts/' + postID + '/delete', { 
    method: 'POST'
  }).then(res => {
    if (res.ok) {
        console.log(document.getElementById(postID));
      document.getElementById(postID).remove();
    } else {
      console.error("Failed to delete post");
    }
  })
  .catch(err => console.error(err));
}