import { supabase } from "~/lib/supabase";

/**
 * Service for handling service provider-related data operations
 */
export const serviceProviderService = {
  /**
   * Checks if a user has completed onboarding
   * @param authUserId The auth user ID to check
   * @returns Boolean indicating if onboarding is completed
   */
  async isOnboardingCompleted(authUserId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("service_providers")
        .select("onboarding_status")
        .eq("auth_user_id", authUserId)
        .single();

      if (error) {
        console.error("Error checking onboarding status:", error);
        return false;
      }

      return data?.onboarding_status === "completed";
    } catch (error) {
      console.error("Unexpected error checking onboarding status:", error);
      return false;
    }
  },

  /**
   * Creates a new service provider record for a user
   * @param authUserId The auth user ID to create a record for
   * @returns The ID of the created service provider
   */
  async createServiceProvider(authUserId: string): Promise<string | null> {
    try {
      // Check if a record already exists
      const { data: existingData } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", authUserId)
        .single();

      if (existingData) {
        return existingData.id;
      }

      // Create a new record
      const { data, error } = await supabase
        .from("service_providers")
        .insert([{ auth_user_id: authUserId }])
        .select()
        .single();

      if (error) {
        console.error("Error creating service provider:", error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error("Unexpected error creating service provider:", error);
      return null;
    }
  },

  /**
   * Completes the onboarding process for a service provider
   * @param authUserId The auth user ID
   * @param businessName The business name
   * @param ownerName The owner name
   * @param businessEmail The business email
   * @returns Boolean indicating if the update was successful
   */
  async completeOnboarding(
    authUserId: string,
    businessName: string,
    ownerName: string,
    businessEmail: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("service_providers")
        .update({
          business_name: businessName,
          owner_name: ownerName,
          business_email: [businessEmail], // Convert string to array
          onboarding_status: "completed",
        })
        .eq("auth_user_id", authUserId);

      if (error) {
        console.error("Error completing onboarding:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Unexpected error completing onboarding:", error);
      return false;
    }
  },
};
