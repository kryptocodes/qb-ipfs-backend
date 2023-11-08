


import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();


import express from "express";
import cors from 'cors';

import routes from './routes'
import './db'

const app = express()
const port = process.env.PORT || 5000
app.use(cors())


app.use(morgan("dev"));


/* health check */
app.get('/health/check', (_, res) => {
    res.json({
        status: "200",
        message: "gm gm!  api is up and running"
    })
});

app.use("/",routes)

app.listen(port, () => {
console.log(`QB app listening on port ${port}`)
})