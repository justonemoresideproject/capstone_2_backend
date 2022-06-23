const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Product = require("../models/product");
const productNewSchema = require("../schemas/productNew.json");
const productUpdateSchema = require("../schemas/productUpdate.json");
const productPriceQuerySchema = require("../schemas/productPriceQuery.json")

const router = new express.Router({ mergeParams: true });

router.post('/', ensureAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, productNewSchema);

        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const product = await Product.add(req.body);
        return res.status(201).json({ product });
    } catch (err) {
        return next(err);
    }
})

// No authorization needed. Route to list of products including names, descriptions, prices, and currencies

router.get("/", async function (req, res, next) {
    try {
        const products = await Product.all()

        return res.status(201).json({ products })
    } catch (e) {
        return next(e)
    }
})

router.get("/:id", async function (req, res, next) {
    try {
        const product = await Product.get(req.params.id);
        return res.json({ product })
    } catch (e) {
        return next(e)
    }
})

router.post("/query", async function (req, res, next) {
    try {
        const searchFilters = req.body

        const validator = jsonschema.validate(req.body, productPriceQuerySchema);

        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        
        const products = await Product.queryProducts(searchFilters)

        return res.status(201).json({ products })
    } catch (e) {
        return next(e)
    }
})


router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, productUpdateSchema)
        if(!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs)
        }

        const product = await Product.update(req.params.id, req.body)
        return res.json({ product });
    } catch (err) {
        return next(err);
    }
})

router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
        await Product.remove(req.params.id);
        return res.json({ deleted: +req.params.id });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;