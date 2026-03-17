import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { cognitoConfig } from "../src/cognitoConfig";

const Signin = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [challengeSession, setChallengeSession] = useState<string | null>(null);
  const [challengeRequired, setChallengeRequired] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [challengeGender, setChallengeGender] = useState("");
  const [challengeName, setChallengeName] = useState("");

  type CognitoLoginResult =
    | { token: string }
    | {
        challenge: {
          name: string;
          session: string;
          requiredAttributes: string[];
        };
      };

  const loginWithCognito = async (
    userEmail: string,
    userPassword: string
  ): Promise<CognitoLoginResult> => {
    const res = await fetch("https://cognito-idp.us-east-1.amazonaws.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
      },
      body: JSON.stringify({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: cognitoConfig.ClientId,
        AuthParameters: {
          USERNAME: userEmail,
          PASSWORD: userPassword,
        },
      }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        body?.message ||
        body?.__type ||
        `Cognito login failed (${res.status})`;
      throw new Error(message);
    }

    // ✅ IMPORTANT: Use AccessToken instead of IdToken
    const token = body?.AuthenticationResult?.AccessToken;

    if (!token) {
      const requiredAttributesRaw =
        body?.ChallengeParameters?.requiredAttributes;

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

    return { token: token as string };
  };

  const respondToNewPasswordChallenge = async (
    userEmail: string,
    nextPassword: string,
    session: string,
    attributes: { gender?: string; name?: string }
  ) => {
    const res = await fetch("https://cognito-idp.us-east-1.amazonaws.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target":
          "AWSCognitoIdentityProviderService.RespondToAuthChallenge",
      },
      body: JSON.stringify({
        ClientId: cognitoConfig.ClientId,
        ChallengeName: "NEW_PASSWORD_REQUIRED",
        Session: session,
        ChallengeResponses: {
          USERNAME: userEmail,
          NEW_PASSWORD: nextPassword,
          "userAttributes.gender": attributes.gender,
          "userAttributes.name": attributes.name,
        },
      }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        body?.message ||
        body?.__type ||
        `Cognito challenge failed (${res.status})`;
      throw new Error(message);
    }

    // ✅ IMPORTANT: Use AccessToken
    const token = body?.AuthenticationResult?.AccessToken;

    if (!token) {
      throw new Error("Cognito challenge failed: missing token");
    }

    return token as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) newErrors.password = "Password is required";

    if (challengeSession) {
      if (!newPassword.trim())
        newErrors.newPassword = "New password is required";

      if (
        challengeRequired.includes("userAttributes.gender") &&
        !challengeGender.trim()
      ) {
        newErrors.gender = "Gender is required";
      }

      if (
        challengeRequired.includes("userAttributes.name") &&
        !challengeName.trim()
      ) {
        newErrors.name = "Name is required";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      if (challengeSession) {
        const token = await respondToNewPasswordChallenge(
          email,
          newPassword,
          challengeSession,
          {
            gender: challengeGender,
            name: challengeName,
          }
        );

        signIn({ token, user: { email } });

        setChallengeSession(null);
        setChallengeRequired([]);
        setNewPassword("");
        setChallengeGender("");
        setChallengeName("");

        navigate("/dashboard");
        return;
      }

      const result = await loginWithCognito(email, password);

      if ("challenge" in result) {
        setChallengeSession(result.challenge.session);
        setChallengeRequired(result.challenge.requiredAttributes);
        setErrorMessage(
          "Password update required. Please set a new password."
        );
        return;
      }

      const token = result.token;

      signIn({ token, user: { email } });

      navigate("/dashboard");
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Cognito login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-(--bg) text-(--text) px-4">
      <div className="w-full max-w-md p-8 bg-(--surface) rounded-3xl border border-(--border) shadow-(--shadow-strong)">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-(--accent) text-white font-semibold shadow-(--shadow-soft)">
            RB
          </div>

          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <p className="text-sm text-(--text-muted)">
            Sign in to your RBAC Studio workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl"
          />

          {challengeSession && (
            <>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
              />

              <select
                value={challengeGender}
                onChange={(e) => setChallengeGender(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
              >
                <option value="">Select Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>

              <input
                type="text"
                placeholder="Full Name"
                value={challengeName}
                onChange={(e) => setChallengeName(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white bg-(--accent) rounded-xl"
          >
            {loading
              ? "Signing in..."
              : challengeSession
              ? "Set New Password"
              : "Sign In"}
          </button>

          {errorMessage && (
            <p className="text-sm text-center text-red-500">{errorMessage}</p>
          )}

          <p className="text-sm text-center mt-2 text-(--text-muted)">
            <span
            onClick={() =>navigate("/signup")}
            className="text-(--accent) cursor-pointer hover:underline">
            Don't have an account?{' '}
            </span>
          </p>
          <p className="text-sm text-right mt-2 text-(--text-muted)">
            <span
              onClick={() => navigate("/forget-password")}
              className="text-(--accent) cursor-pointer hover:underline">
              Forgot Password?
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signin;
