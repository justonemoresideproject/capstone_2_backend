"use strict"

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const stripe = require('stripe')('sk_test_51L5DwtBCvqDloHDcJwSLivA8OxmcsjaPXdWTLdupQMSjDaqsyV3f9qzYfF7jSRdGHRBKt9o1RHN1GTU5qQiLECkr00lFA4lSZZ');

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const customersRoutes = require("./routes/customers");
const ordersRoutes = require("./routes/orders");
const productsRoutes = require("./routes/products");
const addressRoutes = require("./routes/address");
const usersRoutes = require("./routes/users");
const paymentRoutes = require("./routes/payment");

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/customers", customersRoutes);
app.use("/users", usersRoutes);
app.use("/addresses", addressRoutes);
app.use("/products", productsRoutes);
app.use("/orders", ordersRoutes);
app.use("/payment", paymentRoutes)

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError('Route Not Found'));
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;