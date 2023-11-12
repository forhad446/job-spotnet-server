const express = require('express')
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors(
    { origin: true, credentials: true }
));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.uoluduj.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        const UsersCollection = client.db("JobsDB").collection("all_jobs");
        const bidJobsCollection = client.db("JobsDB").collection("bid_all_jobs");

        // jobs posted
        app.post('/addJobs', async (req, res) => {
            const jobInfo = req.body;
            const result = await UsersCollection.insertOne(jobInfo);
            res.send(result)
        })
        // bid jobs posted
        app.post('/bidJobs', async (req, res) => {
            const bidJobInfo = req.body;
            const result = await bidJobsCollection.insertOne(bidJobInfo);
            res.send(result)
        })
        // bid jobs data get by email
        app.get('/bidJobs', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { yourEmail: req.query?.email };
            }
            const result = await bidJobsCollection.find(query).toArray();
            res.send(result);
        })
        // data get by email
        app.get('/jobs', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { email: req.query?.email };
            }
            const result = await UsersCollection.find(query).toArray();
            res.send(result);
        })
        // data get by id
        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id),
            }
            const result = await UsersCollection.find(query).toArray();
            res.send(result)
        })
        // delete single user
        app.delete("/jobs/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id),
            };
            const result = await UsersCollection.deleteOne(query)
            res.send(result);
        });
        // update data
        app.put("/jobs/:id", async (req, res) => {
            const id = req.params.id;
            const data = req.body;

            const filter = {
                _id: new ObjectId(id),
            };
            const options = { upsert: true };
            const updatedData = {
                $set: {
                    job_title: data.job_title,
                    email: data.email,
                    job_type: data.job_type,
                    deadline: data.deadline,
                    minimum_price: data.maximum_price,
                    maximum_price: data.maximum_price,
                    description: data.description
                },
            };
            const result = await UsersCollection.updateOne(
                filter,
                updatedData,
                options
            );
            res.send(result);
        });
        // update bidjobs data
        app.put("/bidJobs/:id", async (req, res) => {
            const id = req.params.id;
            const data = req.body;

            const filter = {
                _id: new ObjectId(id),
            };
            const options = { upsert: true };
            const updatedData = {
                $set: {
                    status: data.status,
                },
            };
            const result = await bidJobsCollection.updateOne(
                filter,
                updatedData,
                options
            );
            res.send(result);
        });


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
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Job Spotnet Server Running ${port}`)
})