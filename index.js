// const dns = require("node:dns");
// dns.setServers(["8.8.8.8", "8.8.4.4"]);

// const express = require('express')
// const dotenv = require('dotenv')
// const { MongoClient, ServerApiVersion } = require('mongodb');
// dotenv.config()
// const uri = process.env.MONGODB_URI;
// const app = express()

// const PORT = process.env.PORT

// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

// async function run() {
//     try {
//         // Connect the client to the server	(optional starting in v4.7)
//         // await client.connect();
//         // Send a ping to confirm a successful connection
//         await client.db("admin").command({ ping: 1 });
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     } finally {
//         // Ensures that the client will close when you finish/error
//         // await client.close();
//     }
// }
// run().catch(console.dir);





// app.get('/', (req, res) => {
//     res.send("Server is running perfectly !!!")
// })



// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`)
// })

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); //  CORS 
const { MongoClient, ServerApiVersion } = require('mongodb');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // fallback 
const uri = process.env.MONGODB_URI;


app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Database Connection
        const db = client.db("sportnest");
        const facilityCollection = db.collection("facilities");
        const bookingCollection = db.collection("bookings");

        // Database Connected
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // ── Facility and Booking Data ──

        // All Facilities
        app.get('/facilities', async (req, res) => {
            const result = await facilityCollection.find().toArray();
            res.send(result);
        });

        // New Booking
        app.post('/bookings', async (req, res) => {
            const bookingData = req.body;
            const result = await bookingCollection.insertOne(bookingData);
            res.send(result);
        });

    } catch (error) {
        console.error("Database connection error:", error);
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("SportNest Express Server is running perfectly !!!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});