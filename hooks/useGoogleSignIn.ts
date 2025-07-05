import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
  isErrorWithCode,
  isCancelledResponse,
} from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "~/lib/supabase";

export function useGoogleSignIn() {
  const signInWithGoogle = async () => {
    try {
      // 1. Ensure Play Services (Android) / no-op on iOS
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // 2. Prompt user
      const result = await GoogleSignin.signIn();

      // 3. Check for success
      if (!isSuccessResponse(result)) {
        // user cancelled or something went wrong; bail out
        return;
      }

      // 4. Extract the User from `result.data`
      const user = result.data;
      const idToken = user.idToken;
      if (!idToken) {
        throw new Error("No idToken returned from Google Sign-In");
      }

      // 5. Exchange the ID token with Supabase Auth
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) throw error;

      // 6. (Optional) Now `data.session` and `data.user` are available

      router.replace("/(tabs)");
      return data;
    } catch (err: any) {
      // 7. Handle Google-Signin-specific errors
      if (isErrorWithCode(err)) {
        switch (err.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // user cancelled the flow
            break;
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert("Google Play Services not available");
            break;
        }
      } else if (isCancelledResponse(err)) {
        // user cancelled
      } else {
        console.error(err);
        Alert.alert("Sign in error", err.message);
      }
    }
  };

  return { signInWithGoogle };
}
