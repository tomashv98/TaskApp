// Not essential

const {
  MongoClient,
  ObjectID,
} = require("mongodb")

const connectionURL = "mongodb://127.0.0.1:27017";
const database = "task-manager";

const id = new ObjectID;
console.log(id);
console.log(id.getTimestamp());

MongoClient.connect(connectionURL, {
  useNewUrlParser: true
}, (err, client) => {
  if (err) {
    return console.log("Connection failed")
  }
  const db = client.db(database);
  db.collection("users").findOne({
    _id: new ObjectID("5c98c811b6abf29c1d7efcb2")
  }, (error, result) => {
    if (error) {
      return console.log("Data not inserted", error)
    }
    console.log(result)
  })
})

// Create db.collections("name").insert...(object)
// Read ------------------------.find...(object)
// Update ----------------------.update..(object,{ $set:{object}} )
// Delete ----------------------.delete...(object)