const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// default route
app.get("/", (req, res) => {
  res.send("Coffee shop server");
});


const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@coffeelist.oikmndh.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeList`;


// MongoDB setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const coffeelistDB = client.db("coffeelistDB");
    const coffeesCollection = coffeelistDB.collection("coffees");
    const usersCollection = coffeelistDB.collection("users");

    // GET all coffees
    app.get("/coffees", async (req, res) => {
      const result = await coffeesCollection.find().toArray();
      res.send(result);
    });

    // send the user data to database
    app.post('/newUser',async(req,res)=>{
      const newUser=req.body;
      const result=await usersCollection.insertOne(newUser);
      res.send(result);

      console.log(newUser);
    });


    // get all users from the database
    app.get('/users',async(req,res)=>{
      const result = await usersCollection.find().toArray();
      res.send(result);
    })


    // user delete route
    app.delete('/delete/user/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)}
      const result=await usersCollection.deleteOne(query);
      res.send(result);
    })

    // user login Route // last logged in time update
    app.patch('/user/login',async(req,res)=>{
      const userInfo=req.body;
      const filter={email: (userInfo.email)}
      const updatedInfo={
        $set:{
          userLastSignIn: userInfo.userLastSignIn
        }
      }
      const result=await usersCollection.updateOne(filter,updatedInfo);
      res.send(result);

    })


    // coffee details route
    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const cursor = await coffeesCollection.findOne(query);
      res.send(cursor);

    });

    // Update coffee
    app.put('/coffee/update/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)};
      const updatedCoffee=req.body;
      const doc={
        $set:{
          name:updatedCoffee.name,
          chef:updatedCoffee.chef,
          supplier:updatedCoffee.supplier,
          price:updatedCoffee.price,
        }
      }
      const option={upsert:false};
      const result=await coffeesCollection.updateOne(query,doc,option);
      res.send(result);
      console.log('Request for update',id);
    })

    // Delete Coffee

    app.delete('/coffee/delete/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)};
      const result = await coffeesCollection.deleteOne(query);
      res.send(result);
    })

    // POST a new coffee
    app.post("/coffees", async (req, res) => {
      const coffee = req.body;
      const result = await coffeesCollection.insertOne(coffee);
      res.send(result);
      console.log("New Coffee Added:", coffee);
    });

    console.log("✅ Connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("🚀 Coffee Shop Server is running on port:", port);
});
