const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const Customer = require("../models/customer");
const customerNewSchema = require("../schemas/orderNew.json");
const customerUpdateSchema = require("../schemas/customerUpdate.json");

const router = new express.Router({ mergeParams: true });

//Customer routes are used for admin use only. Customer creation is handled by the order routes in order to ensure customer creation is only caused by a new order
/********************************************************************************/

/** GET /[id] => { customers }
* Returns all customers. Currently does not allow for queries.

* Authorization: Admin
*/

router.get("/", ensureAdmin, async function(req, res, next) { 
    try {
        const customers = await Customer.all()

        return res.json({ customers })
    } catch (err) {
        return next(err)
    }
})

/** GET /find/[userId] => { customers }
 * Returns all customers with the appropriate user id
 * 
 * Authorization: Correct User or Admin
 */

router.get('/findUser/:userId', ensureCorrectUserOrAdmin, async function(req, res, next) {
    try {
        const id = req.params.userId

        const customers = await Customer.findUser(id)

        return res.json({ customers })
    } catch (err) {
        return next(err)
    }
})

/** POST / => { newCustomer }
 * Uses req.body to accept customer information.
 * 
 * Uses jsonschema customerNew.json to validate customer information
 * 
 * Authorization: Admin
 */
router.post('/', ensureAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, customerNewSchema)

        if(!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const customer = await Customer.register(req.body)

        return res.json({ customer })
    } catch (err) {
        return next(err)
    }
})

/** GET /[id] => { customer }
 * Takes id from req.params and passes to Customer model
 * 
 * Authorization: Admin
 */

router.get('/:id', ensureAdmin, async function(req, res, next) {
    try {
        const id = req.params.id

        const customer = await Customer.get({id})

        return res.json({ customer })
    } catch (err) {
        return next(err)
    }
})

/** PATCH /[id] => { updatedCustomer }
 * Passes req.params and req.body to Customer instance after validating req.body
 * 
 * Authorization: Admin
 */

router.patch('/:id', ensureAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, customerUpdateSchema)

        if(!validator.valid) {
            const errs = validator.errors.map(e => e.stack)
            throw new BadRequestError(errs)
        }

        const id = req.params.id

        const customer = await Customer.update(id, req.body)

        return res.json({ customer })
    } catch (err) {
        return next(err)
    }
})

/**DELETE /[id] => { deleted: customer } 
 * Passes req.params to Customer instance
 * 
 * Authorization: Admin
*/

router.delete('/:id', ensureAdmin, async function(req, res, next) {
    await Customer.remove(req.params.id)
    return res.json({ deleted : +req.params.id })
})

module.exports = router;