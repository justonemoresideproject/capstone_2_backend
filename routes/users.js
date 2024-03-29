/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const Customer = require("../models/customer");
const Order = require("../models/order")
const Address = require("../models/address")
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userRegister.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = new express.Router();

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
        }

        const user = await User.register(req.body);
        const token = createToken(user);
        return res.status(201).json({ user, token });
    } catch (err) {
        return next(err);
    }
});

/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
    const q = req.query

    if(q.id !== undefined) q.id = +q.id;

    try {
        const users = await User.find(q);
        return res.json({ users });
    } catch (err) {
        return next(err);
    }
});

/** GET /[userId] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin, jobs }
 *   where jobs is { id, title, companyHandle, companyName, state }
 *
 * Authorization required: admin or same user
 **/

router.get("/:userId", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const user = await User.getById(req.params.userId);

        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

/**Get /orders/[userId] => { orders }
 * 
 * Returns [{orderId, customerId, addressId, status}, {orderId...} ]
 *
 * Authorization required: Admin or same user 
 **/

router.get("/orders/:customerId", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const customer = await Customer.findUser(req.params.userId)

        const orders = await Order.get({customerId: customer.id})

        return res.status(201).json({ orders })
    } catch (err) {
        return next(err);
    }
})

/**Get /addresses/[userId] => { adderesses }
 * 
 * Authorization: Admin or correct user
 */

router.get("/addresses/:userId", ensureCorrectUserOrAdmin, async function(req, res, next) {
    try {
        // const customer = await Customer.findUser(req.params.userId)

        const addresses = await Address.get(req.params.userId)

        return res.status(201).json({ addresses })
    } catch (err) {
        return next(err);
    }
})

/** PATCH /[userId] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or correct user
 **/

router.patch("/:userId", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const user = await User.update(req.params.userId, req.body);
        return res.status(201).json({ user });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.delete("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        await User.remove(req.params.username);
        return res.json({ deleted: req.params.username });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;