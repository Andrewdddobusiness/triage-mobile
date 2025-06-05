import { Request, Response } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function createSubscriptionSession(req: Request, res: Response) {
  const { email } = req.body;

  const customer = await stripe.customers.create({ email });

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    mode: "subscription",
    success_url: "spaak://payment-success",
    cancel_url: "spaak://payment-cancelled",
  });

  res.json({ url: session.url });
}
