import express from 'express'
import multer from 'multer'
//import { body, validationResult } from 'express-validator'
import os from 'node:os'
import * as fs from 'fs'
import { AzureKeyCredential, DocumentAnalysisClient, PrebuiltModels } from "@azure/ai-form-recognizer"
//TODO: import db from '../lib/db'
import logReceipt from '../devtools/logReceipt'
import dotenv from 'dotenv'
import { appendQueryParams } from '../utils'

//TODO: use https (see: https://web.dev/how-to-use-local-https/)
//TODO: sanitize and validate (see: https://express-validator.github.io/docs/check-api.html)
//TODO: implement multer properly (see: https://github.com/expressjs/multer)
//TODO: implement auth0
/*TODO: implement endpoint security best practices (see:
  https://blog.hubspot.com/website/api-security
  https://www.f5.com/labs/articles/education/securing-apis--10-best-practices-for-keeping-your-data-and-infra)
*/

dotenv.config()

const router = express.Router()

const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: function(req, file, callback) {
    callback(null, Date.now().toLocaleString() + "_" + file.originalname)
  }
})

const upload = multer({ storage: storage })

router.use(upload.any())

router.post('/', (req, res) => {
  const apiKey = process.env.MS_RECEIPT_PROCESSOR_KEY
  const base = process.env.MS_RECEIPT_PROCESSOR_ENDPOINT
  const params = {
    "api-version": "2022-01-30-preview",
    "stringIndexType": "textElements"
  }
  const endpoint = appendQueryParams(base, params)
  
  const submitFile = async (file: Express.Multer.File) => {
    const stream = fs.createReadStream(file.path)
    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));
    const poller = await client.beginAnalyzeDocument(PrebuiltModels.Receipt, stream);
    const { documents: [receipt] } = await poller.pollUntilDone();

    if (receipt) {
//XXX      db.findReceipt(receipt)
      logReceipt(receipt)
    } else {
      throw new Error("Expected at least one receipt in the result.");
    }
  }

  if (Array.isArray(req.files)) {
    req.files.forEach(file => submitFile(file))
    res.sendStatus(200) //FIXME
  }
  else if (req?.files?.file) {
    req.files.file.forEach(file => submitFile(file))
    res.sendStatus(200) //FIXME
  }
})

export default router