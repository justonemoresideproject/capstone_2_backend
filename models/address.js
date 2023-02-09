const { UnauthorizedError, NotFoundError } = require("../expressError");
const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Address {
    static async register({country, state, city, street, addressType, postalCode, customerId}) {
        const dupCheck = await db.query(`
            SELECT * FROM shipping_addresses WHERE shipping_address = $1 AND address_type = $2`, [street, addressType])

        if(dupCheck.rows[0]){
            const dupAddress = dupCheck.rows[0]
            return dupAddress
        }

        const result = await db.query(`
            INSERT INTO shipping_addresses (country, state, city, shipping_address, address_type, postal_code, customer_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING 
            id,
            country,
            state,
            city,
            street,
            address_type AS addressType,
            postal_code AS postalCode,
            customer_id AS customerId`, 
            [
                country,
                state,
                city,
                street,
                addressType,
                postalCode,
                customerId
            ])

        const newAddress = result.rows[0]

        console.log(newAddress)

        return newAddress
    }

    static async all(){
        const result = await db.query(`
        SELECT 
            id, 
            country, 
            state, 
            city, 
            street, 
            address_type AS addressType, 
            postal_code AS postalCode, 
            customer_id AS customerId 
        FROM shipping_addresses`)

        const addresses = result.rows

        return addresses

        // const returnObject = {}

        // addresses.forEach(address => {
        //     returnObject[address.id] = address
        // })

        // return returnObject
    }

    static async update(id, data){
        const addressCheck = await db.query(`SELECT * FROM shipping_addresses WHERE id = $1`, [id])

        if(!addressCheck.rows[0]){
            throw new NotFoundError(`Unknown customer id: ${id}`)
        }

        const { setCols, values } = sqlForPartialUpdate(
            data, 
            {
                addressType: "address_type",
                customerId: "customer_id",
                postalCode: "postal_code"
            })

            const idVarIdx = "$" + (values.length + 1);

            const querySql = `
            UPDATE shipping_addresses 
            SET ${setCols}
            WHERE id = ${idVarIdx} 
            RETURNING 
                id,
                country,
                state,
                city,
                street,
                address_type AS addressType,
                postal_code AS postalCode,
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