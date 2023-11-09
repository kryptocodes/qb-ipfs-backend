import mongoose from "mongoose";
import app from "../index";
import supertest from "supertest";


afterAll(done => {
    // Closing the DB connection to avoid Jest open handle error
    mongoose.connection.close()
    done()
  })

// check if the server is up and running
describe("GET /health/check", () => {
    it("should return 200 OK", async () => {
        const result = await supertest(app).get("/health/check");
        expect(result.status).toEqual(200);
    });
})

// random hash should return 404
describe("POST /hash", () => {
    it("should return 404 Not Found", async () => {
        const result = await supertest(app).post("/hash")
        expect(result.status).toEqual(404);
    })
});