const jsonschema = require("jsonschema");

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const { BadRequestError } = require("../expressError");

/** POST => token
 * 
 * req.body {
 *      username: string,
 *      password: string
 * }
 * 
 * Authorization: None
 */

router.post("/token", async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userAuthSchema);

        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs); 
        }

        const { username, password } = req.body;
        const user = await User.authenticate(username, password);
        const token = createToken(user);
        console.log(user)
        return res.json({ token, userId: user.id, isAdmin: user.isAdmin });
    } catch (err) {
        return next(err);
    }
})

router.get('/', async function (req, res, next){
    return res.json({ 'message': 'hello' })
})

/** POST => token
 * 
 * req.body = {
 *      username: string,
 *      firstName: string,
 *      lastName: string,
 *      email: string,
 *      phone: string,
 *      password: string
 * }
 * 
 * Authorization: None
 */

router.post("/register", async function (req, res, next) {
    try {
        console.log('Auth Register')
        const validator = jsonschema.validate(req.body, userRegisterSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const newUser = await User.register({ ...req.body, isAdmin: false });
        const token = createToken(newUser);
        return res.status(201).json({ token, userId: newUser.id, isAdmin: newUser.isAdmin });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;