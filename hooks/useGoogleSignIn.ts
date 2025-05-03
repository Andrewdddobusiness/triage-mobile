import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";
import { supabase } from "~/lib/supabase";

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";

export function useGoogleSignIn() {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri: AuthSession.makeRedirectUri({
        scheme: Platform.select({ web: "", default: "triage" }),
      }),
      scopes: ["openid", "email", "profile"],
      responseType: "code",
    },
    discovery
  );

  const signInWithGoogle = async () => {
    // Prompt the user to sign in
    const result = await promptAsync();

    if (result?.type !== "success" || !result.params?.code) {
      throw new Error("Google sign in cancelled or failed");
    }

    const { code } = result.params;

    // Exchange code for session with Supabase
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) throw error;

    return data.session;
  };

  return {
    signInWithGoogle,
    request, // can use this to render buttons with promptAsync
  };
}
