const cognitoUrl = import.meta.env.VITE_COGNITO_URL as string;
const cognitoClientId = import.meta.env.VITE_COGNITO_CLIENT_ID as string;

const parseCognitoMessage = (body: any, fallback: string) =>
  body?.message || body?.__type || fallback;

export type CognitoCodeDeliveryDetails = {
  destination?: string;
  deliveryMedium?: string;
  attributeName?: string;
};

export const getCognitoTokenPayload = (token: string) => {
  try {
    return JSON.parse(atob(token.split(".")[1] || ""));
  } catch {
    return null;
  }
};

export type CognitoLoginResult =
  | { token: string }
  | {
      challenge: {
        name: string;
        session: string;
        requiredAttributes: string[];
      };
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

export async function startForgotPassword(
  email: string
): Promise<{
  codeDeliveryDetails: CognitoCodeDeliveryDetails | null;
}> {
  const body = await sendCognitoRequest(
    "AWSCognitoIdentityProviderService.ForgotPassword",
    {
      ClientId: cognitoClientId,
      Username: email,
    }
  );

  return {
    codeDeliveryDetails: body?.CodeDeliveryDetails
      ? {
          destination: body.CodeDeliveryDetails.Destination,
          deliveryMedium: body.CodeDeliveryDetails.DeliveryMedium,
          attributeName: body.CodeDeliveryDetails.AttributeName,
        }
      : null,
  };
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

export async function loginWithCognito(
  email: string,
  password: string
): Promise<CognitoLoginResult> {
  const body = await sendCognitoRequest(
    "AWSCognitoIdentityProviderService.InitiateAuth",
    {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: cognitoClientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    }
  );

  const token = body?.AuthenticationResult?.IdToken;

  if (token) {
    return { token: token as string };
  }

  const requiredAttributesRaw = body?.ChallengeParameters?.requiredAttributes;
  let requiredAttributes: string[] = [];

  if (typeof requiredAttributesRaw === "string") {
    try {
      const parsed = JSON.parse(requiredAttributesRaw);
      if (Array.isArray(parsed)) {
        requiredAttributes = parsed;
      }
    } catch {
      requiredAttributes = [];
    }
  }

  if (body?.ChallengeName && body?.Session) {
    return {
      challenge: {
        name: body.ChallengeName as string,
        session: body.Session as string,
        requiredAttributes,
      },
    };
  }

  throw new Error("Cognito login failed: missing token");
}

export async function respondToNewPasswordChallenge(
  email: string,
  nextPassword: string,
  session: string,
  attributes: { gender?: string; name?: string }
) {
  const body = await sendCognitoRequest(
    "AWSCognitoIdentityProviderService.RespondToAuthChallenge",
    {
      ClientId: cognitoClientId,
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      Session: session,
      ChallengeResponses: {
        USERNAME: email,
        NEW_PASSWORD: nextPassword,
        "userAttributes.gender": attributes.gender,
        "userAttributes.name": attributes.name,
      },
    }
  );

  const token = body?.AuthenticationResult?.IdToken;

  if (!token) {
    throw new Error("Cognito challenge failed: missing token");
  }

  return token as string;
}
