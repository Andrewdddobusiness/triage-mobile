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

    // Create crypto provider for Deno
    const cryptoProvider = Stripe.createSubtleCryptoProvider();

    // Use async version of constructEvent
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
      undefined,
      cryptoProvider
    );

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
  // Get customer metadata to find service provider
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2024-06-20",
  });
  const customer = await stripe.customers.retrieve(subscription.customer as string);

  const subscriptionData = {
    stripe_customer_id: subscription.customer,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0]?.price?.id,
    status: subscription.status,
    current_period_start: subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : null,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
  };

  // Check if subscription already exists - handle the error properly
  const { data: existingSub, error: selectError } = await supabaseClient
    .from("subscriptions")
    .select("service_provider_id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle(); // Use maybeSingle() instead of single()

  if (selectError) {
    console.error("Error checking existing subscription:", selectError);
    return;
  }

  if (existingSub) {
    // Update existing subscription
    const { error: updateError } = await supabaseClient
      .from("subscriptions")
      .update(subscriptionData)
      .eq("stripe_subscription_id", subscription.id);

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      return;
    }

    // Update service provider subscription status
    await supabaseClient
      .from("service_providers")
      .update({ subscription_status: subscription.status === "active" ? "active" : "inactive" })
      .eq("id", existingSub.service_provider_id);

    console.log("✅ Updated existing subscription:", subscription.id);
  } else {
    // This is a new subscription - get service provider ID from customer metadata
    const serviceProviderId = (customer as any).metadata?.service_provider_id;

    if (!serviceProviderId) {
      console.error("No service provider ID found in customer metadata for subscription:", subscription.id);
      return;
    }

    // Use upsert to handle potential race conditions
    const { error: upsertError } = await supabaseClient.from("subscriptions").upsert(
      {
        ...subscriptionData,
        service_provider_id: serviceProviderId,
      },
      {
        onConflict: "stripe_subscription_id",
      }
    );

    if (upsertError) {
      console.error("Error upserting subscription:", upsertError);
      return;
    }

    // Update service provider subscription status
    const { error: updateError } = await supabaseClient
      .from("service_providers")
      .update({ subscription_status: subscription.status === "active" ? "active" : "inactive" })
      .eq("id", serviceProviderId);

    if (updateError) {
      console.error("Error updating service provider:", updateError);
    } else {
      console.log("✅ Created new subscription for service provider:", serviceProviderId);
    }
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
