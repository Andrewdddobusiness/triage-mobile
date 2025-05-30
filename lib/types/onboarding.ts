export interface OnboardingStepConfig {
  label: string;
  field: keyof OnboardingFormData;
  description: string;
}

export interface OnboardingFormData {
  businessName: string;
  ownerName: string;
  businessEmail: string;
  specialty: string[];
  servicesOffered: string[];
  serviceArea: string[];
}

export interface OnboardingFormErrors {
  businessName: string;
  ownerName: string;
  businessEmail: string;
  specialty: string;
  servicesOffered: string;
  serviceArea: string;
}

export interface AISecretaryOnboardingData {
  assistantPresetId: string;
  assistantName: string;
  customGreeting: string;
  twilioPhoneNumber: string;
}

export interface AssistantPreset {
  assistant_id: any;
  avatar_url: string | undefined;
  id: string;
  name: string;
  description: string;
  voicePreviewUrl: string;
  avatarUrl: string;
  defaultGreeting: string;
}
