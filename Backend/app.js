const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();

app.use(express.json()); //middleware for post and put
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const errorMiddleware = require('./middleware/error')
const user = require('./routes/userRoutes')
const coach = require('./routes/coachRoutes')
const booking = require('./routes/bookingRoutes')



app.use("/api", user)
app.use("/api", coach)
app.use("/api", booking)

app.get('*',function (req, res) {
    res.status(404).json({
        message: "invalid path"
    });
});

app.use(errorMiddleware)
module.exports = app