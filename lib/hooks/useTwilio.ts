import { useEffect, useState } from "react";
import { Voice, Call } from "@twilio/voice-react-native-sdk";
import { Platform } from "react-native";

const API_URL = __DEV__
  ? Platform.select({
      ios: "https://328c-58-107-53-183.ngrok-free.app",
      android: "http://10.0.2.2:3001",
      default: "https://328c-58-107-53-183.ngrok-free.app",
    })
  : "your_production_api_url_here";

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
        const res = await fetch(`${API_URL}/accessToken?identity=${identity}`);
        const { token } = await res.json();

        await voice.register(token);

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
