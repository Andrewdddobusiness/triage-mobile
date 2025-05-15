import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!);

export default interface CustomerInquiry {
  job_type: string;
  id: string;
  name: string;
  phone: string;
  email: string | null;
  inquiry_date: string;
  preferred_service_date: string | null;
  estimated_completion: string | null;
  budget: number | null;
  job_description: string | null;
  call_sid: string | null;
  location: string | null;
  status: "new" | "contacted" | "scheduled" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

interface CustomerInquiriesState {
  inquiries: CustomerInquiry[];
  selectedInquiry: CustomerInquiry | null;
  isLoading: boolean;
  error: string | null;
  fetchInquiries: (userId?: string) => Promise<void>;
  selectInquiry: (inquiry: CustomerInquiry) => void;
  updateInquiryStatus: (id: string, status: CustomerInquiry["status"]) => Promise<void>;
}

export const useCustomerInquiries = create<CustomerInquiriesState>((set, get) => ({
  inquiries: [],
  selectedInquiry: null,
  isLoading: false,
  error: null,

  fetchInquiries: async (userId?: string) => {
    set({ isLoading: true, error: null });
    try {
      // If no userId is provided, return empty array
      if (!userId) {
        set({ inquiries: [], isLoading: false });
        return;
      }

      // 1. First get the service provider record for this user
      const { data: serviceProvider, error: spError } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", userId)
        .single();

      if (spError) throw spError;

      // 2. Get all assistants for this service provider
      const { data: assistants, error: assistantsError } = await supabase
        .from("service_provider_assistants")
        .select("assistant_id")
        .eq("service_provider_id", serviceProvider.id);

      if (assistantsError) throw assistantsError;

      // If no assistants found, return empty array
      if (!assistants || assistants.length === 0) {
        set({ inquiries: [], isLoading: false });
        return;
      }

      // 3. Extract assistant IDs
      const assistantIds = assistants.map((a) => a.assistant_id);

      // 4. Fetch inquiries that match these assistant IDs
      const { data, error } = await supabase
        .from("customer_inquiries")
        .select("*")
        .in("assistant_id", assistantIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ inquiries: data as CustomerInquiry[], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectInquiry: (inquiry) => {
    set({ selectedInquiry: inquiry });
  },

  updateInquiryStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("customer_inquiries")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update the inquiries list with the updated inquiry
      const inquiries = get().inquiries.map((inquiry) => (inquiry.id === id ? (data as CustomerInquiry) : inquiry));

      set({ inquiries, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
