const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@coffeelist.oikmndh.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeList`;

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

module.exports = clientPromise;
