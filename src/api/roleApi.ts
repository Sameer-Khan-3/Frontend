import axios from "../../node_modules/axios/index";

const API_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const createRole = async (name: string) => {
  const response = await axios.post(`${API_URL}/api/roles`, {
    name,
  });

  return response.data;
};