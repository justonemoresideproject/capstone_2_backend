const { UnauthorizedError, NotFoundError, BadRequestError } = require("../expressError");
const Customer = require("./customer")
const Address = require("./address")
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");
const { sqlForPartialUpdate, sqlForQuery } = require('../helpers/sql')

/* 
Order Class
*/

class Order {
    /** receiveOrder(data) => order
     * 
     * Accepts data and routes information to either createOrder function or createCustomerAndOrder function
     * 
     * Data can follow one of the following schemas
     * 
     * data = {
     *      customerId: integer,
     *      addressId: integer,
     *      products: { productId: quantity }
     * }
     * 
     * OR
     * 
     * data = {
     *      customerInfo: { 
     *          firstName, 
     *          lastName... etc. },
     *      products: { productId: quantity}
     * }
     * 
     * Throws BadRequestError if neither schema is used
     */

    static async receiveOrder(data) {
        if(data.addressId && data.customerId) {
            const order = await Order.createOrder(data.customerId, data.addressId, data.products)

            return order            
        } 

        if(data.customerInfo && data.products) {
            const order = await this.createCustomerAndOrder(data.customerInfo, data.products)

            return order
        }

        throw new BadRequestError("Incorrect schema for req.body")
    }

    /** Creates a new order out of customerId, addressId, and the products being passed. Passes information to db and returns the new order
     *  Parameters: 
     *      customerId: integer,
     *      addressId: integer,
     *      products: { productId: quantity }
     */

    static async createOrder(customerId, addressId, products) {
        const createdAt = new Date()
        const res = await db.query(`
        INSERT INTO orders 
        (
            customer_id, 
            address_id, 
            created_at, 
            delivered_status
        ) 
        VALUES ($1, $2, $3, $4) 
        RETURNING 
            id,
            customer_id AS "customerId", 
            address_id AS "addressId", 
            created_at AS "createdAt",
            delivered_status AS "status"`, 
        [
            customerId,
            addressId,
            createdAt,
            'notDelivered'
        ])

        const order = res.rows[0]

        const orderLineItems = await this.addItems(order.id, products, createdAt)

        order.items = orderLineItems

        return order
    }

    /*

    Order.createCustomerAndOrder {customerInfo, products} => [order]

    Passes customerInfo object and products object

    customerInfo object contains firstName, lastName, email, phone, address, and type of address

    products object contains productId and quantity as a key value pair

    returns an order containing id, customerId, addressId, status, and createdAt timestamp

    */

    static async createCustomerAndOrder(customerInfo, products) {
        const { firstName, lastName, email, phone, street, country, city, state, addressType } = customerInfo

        const newCustomer = await Customer.register({firstName, lastName, email, phone});
        console.log("After new customer")

        const customerId = newCustomer.id

        const addressInfo = { street, city, state, country, addressType, customerId }

        console.log(addressInfo)
        const newAddress = await Address.register(addressInfo);

        const addressId = newAddress.id

        const createdAt = new Date()
        const res = await db.query(`
            INSERT INTO orders 
            (
                customer_id, 
                address_id, 
                created_at, 
                delivered_status
            ) 
            VALUES ($1, $2, $3, $4) 
            RETURNING 
                id,
                customer_id AS "customerId", 
                address_id AS "addressId", 
                created_at AS "createdAt",
                delivered_status AS "status"`, 
            [
                customerId,
                addressId,
                createdAt,
                'notDelivered'
            ])

        const order = res.rows[0]

        const orderLineItems = await this.addItems(order.id, products, createdAt)

        order.items = orderLineItems

        return order
    }

    /**Order */

    /** Order.get[searchFilters] => order(s)
     * 
     * Returns orders that are associated with the searchFilter passed
     * 
     * Throws a NotFoundError when no order is not found
     */

    static async get(searchFilters = {}) {
        let query = `
            SELECT 
                id, 
                customer_id AS customerId,
                created_at AS createdAt,
                delivered_status AS deliveredStatus,
                address_id AS addressId
            FROM orders`

        if(Object.keys(searchFilters).length > 0) {
            const { whereCols, values } = sqlForQuery(searchFilters, {
                customerId: 'customer_id',
                addressId: 'address_id',
                deliveredStatus: 'delivered_status',
                createdAt: 'created_at'
            })

            query += ` WHERE ${whereCols}`

            const res = await db.query(query, [...values])

            return res.rows
        }

        const res = await db.query(query)

        return res.rows
    }

    /** Accepts an orderId and the data to be updated. Pushes information to db and returns the updated order
     * 
     * Makes use of the sqlForPartialUpdate helper
     * 
     * Data can include the following 
     *      customerId,
     *      addressId,
     *      status
     * 
     * Attempting to change the created_at field will result in a badrequesterror
     * 
     * throws a NotFoundError when id is unknown
     */

    static async update(id, data){
        const orderCheck = await db.query(
            `SELECT * FROM orders WHERE id = $1`, [id]
        )

        if(!orderCheck){
            throw new NotFoundError(`Unknown Order Id: ${id}`)
        }

        if(data.createdAt){
            throw new BadRequestError(`Unable to change the created_at column`)
        }

        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                addressId: "address_id",
                customerId: "customer_id",
                status: "delivered_status"
            }
        );

        const idVarIdx = "$" + (values.length + 1);

        const querySql = `
            UPDATE orders 
            SET ${setCols} 
            WHERE id = ${idVarIdx} 
            RETURNING 
                id,
                customer_id AS customerId, 
                address_id AS addressId, 
                created_at AS createdAt,
                delivered_status AS status
            `;
        
        const result = await db.query(querySql, [...values, id])

        const order = result.rows[0]

        return order
    }

    /** Accepts an orderId, productId and quantity and creates a new orderLineItem in db.
     * 
     * throws a NotFoundError when id is unknown
     */

    static async addItem(orderId, productId, quantity) {
        const createdAt = new Date();
        const orderCheck = await db.query(
            `SELECT * FROM orders WHERE id = $1`, [orderId]
        )

        if(!orderCheck){
            throw new NotFoundError(`Unknown Order Id: ${orderId}`)
        }

        const res = await db.query(`INSERT INTO order_line_items 
        (
            order_id, 
            product_id, 
            quantity, 
            created_at
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
        id AS itemId,
        order_id AS orderId,
        product_id AS productId,
        quantity,
        created_at AS createdAt`, 
        [
            orderId, 
            productId, 
            quantity, 
            createdAt
        ])

        const item = res.rows[0]

        return item
    }

    /** Accepts orderId and products object to create multiple new orderLineItems in db
     * 
     * throws NotFoundError when orderId is not found
     */

    static async addItems(orderId, products) {
        const timeStamp = new Date()
        const keys = Object.keys(products)

        const items = Promise.all(
            keys.map(async (key) => {
                const orderItem = await this.addItem(
                    orderId, 
                    key, 
                    products[key], 
                    timeStamp
                )

                return orderItem
            })
        )

        return items
    }

    /** Accepts an order id and removes order from database
     * 
     * Throws a NotFoundError when id is unknown
     */

    static async remove(id){
        const result = await db.query(
            `DELETE
            FROM orders
            WHERE id = $1`, [id]
        )

        const order = result.rows[0]

        if(!order){
            throw new NotFoundError(`Unknown order id: ${id}`)
        }
    }

    /** Accepts an orderLineItem id and removes the item from database
     * 
     * Throws a NotFoundError when id is unknown
     */

    static async removeItem(id){
        const result = await db.query(
            `DELETE
            FROM order_line_items
            WHERE id = $1`, [id]
        )

        const item = result.rows[0]

        if(!item){
            throw new NotFoundError(`Unknown item id: ${id}`)
        }
    }
}

module.exports = Order