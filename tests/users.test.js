const request = require("supertest");

const crypto = require("node:crypto");

const app = require("../src/app");

const database = require("../database");

describe("GET /api/users", () => {
  it("should return all users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });
});

describe("GET /api/users/:id", () => {
  it("should return one user", async () => {
    const response = await request(app).get("/api/users/1");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });

  it("should return no user", async () => {
    const response = await request(app).get("/api/users/0");

    expect(response.status).toEqual(404);
  });
});

describe("POST /api/users", () => {
  it("should return created user", async () => {
    const newUser = {
      firstname: "Jimmy",
      lastname: "Neutron",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "London",
      language: "German",
    };

    const response = await request(app).post("/api/users").send(newUser);

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("number");

    const [result] = await database.query("SELECT * FROM users WHERE id=?", response.body.id);

    const [userInDatabase] = result;

    expect(userInDatabase).toHaveProperty("id");

    expect(userInDatabase).toHaveProperty("firstname");
    expect(userInDatabase.firstname).toStrictEqual(newUser.firstname);
    expect(userInDatabase).toHaveProperty("lastname");
    expect(typeof userInDatabase.lastname).toStrictEqual(newUser.lastname);
    expect(userInDatabase).toHaveProperty("email");
    expect(typeof userInDatabase.email).toStrictEqual(newUser.email);
    expect(userInDatabase).toHaveProperty("city");
    expect(typeof userInDatabase.city).toStrictEqual(newUser.city);
    expect(userInDatabase).toHaveProperty("language");
    expect(typeof userInDatabase.language).toStrictEqual(newUser.language);
  });
  it("should return an error", async () => {
    const userWithMissingProps = { firstname: "Toto" };
    expect(userWithMissingProps).toHaveProperty("firstname");

    const response = await request(app).post("/api/users").send(userWithMissingProps);

    expect(response.status).toEqual(500);
  });
});

afterAll(() => database.end());
