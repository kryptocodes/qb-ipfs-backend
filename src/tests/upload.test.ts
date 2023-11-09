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

describe("POST /upload and check /hash", () => {
    let hash:string;
    it("should return 200 OK", async () => {
        const result = await supertest(app).post("/upload").field('file', JSON.stringify({test: "test"}));
        expect(result.status).toEqual(200)
        expect(result.body).toHaveProperty('hash')
        hash = result.body.hash

    })

    it("should return 200 OK", async () => {
        const result = await supertest(app).get(`/${hash}`);
        expect(result.status).toEqual(200)
        expect(result.body).toHaveProperty('test')
    })

});