const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
let database;

async function connect() {
  try {
    const client = await MongoClient.connect("mongodb://localhost:27017");
    database = client.db("library");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; // Re-throw the error to indicate connection failure.
  }
}
async function testConnection() {
  try {
    const client = await MongoClient.connect("mongodb://localhost:27017");
    client.close();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

testConnection();

testConnection();

function getDb() {
  if (!database) {
    throw { message: "Database connection not established" };
  }
  return database;
}
module.exports = {
  connectToDatabase: connect,
  getDb: getDb,
  testConnection: testConnection,
};
