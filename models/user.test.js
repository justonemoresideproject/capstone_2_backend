const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");

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

describe("register", function () {
    const newUser = {
        username: 'secondTest',
        firstName: 'testFirst',
        lastName: 'testLast',
        email: 'test@gmail.com',
        phone: "5554443333",
        isAdmin: false
    }

    test("works", async function () {
        const user = await User.register({
            ...newUser,
            password: 'password'
        })

        expect(user).toEqual({
            ...newUser, 
            id: expect.any(Number)
        });

        const found = await db.query(`SELECT * FROM users WHERE username = $1`, ['secondTest']);
        expect(found.rows[0].is_admin).toEqual(false);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    })
})

describe("authenticate", function() {
    test("works", async function() {

        const user = {
            username: "test",
            firstName: "jim",
            lastName: "bo",
            email: "jimbo@gmail.com",
            phone: "1112223333",
            password: 'banana',
            isAdmin: false
        }

        await User.register(user)
        const authenticatedUser = await User.authenticate(user.username, user.password)

        // expect(user.rows[0].is_admin).toEqual(false);
        // expect(user.rows[0].password.startsWith("$2b$")).toEqual(true);
        // password: startsWith("$2b$")

        expect(authenticatedUser.rows[0]).toEqual(user);
    });

    test("unauth if no such user", async function(){
        try{
            const user = await User.authenticate('fake', 'notreal')
            fail();
        } catch(err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    })
})