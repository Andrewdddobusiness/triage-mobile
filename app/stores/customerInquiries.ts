import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!);

export interface CustomerInquiry {
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
  status: "new" | "contacted" | "scheduled" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

interface CustomerInquiriesState {
  inquiries: CustomerInquiry[];
  selectedInquiry: CustomerInquiry | null;
  isLoading: boolean;
  error: string | null;
  fetchInquiries: () => Promise<void>;
  selectInquiry: (inquiry: CustomerInquiry) => void;
  updateInquiryStatus: (id: string, status: CustomerInquiry["status"]) => Promise<void>;
}

export const useCustomerInquiries = create<CustomerInquiriesState>((set, get) => ({
  inquiries: [],
  selectedInquiry: null,
  isLoading: false,
  error: null,

  fetchInquiries: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("customer_inquiries")
        .select("*")
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
