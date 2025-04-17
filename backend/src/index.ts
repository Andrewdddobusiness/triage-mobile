import express from "express";
import dotenv from "dotenv";
import { jwt, twiml } from "twilio";
import cors from "cors";
const { AccessToken } = jwt;
const VoiceGrant = AccessToken.VoiceGrant;
const VoiceResponse = twiml.VoiceResponse;

dotenv.config();

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
