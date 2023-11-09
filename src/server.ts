import logger from "./utils/logger";
import app from ".";
import dotenv from "dotenv";
dotenv.config();


const port = process.env.PORT

app.listen(port, () => {
    logger.info(`server started at http://localhost:${port}`);
});
