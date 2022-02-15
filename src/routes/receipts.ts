import express from 'express';
import multer from 'multer';
//import { body, validationResult } from 'express-validator'
import os from 'node:os'
import * as fs from 'fs'
//import cors from 'cors'
import { AzureKeyCredential, DocumentAnalysisClient, PrebuiltModels } from "@azure/ai-form-recognizer"
//TODO: import db from '../lib/db'
import logReceipt from '../devtools/logReceipt'

//TODO: use https (see: https://web.dev/how-to-use-local-https/)
//TODO: sanitize and validate (see: https://express-validator.github.io/docs/check-api.html)
//TODO: implement multer properly (see: https://github.com/expressjs/multer)
//TODO: implement auth0
/*TODO: implement endpoint security best practices (see:
  https://blog.hubspot.com/website/api-security
  https://www.f5.com/labs/articles/education/securing-apis--10-best-practices-for-keeping-your-data-and-infra)
*/

const router = express.Router()

const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: function(req, file, callback) {
    console.log(file)
    callback(null, Date.now().toLocaleString() + "_" + file.originalname)
  }
})

const upload = multer({ storage: storage })

//TODO configure cors
//app.use(cors())

router.use(upload.any())

router.post('/', (req, res) => {
  console.log('records req: ', req.files)
  const apiKey = process.env.MS_RECEIPT_PROCESSOR_KEY
  const endpoint = process.env.MS_RECEIPT_PROCESSOR_ENDPOINT
  
  const submitFile = async (file: Express.Multer.File) => {
    const stream = fs.createReadStream(file.path)
    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));
    const poller = await client.beginAnalyzeDocuments(PrebuiltModels.Receipt, stream);
    const { documents: [receipt] } = await poller.pollUntilDone();

    if (receipt) {
//XXX      db.findReceipt(receipt)
      logReceipt(receipt)
    } else {
      throw new Error("Expected at least one receipt in the result.");
    }
  }

  if (Array.isArray(req.files)) {
    req.files.forEach(file => console.log(submitFile(file)))
    res.sendStatus(200) //FIXME
  }
  else if (req.files.file) {
    req.files.file.forEach(file => console.log(submitFile(file)))
    res.sendStatus(200) //FIXME
  }
})

export default router