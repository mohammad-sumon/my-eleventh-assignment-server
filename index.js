const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jiixnyw.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const serviceCollection = client.db('kitchenReview').collection('services');
        const reviewCollection = client.db('kitchenReview').collection('myReviews');

        // Home page 3 services will be display
        app.get('/services', async(req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query).limit(3);
            const services = await cursor.toArray();
            res.send(services);
        });

        // Services page all 6 services will be display
        app.get('/allServices', async(req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        // to get specific id for dynamic route
        app.get('/allServices/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        // reviews api
        app.get('/myReviews', async (req, res) => {
            let query = {};
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.post('/myReviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        // to add service
        app.post('/addServices', async (req, res) => {
            const service = req.body;
            console.log(service);
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        // for delete review
        app.delete('/myReviews/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        });

        // jwt token
        app.post('/jwt', (req, res) => {
            const user = req.body;
            // console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'});
            res.send({token});
        })
    }
    finally{

    }
}

run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('Programming data is runningggggg')
});

app.listen(port, () => {
    console.log('Programming api data running on', port);
})