import { supabase } from "~/lib/supabase";

/**
 * Service for handling user-related data operations
 */
export const userService = {
  /**
   * Fetches the business email for a user from the service_providers table
   * @param userId The ID of the user to fetch the business email for
   * @returns The business email if found, otherwise null
   */
  async getBusinessEmail(userId: string): Promise<string | null> {
    try {
      // Fetch the service provider data for the user
      const { data, error } = await supabase
        .from("service_providers")
        .select("business_email")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching business email:", error);
        return null;
      }

      // Return the business email if it exists
      if (data && data.business_email) {
        return data.business_email;
      }

      return null;
    } catch (error) {
      console.error("Unexpected error fetching business email:", error);
      return null;
    }
  },

  /**
   * Gets the user's profile information including name from service_providers table
   * @param userId The ID of the user to fetch the profile for
   * @returns An object containing the user's profile information
   */
  async getUserProfile(userId: string): Promise<{ name: string }> {
    try {
      // Get owner_name from service_providers table
      const { data, error } = await supabase
        .from("service_providers")
        .select("owner_name")
        .eq("auth_user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return { name: "User" };
      }

      // Use the owner_name from service_providers or default to "User"
      const name = data?.owner_name || "User";
      return { name };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return { name: "User" };
    }
  },
};
