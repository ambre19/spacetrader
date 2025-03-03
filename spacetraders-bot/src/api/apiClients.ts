import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_URL = "https://api.spacetraders.io/v2";
const TOKEN = process.env.SPACE_TRADERS_TOKEN;

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
    },
});
