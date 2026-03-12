const cognitoUrl = import.meta.env.VITE_COGNITO_URL as string;
const cognitoClientId = import.meta.env.VITE_COGNITO_CLIENT_ID as string;

const parseCognitoMessage = (body: any, fallback: string) =>
  body?.message || body?.__type || fallback;

export const getCognitoTokenPayload = (token: string) => {
  try {
    return JSON.parse(atob(token.split(".")[1] || ""));
  } catch {
    return null;
  }
};

async function sendCognitoRequest(
  target: string,
  payload: Record<string, unknown>
) {
  const res = await fetch(cognitoUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": target,
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      parseCognitoMessage(body, `Cognito request failed (${res.status})`)
    );
  }

  return body;
}

export async function signUpWithCognito(input: {
  email: string;
  password: string;
  username: string;
  gender: string;
}) {
  return sendCognitoRequest("AWSCognitoIdentityProviderService.SignUp", {
    ClientId: cognitoClientId,
    Username: input.email,
    Password: input.password,
    UserAttributes: [
      { Name: "email", Value: input.email },
      { Name: "name", Value: input.username },
      { Name: "gender", Value: input.gender || "unspecified" },
    ],
  });
}

export async function confirmSignUpWithCognito(email: string, code: string) {
  return sendCognitoRequest("AWSCognitoIdentityProviderService.ConfirmSignUp", {
    ClientId: cognitoClientId,
    Username: email,
    ConfirmationCode: code,
  });
}

export async function startForgotPassword(email: string) {
  return sendCognitoRequest(
    "AWSCognitoIdentityProviderService.ForgotPassword",
    {
      ClientId: cognitoClientId,
      Username: email,
    }
  );
}

export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
) {
  return sendCognitoRequest(
    "AWSCognitoIdentityProviderService.ConfirmForgotPassword",
    {
      ClientId: cognitoClientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    }
  );
}
