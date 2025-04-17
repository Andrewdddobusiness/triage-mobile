declare module "react-native-twilio-programmable-voice" {
  type EventType = "deviceDidReceiveIncoming" | "connectionDidConnect" | "connectionDidDisconnect" | "callStateUpdated";

  interface ConnectParams {
    To: string;
  }

  const TwilioVoice: {
    initWithToken: (token: string) => Promise<void>;
    connect: (params: ConnectParams) => Promise<void>;
    disconnect: () => Promise<void>;
    accept: () => Promise<void>;
    reject: () => Promise<void>;
    muteCall: () => Promise<void>;
    unmuteCall: () => Promise<void>;
    setSpeakerPhone: (enabled: boolean) => Promise<void>;
    hold: () => Promise<void>;
    unhold: () => Promise<void>;
    addEventListener: (event: EventType, listener: (data?: any) => void) => void;
    removeEventListener: (event: EventType) => void;
  };

  export default TwilioVoice;
}
