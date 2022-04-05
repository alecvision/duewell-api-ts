import { Router } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import { db } from "../../db/";
import { sanitizeTransactions } from "../../utils";

const issuerBaseURL = process.env.AUTH0_ISSUER_BASE_URL;
const audience = process.env.AUTH0_AUDIENCE;

const router = Router();
const checkJwt = auth({ issuerBaseURL, audience });

router.post("/", checkJwt, async (req, res) => {
  console.log("protocol", req.protocol);
  console.log("headers", req.headers);
  console.log("parameters", req.params);
  console.log("query", req.query);
  console.log("auth", req.auth);
  console.log("body", req.body);
  const transactions = await db.transactions.read({
    user_id: req.body.user.sub,
  });
  
  if (transactions.length > 0) {
    res.json(sanitizeTransactions(transactions));
  } else {
    res.json([]);
  }
});

export default router;
