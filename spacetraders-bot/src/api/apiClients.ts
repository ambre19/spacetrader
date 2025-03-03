import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_URL = "https://api.spacetraders.io/v2";
const TOKEN = process.env.SPACE_TRADERS_TOKEN;

/**
 * Creates an Axios instance configured with the base URL and headers for API requests.
 * 
 * @constant
 * @type {AxiosInstance}
 * 
 * @property {string} baseURL - The base URL for the API.
 * @property {Object} headers - The headers to be sent with each request.
 * @property {string} headers.Authorization - The authorization token for API access.
 * @property {string} headers["Content-Type"] - The content type of the request, set to "application/json".
 */
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
    },
});
