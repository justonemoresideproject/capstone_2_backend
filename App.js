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

app.post('/create-checkout-session', async (req, res) => {
  const { paymentMethodType, currency, amount } = req.body;

  try{
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: [paymentMethodType]
    });
  
    res.json({ clientSecret: paymentIntent.client_secret })
  } catch(err) {
    res.status(400).json({ error: { message: err.message }})
  }
});

app.get('/config', async (req, res) => {
  res.json({publishableKey: process.env.STRIPE_PUBLISHABLE_KEY})
})

// app.post('/purchase', async (req, res) => {
  
// })

app.post(
  '/webhook', 
  bodyParser.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.log(`X Error Message: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    if(event.type === 'payment_intent.created') {
      const paymentIntent = event.dta.object;
      console.log(`[${event.id}] PaymentIntent (${paymentIntent.id}): ${paymentIntent.status}`)
    }
    if(event.type === 'payment_intent.canceled') {
      const paymentIntent = event.dta.object;
      console.log(`[${event.id}] PaymentIntent (${paymentIntent.id}): ${paymentIntent.status}`)
    }
    if(event.type === 'payment_intent.failed') {
      const paymentIntent = event.dta.object;
      console.log(`[${event.id}] PaymentIntent (${paymentIntent.id}): ${paymentIntent.status}`)
    }
    if(event.type === 'payment_intent.processing') {
      const paymentIntent = event.dta.object;
      console.log(`[${event.id}] PaymentIntent (${paymentIntent.id}): ${paymentIntent.status}`)
    }
    if(event.type === 'payment_intent.requires_action') {
      const paymentIntent = event.dta.object;
      console.log(`[${event.id}] PaymentIntent (${paymentIntent.id}): ${paymentIntent.status}`)
    }
    if(event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.dta.object;
      console.log(`[${event.id}] PaymentIntent (${paymentIntent.id}): ${paymentIntent.status}`)
    }

    res.json({ received: true });
  }
)

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