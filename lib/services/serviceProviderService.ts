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
  async completeOnboardingWithDetails(
    authUserId: string,
    businessName: string,
    ownerName: string,
    businessEmail: string,
    specialty: string[],
    servicesOffered: string[],
    serviceArea: string
  ): Promise<boolean> {
    try {
      // Get the service provider record
      const { data: serviceProvider, error: spError } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", authUserId)
        .single();

      if (spError) throw spError;

      // Update the service provider with all the details
      const { error: updateError } = await supabase
        .from("service_providers")
        .update({
          business_name: businessName,
          owner_name: ownerName,
          business_email: businessEmail ? [businessEmail] : null,
          specialty: specialty,
          services_offered: servicesOffered,
          service_area: serviceArea,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("id", serviceProvider.id);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error("Error completing onboarding:", error);
      return false;
    }
  },
};
