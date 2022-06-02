const { UnauthorizedError, NotFoundError } = require("../expressError");
const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Address {
    static async register({address, addressType, customerId}) {
        const dupCheck = await db.query(`
            SELECT * FROM shipping_addresses WHERE shipping_address = $1 AND address_type = $2`, [address, addressType])

        if(dupCheck.rows[0]){
            const dupAddress = dupCheck.rows[0]
            return dupAddress
        }

        const result = await db.query(`
            INSERT INTO shipping_addresses (shipping_address, address_type, customer_id)
            VALUES ($1, $2, $3)
            RETURNING 
            id,
            shipping_address AS address,
            address_type AS addressType,
            customer_id AS customerId`, 
            [
                address,
                addressType,
                customerId
            ])

        const newAddress = result.rows[0]

        return newAddress
    }

    static async all(){
        const result = await db.query(`
            SELECT * FROM shipping_addresses`)

        const addresses = result.rows[0]

        return addresses
    }

    static async update(id, data){
        const addressCheck = await db.query(`SELECT * FROM shipping_addresses WHERE id = $1`, [id])

        if(!addressCheck.rows[0]){
            throw new NotFoundError(`Unknown customer id: ${id}`)
        }

        const { setCols, values } = sqlForPartialUpdate(
            data, 
            {
                shippingAddress: "shipping_address",
                customerId: "customer_id"
            })

            const idVarIdx = "$" + (values.length + 1);

            const querySql = `
            UPDATE shipping_addresses 
            SET ${setCols} 
            WHERE id = ${idVarIdx} 
            RETURNING 
                id,
                shipping_address AS address,
                address_type AS addressType,
                customer_id AS customerId`;

            const result = await db.query(querySql, [...values, id])

            const address = result.rows[0]
        
            return address
    }

    static async get(id){
        const result = await db.query(
            `SELECT * FROM shipping_addresses WHERE id = $1`, 
            [
                id
            ]
        )

        const address = result.rows[0]

        return address
    }

    static async update(id, data){
        const addressCheck = await db.query(`SELECT * FROM shipping_address`)

        if(!addressCheck){
            throw new NotFoundError(`Unknown Address Id: ${id}`)
        }

        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                address: "shipping_address",
                addressType: "address_type",
                customerId: "customer_id"
            });

        const idVarIdx = "$" + (values.length + 1);

        const querySql = 
        `
            UPDATE products 
            SET ${setCols} 
            WHERE id = ${idVarIdx} 
            RETURNING 
                shipping_address AS address, 
                address_type AS addressType,
                customer_id as customerId
        `;
        const result = await db.query(querySql, [...values, id]);

        const address = result.rows[0]

        return address
    }

    static async remove(id) {
        const result = await db.query(
            `DELETE
            FROM shipping_addresses
            WHERE id = $1
            RETURNING id`, [id]
        )

        const address = result.rows[0]

        if(!address) throw new NotFoundError(`No shipping address id: ${id}`)
    }
}

module.exports = Address