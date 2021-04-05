const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
const admin = require('./firebase')

// models
const User = require('./models/User')
const Book = require('./models/Books')
const Order = require('./models/Order')

require('dotenv').config()

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('connected'))
  .catch((err) => console.log('connection error ' + err))

const authCheck = async (req, res, next) => {
  try {
    const userFromFirebase = await admin
      .auth()
      .verifyIdToken(req.headers.authtoken)

    req.user = userFromFirebase

    next()
  } catch (err) {
    console.log(err)
    res.status(401).json({
      err: 'Invalid token',
    })
  }
}

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// create user
app.post('/login', authCheck, async (req, res) => {
  const { name, email } = req.user
  const user = await User.findOneAndUpdate({ email }, { name }, { new: true })

  if (user) {
    res.json(user)
  } else {
    const newUser = await new User({
      email,
      name,
    }).save()
    res.json(newUser)
  }
})

// get current user
app.post('/me', authCheck, async (req, res) => {
  const user = await User.findOne({ email: req.user.email })
  res.json(user)
})

// get all books
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find({})
    res.status(200).json(books)
  } catch (error) {
    console.log(error)
  }
})

// get book by id
app.get('/book/:id', authCheck, async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id })
    res.status(200).json(book)
  } catch (error) {
    console.log(error)
  }
})

// create book
app.post('/books', authCheck, async (req, res) => {
  try {
    const { email } = req.user
    console.log(req.body.book)
    const book = await new Book({
      ...req.body.book,
      email,
    }).save()
    res.status(201).json(book)
  } catch (error) {
    console.log(error)
  }
})

// delete book
app.delete('/book/:id', authCheck, async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({ _id: req.params.id })
    // delete all order of that book
    const orders = await Order.find({ book: book._id })

    if (orders.length > 0) {
      await Order.deleteMany({ book: req.params.id })
    }

    res.status(200).json(book)
  } catch (error) {}
})

// create order
app.post('/orders', authCheck, async (req, res) => {
  try {
    console.log(req.body)
    const order = await new Order({
      book: req.body.bookId,
      email: req.user.email,
    }).save()
    res.status(201).json(order)
  } catch (error) {
    console.log(error)
  }
})

// get orders of current user
app.get('/orders', authCheck, async (req, res) => {
  const orders = await Order.find({ email: req.user.email }).populate('book', [
    'name',
    'price',
    'author',
  ])

  res.status(200).json(orders)
})

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log('server is listening on port: ' + port)
})
