import { create } from "zustand";
import { supabase } from "~/lib/supabase";

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
      const { data, error } = await supabase.functions.invoke<{
        success: boolean;
        data?: CustomerInquiry[];
        error?: string;
      }>("get-inquiries");

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to fetch inquiries");

      set({ inquiries: (data.data as CustomerInquiry[]) || [], isLoading: false });
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
