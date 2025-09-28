const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { ObjectId } = require("mongodb");

// import the clientPromise from your modular MongoDB file
const clientPromise = require("./mongo"); // adjust path if needed

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// default route
app.get("/", (req, res) => {
  res.send("Coffee shop server");
});

// wrap all MongoDB operations in an async IIFE
(async () => {
  try {
    const client = await clientPromise;
    const coffeelistDB = client.db("coffeelistDB");
    const coffeesCollection = coffeelistDB.collection("coffees");
    const usersCollection = coffeelistDB.collection("users");

    console.log("✅ Connected to MongoDB!");

    // GET all coffees
    app.get("/coffees", async (req, res) => {
      const result = await coffeesCollection.find().toArray();
      res.send(result);
    });

    // POST new user
    app.post("/newUser", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
      console.log("New User Added:", newUser);
    });

    // GET all users
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // DELETE a user
    app.delete("/delete/user/:id", async (req, res) => {
      const id = req.params.id;
      const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // PATCH user login (update last login)
    app.patch("/user/login", async (req, res) => {
      const userInfo = req.body;
      const filter = { email: userInfo.email };
      const updateDoc = {
        $set: { userLastSignIn: userInfo.userLastSignIn },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // GET coffee details by id
    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const result = await coffeesCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // UPDATE coffee
    app.put("/coffee/update/:id", async (req, res) => {
      const id = req.params.id;
      const updatedCoffee = req.body;
      const result = await coffeesCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            name: updatedCoffee.name,
            chef: updatedCoffee.chef,
            supplier: updatedCoffee.supplier,
            price: updatedCoffee.price,
          },
        },
        { upsert: false }
      );
      res.send(result);
      console.log("Updated Coffee:", id);
    });

    // DELETE coffee
    app.delete("/coffee/delete/:id", async (req, res) => {
      const id = req.params.id;
      const result = await coffeesCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // POST new coffee
    app.post("/coffees", async (req, res) => {
      const coffee = req.body;
      const result = await coffeesCollection.insertOne(coffee);
      res.send(result);
      console.log("New Coffee Added:", coffee);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
})();

app.listen(port, () => {
  console.log("🚀 Coffee Shop Server is running on port:", port);
});
