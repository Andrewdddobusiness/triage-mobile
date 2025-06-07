import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import Stripe from "https://esm.sh/stripe@14.21.0";

serve(async (req: Request) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    const event = stripe.webhooks.constructEvent(body, signature, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);

    // Initialize Supabase client
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription, supabaseClient);
        break;
      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(deletedSubscription, supabaseClient);
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response(JSON.stringify({ error: "Webhook handler failed" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleSubscriptionUpdate(subscription: Stripe.Subscription, supabaseClient: any) {
  // Find customer by Stripe customer ID
  const { data: existingSub } = await supabaseClient
    .from("subscriptions")
    .select("service_provider_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  const subscriptionData = {
    stripe_customer_id: subscription.customer,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0]?.price?.id,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  };

  if (existingSub) {
    // Update existing subscription
    await supabaseClient.from("subscriptions").update(subscriptionData).eq("stripe_subscription_id", subscription.id);
  } else {
    // This is a new subscription, needs manual linking
    console.log("New subscription created, needs manual linking:", subscription.id);
  }

  // Update service provider subscription status
  if (existingSub) {
    await supabaseClient
      .from("service_providers")
      .update({
        subscription_status: subscription.status === "active" ? "active" : "inactive",
      })
      .eq("id", existingSub.service_provider_id);
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription, supabaseClient: any) {
  await supabaseClient
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscription.id);

  // Update service provider status
  const { data: sub } = await supabaseClient
    .from("subscriptions")
    .select("service_provider_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (sub) {
    await supabaseClient
      .from("service_providers")
      .update({ subscription_status: "inactive" })
      .eq("id", sub.service_provider_id);
  }
}
