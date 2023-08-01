const mongoose = require("mongoose");

const connectDB = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then((data) => {
      console.log(`MongoDB connected with server ${data.connection.port}`);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = connectDB;
