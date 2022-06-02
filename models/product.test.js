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
        currency: 'USD'
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
            price: 6.00,
            currency: 'CAN'
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

    test("can add image to product", async function() {
        const product = await Product.add(newProduct)

        const imageInfo = {
            url: 'test.jpg',
            productId: product.id
        }

        const image = await Product.addImage(imageInfo)

        expect(image).toEqual({
            ...imageInfo,
            id: expect.any(Number)
        })
    })

    test("can edit image", async function() {
        const product = await Product.add(newProduct)

        const imageData = {
            url: 'first.jpg',
            productId: product.id
        }

        const image = await Product.addImage(imageData)
        
        const editImageData = {
            url: 'second.jpg'
        }

        const imageEdit = await Product.updateImage(image.id, editImageData)

        expect(imageEdit).toEqual({
            ...editImageData,
            productId: product.id,
            id: expect.any(Number)
        })
    })
});