const express = require('express')
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const jwt = require("jwt-simple");
const passport = require("passport");
const ExtractJwt = require("passport-jwt").ExtractJwt;
const JwtStrategy = require("passport-jwt").Strategy;

const app = express();
app.use(bodyParser.json());
app.use(express.json())
const SECRET_KEY = "ITSARA_N";
const PORT = process.env.PORT || 8000
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/node-api-101'

/**
 * JWT Authentication
 */
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"),
  secretOrKey: SECRET_KEY
};
const jwtAuth = new JwtStrategy(jwtOptions, (payload, done) => {
  if (payload.sub === "Admin") {
    done(null, true);
  } else {
    done(null, false);
  }
});
passport.use(jwtAuth);
const authMiddleware = passport.authenticate("jwt", { session: false });

/**
 * Login
 * [POST]: /login
 * Input username, password for generate JTW for access to another.
 */
app.post("/login", (req, res) => {
  if (req.body.username === "Admin" && req.body.password === "1234") {
    const payload = {
      sub: req.body.username,
      iat: new Date().getTime()
    };
    const myJWT = jwt.encode(payload, SECRET_KEY);
    res.send(myJWT);
  } else {
    res.send("Wrong username and password");
  }
});

/**
 * Connect mongodb
 */
mongoose.connect(DB_URI, { useNewUrlParser: true })
const Schema = mongoose.Schema
const productSchema = new Schema({
  name: String,
  desc: String,
  image: String,
  price: Number,
  status: Boolean,
}, { timestamps: true, versionKey: false })
Product = mongoose.model('Product', productSchema)

/**
 * Get products list from public
 * [GET]: /products
 */
app.get('/products', async (req, res) => {
  const productList = await Product.find();
  res.json(productList);
})

/**
 * Get product info by id from public
 * [GET]: /product/:id
 */
app.get('/product/:id', async (req, res) => {
  const { id } = req.params
  const productInfo = await Product.findById(id)
  res.json(productInfo);
})

/**
 * Create new product by admin
 * [POST]: /product
 *   body: {
 *     "name": String,
 *     "desc": String,
 *     "image": String,
 *     "price": Number,
 *     "status": Boolean
 *   }
 */
app.post('/product', authMiddleware, async (req, res) => {
  const { body } = req
  const newProduct = new Product(body);
  await newProduct.save();
  res.status(201).end();
})

/**
 * Update product by id by admin
 * [PUT]: /product:id
 *   body: {
 *     "name": String,
 *     "desc": String,
 *     "image": String,
 *     "price": Number,
 *     "status": Boolean
 *   }
 */
app.put('/product/:id', authMiddleware, async (req, res) => {
  const { body, params } = req
  const { id } = params
  const product = await Product.findByIdAndUpdate(id, { $set: body })
  res.json(product);
})

/**
 * Delete product by id by admin
 * [DELETE]: /product/:id
 */
app.delete('/product/:id', authMiddleware, async (req, res) => {
  const { id } = req.params
  await Product.deleteOne({ _id: id })
  res.status(204).end();
})

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Serer running on ${PORT}`)
})
