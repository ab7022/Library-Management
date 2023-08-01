

function initializeBookSuggestions() {
  fetch("/data/book_suggestions.json") // Adjust the path to the correct location
    .then((response) => response.json())
    .then((data) => {
      bookSuggestions = data; // Assign the fetched data to the global variable
      createBookSuggestion(); // Call the function to create book suggestions after data is loaded
    })
    .catch((error) => {
      console.error("Error fetching book suggestions:", error);
    });
}

function searchBooks() {
  const searchBookInput = document.getElementById("title");
  const searchBookValue = searchBookInput.value.toLowerCase();

  const searchContainer = document.querySelector(".search-container");

  // Remove any previous status message before appending the new one
  const existingStatus = searchContainer.querySelector(".status-message");
  if (existingStatus) {
    searchContainer.removeChild(existingStatus);
  }

  const statusText = document.createElement("h3");
  const availableBooks = [];

  bookSuggestions.forEach((book, index) => {
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

function createBookSuggestion() {
  const bookDropdown = document.getElementById("book-dropdown");
  const searchBookInput = document.getElementById("title"); // Move this line here

  searchBookInput.addEventListener("input", function () {
    bookDropdown.innerHTML = "";
    const inputValue = searchBookInput.value.toLowerCase();
    const filteredBooks = bookSuggestions.filter((book) =>
      book.title.toLowerCase().startsWith(inputValue)
    );
    filteredBooks.forEach((book) => {
      const option = document.createElement("option");
      option.value = book.title;
      bookDropdown.appendChild(option);
    });
  });
}

// Use DOMContentLoaded event to make sure the code runs after HTML content is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeBookSuggestions(); // Call the function to fetch book suggestions data
  const btnSearch = document.getElementById("btn-search");
  btnSearch.addEventListener("click", searchBooks); // Add click event listener to search button
});