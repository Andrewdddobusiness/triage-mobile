import { useEffect, useState } from "react";
import { Voice, Call } from "@twilio/voice-react-native-sdk";
import { Platform } from "react-native";

const API_URL = __DEV__
  ? Platform.select({
      ios: "https://24c9-2403-4800-3530-1a01-3d83-455e-54cf-ab55.ngrok-free.app",
      android: "http://10.0.2.2:3001",
      default: "https://24c9-2403-4800-3530-1a01-3d83-455e-54cf-ab55.ngrok-free.app",
    })
  : "https://24c9-2403-4800-3530-1a01-3d83-455e-54cf-ab55.ngrok-free.app";

export function useTwilio(identity: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [isIncoming, setIsIncoming] = useState(false);
  const [callStatus, setCallStatus] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [voice] = useState(() => new Voice());
  const [activeCall, setActiveCall] = useState<Call | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        console.log("Fetching token from:", `${API_URL}/accessToken?identity=${identity}`);
        const res = await fetch(`${API_URL}/accessToken?identity=${identity}`);
        console.log("useEffect response:", res);
        if (!res.ok) {
          const text = await res.text();
          console.error("Server response:", text);
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        const { token } = data;
        console.log("Token:", token);

        // Initialize PushKit with proper error handling
        try {
          console.log("Initializing PushKit registry...");
          await voice.initializePushRegistry();
          console.log("PushKit registry initialized successfully");

          // Only proceed with registration if PushKit initialization succeeded
          const regResult = await voice.register(token);
          console.log("Voice registered:", regResult);

          // Rest of your event handlers...
          voice.on("connected", (call: Call) => {
            console.log("✅ Connected call", call);
            setActiveCall(call);
            setIsConnected(true);
            setCallStatus("connected");
          });

          voice.on("disconnected", () => {
            setActiveCall(null);
            setIsConnected(false);
            setIsIncoming(false);
            setCallStatus("disconnected");
            setIsMuted(false);
            setIsSpeakerOn(false);
            setIsOnHold(false);
          });

          voice.on("callInvite", (invite) => {
            console.log("📞 Incoming call invite:", invite);
            setIsIncoming(true);
            setCallStatus("incoming");
          });
        } catch (pushKitError) {
          console.error("PushKit initialization error:", pushKitError);
          // You might want to show an alert to the user here
          // For outgoing calls only, you could potentially continue without PushKit
          // but incoming calls won't work
        }
      } catch (error) {
        console.error("Error setting up Twilio:", error);
      }
    };

    setup();

    return () => {
      voice.unregister();
    };
  }, [identity]);

  const makeCall = async (to: string) => {
    try {
      const res = await fetch(`${API_URL}/accessToken?identity=${identity}`);
      const { token } = await res.json();

      console.log("Initiating call to:", to);
      await voice.connect(token, {
        params: { To: to },
      });
    } catch (error) {
      console.error("Error making call:", error);
    }
  };

  const hangup = async () => {
    try {
      if (activeCall) {
        await activeCall.disconnect();
      }
    } catch (error) {
      console.error("Error hanging up:", error);
    }
  };

  const toggleMute = async () => {
    try {
      if (activeCall) {
        await activeCall.mute(!isMuted);
        setIsMuted(!isMuted);
      }
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  const toggleSpeaker = async () => {
    try {
      if (activeCall) {
        await voice.setAudioDevice(isSpeakerOn ? "earpiece" : "speaker");
        setIsSpeakerOn(!isSpeakerOn);
      }
    } catch (error) {
      console.error("Error toggling speaker:", error);
    }
  };

  const toggleHold = async () => {
    try {
      if (activeCall) {
        if (isOnHold) {
          await activeCall.unhold();
        } else {
          await activeCall.hold();
        }
        setIsOnHold(!isOnHold);
      }
    } catch (error) {
      console.error("Error toggling hold:", error);
    }
  };

  return {
    makeCall,
    hangup,
    toggleMute,
    toggleSpeaker,
    toggleHold,
    isConnected,
    isIncoming,
    callStatus,
    isMuted,
    isSpeakerOn,
    isOnHold,
  };
}
