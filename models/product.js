const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");
const { sqlForPartialUpdate } = require('../helpers/sql')

class Product {
    static async all(){
        const results = await db.query(`
        SELECT * FROM products`)

        const products = results.rows[0]

        return products
    }

    static async allNames(){
        const results = await db.query(`SELECT name FROM products`)

        const productNames = results.rows[0]

        return productNames
    }

    static async allDescriptions(){
        const results = await db.query(`SELECT description FROM products`)

        const productDescriptions = results.rows[0]

        return productDescriptions
    }

    static async allPrices(){
        const results = await db.query(`SELECT price FROM products`)

        const productPrice = results.rows[0]

        return productPrice
    }

    static async add({
        name,
        published = true,
        description,
        price,
        imageSrc
    }) {
        const result = await db.query(`
        INSERT INTO products 
        (
            name,
            published,
            description,
            price,
            image_source
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            name,
            published,
            description,
            price,
            image_source
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
                image_source
        `;
        const result = await db.query(querySql, [...values, id]);

        const product = result.rows[0]

        return product
    }

    static async get(id){
        const result = await db.query(`SELECT * FROM products WHERE id = $1`, [id])

        if(!result){
            throw new NotFoundError('Unknown Product Id ')
        }

        const product = result.rows[0]

        return product
    }


    // Can be erased since the image update is already handled in the product update

    // static async updateProductImage(id, imageSrc){
    //     const imageCheck = await db.query(`SELECT * FROM products WHERE id = $1`, [id])

    //     if(!imageCheck){
    //         throw new NotFoundError('Product not found')
    //     }

    //     const { setCols, values } = sqlForPartialUpdate(
    //         data,
    //         {});

    //     const idVarIdx = "$" + (values.length + 1);

    //     const querySql = 
    //     `
    //         UPDATE product_images 
    //         SET ${setCols} 
    //         WHERE id = ${idVarIdx} 
    //         RETURNING 
    //             id, 
    //             url,
    //             product_id AS "productId"
    //     `;
    //     const result = await db.query(querySql, [...values, id]);

    //     const image = result.rows[0]

    //     return image
    // }

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