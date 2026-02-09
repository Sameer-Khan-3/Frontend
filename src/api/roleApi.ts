import axios from "axios";

const API_URL = "http://localhost:4000";

export const createRole = async (name: string) => {
    const response = await axios.post(`${API_URL}/api/roles`, {name});
    return response.data;
};