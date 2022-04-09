import { auth } from "express-oauth2-jwt-bearer";

const issuerBaseURL = process.env.AUTH0_ISSUER_BASE_URL;
const audience = process.env.AUTH0_AUDIENCE;

export const checkJwt = auth({ issuerBaseURL, audience });
