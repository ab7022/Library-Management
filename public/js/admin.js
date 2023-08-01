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
function Func() {
    fetch("./sample.json")
        .then((res) => {
        return res.json();
    })
    .then((data) => console.log(data));
}