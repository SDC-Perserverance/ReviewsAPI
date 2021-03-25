const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');

const url = 'mongodb://127.0.0.1:27017/ratings_reviews';

const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function parsePhotos() {
  let entry;
  await client.connect();
  const database = client.db('ratings_reviews');
  const reviewsCollection = database.collection('reviews');

  const stream = fs.createReadStream('/Users/mattix/Desktop/Data_SDC/reviews_photos.csv').pipe(csv());

  let container = [];

  console.log('running...')

  let currentReview = 1;

  for await (const chunk of stream) {
    const review_id_photos = Number(chunk['review_id']);
    entry = {
      updateOne: {
        filter: { 'review_id': review_id_photos },
        update: { $push: { photos: chunk['url'] } }
      }
    }

    container.push(entry);

    if (container.length > 500) {
      await reviewsCollection.bulkWrite(container);
      container = [];
    }
  }

  console.log('finished');
}


async function parseReviewChar() {
  let entry;
  await client.connect();
  const database = client.db('ratings_reviews');
  const reviewsCollection = database.collection('reviews');
  const stream = fs.createReadStream('/Users/mattix/Desktop/Data_SDC/characteristic_reviews.csv').pipe(csv());

  console.log('running...')

  let container = [];
  let currentReview = 1;
  let char_obj = {};

  for await (const chunk of stream) {
    const review_id = Number(chunk['review_id']);
    const char_id = chunk['characteristic_id'];
    const char_value = chunk['value'];

    if (currentReview === review_id) {
      char_obj[char_id] = char_value;

    } else {
      entry = {
        updateOne: {
          filter: { 'review_id': currentReview },
          update: { $set: { 'characteristics': char_obj } }
        }
      }
      container.push(entry);
      char_obj = { [char_id]: char_value };
      currentReview = review_id;
    }

    if (container.length > 500) {
      await reviewsCollection.bulkWrite(container);
      container = [];
    }


  }
  console.log('finished');
}

async function parseChar() {
  await client.connect();
  const database = client.db('ratings_reviews');
  const reviews = database.collection('reviews');
  const characteristics = database.collection('characteristics');
  const meta = database.collection('meta_data');
  let collection = [];

  for (let j = 1; j < 1000010; j++) {
    console.log(j);
    let chars = await characteristics.find({ product_id: j }).toArray();
    let review_chars = await reviews.find({ product_id: j }).toArray();

    let obj = {
      product_id: j,
      ratings: {},
      characteristics: {}
    };


    for (let i = 0; i < review_chars.length; i++) {
      if (review_chars[0] && chars[0].characteristics[i]) {
        obj.characteristics[chars[0].characteristics[i].name] = {
          id: chars[0].characteristics[i].id,
          value: 0 + Number(review_chars[0].characteristics[chars[0].characteristics[i].id])
        }
      }
      if (!obj.ratings[review_chars[i].rating]) {
        obj.ratings[review_chars[i].rating] = 1
      } else {
        obj.ratings[review_chars[i].rating]++
      }
    }

      await meta.insertOne(obj);
  }
}


// parseChar();
// parseReviewChar()
// parsePhotos();
