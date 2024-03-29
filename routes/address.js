const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureCorrectUserOrAdmin, ensureLogin } = require("../middleware/auth");
const Address = require("../models/address");
const addressNewSchema = require("../schemas/addressNew.json");
const addressUpdateSchema = require("../schemas/addressUpdate.json");

const router = new express.Router({ mergeParams: true });

/** POST => newOrder
 * 
 * req.body = {
 *  address: string,
 *  type: string,
 *  customerId: integer
 * }
 * 
 * Authorization: Admin
 */

router.post('/', ensureAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, addressNewSchema)

        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        // const { address, type, customerId } = req.body

        const newAddress = await Address.register(req.body)

        console.log(newAddress)

        return res.status(201).json({ newAddress })
    } catch(err) {
        return next(err)
    }
})

/** GET => all addresses
 * 
 * Queries currently not supported
 * 
 * Authorization: Admin
 */

router.get('/', ensureAdmin, async function(req, res, next) {
    const q = req.query

    if(q.id !== undefined) q.id = +q.id;
    if(q.customer_id !== undefined) q.customer_id = +q.customer_id

    try {
        const addresses = await Address.find(q)

        return res.json(addresses)
    } catch(err) {
        return next(err)
    }
})

// Obsolete due to / route taking on all query functions through find method within model

/** GET /[id] => address
 * 
 * Authorization: Admin
 */

// router.get('/:id', ensureAdmin, async function(req, res, next) {
//     try {
//         const address = Address.get(req.params.id)

//         return res.json({ address })
//     } catch(err) {
//         return next(err)
//     }
// })

/** PATH /[id] => updated address
 * 
 * Autorization: Admin
 */

router.patch('/:id', ensureAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, addressUpdateSchema)

        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const address = await Address.update(req.params.id, req.body);

        return res.json({ address })
    } catch(err) {
        return next(err)
    }
})

/** REMOVE /[id] => removed address
 * 
 * Authorization: Admin 
 */

router.delete('/:id', ensureAdmin, async function(req, res, next) {
    try {
        const address = Address.get(req.params.id)

        return res.json({ address })
    } catch(err) {
        return next(err)
    }
})

module.exports = router;