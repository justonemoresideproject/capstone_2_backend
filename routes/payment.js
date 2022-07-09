const jsonschema = require("jsonschema");
const bodyParser = require("body-parser");
const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureCorrectUserOrAdmin, ensureLogin } = require("../middleware/auth");
// const addressNewSchema = require("../schemas/addressNew.json");
// const addressUpdateSchema = require("../schemas/addressUpdate.json");

const router = new express.Router({ mergeParams: true });
// router.use(bodyParser.urlencoded({ extended: false }));

router.post('/create-checkout-session', async (req, res) => {
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

router.get('/config', async (req, res) => {
    res.json({publishableKey: process.env.STRIPE_PUBLISHABLE_KEY})
})

router.post('/webhook', bodyParser.raw({ type: "application/json" }),
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

  module.exports = router;