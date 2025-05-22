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
  serviceArea: string;
}

export interface OnboardingFormErrors {
  businessName: string;
  ownerName: string;
  businessEmail: string;
  specialty: string;
  servicesOffered: string;
  serviceArea: string;
}
