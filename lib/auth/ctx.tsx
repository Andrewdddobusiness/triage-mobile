import { useContext, createContext, type PropsWithChildren } from "react";
import { supabase } from "~/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

const AuthContext = createContext<{
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: Session | null;
  isLoading: boolean;
  hasActiveSubscription: boolean;
  subscriptionLoading: boolean;
  checkSubscription: () => Promise<void>;
}>({
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  session: null,
  isLoading: true,
  hasActiveSubscription: false,
  subscriptionLoading: false,
  checkSubscription: async () => {},
});

export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const checkSubscription = async () => {
    if (!session?.user?.id) return;

    setSubscriptionLoading(true);
    try {
      const response = await fetch("https://triage-mobile.vercel.app/stripe-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session.user.id }),
      });

      const data = await response.json();
      setHasActiveSubscription(data.hasActiveSubscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setHasActiveSubscription(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
      if (session) {
        checkSubscription();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkSubscription();
      } else {
        setHasActiveSubscription(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signUp,
        signOut,
        session,
        isLoading,
        hasActiveSubscription,
        subscriptionLoading,
        checkSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
