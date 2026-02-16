import axios from "axios";
import env from "dotenv";
env.config();

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const createRole = async (name: string) => {
    const response = await axios.post(`${API_URL}/api/roles`, {name});
    return response.data;
};