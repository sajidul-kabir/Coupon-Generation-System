const app = require("./app.js");

//server start
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`server started port ${port}`);
});

//UncaughtException Error handling
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  process.exit();
});

//Unhandled Rejection Error handling
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
