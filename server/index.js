const express = require('express');
const bodyParser = require('body-parser');
const database = require('../database/queries.js')
var cors = require('cors')

let app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/loaderio-5ea1c9216e170afd6aec2004ba9f5517', (req, res) => {
  res.send('loaderio-5ea1c9216e170afd6aec2004ba9f5517');
});

app.get('/reviews', async (req, res) => {
  let params = req.query;
  database.getAllReviews(params, (err, docs) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.send({results: docs});
    }
  })
});

app.get('/reviews/:product_id/meta', (req, res) => {
  let productId = Number(req.params.product_id);

  database.getMetaData(productId, (err, docs) => {
    if (err) {
      res.sendStats(500);
    } else {
      res.send(docs);
    }
  })
});

app.post('/reviews', (req, res) => {
  let params = req.body;
  database.writeNewReview(params, (err, data) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.send(data);
    }
  })
});

app.put('/reviews/:review_id/helpful', (req, res) => {
  let reviewId = Number(req.params.review_id);
  database.updateHelpful(reviewId, (err, data) => {
    if (err) {
      res.sendState(500);
    } else {
      res.send(data);
    }
  });
});

app.put('/reviews/report/:review_id', (req, res) => {
  let reviewId = Number(req.params.review_id);
  database.markAsReported(reviewId, (err, data) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.send(data);
    }
  })
});

app.listen(port, () => {
  console.log('listening on port 3001')
})
