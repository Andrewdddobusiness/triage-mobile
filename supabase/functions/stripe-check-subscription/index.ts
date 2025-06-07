import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    // Get service provider record
    const { data: serviceProvider, error: spError } = await supabaseClient
      .from("service_providers")
      .select("id, subscription_status")
      .eq("auth_user_id", userId)
      .single();

    if (spError) {
      console.error("Error fetching service provider:", spError);
      return new Response(JSON.stringify({ error: "Service provider not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Get active subscription from Stripe
    const { data: subscription, error: subError } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("service_provider_id", serviceProvider.id)
      .eq("status", "active")
      .single();

    if (subError && subError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching subscription:", subError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // If we have a subscription, verify it with Stripe
    if (subscription) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);

        // Update local subscription status if it differs
        if (stripeSubscription.status !== subscription.status) {
          await supabaseClient
            .from("subscriptions")
            .update({
              status: stripeSubscription.status,
              current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            })
            .eq("id", subscription.id);
        }

        return new Response(
          JSON.stringify({
            hasActiveSubscription: stripeSubscription.status === "active" || stripeSubscription.status === "trialing",
            subscription: {
              status: stripeSubscription.status,
              current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: stripeSubscription.cancel_at_period_end,
              canceled_at: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000).toISOString() : null,
              trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
              plan_name: "Pro Plan",
              billing_cycle: stripeSubscription.items.data[0]?.price?.recurring?.interval || "month",
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      } catch (stripeError) {
        console.error("Stripe error:", stripeError);
        return new Response(JSON.stringify({ hasActiveSubscription: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    return new Response(JSON.stringify({ hasActiveSubscription: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Subscription check error:", err);
    return new Response(JSON.stringify({ error: "Failed to check subscription" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
