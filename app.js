const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const databaseConnection = require("./database/db.js");
const ErrorHandler = require("./middlewares/error.js");
const appRoutes = require("./routes/index");
const cors = require("cors");
const bodyParser = require("body-parser");
const compression = require("compression");
const consoleLogger = require("./config/logging.js");
const config = require("./config/config.js");

// ! Create app
const app = express();

// ! Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  consoleLogger.error("Server error: " + err.message);
  process.exit(1);
});

// ! import middleware app
app.use((req, res, next) => {
  // ! if condition is used only for stripe webhook
  if (req.originalUrl.startsWith("/api/v1/order/stripe/webhook")) {
    bodyParser.raw({ type: "application/json" })(req, res, next);
  } else {
    // ! for all other routes
    express.json()(req, res, next);
  }
});

// ! gzip compression
app.use(compression());

// ! define cors options
app.use("*", cors());

// ! parse json request body
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ! starting the Database
databaseConnection();

// ! Error handling for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  } else {
    next();
  }
});

// ! limit repeated failed requests to auth endpoints
if (config.env === "production") {
  app.use("/v1/auth", authLimiter);
}

// ! import Routes
app.use("/api/v1", appRoutes);

// ! Starting message
app.get("/", (req, res) => {
  return res.status(200).send("Welcome to SpeakShift Backend");
});

// ! Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./doc/swagger.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ! Starting Server
const PORT = config.port || 1000;
app.listen(PORT, () => {
  consoleLogger.info(`Server is starting on port: ${PORT}`);
});

// ! Unhandled promise rejection
app.use(ErrorHandler);

process.on("unhandledRejection", (reason) => {
  consoleLogger.error("Server closed duce to" + reason);
  server.close(() => {
    process.exit(1);
  });
});
