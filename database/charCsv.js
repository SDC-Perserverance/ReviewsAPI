const { MongoClient } = require('mongodb');
const csv = require('csv-parser');
const fs = require('fs');

const url = 'mongodb://127.0.0.1:27017/ratings_reviews';

const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


async function parseChars() {
  await client.connect();
  const database = client.db('ratings_reviews');
  const testCollection = database.collection('characteristics');

  const stream = fs.createReadStream('/Users/mattix/Desktop/Data_SDC/characteristics.csv').pipe(csv());

  let entry = { product_id: 1, characteristics: [] };

  console.log('loading entries into the database...');

  for await (const chunk of stream) {
    const product_id = Number(chunk['product_id']);
    let obj = {}

    if (product_id === entry.product_id) {
      obj.id = chunk.id;
      obj.name = chunk.name;
      entry.characteristics.push(obj);

    } else {
      await testCollection.insertOne(entry);
      entry = {
        product_id: product_id,
        characteristics: []
      }

    }

  }
  await testCollection.insertOne(entry);
  console.log('finished');
}

parseChars();
