import { Roles } from "../types/roles";
import { API_BASE_URL } from "./baseUrl";

const BASE_URL = API_BASE_URL;

export const signup = async (data: {
  email: string;
  password: string;
  username: string;
  role: Roles;
}) => {
  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Signup failed");
  }

  return response.json();
};

/**
 * Login API
 */
export const login = async (data: {
  email: string;
  password: string;
}) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return response.json();
};

