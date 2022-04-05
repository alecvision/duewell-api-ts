import express from "express";
import { dbConnect } from "./db";
import receipts from "./routes/receipts";
import plaid from "./routes/plaid";
//TODO configure cors
import cors from "cors";

const app = express();
//TODO: configure mongodb for production and update CONNSTRING env var

function normalizePort(portNumber: string | number) {
  if (typeof portNumber === "number" && portNumber <= 65535) {
    return portNumber;
  } else if (
    typeof portNumber === "string" &&
    !isNaN(parseInt(portNumber)) &&
    parseInt(portNumber) <= 65535
  ) {
    return Number(portNumber);
  } else throw new Error("Port number must be of type 'string' or 'number'.");
}

const port = normalizePort(process.env.PORT_NUMBER);
//TODO: remove/change next line for production
const corsOptions = { origin: 'http://localhost:3000' };

dbConnect()
  .then(() => {
    app.use(cors(corsOptions));
    app.use("/receipts", receipts);
    app.use("/plaid", plaid);
    app.all('*', (_, res) => res.status(404).send('not found'))

    app.listen(port, () =>
      console.log(`Express is listening at http://localhost:${port}`)
    );
  })
  .catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
  });
