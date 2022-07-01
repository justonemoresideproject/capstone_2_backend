const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Product = require("./product.js");
const Order = require("./order.js");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
} = require("./__testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Order Class Tests", function () {
    const expectedOrder = {
        "customerId" : expect.any(Number),
        "addressId" : expect.any(Number),
        "createdAt" : expect.any(String),
        "status" : expect.any(String)
    }

    test("Can receive order containing customer info", function() {
        const newOrder = {
            "customerInfo" : {
                "firstName": 'testy',
                "lastName": 'test',
                "email": "test@mail.com",
                "phone": "5555555555",
                "address" : "123 fake street 12345 Joplin, Mo USA",
                "type" : "home"
            }, 
            "products" : {
                1 : 1
            }
        }
        const order = Order.receiveOrder(newOrder)

        expect(order).toEqual(expectedOrder)
    })

    test("Can receive order containing customerId, addressId", function() {
        const newOrder = {
            "customerId" : 1,
            "addressId" : 1,
            "products" : {
                1 : 1
            }
        }

        const order = Order.receiveOrder(newOrder)

        expect(order).toEqual(expectedOrder)
    })

    test("Can update order", function() {
        const expectedOrder = {
            "customerId" : 1,
            "addressId" : 1,
            "createdAt" : expect.any(String)
        }

        const newOrder = {
            "customerInfo" : {
                "firstName" : 'testy',
                "lastName" : 'testington',
                "email" : 'test@test.com',
                "phone" : '1231231234',
                "address" : '123 fake street 12345 Joplin, Mo USA',
                "type" : 'home'
            },
            "products" : {
                1 : 1
            }
        }

        const order = Order.receiveOrder(1, newOrder)

        const updatedOrder = Order.update(order.id, { "customerId": 1, "addressId": 1 })

        expect(updatedOrder).toEqual(expectedOrder)
    })

    test("Can add item to order", function() {
        const newOrder = {
            "customerId": 1,
            "addressId": 1,
            "products" : {
                1 : 1
            }
        }

        const expectedItem = {
            "orderId" : expect.any(Number),
            "productId" : 1,
            "quantity" : 1,
            "createdAt" : expect.any(String)
        }

        const order = Order.receiveOrder(newOrder)

        const item = Order.addItem(order.id, 1, 1)

        expect(item).toEqual(expectedItem)
    })

    test("Can add items to order", function() {
        const newOrder = {
            "customerId": 1,
            "addressId": 1,
            "products" : {
                1 : 1,
                2: 1
            }
        }

        const expectedItem = {
            "orderId" : expect.any(Number),
            "productId" : 2,
            "quantity" : 1,
            "createdAt" : expect.any(String)
        }

        const order = await Order.receiveOrder(newOrder)

        const item = await Order.addItem(order.id, 1, 1)

        expect(item).toEqual(expectedItem) 
    })
})