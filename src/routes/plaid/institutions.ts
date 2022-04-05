import { Router } from "express";
import { CountryCode } from "plaid";
import { client, PLAID_COUNTRY_CODES } from ".";

const router = Router();

router.get("/", (req, res) => {
  Promise.resolve(req).then(async ({ query }) => {
    let { count = 200, offset = 0 } = query;
    const radix = 10;
    count = parseInt(count as string, radix);
    offset = parseInt(offset as string, radix);
    const request = {
      count: count,
      offset: offset,
      options: {
        include_optional_metadata: true,
      },
      country_codes: PLAID_COUNTRY_CODES as CountryCode[],
    };
    const response = await client.institutionsGet(request);
    const institutions = Array.isArray(response.data.institutions)
      ? response.data.intitutions
      : [response.data.institutions];
    res.json(institutions);
  });
});

router.get("/:institution_id", (req, res) => {
  Promise.resolve().then(async () => {
    const { institution_id } = req.params;
    const request = {
      institution_id,
      country_codes: PLAID_COUNTRY_CODES as CountryCode[],
      options: {
        include_optional_metadata: true,
      },
    };
    try {
      const response = await client.institutionsGetById(request);
      const institution = Array.isArray(response.data.institution)
        ? response.data.institution
        : [response.data.institution];
      res.json(institution);
    } catch (error) {
      res.status(500).json(error);
    }
  });
});

export default router;
