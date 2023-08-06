// const editBtn = document.getElementById("edit-btn")
// const cancelBtn = document.getElementById("cancel-btn")
// const popup = document.getElementById("card4")
// const backdrop = document.getElementById("backdrop")
// editBtn.addEventListener("click",function(){
// popup.style.display = "block"
// backdrop.style.display = "block"
// })
// cancelBtn.addEventListener("click",function(){
//     popup.style.display="none";
//     backdrop.style.display= 'none';

// })
// document.addEventListener("DOMContentLoaded", function() {
//     // Get all the edit buttons and add click event listeners to them
//     const editButtons = document.querySelectorAll("[id^='edit-btn-']"); // Selects all elements with IDs starting with "edit-btn-"
  
//     editButtons.forEach(function(editButton) {
//       editButton.addEventListener("click", function() {
//         // Extract the index from the ID of the clicked edit button
//         const index = parseInt(this.id.split("-")[1]);
//         if (!isNaN(index)) {
//           // Now you can perform the desired actions for the clicked edit button based on the index
//           console.log("Clicked Edit Button for Book with Index:", index);
//         } else {
//           console.error("Failed to extract index from ID:", this.id);
//         }
//       });
//     });
//   });
  
// editConfig.js

document.addEventListener("DOMContentLoaded", function() {
    // Get all the edit buttons and add click event listeners to them
    const editButtons = document.querySelectorAll("[id^='edit-btn-']");
    const deleteButtons = document.querySelectorAll("[id^='dlt-btn-']");
    const popup = document.getElementById("card4");
    const backdrop = document.getElementById("backdrop");
    const cancelBtn = document.getElementById("cancel-btn")

    editButtons.forEach(function(editButton) {
      editButton.addEventListener("click", function() {
        const index = parseInt(this.id.split("-")[2]); // Note the index is now at [2]
        if (!isNaN(index)) {
          // Now you can perform the desired actions for the clicked edit button based on the index
          console.log("Clicked Edit Button for Book with Index:", index);
          // You can show the edit configuration form or perform other actions here
          popup.style.display = "block";
          backdrop.style.display = "block";
        } else {
          console.error("Failed to extract index from ID:", this.id);
        }
      });
    });

    cancelBtn.addEventListener("click",function(){
    popup.style.display="none";
    backdrop.style.display= 'none';

})
  
// Assuming you are making the DELETE request when clicking the "Delete" button
// Update this part of your client-side code

// Get the delete button elements

// Add event listeners to handle DELETE requests for each button
deleteButtons.forEach(deleteButton => {
  deleteButton.addEventListener("click", () => {
    const bookIdToDelete = deleteButton.dataset.id;

    fetch(`/deleteBook/${bookIdToDelete}`, {
      method: "DELETE",
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      return response.json();
    })
    .then(data => {
      console.log(data.message); // Display the response from the server
      // Reload the page to reflect the updated data
      location.reload();
    })
    .catch(error => {
      console.error("Error deleting book:", error);
      // Optionally, you can display an error message to the user
      // For example: alert("Error deleting book. Please try again later.");
    });
  });
});

  });
  