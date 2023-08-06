const fs = require('fs');

// Load the existing JSON data from the file
const jsonData = require('../data/book_suggestions.json');

// Function to generate a 3-digit unique ID
function generateUniqueID(existingIDs) {
  let counter = 1;
  while (true) {
    const newID = String(counter).padStart(3, '0');
    if (!existingIDs.has(newID)) {
      return newID;
    }
    counter++;
  }
}

// Generate unique IDs for each book
const existingIDs = new Set(jsonData.map(book => book.id));
jsonData.forEach(book => {
  if (!book.id) {
    book.id = generateUniqueID(existingIDs);
    existingIDs.add(book.id);
  }
});

// Save the updated JSON data back to the file
fs.writeFileSync('../data/book_suggestions.json', JSON.stringify(jsonData, null, 2));

