import { API_BASE_URL } from "./baseUrl";

type CompleteSignupProfileInput = {
  email: string;
  username: string;
  gender: string;
};

export async function completeSignupProfile(
  input: CompleteSignupProfileInput
) {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      username: input.username,
      gender: input.gender,
    }),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(body?.message || "Failed to create user profile");
  }

  return body;
}
