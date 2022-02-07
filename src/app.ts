import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator'
import os from 'node:os'

//TODO: use https (see: https://web.dev/how-to-use-local-https/)
//TODO: sanitize and validate (see: https://express-validator.github.io/docs/check-api.html)
//TODO: implement multer properly (see: https://github.com/expressjs/multer)
//TODO: normalize port number (see: express-generator output)
//TODO: implement .env
//TODO: implement auth0
//TODO: split code with express router
/*TODO: implement endpoint security best practices (see:
  https://blog.hubspot.com/website/api-security
  https://www.f5.com/labs/articles/education/securing-apis--10-best-practices-for-keeping-your-data-and-infra)
*/

const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: function(req, file, callback) {
    console.log(file)
    callback(null, file.originalname + Date.now().toLocaleString())
  }
})

const app = express();
const port = 3333;
const upload = multer({ storage: storage})

app.all('/', (_req, res) => {
  //respond to server status check
  try {
    res.sendStatus(200)
  }
  catch (err) {
    res.status(500).send(err?.message || 'Internal Server Error')
  }
});

app.post('/records', (req, res) => {
  
})

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});