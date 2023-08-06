const guideBtn = document.getElementById("guide-btn");
const guide = document.querySelector(".additional-info");

function showGuide() {
  const currentDisplayStyle = window.getComputedStyle(guide).display;
  if (currentDisplayStyle === "none") {
    guide.style.display = "block";
  } else {
    guide.style.display = "none";
  }
}

guideBtn.addEventListener("click", showGuide);


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
  }
}

async function createBookSuggestion() {
  const bookDropdown = document.getElementById("book-dropdown");
  const searchBookInput = document.getElementById("book-title"); // Correct the id attribute

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

  // Auto-select author based on the selected book title
  const selectedBook = data.find((book) => book.title.toLowerCase() === inputValue);
  const authorName = document.getElementById("author-name");
  if (selectedBook) {
    authorName.value = selectedBook.author;
  } else {
    authorName.value = "Not Found"; // Clear the author field if the book is not found
  }
}

// Add an event listener to the book title input field
const searchBookInput = document.getElementById("book-title");
searchBookInput.addEventListener("input", createBookSuggestion);


document.addEventListener("DOMContentLoaded", function () {
  const returnDateInput = document.getElementById("return-date");
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  const year = today.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;
  returnDateInput.value = formattedDate;
})