const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
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
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // ── Facility and Booking Data ──

        //  All Facilities 
        app.get('/facilities', async (req, res) => {
            try {
                const result = await facilityCollection.find().toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching facilities" });
            }
        });

        //  Get Single Facility by ID 
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

        //  New Booking 
        app.post('/bookings', async (req, res) => {
            try {
                const bookingData = req.body;

                // User Login Mechanism Check
                if (!bookingData.userEmail || bookingData.userEmail.trim() === "") {
                    return res.status(401).send({
                        success: false,
                        message: "Unauthorized! Please login to book a facility."
                    });
                }

                const result = await bookingCollection.insertOne(bookingData);
                res.status(201).send(result);

            } catch (error) {
                console.error("Booking error:", error);
                res.status(500).send({ message: "Failed to complete booking" });
            }
        });

        //  My Bookings Feature (User end)
        app.get('/bookings', async (req, res) => {
            try {
                const email = req.query.email;
                if (!email) {
                    return res.status(400).send({ message: "Email query parameter is required" });
                }
                const query = { userEmail: email };

                const result = await bookingCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error("Error fetching user bookings:", error);
                res.status(500).send({ message: "Error fetching user bookings" });
            }
        });

        // Owner Dashboard
        app.get('/owner-bookings', async (req, res) => {
            try {
                const ownerEmail = req.query.email;

                if (!ownerEmail) {
                    return res.status(400).send({ message: "Owner email is required to fetch dashboard data." });
                }
                const query = { ownerEmail: ownerEmail };
                const result = await bookingCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error("Error fetching owner bookings:", error);
                res.status(500).send({ message: "Error fetching dashboard bookings" });
            }
        });

        //  Cancel Booking Slot 
        app.delete('/bookings/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await bookingCollection.deleteOne(query);

                if (result.deletedCount === 0) {
                    return res.status(404).send({ message: "Booking record not found" });
                }
                res.send({ success: true, message: "Booking canceled successfully" });
            } catch (error) {
                console.error("Error deleting booking:", error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });

        //  Add New Arena/Facility 
        app.post('/facilities', async (req, res) => {
            try {
                const newArena = req.body;

                newArena.pricePerHour = !isNaN(parseFloat(newArena.pricePerHour)) ? parseFloat(newArena.pricePerHour) : 0;
                newArena.capacity = !isNaN(parseInt(newArena.capacity)) ? parseInt(newArena.capacity) : 0;

                const result = await facilityCollection.insertOne(newArena);
                res.status(201).send(result);
            } catch (error) {
                console.error("Error inserting facility:", error);
                res.status(500).send({ message: "Failed to deploy new arena" });
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