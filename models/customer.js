const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");
const { sqlForPartialUpdate } = require('../helpers/sql')

const Address = require('./address')

class Customer {
    /** Create a customer from data, updates db, returns a new customer from data 
     *  Data should be { 
     *      firstName: string, 
     *      lastName: string, 
     *      email: string, 
     *      phone: string 
     * }
     * 
     * Throws bad request error if customer already exists
    */

    static async register({
        userId = null, firstName, lastName, email, phone
    }) {
        console.log("Customer register")
        const timeStamp = new Date()

        const result = await db.query(`
            INSERT INTO customers
            (
                user_id,
                first_name,
                last_name,
                created_at,
                email,
                phone
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                id,
                user_id AS "userId",
                first_name AS "firstName",
                last_name AS "lastName",
                created_at AS "createdAt",
                email,
                phone`, 
                [
                    userId,
                    firstName, 
                    lastName, 
                    timeStamp, 
                    email, 
                    phone
                ]
            )

        const customer = result.rows[0]

        return customer
    }

    /**Returns all customers with the given user id */

    static async findUser(id) {
        const res = await db.query(`SELECT * FROM customers WHERE user_id = $1`, [id])

        if(!res.rows) {
            throw new NotFoundError(`Unknown customer with user id: ${id}`)
        }

        const customers = res.rows[0]

        return customers
    }

    /** Returns all customers from database
     * 
     *  Queries currently unsupported
     */

    static async all() {
        const res = await db.query('SELECT * FROM customers')

        return res.rows
    }

    static async get(searchFilters = {}) {
        console.log('customer model get function')
        let query = `SELECT * FROM customers`
        let whereExpressions = []
        let queryValues = []

        const { userId, id, firstName, lastName } = searchFilters;

        if(userId != undefined) {
            queryValues.push(userId)
            whereExpressions.push(`user_id = $${queryValues.length}`)
        }

        if(id != undefined) {
            queryValues.push(id)
            whereExpressions.push(`id = $${queryValues.length}`)
        }

        if(firstName != undefined) {
            queryValues.push(`%${firstName}%`)
            whereExpressions.push(`first_name ILIKE $${queryValues.length}`)
        }

        if(lastName != undefined) {
            queryValues.push(`%${lastName}%`)
            whereExpressions.push(`last_name ILIKE $${queryValues.length}`)
        }

        if(email != undefined) {
            queryValues.push(`%${email}%`)
            whereExpressions.push(`email ILIKE $${queryValues.length}`)
        }

        if (whereExpressions.length > 0) {
            query += " WHERE " + whereExpressions.join(" AND ");
        }

        const res = await db.query(query, queryValues)

        const customers = res.rows[0]

        return customers
    }

    /** Returns a specific customer from database
     * 
     *  throws notfounderror if customer id is unknown
     */

    static async get(id){
        const res = await db.query(`
            SELECT * FROM customers 
            WHERE id = $1
            RETURNING
                id,
                created_at AS "createdAt",
                email,
                first_name AS "firstName",
                last_name AS "lastName",
                phone,
                user_id AS "userId"`, [id])

        if(!res.rows[0]){
            throw new NotFoundError(`Unknown customer id: ${id}`)
        }

        const customer = res.rows[0]

        return customer
    }

    /** Updates customer with new information
     * 
     * throws NotFoundError when customer id is unknown
     */

    static async update(id, data){
        const customerCheck = await db.query(`SELECT * FROM customers WHERE id = $1`, [id])

        if(!customerCheck.rows[0]){
            throw new NotFoundError(`Unknown customer id: ${id}`)
        }

        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                firstName: "first_name",
                lastName: "last_name"
            });

        const idVarIdx = "$" + (values.length + 1);

        const querySql = `
            UPDATE customers 
            SET ${setCols} 
            WHERE id = ${idVarIdx} 
            RETURNING 
                id,
                first_name AS "firstName",
                last_name AS "lastName",
                email,
                phone`;

        const result = await db.query(querySql, [...values, id])

        const customer = result.rows[0]

        return customer
    }


    /** Removes specific customer from database
     * 
     * throws NotFoundError when id is unknown
     */

    static async remove(id){
        const result = await db.query(
            `DELETE
            FROM customers
            WHERE id = $1
            RETURNING id`, [id]
        )

        const customer = result.rows[0]

        if(!customer) throw new NotFoundError(`No customer id: ${id}`)

        return customer
    }
}

module.exports = Customer