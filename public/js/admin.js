//for hiding and displaying content
const addBooksBtn = document.getElementById("add-books");
const manageBooksBtn = document.getElementById("manage-books");
const manageBorrowersBtn = document.getElementById("manage-borrowers");

const card1 = document.getElementById("card1");
const card2 = document.getElementById("card2");
const card3 = document.getElementById("card3");

addBooksBtn.addEventListener("click", () => {
  card1.style.display = "block";
  card2.style.display = "none";
  card3.style.display = "none";
});

manageBooksBtn.addEventListener("click", () => {
  card1.style.display = "none";
  card2.style.display = "block";
  card3.style.display = "none";
});

manageBorrowersBtn.addEventListener("click", () => {
  card1.style.display = "none";
  card2.style.display = "none";
  card3.style.display = "block";
});


async function fetchBookSuggestions() {
  try {
    const response = await fetch("./book_suggestions.json");
    console.log("Response status:", response.status);
    if (!response.ok) {
      console.error("Failed to fetch book suggestions data.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    return [];
  }}

  
    async function createBookSuggestion() {
      const bookDropdown = document.getElementById("book-dropdown");
      const searchBookInput = document.getElementById("title"); // Correct the id attribute
  
      const data = await fetchBookSuggestions();
  
      bookDropdown.innerHTML = "";
      const inputValue = searchBookInput.value.toLowerCase();
      const filteredBooks = data.filter((book) =>
        book.title.toLowerCase().startsWith(inputValue)
      );
      filteredBooks.forEach((book) => {
        const option = document.createElement("option");
        option.value = book.title;
        bookDropdown.appendChild(option);
      });
    }
    document.addEventListener("DOMContentLoaded", function() {
      const deleteButtons = document.querySelectorAll(".delete-btn");
    
      deleteButtons.forEach(function(deleteButton) {
        deleteButton.addEventListener("click", function() {
          const bookIdToDelete = this.dataset.id;
          if (!bookIdToDelete) {
            console.error("Failed to extract book ID from the button.");
            return;
          }
    
          // Make an HTTP DELETE request to the server's endpoint
          fetch(`/deleteBook/${bookIdToDelete}`, {
            method: "DELETE",
          })
            .then(response => response.json())
            .then(data => {
              console.log(data.message); // Display the response from the server
              // Optionally, you can update the UI to reflect the deleted book
            })
            .catch(error => {
              console.error("Error deleting book:", error);
            });
        });
      });
    });
    
const searchInputValue = document.getElementById("searchOrderId")
// Usage example: call the deleteEntryByOrderId function with the order ID of the entry you want to delete
deleteEntryByOrderId(searchInputValue);

