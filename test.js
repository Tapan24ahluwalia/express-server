const { MongoClient, ServerApiVersion } = require('mongodb');

async function getDataFromCollection(uri, dbName, collectionName) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log("Successfully connected to MongoDB Atlas");

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const data = await collection.find({}).toArray();
        console.log("Data retrieved from collection: ", data);

    } catch (e) {
        console.error("An error occurred while trying to retrieve data: ", e);
    } finally {
        await client.close();
        console.log("Connection to MongoDB Atlas closed");
    }
}

getDataFromCollection("mongodb+srv://nabeel:nabeel110@cluster0.pzelxbp.mongodb.net/?retryWrites=true&w=majority", "vitejs", "lessonsdata");

