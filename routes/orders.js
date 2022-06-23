const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureCorrectUserOrAdmin, ensureLoggedIn } = require("../middleware/auth");
const Order = require("../models/order");
const orderNewSchema = require("../schemas/orderNew.json");
const orderNewTwoSchema = require("../schemas/orderNewTwo.json");
const orderUpdateSchema = require("../schemas/orderUpdate.json");

const router = new express.Router();

/**
 * GET / => orders
 * Query can be passed to find specified orders
 * 
 * Authorization: Correct User or Admin
 */

router.get('/', ensureCorrectUserOrAdmin, async function(req, res, next) {
    const q = req.query

    if(q.id !== undefined) q.id = +q.id;
    if(q.userId !== undefined) q.userId = +q.userId;
    if(q.addressId !== undefined) q.addressId = +q.addressId;

    try {
        const orders = await Order.get(q)

        return res.json({ orders })
    } catch (err) {
        return next(err)
    }
})

/**
 * POST / => newOrder 
 * req.body = { addressId, customerId, products }
 * or
 * req.body = { customerInfo, products }
 * 
 * 
 */

router.post("/", async function(req, res, next) {
    try {
        const validatorOne = jsonschema.validate(req.body, orderNewSchema)

        const validatorTwo = jsonschema.validate(req.body, orderNewTwoSchema)

        if(!validatorOne.valid && !validatorTwo.valid){
            if(!validatorOne.valid) {
                const errs = validatorOne.errors.map(e => e.stack);
                throw new BadRequestError(errs);
            }
            const errs = validatorTwo.errors.map(e => e.stack)
            throw new BadRequestError(errs);
        }

        const order = await Order.receiveOrder(req.body)
        console.log("Order Route after receive")

        return res.status(201).json({ order })
    } catch (err) {
        return next(err)
    }
})

/** GET /[id] => order */

router.get(`/:id`, async function(req, res, next) {
    try {
        const order = await Order.get(req.params.id)

        return res.json({ order })
    } catch (err) {
        return next(err)
    }
})

/** PATCH /[id] => updatedOrder
 * req.body = { informationToUpdate }
 */

router.patch(`/:id`, ensureCorrectUserOrAdmin, async function(req, res, next) {
    try {
        const id = req.params.id;

        const validator = jsonschema.validate(req.body, orderUpdateSchema)

        if(!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const updatedOrder = await Order.update(id, req.body)

        return res.json({ updatedOrder })
    } catch (err) {
        return next(err)
    }
})

/** DELETE /[id] => deletedOrder */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
        await Order.remove(req.params.id)
        return res.json({ deleted: +req.params.id })
    } catch (err) {
        return next(err)
    }
})

module.exports = router;