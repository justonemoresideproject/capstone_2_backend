const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Customer = require("./customer.js");

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

describe("Customer Class Tests", function () {
    const customerInfo = {
        firstName: 'Testington',
        lastName: 'Testly the third',
        email: 'test@mail.com',
        phone: '5554443322'
    }

    test("Can create customer", async function() {
        const newCustomer = await Customer.register(customerInfo)

        expect(newCustomer).toEqual({
            ...customerInfo,
            id: expect.any(Number),
            createdAt: expect.anything,
            userId: expect.null
        })
    })

    test("Can update customer", async function() {
        const newCustomer = await Customer.register(customerInfo)

        const updateInfo = {
            firstName: 'Testly',
            lastName: 'Testington the fourth',
            email: 'secondTest@gmail.com',
            phone: '2223334444'
        }

        const updatedCustomer = await Customer.update(newCustomer.id, updateInfo)

        expect(updatedCustomer).toEqual({
            ...updateInfo,
            id: expect.any(Number)
        })
    })

    test("Can get customer", async function() {
        const newCustomer = await Customer.register(customerInfo)

        const foundCustomer = await Customer.get(newCustomer.id)

        expect(foundCustomer).toEqual(newCustomer)
    })
})