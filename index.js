const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { ObjectId } = require("mongodb");
const serverless = require("serverless-http");
const clientPromise = require("../lib/mongo");

const app = express();
app.use(cors());
app.use(express.json());

// default route
app.get("/", (req, res) => {
  res.json({ message: "Coffee shop server is running!" });
});

// GET all coffees
app.get("/coffees", async (req, res) => {
  try {
    const client = await clientPromise;
    const coffeesCollection = client.db("coffeelistDB").collection("coffees");
    const result = await coffeesCollection.find().toArray();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch coffees" });
  }
});

// GET coffee details by ID
app.get("/coffee/:id", async (req, res) => {
  try {
    const client = await clientPromise;
    const coffeesCollection = client.db("coffeelistDB").collection("coffees");
    const result = await coffeesCollection.findOne({ _id: new ObjectId(req.params.id) });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch coffee" });
  }
});

// POST new coffee
app.post("/coffees", async (req, res) => {
  try {
    const client = await clientPromise;
    const coffeesCollection = client.db("coffeelistDB").collection("coffees");
    const result = await coffeesCollection.insertOne(req.body);
    res.json(result);
    console.log("New Coffee Added:", req.body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add coffee" });
  }
});

// UPDATE coffee
app.put("/coffee/update/:id", async (req, res) => {
  try {
    const client = await clientPromise;
    const coffeesCollection = client.db("coffeelistDB").collection("coffees");
    const updatedCoffee = req.body;
    const result = await coffeesCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          name: updatedCoffee.name,
          chef: updatedCoffee.chef,
          supplier: updatedCoffee.supplier,
          price: updatedCoffee.price,
        },
      }
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update coffee" });
  }
});

// DELETE coffee
app.delete("/coffee/delete/:id", async (req, res) => {
  try {
    const client = await clientPromise;
    const coffeesCollection = client.db("coffeelistDB").collection("coffees");
    const result = await coffeesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete coffee" });
  }
});

// POST new user
app.post("/newUser", async (req, res) => {
  try {
    const client = await clientPromise;
    const usersCollection = client.db("coffeelistDB").collection("users");
    const result = await usersCollection.insertOne(req.body);
    res.json(result);
    console.log("New User Added:", req.body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add user" });
  }
});

// GET all users
app.get("/users", async (req, res) => {
  try {
    const client = await clientPromise;
    const usersCollection = client.db("coffeelistDB").collection("users");
    const result = await usersCollection.find().toArray();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// DELETE user
app.delete("/delete/user/:id", async (req, res) => {
  try {
    const client = await clientPromise;
    const usersCollection = client.db("coffeelistDB").collection("users");
    const result = await usersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// PATCH user login (update last sign-in)
app.patch("/user/login", async (req, res) => {
  try {
    const client = await clientPromise;
    const usersCollection = client.db("coffeelistDB").collection("users");
    const userInfo = req.body;
    const result = await usersCollection.updateOne(
      { email: userInfo.email },
      { $set: { userLastSignIn: userInfo.userLastSignIn } }
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update login" });
  }
});

// Export for Vercel
module.exports = serverless(app);