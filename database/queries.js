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
const metaData = database.collection('meta_data');
const characteristics = database.collection('characteristics');

// <<<<<Database Queries>>>>>>

async function getAllReviews(params, callback) {
  let productId = Number(params.product_id);
  let count = Number(params.count) || 5;
  let data = await reviews.find({ product_id: productId }).limit(count).toArray();

  callback(null, data);
}

async function getMetaData(productId, callback) {
  let data = await metaData.findOne({ product_id: productId });

  callback(null, data);
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


async function testingMeta(productId) {
  // let chars = await characteristics.find({ product_id: productId }).limit(5).toArray();
  // let review_chars = await reviews.find({ product_id: productId }).limit(5).toArray();

  characteristics
}


module.exports.getAllReviews = getAllReviews;
module.exports.writeNewReview = writeNewReview;
module.exports.updateHelpful = updateHelpful;
module.exports.markAsReported = markAsReported;
module.exports.getMetaData = getMetaData;
