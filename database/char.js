const parseChar = () => {
  let obj = {
    product_id: productId,
    ratings: {},
    characteristics: {}
  };

  for (let i = 0; i < 1000011; i++) {
    let chars = await characteristics.find({ product_id: i }).limit(5).toArray();
    let review_chars = await reviews.find({ product_id: i }).limit(5).toArray();

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
  }
}
