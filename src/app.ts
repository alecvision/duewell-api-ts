import express from "express";
import dotenv from 'dotenv';
import receipts from './routes/receipts'
import plaid from './routes/plaid'

dotenv.config()

const app = express();

function normalizePort(portNumber: string | number) {
    console.log('portnum', portNumber)
    if (typeof portNumber === 'number' && portNumber <= 65535) {
        return portNumber
    } else if (typeof portNumber === 'string' && !isNaN(parseInt(portNumber)) && parseInt(portNumber) <= 65535) {
        return Number(portNumber)
    } else throw new Error("Port number must be of type 'string' or 'number'.");
}
  
const port = normalizePort(process.env.PORT_NUMBER)  

app.use('/receipts', receipts)
app.use('/plaid', plaid)

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
  });