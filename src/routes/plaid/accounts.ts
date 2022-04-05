import { Router } from "express";
import { db } from "../../db/";
import { sanitizeTransactions } from "../../utils";

const router = Router();

router.get("/:account_id/transactions", (req, res) => {
  Promise.resolve(req).then(async ({ params }) => {
    const { account_id } = params;
    const transactions = await db.transactions.read({ account_id });
    res.json(sanitizeTransactions(transactions));
  });
});

export default router