import { useEffect, useState } from "react";
import { Voice, Call } from "@twilio/voice-react-native-sdk";
import { Platform, Alert } from "react-native";
import { useFeatureFlags } from "../providers/FeatureFlagProvider";

const API_URL = __DEV__
  ? Platform.select({
      ios: process.env.EXPO_PUBLIC_API_URL_DEV_IOS,
      android: process.env.EXPO_PUBLIC_API_URL_DEV_ANDROID,
      default: process.env.EXPO_PUBLIC_API_URL_DEV_IOS,
    })
  : process.env.EXPO_PUBLIC_API_URL_PROD;

export function useTwilio(identity: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [isIncoming, setIsIncoming] = useState(false);
  const [callStatus, setCallStatus] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [voice] = useState(() => new Voice());
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const { flags } = useFeatureFlags();

  useEffect(() => {
    if (!flags.telephony || flags.killSwitch) {
      setCallStatus("disabled");
      setActiveCall(null);
      setIsConnected(false);
      setIsIncoming(false);
      return;
    }

    const setup = async () => {
      try {
        const res = await fetch(`${API_URL}/accessToken?identity=${identity}`);
        if (!res.ok) {
          const text = await res.text();
          console.error("Server response:", text);
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        const { token } = data;

        // Initialize PushKit with proper error handling
        try {
          await voice.initializePushRegistry();

          // Only proceed with registration if PushKit initialization succeeded
          const regResult = await voice.register(token);

          // Rest of your event handlers...
          voice.on("connected", (call: Call) => {
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

          voice.on("callInvite", () => {
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
  }, [identity, flags.telephony, flags.killSwitch]);

  const makeCall = async (to: string) => {
    if (!flags.telephony || flags.killSwitch) {
      Alert.alert("Calls unavailable", flags.safeModeMessage || "Calling is temporarily disabled.");
      return;
    }

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
