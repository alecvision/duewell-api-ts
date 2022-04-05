import { Router } from 'express'
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'
import type { CountryCode, Products } from 'plaid'

import { json } from 'body-parser'
import link from './link'
import itemsRouter from './items'
import accountsRouter from './accounts'
import institutionsRouter from './institutions'
import transactionsRouter from './transactions'

export const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
export const PLAID_SECRET = process.env.PLAID_SECRET;
export const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';
export const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'us,ca').split(',') as CountryCode[]
export const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || 'transactions').split(',') as Products[];
export const PLAID_REDIRECT_URI = (process.env.PLAID_REDIRECT_URI || '');

const router = Router()

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

export const client = new PlaidApi(configuration);

//router.use(bodyParser.urlencoded({ extended: false }));
router.use(json());
router.use('/link', link)
router.use('/items', itemsRouter)
router.use('/accounts', accountsRouter)
router.use('/transactions', transactionsRouter)
router.use('/institutions', institutionsRouter)

export default router