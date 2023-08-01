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

document.addEventListener('DOMContentLoaded', function () {
  const returnButtons = document.querySelectorAll('.return-btn');

  returnButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const borrowerId = button.dataset.borrowerId;

      // Send a POST request to the server with the borrowerId to delete the entry
      fetch('/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ borrowerId }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data); // Optional: Log the response from the server
          // Reload the page to reflect the changes after deletion
          window.location.reload();
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    });
  });
});
