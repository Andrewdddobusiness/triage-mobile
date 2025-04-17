declare module "@twilio/voice-react-native-sdk" {
  export interface CallInvite {
    accept(): Promise<void>;
    reject(): Promise<void>;
  }

  export interface Call {
    disconnect(): Promise<void>;
    mute(shouldMute: boolean): Promise<void>;
    hold(): Promise<void>;
    unhold(): Promise<void>;
  }

  export type AudioDevice = "earpiece" | "speaker";

  export class Voice {
    register(token: string): Promise<void>;
    unregister(): Promise<void>;
    connect(token: string, options: { params: { To: string } }): Promise<Call>;
    setAudioDevice(device: AudioDevice): Promise<void>;
    on(event: "callInvite", listener: (callInvite: CallInvite) => void): void;
    on(event: "connected", listener: (call: Call) => void): void;
    on(event: "disconnected", listener: () => void): void;
  }
}
