import { Router } from "express";
import { db } from "../../db";
import {
  sanitizeItems,
  isValidItemStatus,
  validItemStatuses,
} from "../../utils"; 
import { client } from ".";
import type { PlaidItemModel } from "../../db/models";

const router = Router();

router.post("/", function (request, response, next) {
  Promise.resolve(request.body).then(
    async ({ institution_id, user_id, public_token }) => {
      try {
        const existingItem: PlaidItemModel = await db.plaidItems.read({
          institution_id,
          user_id,
        });

        if (existingItem) {
          response
            .status(409)
            .send("You have already linked this institution.");
          return;
        }

        const res = await client.itemPublicTokenExchange({
          public_token,
        });

        const new_id = await db.plaidItems.create({
          ...res.data,
          institution_id,
          user_id,
        });
        const newItem = await db.plaidItems.read({ _id: new_id });

        response.status(200).json(sanitizeItems(newItem));
      } catch (err) {
        response.status(500).json(err) && next();
      }
    }
  );
});

router.get("/:item_id", (req, res, next) => {
  Promise.resolve(req.params).then(async ({ item_id }) => {
    try {
      const item = await db.plaidItems.read({ item_id });
      res.status(200).json(sanitizeItems(item));
    } catch (err) {
      res.status(500).json(err) && next();
    }
  });
});

router.put("/:item_id", (req, res) => {
  Promise.resolve(req).then(async ({ body, params }) => {
    const { item_id } = params;
    const { status } = body;

    if (status) {
      if (!isValidItemStatus(status)) {
        res.status(400).json({
          reason: `${status} is not a valid Item status`,
          acceptedValues: validItemStatuses,
        });
      }
      await db.plaidItems.update({ item_id }, { status });
      const item = await db.plaidItems.read({ item_id });
      res.status(200).json(sanitizeItems(item));
    } else {
      res.status(400).json({
        reason: "You must provide updated item information.",
        acceptedKeys: ["status"],
      });
    }
  });
});

router.delete("/:item_id", (req, res) => {
  Promise.resolve(req).then(async ({params}) => {
    let removed: boolean;
    let status_code: number;
    const { item_id } = params;
    try {
      const { plaid_access_token: accessToken } = await db.plaidItems.read({item_id});
      const response = await client.itemRemove({
        access_token: accessToken,
      });
      removed = response.data.removed;
      status_code = response.data.status_code;
    } catch (error) {
      if (!removed) {
        res.sendStatus(status_code);
      }
      await db.plaidItems.delete({item_id});

      res.sendStatus(204);
    }
  })
})

router.get("/:itemId/accounts");

router.get("/:itemId/transactions");

export default router;
