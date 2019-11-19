const express = require('express')
const app = express()
const mongoose = require('mongoose')


const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/node-api-101'
mongoose.connect(dbURI, { useNewUrlParser: true })
const Schema = mongoose.Schema
const productSchema = new Schema({
  name: String,
  desc: String,
  image: String,
  price: Number,
  status: Boolean,
}, { timestamps: true, versionKey: false })
Product = mongoose.model('Product', productSchema)


app.use(express.json())

app.get('/products', async (req, res) => {
  const productList = await Product.find();
  res.json(productList);
})

app.get('/product/:id', async (req, res) => {
  const { id } = req.params
  const productInfo = await Product.findById(id)
  res.json(productInfo);
})

app.post('/product', async (req, res) => {
  const { body } = req  
  const newProduct = new Product(body);
  await newProduct.save();
  res.status(201).end();
})

app.put('/product/:id', async (req, res) => {
  const { body, params } = req  
  const { id } = params
  const product = await Product.findByIdAndUpdate(id, { $set: body })
  res.json(product);
})

app.delete('/product/:id', async (req, res) => {
  const { id } = req.params
  console.log(id);
  
  await Product.findOneAndDelete(id);
  res.status(204).end();
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`Application is running on port ${PORT}`)
})