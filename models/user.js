// first step is to set up proper registration with server

const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");
const { sqlForPartialUpdate } = require('../helpers/sql')
const Customer = require("./customer")

class User {
    static async register({
        username, 
        firstName, 
        lastName, 
        email, 
        phone, 
        isAdmin = false, 
        password}) { 
        const duplicateCheck = await db.query(
            `SELECT username 
            FROM users 
            WHERE username = $1`, 
            [username],
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate username: ${username}`);
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        const customerInfo = {firstName, lastName, email, phone}
        const customer = await Customer.register(customerInfo)

        const result = await db.query(
            `INSERT INTO users
            (username,
            password,
            first_name,
            last_name,
            email,
            phone,
            customer_id,
            is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING 
            username, 
            first_name AS "firstName", 
            last_name AS "lastName", 
            email,
            phone,
            customer_id AS "customerId",
            is_admin AS "isAdmin"`,
            [
                username,
                hashedPassword,
                firstName,
                lastName,
                email,
                phone,
                customer.id,
                isAdmin
            ],
        );

        const user = result.rows[0]

        return user
    }

    static async authenticate(username, password){
        const result = await db.query(`
        SELECT 
            username, 
            password, 
            first_name AS "firstName", 
            last_name AS "lastName",
            email,
            phone,
            customer_id AS "customerId",
            is_admin AS "isAdmin"
        FROM
            users
        WHERE
            username=$1`, [username])
            
        const user = result.rows[0]

        if (user) {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
                delete user.password
                return user
            }
        }
        throw new UnauthorizedError('Invalid username/password')
    }

    static async getById(userId) {
        const result = await db.query(`
            SELECT * FROM user
            WHERE user_id = $1`, [userId])

        const user = result.rows[0]

        if(!user) {
            throw new NotFoundError(`No user ID: ${userId}`)
        }

        return user
    }

    static async getByName(username) {
        const result = await db.query(`
            SELECT * FROM users
            WHERE username = $1`, [username])

        const user = result.rows[0];

        if (!user) {
            throw new NotFoundError(`No user: ${username}`);
        }
        
        return user
    }

    static async update(userId, data){
        if(data.password) {
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }

        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                firstName: "first_name",
                lastName: "last_name",
                isAdmin: "is_admin",
                customerId: "customer_id"
            });

        const userIdVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE users 
                            SET ${setCols} 
                            WHERE id = ${userIdVarIdx} 
                            RETURNING 
                            username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
        const result = await db.query(querySql, [...values, userId]);
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user with ID: ${userId}`);

        delete user.password;
        return user;
    }

    static async removeByUserName(username) {
        let result = await db.query(
            `DELETE
            FROM users
            WHERE username = $1
            RETURNING username`,
            [username],
        );
        const user = result.rows[0];
    
        if (!user) throw new NotFoundError(`No user: ${username}`);

        return user
    }

    static async removeById(userId) {
        let result = await db.query(
            `DELETE
            FROM users
            WHERE id = $1
            RETURNING id`,
            [userId],
        );
        const user = result.rows[0];
    
        if (!user) throw new NotFoundError(`No user ID: ${userId}`);

        return user
    }

    // static async createCustomer(firstName, lastName, email, phone){
    //     const timeStamp = new Date()
    //     const res = await db.query(
    //         `INSERT INTO customers 
    //         (
    //             first_name,
    //             last_name,
    //             created_at,
    //             email,
    //             phone
    //         )
    //         VALUES ($1, $2, $3, $4, $5)
    //         RETURNING 
    //         id,
    //         first_name AS firstName,
    //         last_name AS lastName,
    //         created_at AS createdAt,
    //         email,
    //         phone`, 
    //         [
    //             firstName,
    //             lastName,
    //             timeStamp,
    //             email,
    //             phone
    //         ]
    //     )

    //     const customer = res.rows[0]

    //     return customer
    // }

    // static async updateCustomer(id, data){
    //     const customerCheck = await db.query(`SELECT * FROM customers WHERE id = $1`, [id])

    //     if(!customerCheck){
    //         throw new NotFoundError(`Unknown customer id: ${id}`)
    //     }

    //     const { setCols, values } = sqlForPartialUpdate(
    //         data,
    //         {
    //             firstName: "first_name",
    //             lastName: "last_name",
    //             isAdmin: "is_admin",
    //             customerId: "customer_id"
    //         });

    //     const usernameVarIdx = "$" + (values.length + 1);

    //     const querySql = `
    //         UPDATE users 
    //         SET ${setCols} 
    //         WHERE username = ${usernameVarIdx} 
    //         RETURNING 
    //             username,
    //             first_name AS "firstName",
    //             last_name AS "lastName",
    //             email,
    //             is_admin AS "isAdmin"`;
    //     const result = await db.query(querySql, [...values, username]);
    //     const user = result.rows[0];

    //     return user
    // }
}

module.exports = User