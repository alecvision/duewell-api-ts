import { Router } from "express";
import { checkJwt } from "../../middleware";
import { db } from "../../db";
import { sanitizeTransactions } from "../../utils";

const router = Router();

router.post("/", checkJwt, async (req, res) => {
  console.log("protocol", req.protocol);
  console.log("headers", req.headers);
  console.log("parameters", req.params);
  console.log("query", req.query);
  console.log("auth", req.auth);
  console.log("body", req.body);
  
  const transactions = await db.transactions.read({
    user_id: req.body.user_id,
  });
  
  if (transactions.length > 0) {
    res.json(sanitizeTransactions(transactions));
  } else {
    res.json([]);
  }
});

export default router;
