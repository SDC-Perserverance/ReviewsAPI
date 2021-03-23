const { MongoClient } = require("mongodb");
const mongoose = require('mongoose');

const url = "mongodb://localhost:27017/ratings_reviews";

mongoose.connect(url, {
  useNewUrlParser: true
})

let reviewSchema = mongoose.Schema({
  product_id: { type: Number, index: true },
  review_id: { type: Number, index: true },
  rating: Number,
  date: String,
  summary: String,
  body: String,
  recommend: Boolean,
  reported: Boolean,
  reviewer_name: String,
  reviewer_email: String,
  response: String,
  helpfulness: Number,
  photos: Array,
  characteristics: Object
});

let Review = mongoose.model('reviews', reviewSchema);

const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect()
  .then(res => {
    console.log('Connected to db...')
  })
  .catch(err => {
    console.log(err);
  });

const database = client.db("ratings_reviews");
const reviews = database.collection('reviews');
const characteristics = database.collection('characteristics');

// <<<<<Database Queries>>>>>>

async function getAllReviews(params, callback) {
  let productId = Number(params.product_id);
  let count = Number(params.count) || 5;
  let data = await reviews.find({ product_id: productId }).limit(count).toArray();

  callback(null, data);
}

async function getMetaData(productId, callback) {
  let one, two, three, four, five;
  let obj = {
    product_id: productId,
    ratings: {},
    characteristics: {}
  };
  let chars = await characteristics.find({ product_id: productId }).limit(5).toArray();
  let review_chars = await reviews.find({ product_id: productId }).limit(5).toArray();



  for (let i = 0; i < chars[0].characteristics.length; i++) {
    if (review_chars[0]) {
      obj.characteristics[chars[0].characteristics[i].name] = {
        id: chars[0].characteristics[i].id,
        value: 0 + Number(review_chars[0].characteristics[chars[0].characteristics[i].id])
      }
    }
  }

  for (let i = 0; i < review_chars.length; i++) {
    if (!obj.ratings[review_chars[i].rating]) {
      obj.ratings[review_chars[i].rating] = 1
    } else {
      obj.ratings[review_chars[i].rating]++
    }

  }
  callback(null, obj);
}


async function writeNewReview(params, callback) {
  let lastReview = await reviews.find().sort({ review_id: -1 }).limit(1).toArray();
  let lastId = lastReview[0].review_id + 1


  let newReview = new Review({
    product_id: params['product_id'],
    review_id: lastId,
    rating: params['rating'],
    date: new Date(),
    summary: params['summary'],
    body: params['body'],
    recommend: params['recommend'],
    reported: false,
    reviewer_name: params['name'],
    reviewer_email: params['email'],
    response: null,
    helpfulness: 0,
    photos: params['photos'],
    characteristics: params['characteristics']
  });


  let data = await reviews.insertOne(newReview)
  callback(null, data);
}


async function updateHelpful(reviewId, callback) {
  let data = await reviews.update(
    { review_id: reviewId },
    { $inc: { helpfulness: 1 } }
  )

  callback(null, data);
}

async function markAsReported(reviewId, callback) {
  let data = await reviews.update(
    { review_id: reviewId },
    { $set: { reported: true } }
  )
  callback(null, data);
}

module.exports.getAllReviews = getAllReviews;
module.exports.writeNewReview = writeNewReview;
module.exports.updateHelpful = updateHelpful;
module.exports.markAsReported = markAsReported;
module.exports.getMetaData = getMetaData;


// {
//   "product_id": 1,
//   "rating": 4,
//   "summary": "Best Product Ever!!",
//   "body": "I really loved this product",
//   "recommend": true,
//   "name": "Mattix",
//   "email": "example@gmail.com",
//   "photos": [],
//   "characteristics": {
//       "1": 4,
//       "2": 5
//   }
// }