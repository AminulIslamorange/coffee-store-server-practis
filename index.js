const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// midleware

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mpfz1at.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const coffeeCollection = client.db('coffeeShopDB').collection('coffee');
        const userCollection=client.db('coffeeShopDB').collection('user');


        app.get('/coffee',async(req,res)=>{
            const cursor=coffeeCollection.find();
            const result=await cursor.toArray();
            res.send(result)
        })

        app.post('/coffee', async (req, res) => {
            const newCoffee = req.body;
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);

        });

        app.delete('/coffee/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:new ObjectId(id)};
            const result=await coffeeCollection.deleteOne(query);
            res.send(result);
        });

        app.get('/coffee/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await coffeeCollection.findOne(query);
           res.send(result);
        });
        app.put('/coffee/:id',async(req,res)=>{
            const id=req.params.id;
            const filter={_id :new ObjectId(id)};
            const options = { upsert: true };
            const updatedCoffee=req.body;
            const coffee={
                $set:{
                    name:updatedCoffee.name, 
                    quantity:updatedCoffee.quantity,
                    category:updatedCoffee.category,
                    details:updatedCoffee.details, 
                    supplier:updatedCoffee.supplier,
                     taste:updatedCoffee.taste,
                      photo:updatedCoffee.photo
                }
            }
            const result=await coffeeCollection.updateOne(filter,coffee,options);
            res.send(result);


        });

        // user Database start now

        app.post('/user',async(req,res)=>{
            const newUser=req.body;
            console.log(newUser);
            const result=await userCollection.insertOne(newUser);
            res.send(result);
        });

        app.get('/user',async(req,res)=>{
            const cursur=userCollection.find();
            const result=await cursur.toArray();
            res.send(result);
        });

        app.delete('/user/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:new ObjectId(id)}
            const result = await userCollection.deleteOne(query);
            res.send(result);
        });

        app.patch('/user',async(req,res)=>{
            const user=req.body;
            const filter={email : user.email}
            const updateDoc={
                $set:{
                    lastLoggedAt:user.lastLoggedAt
                }
            }
            const result=await userCollection.updateOne(filter,updateDoc);
            res.send(result);
        })








        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('coffee store server running')
});

app.listen(port, () => {
    console.log(`server running on port ${port}`);
})