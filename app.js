const express=require('express')
const cors=require('cors')
const fetch=require('node-fetch')
require('dotenv').config() 
const http = require("http");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express()
app.use(cors())
//app.use(bodyParser.json())

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

//logger middleware
app.use((req,res,next)=>{
  let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl
  console.log(fullUrl)
   next()
})

//getting lessons from lessons collection in Mongo atlas
async function getDataFromCollection(uri, dbName, collectionName,search) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log("Successfully connected to MongoDB Atlas");

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const data = await collection.find({$or: [
          { name: { $regex: search } },
          { location: { $regex: search } }
      ]}).toArray();
        
        return data

    } catch (e) {
        console.error("An error occurred while trying to retrieve data: ", e);
    } finally {
        await client.close();
        console.log("Connection to MongoDB Atlas closed");
    }
}

//post data to orders collection
async function addDataToCollection(uri, dbName, collectionName,myorders) {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
      await client.connect();
      console.log("Successfully connected to MongoDB Atlas");

      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      
       await collection.insertMany(myorders);
      console.log("data inserted")

  } catch (e) {
      console.error("An error occurred while trying to retrieve data: ", e);
  } finally {
      await client.close();
      console.log("Connection to MongoDB Atlas closed");
  }
}


async function updateDataInCollection(uri, dbName, collectionName,updates) {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
      await client.connect();
      console.log("Successfully connected to MongoDB Atlas update");

      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      // updates=[{product_id:"648b20da0d8d3b655e81d570",spaces:12}]
      
         for(update of updates){
        await collection.updateOne({"_id":  new ObjectId(update.lesson_id)},{$set:{"spaces":update.spaces}});
      }
       console.log("data updated")

  } catch (e) {
      console.error("An error occurred while trying to update data: ", e);
  } finally {
      await client.close();
      console.log("Connection to MongoDB Atlas closed");
  }
}


// get lessons api
app.get('/api/lessons',async (req,res)=>{
    try{
       let search= req.query.q || ""
       //console.log(search)
      const data= await getDataFromCollection(process.env.MONGO_URL, "test", "lessons",search)
     
      res.status(200).send(data)
       
    }
    catch(err){console.log(err)}
})

//post order
app.post('/api/order',async (req,res)=>{
    try{
      //console.log(req.body.myorders)
      addDataToCollection(process.env.MONGO_URL,"test","orders",req.body.myorders)
      res.status(200).send({msg:"successfull!!"})
    }
    catch(err){console.log(err)}
})

//update lessons
app.put('/api/lessons/update',async (req,res)=>{
   try{
    console.log(req.body)
    updateDataInCollection(process.env.MONGO_URL, "test", "lessons",req.body)
    res.status(200).send("updated !!")

   }
   catch(err){console.log(err)}
})

//fetching lessons..


const port=process.env.PORT||8000

app.listen(port,(req,res)=>{
  console.log("server running on port",port)
}
)