import express from 'express'
import { Configuration, CountryCode, LinkTokenCreateRequest, PlaidApi, PlaidEnvironments, Products } from 'plaid'
import bodyParser from 'body-parser'
import prettyPrintRes from '../devtools/prettyPrintRes'
import dotenv from 'dotenv'

dotenv.config()
const router = express.Router()

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'us,ca').split(',');
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || 'transactions').split(',');
const PLAID_REDIRECT_URI = (process.env.PLAID_REDIRECT_URI || '');

// TODO: We store the access_token in memory - in production, store it in a secure
// persistent data store
let ACCESS_TOKEN: string | null = null;
let PUBLIC_TOKEN: string | null = null;
let ITEM_ID: string | null = null;

const configuration = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV],
    baseOptions: {
        headers: {
            'Content-Type': 'application/json',
            'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
            'PLAID-SECRET': PLAID_SECRET,
            'Plaid-Version': '2020-09-14',
        },
    },
});

const client = new PlaidApi(configuration);

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());  

router.post('/info', function (_request, response) {
    response.json({
        item_id: ITEM_ID,
        access_token: ACCESS_TOKEN,
        products: PLAID_PRODUCTS,
    });
});

router.post('/create_link_token', function (_request, response, next) {
    Promise.resolve()
    .then(async () => {
        const configs: LinkTokenCreateRequest = {
            user: {
                //TODO This should correspond to a unique id for the current user.
                client_user_id: 'user-id',
            },
            client_name: 'DueWell',
            products: PLAID_PRODUCTS as Products[],
            country_codes: PLAID_COUNTRY_CODES as CountryCode[],
            language: 'en', //TODO: Move to env var in case of internationalization
        };
  
        if (PLAID_REDIRECT_URI !== '') {
            configs.redirect_uri = PLAID_REDIRECT_URI;
        }

        const createTokenResponse = await client.linkTokenCreate(configs);
        prettyPrintRes(createTokenResponse);
        response.json(createTokenResponse.data);
    })
    .catch(next);
});

router.post('/set_access_token', function (request, response, next) {
    PUBLIC_TOKEN = request.body.public_token;
    Promise.resolve().then(async function () {
        const tokenResponse = await client.itemPublicTokenExchange({
            public_token: PUBLIC_TOKEN,
        });
        prettyPrintRes(tokenResponse);
        ACCESS_TOKEN = tokenResponse.data.access_token;
        ITEM_ID = tokenResponse.data.item_id;
        response.json({
            access_token: ACCESS_TOKEN,
            item_id: ITEM_ID,
            error: null,
        });
    })
    .catch(next);
});

router.get('/auth', function (_request, response, next) {
    Promise.resolve().then(async function () {
        const authResponse = await client.authGet({
            access_token: ACCESS_TOKEN,
        });
        prettyPrintRes(authResponse);
        response.json(authResponse.data);
    })
    .catch(next);
});

/* router.get('/transactions', function (_request, response, next) {
    Promise.resolve().then(async function () {
        //TODO: Get startDate and endDate from client request
        const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
        const endDate = moment().format('YYYY-MM-DD');
        const configs = {
            access_token: ACCESS_TOKEN,
            start_date: startDate,
            end_date: endDate,
            options: {
                count: 250,
                offset: 0,
            },
        };
        const transactionsResponse = await client.transactionsGet(configs);
        prettyPrintRes(transactionsResponse);
        response.json(transactionsResponse.data);
    })
    .catch(next);
}); */

router.get('/balance', function (_request, response, next) {
    Promise.resolve().then(async function () {
        const balanceResponse = await client.accountsBalanceGet({
            access_token: ACCESS_TOKEN,
        });
        prettyPrintRes(balanceResponse);
        response.json(balanceResponse.data);
    })
  .catch(next);
});

router.get('/item', function (_request, response, next) {
    Promise.resolve().then(async function () {
        // Pull the Item - this includes information about available products,
        // billed products, webhook information, and more.
        const itemResponse = await client.itemGet({
            access_token: ACCESS_TOKEN,
        });
        // Also pull information about the institution
        const configs = {
            institution_id: itemResponse.data.item.institution_id,
            country_codes: [CountryCode.Us],
        };
        const instResponse = await client.institutionsGetById(configs);
        prettyPrintRes(itemResponse);
        response.json({
            item: itemResponse.data.item,
            institution: instResponse.data.institution,
        });
    })
    .catch(next);
});

router.get('/accounts', function (_request, response, next) {
    Promise.resolve().then(async function () {
        const accountsResponse = await client.accountsGet({
            access_token: ACCESS_TOKEN,
        });
        prettyPrintRes(accountsResponse);
        response.json(accountsResponse.data);
    })
    .catch(next);
});

export default router