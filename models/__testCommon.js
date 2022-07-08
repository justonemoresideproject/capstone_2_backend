const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM products")
    await db.query("DELETE FROM customers")
    await db.query("DELETE FROM shipping_addresses")
    await db.query("DELETE FROM orders")
    await db.query("DELETE FROM users")

    const productIds = [];
    const customerIds = [];
    const shippingAddressIds = [];
    const orderIds = [];
    const userIds = [];
    
    const products = await db.query(`
        INSERT INTO products (name, description, variant_sku, price, image_source, published)
        VALUES ('Furby', 'furry and stuff', '30703423', 5.00, 'test.jpg', true)`);
    productIds.splice(0, 0, products.rows.map(r => r.id))
    

    const customers = await db.query(`
        INSERT INTO customers (first_name, last_name, email, phone) 
        VALUES ('Bob', 'Builder', 'test@test.com', 5553332211)`);
    customerIds.splice(0, 0, customers.rows.map(r => r.id))

    const shipping_addresses = await db.query(`
        INSERT INTO shipping_addresses (shipping_address, address_type, customer_id)
        VALUES ('123 fake street', 'home', 1)`);
    shippingAddressIds.splice(0, 0, shipping_addresses.rows.map(r => r.id))

    const orders = await db.query(`
        INSERT INTO orders (customer_id, address_id, created_at, delivered_status)
        VALUES (1, 1, '2022-05-11 17:07', 'notDelivered')`);
    orderIds.splice(0, 0, orders.rows.map(r => r.id))

    const users = await db.query(`
        INSERT INTO users (username, password, first_name, last_name, email, phone, is_admin)
        VALUES ('tester', '$2b$', 'phil', 'phillington', 'test@testmail.com', 1112223344, false)`
    );
    userIds.splice(0, 0, users.rows.map(r => r.id))
}

async function commonBeforeEach() {
    await db.query("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
};