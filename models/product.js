const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");
const { sqlForPartialUpdate } = require('../helpers/sql')

class Product {
    static async all(){
        const results = await db.query(`
        SELECT 
            id, 
            name, 
            published, 
            description, 
            price, 
            variant_sku AS "variantSku", 
            image_source AS "imageSrc" FROM products`)

        const products = {}

        results.rows.forEach(product => {
            products[product.id] = {...product}
        })

        return products
    }

    static async find(searchFilters = {}) {
        let query = `SELECT * FROM products`
        let whereExpressions = []
        let queryValues = []

        const { id, name, description, variantSku, price, imageSrc } = searchFilters

        if(id) {
            queryValues.push(id)
            whereExpressions.push(`id = $${queryValues.length}`)
        }

        if(name) {
            queryValues.push(name)
            whereExpressions.push(`name ILIKE %$${queryValues.length}%`)
        }

        if(description) {
            queryValues.push(description)
            whereExpressions.push(`description ILIKE %${queryValues.length}%`)
        }

        if(variantSku) {
            queryValues.push(variantSku)
            whereExpressions.push(`variant_sku = $${queryValues.length}`)
        }

        if(price) {
            queryValues.push(price)
            whereExpressions.push(`price = $${queryValues.length}`)
        }

        if(imageSrc) {
            queryValues.push(imageSrc) 
            whereExpressions.push(`image_source = $${queryValues.length}`)
        }

        if (whereExpressions.length > 0) {
            query += " WHERE " + whereExpressions.join(" AND ");
        }

        const res = await db.query(query, queryValues)

        if(!res.rows[0]) {
            throw new NotFoundError(`No results found`)
        }

        const products = res.rows[0]

        return products
    }

    static async allNames(){
        const results = await db.query(`SELECT name FROM products`)

        const productNames = results.rows

        return productNames
    }

    static async allDescriptions(){
        const results = await db.query(`SELECT description FROM products`)

        const productDescriptions = results.rows

        return productDescriptions
    }

    static async queryProducts(searchFilters = {}){
        console.log('query')
        console.log(searchFilters)
        const { select, target, lessThan, descOrder } = searchFilters

        let query = 'SELECT ';

        if(select) {
            select.forEach((ele, index) => {
                index == select.length - 1 ? query+=`${ele} FROM products` : query+=`${ele}, `
            })
        } else {
            query+=` * FROM products`
        }

        if(target != null) {
            if(lessThan) {
                query+=` WHERE price >= ${target} `
            } else {
                query+= ` WHERE price <= ${target} `
            }

            console.log('if statements')

            if(descOrder) {
                query+= `ORDER BY price DESC`
            } else {
                query+= `ORDER BY price ASC`
            }
        }

        console.log(query)

        const results = await db.query(query)

        const ids = results.rows

        return ids
    }

    static async add({
        name,
        published = true,
        description,
        price,
        variantSku,
        imageSrc
    }) {
        const result = await db.query(`
        INSERT INTO products 
        (
            name,
            published,
            description,
            price,
            variant_sku,
            image_source
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            name,
            published,
            description,
            price,
            variant_sku AS "variantSku",
            image_source AS "imageSrc"
        `,
        [
            name,
            published,
            description,
            price,
            imageSrc
        ])

        const product = result.rows[0]

        return product
    }

    static async update(id, data){
        const productCheck = await db.query(`SELECT * FROM products WHERE id = $1`, [id])

        if(!productCheck){
            throw new NotFoundError(`Unknown Product Id`)
        }

        const { setCols, values } = sqlForPartialUpdate(
            data,
            {imageSrc: "image_source"});

        const idVarIdx = "$" + (values.length + 1);

        const querySql = 
        `
            UPDATE products 
            SET ${setCols} 
            WHERE id = ${idVarIdx} 
            RETURNING
                id,
                name, 
                published,
                description,
                price,
                variant_sku AS "variantSku",
                image_source AS "imageSrc"
        `;
        const result = await db.query(querySql, [...values, id]);

        const product = result.rows[0]

        return product
    }

    static async get(id){
        const result = await db.query(`SELECT * FROM products 
        WHERE id = $1
        RETURNING
            id,
            name,
            published,
            description,
            price,
            variant_sku AS "variantSku",
            image_source AS "imageSrc"`, [id])

        if(!result){
            throw new NotFoundError('Unknown Product Id ')
        }

        const product = result.rows[0]

        return product
    }

    static async remove(id){
        const result = await db.query(
            `DELETE 
            FROM products 
            WHERE id = $1`, [id])

        const product = result.rows[0]

        if(!product){
            throw new NotFoundError(`Unknown product id: ${id}`)
        }
    }

    // Can be deleted since the image table is no longer necessary

    // static async removeImage(id){
    //     const result = await db.query(
    //         `DELETE
    //         FROM product_images
    //         WHERE id = $1`, [id]
    //     )

    //     const image = result.rows[0]

    //     if(!image){
    //         throw new NotFoundError(`Unknown image id: ${id}`)
    //     }
    // }
}

module.exports = Product