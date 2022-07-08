const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Product = require("./product.js");

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

describe("Product Class Tests", function () {
    const newProduct = {
        name: 'testProduct',
        description: 'testDescription',
        price: 5.00,
        imageSrc: 'test.jpg',
        published: true,
        variantSku: '123test'
    }

    test("can add product", async function() {
        const product = await Product.add(newProduct)

        expect(product).toEqual({
            ...newProduct,
            price: "5.00",
            id: expect.any(Number)
        });
    });

    test("can update product", async function() {
        const order = await Product.add(newProduct)

        const editInfo = {
            name: 'editTest',
            description: 'editDescription',
            price: 6.00
        }

        const productEdit = await Product.update(order.id, editInfo)

        expect(productEdit).toEqual({
            ...editInfo,
            price: "6.00",
            id: expect.any(Number)
        })
    })

    test("can find product", async function() {
        const product = await Product.add(newProduct)

        const foundProduct = await Product.get(product.id)

        expect(foundProduct).toEqual(product)
    })
});