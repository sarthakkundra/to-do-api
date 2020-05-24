const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/user");

const userOneId = new mongoose.Types.ObjectId();
// Creating a user to test routes that require a user
const userOne = {
  _id: userOneId,
  name: "first user",
  email: "firstuser@example.com",
  password: "12345678",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    }
  ]
};

// Cleaning DB before every run
beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

// Test to create a new user
test("Creating a new user", async () => {
  await request(app)
    .post("/users")
    .send({
      name: "sarthak",
      email: "sarthak@example1.com",
      password: "12345678",
    })
    .expect(201);
});

// Test to login a user
test("Should login existing user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);
});

// Test to not login a fake user
test("Not login non-existent user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "dkajnda@example.com",
      password: "132rfvsfq1",
    })
    .expect(400);
});

// Test to get profile of an authenticated user
test("Should get profile of user", async () => {
  await request(app)
    .get("/users/me")
    .set('authToken', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});
