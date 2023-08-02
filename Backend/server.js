const app = require('./app')
const dotenv = require("dotenv")
const connectDB = require("./utils/connectDB");
const ErrorHandler = require('./utils/errorHandler');

dotenv.config({path:"Backend/config/config.env"})
// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
  });


connectDB();
app.listen(process.env.PORT, ()=> {
    console.log(`Server is working on ${process.env.PORT}`);
});

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);

    // return(new ErrorHandler(err.message, 11000))
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);
  
    server.close(() => {
      process.exit(1);
    });
});
