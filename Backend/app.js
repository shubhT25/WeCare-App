const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();

app.use(express.json()); //middleware for post and put
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const errorMiddleware = require('./middleware/error.js')
const user = require('./routes/userRoutes.js')


app.use("/api", user)

console.log("api")
app.use(errorMiddleware)
module.exports = app