import express from "express";
import dotenv from "dotenv";
import { jwt, twiml } from "twilio";
import cors from "cors";
const { AccessToken } = jwt;
const VoiceGrant = AccessToken.VoiceGrant;
const VoiceResponse = twiml.VoiceResponse;

// Load environment variables
const envPath = process.env.NODE_ENV === "production" ? ".env.production" : ".env";
console.log("env: ", envPath);
dotenv.config({ path: envPath });

// Debug environment variables
console.log("Environment variables loaded:", {
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? "Set" : "Missing",
  TWILIO_API_KEY: process.env.TWILIO_API_KEY ? "Set" : "Missing",
  TWILIO_API_SECRET: process.env.TWILIO_API_SECRET ? "Set" : "Missing",
  TWILIO_TWIML_APP_SID: process.env.TWILIO_TWIML_APP_SID ? "Set" : "Missing",
  PORT: process.env.PORT || 3001,
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3001;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.get("/accessToken", (req, res) => {
  try {
    console.log("Received token request for identity:", req.query.identity);
    const identity = req.query.identity || "user";

    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_API_KEY ||
      !process.env.TWILIO_API_SECRET ||
      !process.env.TWILIO_TWIML_APP_SID
    ) {
      console.error("Missing Twilio credentials");
      throw new Error("Missing required Twilio credentials");
    }

    const accessToken = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { identity: String(identity) }
    );

    const grant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
      pushCredentialSid: process.env.TWILIO_PUSH_CREDENTIAL_SID,
      incomingAllow: true,
    });
    accessToken.addGrant(grant);

    const token = accessToken.toJwt();
    console.log("Generated token for identity:", identity);
    res.send({ token });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// Handle incoming/outgoing voice calls
app.post("/voice", (req, res) => {
  console.log("Received voice request:", req.body);
  const twiml = new VoiceResponse();

  // If this is an outgoing call
  if (req.body.To) {
    twiml.dial().number(req.body.To);
  } else {
    // This is an incoming call
    twiml.say("Thanks for calling! Someone will be with you shortly.");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

app.post("/create-subscription-session", async (req, res) => {
  try {
    const { email } = req.body;

    const customer = await stripe.customers.create({ email });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: "spaak://payment-success",
      cancel_url: "spaak://payment-cancelled",
    });

    console.log("Created checkout session for:", email);
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Failed to create subscription session" });
  }
});

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for backend
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Check user subscription status
app.post("/check-subscription", async (req, res) => {
  try {
    const { userId } = req.body;

    // Get service provider record
    const { data: serviceProvider, error: spError } = await supabaseAdmin
      .from("service_providers")
      .select("id, subscription_status")
      .eq("auth_user_id", userId)
      .single();

    if (spError) {
      console.error("Error fetching service provider:", spError);
      return res.status(404).json({ error: "Service provider not found" });
    }

    // Get active subscription from Stripe
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("service_provider_id", serviceProvider.id)
      .eq("status", "active")
      .single();

    if (subError && subError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching subscription:", subError);
      return res.status(500).json({ error: "Database error" });
    }

    // If we have a subscription, verify it with Stripe
    if (subscription) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);

        // Update local subscription status if it differs
        if (stripeSubscription.status !== subscription.status) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: stripeSubscription.status,
              current_period_start: new Date((stripeSubscription as any).current_period_start * 1000).toISOString(),
              current_period_end: new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
              cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            })
            .eq("id", subscription.id);
        }

        return res.json({
          hasActiveSubscription: stripeSubscription.status === "active",
          subscription: {
            status: stripeSubscription.status,
            current_period_end: new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          },
        });
      } catch (stripeError) {
        console.error("Stripe error:", stripeError);
        return res.json({ hasActiveSubscription: false });
      }
    }

    res.json({ hasActiveSubscription: false });
  } catch (err) {
    console.error("Subscription check error:", err);
    res.status(500).json({ error: "Failed to check subscription" });
  }
});

// Stripe webhook to handle subscription events
app.post("/stripe-webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object;
        await handleSubscriptionCancellation(deletedSubscription);
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).json({ error: "Webhook handler failed" });
  }
});

async function handleSubscriptionUpdate(subscription: any) {
  // Find customer by Stripe customer ID
  const { data: existingSub } = await supabaseAdmin
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
    await supabaseAdmin.from("subscriptions").update(subscriptionData).eq("stripe_subscription_id", subscription.id);
  } else {
    // This is a new subscription, we need to link it to a service provider
    // You'll need to implement logic to find the correct service provider
    console.log("New subscription created, needs manual linking:", subscription.id);
  }

  // Update service provider subscription status
  if (existingSub) {
    await supabaseAdmin
      .from("service_providers")
      .update({ subscription_status: subscription.status === "active" ? "active" : "inactive" })
      .eq("id", existingSub.service_provider_id);
  }
}

async function handleSubscriptionCancellation(subscription: any) {
  await supabaseAdmin
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscription.id);

  // Update service provider status
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("service_provider_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (sub) {
    await supabaseAdmin
      .from("service_providers")
      .update({ subscription_status: "inactive" })
      .eq("id", sub.service_provider_id);
  }
}
