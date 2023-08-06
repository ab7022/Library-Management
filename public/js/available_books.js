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
async function searchBooks() {
  const searchBookInput = document.getElementById("title");
  const searchBookValue = searchBookInput.value.toLowerCase();

  const searchContainer = document.querySelector(".search-container");

  // Remove any previous status message before appending the new one
  const existingStatus = searchContainer.querySelector(".status-message");
  if (existingStatus) {
    searchContainer.removeChild(existingStatus);
  }
  const data = await fetchBookSuggestions();

  const statusText = document.createElement("h2");
  statusText.classList.add("status-message");
  const statusContainer = document.querySelector(".status-container");
  statusContainer.innerHTML = ""; // Clear any previous status message
  statusContainer.appendChild(statusText);
  const availableBooks = [];

  data.forEach((book, index) => {
    if (book.title.toLowerCase().includes(searchBookValue)) {
      availableBooks.push(index + 1); // Add the serial number to availableBooks array
    }
  });

  if (availableBooks.length > 0) {
    statusText.textContent = "Book Available at Sr.no: " + availableBooks.join(", ");
  } else {
    statusText.textContent = "Book Not Available";
  }

  statusText.classList.add("status-message");
  searchContainer.appendChild(statusText);
}


document.addEventListener("DOMContentLoaded", function () {
  createBookSuggestion(); // Call the function to fetch book suggestions data
  const btnSearch = document.getElementById("btn-search");
  btnSearch.addEventListener("click", searchBooks); // Add click event listener to search button
});
  
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

// Add an event listener to the book title input field
const searchBookInput = document.getElementById("title"); // Correct the id attribute
searchBookInput.addEventListener("input", createBookSuggestion);