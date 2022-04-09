import { Router } from "express"
import {  LinkTokenCreateRequest } from "plaid";
import { client, PLAID_PRODUCTS, PLAID_REDIRECT_URI, PLAID_COUNTRY_CODES } from ".";
import { db } from '../../db'

const router = Router()

router.post('/', function (request, response, next) {
    Promise.resolve()
    .then(async () => {
        const { user_id, item_id } = request.body;
        let access_token = null;
        let products = PLAID_PRODUCTS;
        
        if (item_id) {
            // for the link update mode, include access token and an empty products array
            const itemIdResponse = await db.plaidItems.read({item_id});
            access_token = itemIdResponse.plaid_access_token;
            products = [];
        }
        
        const configs: LinkTokenCreateRequest = {
            user: {
                client_user_id: user_id
            },
            client_name: 'DueWell',
            products,
            country_codes: PLAID_COUNTRY_CODES,
            language: 'en', //TODO: Move to env var in case of internationalization,
            access_token: access_token
        };
        
        if (PLAID_REDIRECT_URI.indexOf('http') === 0) {
            configs.redirect_uri = PLAID_REDIRECT_URI;
        }

        const { data, status, statusText } = await client.linkTokenCreate(configs);
        const body = status.toString(10).startsWith("2") ? data : statusText

        response.status(status).send(body)
    })
    .catch(next);
});

export default router