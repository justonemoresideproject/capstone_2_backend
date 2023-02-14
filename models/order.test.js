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

test("Order Class Tests", async function () {
    const expectedOrder = {
        "customerId" : expect.any(Number),
        "addressId" : expect.any(Number),
        "createdAt" : expect.any(Date),
        "status" : expect.any(String)
    }

    test("Can receive order containing customer info", async function() {
        const newOrder = {
            "customerInfo" : {
                "firstName": 'testy',
                "lastName": 'test',
                "email": "test@mail.com",
                "phone": "5555555555",
                "street" : "123 fake street",
                "city": "Joplin",
                "state": "Missouri",
                "country": "United States of America",
                "postalCode": 12345,
                "addressType" : "home"
            }, 
            "products" : {
                1 : 1
            }
        }
        const order = await Order.receiveOrder(newOrder)

        expect(order).toEqual(expectedOrder)
    })

    test("Can receive order containing customerId, addressId", async function() {
        const newOrder = {
            "customerId" : 1,
            "addressId" : 1,
            "products" : {
                1 : 1
            }
        }

        const order = await Order.receiveOrder(newOrder)

        expect(order).toEqual({...newOrder, 
            "createdAt": expect.any(Date),
            "id": expect.any(Number),
            "items": expect.any(Array)
        })
    })

    test("Can update order", async function() {
        const expectedOrder = {
            "customerId" : expect.any(Number),
            "addressId" : expect.any(Number),
            "createdAt" : expect.any(Date)
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

        const order = await Order.receiveOrder(1, newOrder)

        const updatedOrder = await Order.update(order.id, { "customerId": 1, "addressId": 1 })

        expect(updatedOrder).toEqual(expectedOrder)
    })

    test("Can add item to order", async function() {
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
            "itemId": expect.any(Number),
            "createdAt" : expect.any(String)
        }

        const order = await Order.receiveOrder(newOrder)

        const item = await Order.addItem(order.id, 1, 1)

        expect(item).toEqual(expectedItem)
    })

    test("Can add items to order", async function() {
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
            "itemId": expect.any(Number),
            "productId" : expect.any(Number),
            "orderId": expect.any(Number),
            "quantity" : 1,
            "createdAt" : expect.anything()
        }

        const order = await Order.receiveOrder(newOrder)

        const item = await Order.addItem(order.id, 1, 1)

        expect(item).toEqual(expectedItem) 
    })
})