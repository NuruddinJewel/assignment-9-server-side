const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // CORS 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb'); // ObjectId

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

        // ১. All Facilities
        app.get('/facilities', async (req, res) => {
            try {
                const result = await facilityCollection.find().toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching facilities" });
            }
        });

        // ২. Get Single Facility by ID (Frontend_Details)
        app.get('/facilities/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await facilityCollection.findOne(query);
                if (!result) {
                    return res.status(404).send({ message: "Facility not found" });
                }
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Invalid ID format or Server Error" });
            }
        });

        // ৩. New Booking (Validation Check)
        app.post('/bookings', async (req, res) => {
            try {
                const bookingData = req.body;

                // User Login Mechanism
                if (!bookingData.userEmail || bookingData.userEmail.trim() === "") {
                    return res.status(401).send({
                        success: false,
                        message: "Unauthorized! Please login to book a facility."
                    });
                }

                // Database save
                const result = await bookingCollection.insertOne(bookingData);
                res.status(201).send(result);

            } catch (error) {
                console.error("Booking error:", error);
                res.status(500).send({ message: "Failed to complete booking" });
            }
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