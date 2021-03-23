const { MongoClient } = require('mongodb');
const csv = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');

const url = 'mongodb://127.0.0.1:27017/ratings_reviews';

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

});

let Review = mongoose.model('reviews', reviewSchema);

fs.createReadStream('/Users/mattix/Desktop/Data_SDC/reviews.csv')
  .pipe(csv())
  .on('data', (data) => {
    var newReview = new Review({
      product_id: data['product_id'],
      review_id: data['id'],
      rating: data['rating'],
      date: data['date'],
      summary: data['summary'],
      body: data['body'],
      recommend: data['recommend'],
      reported: data['reported'],
      reviewer_name: data['reviewer_name'],
      reviewer_email: data['reviewer_email'],
      response: data['response'],
      helpfulness: data['helpfulness'],
      photos: []

    });

    newReview.save(function (err, item) {
      if (err) {
        console.log("Error")
      }
    });
  })
  .on('end', () => {
    console.log("Done");
  });

