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
  lastFetchedAt: number | null;
  isOffline: boolean;
  fetchInquiries: (force?: boolean) => Promise<void>;
  selectInquiry: (inquiry: CustomerInquiry) => void;
  updateInquiryStatus: (id: string, status: CustomerInquiry["status"]) => Promise<void>;
}

export const useCustomerInquiries = create<CustomerInquiriesState>((set, get) => ({
  inquiries: [],
  selectedInquiry: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,
  isOffline: false,

  fetchInquiries: async (force = false) => {
    const now = Date.now();
    const { lastFetchedAt, inquiries } = get();
    const cacheMs = 30_000;

    if (!force && lastFetchedAt && now - lastFetchedAt < cacheMs && inquiries.length > 0) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const fetchPromise = supabase.functions.invoke<{
        success: boolean;
        data?: CustomerInquiry[];
        error?: string;
      }>("get-inquiries");

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Check your connection and retry.")), 10_000)
      );

      const { data, error } = (await Promise.race([fetchPromise, timeoutPromise])) as Awaited<
        ReturnType<typeof supabase.functions.invoke>
      >;

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to fetch inquiries");

      set({
        inquiries: (data.data as CustomerInquiry[]) || [],
        isLoading: false,
        lastFetchedAt: now,
        isOffline: false,
      });
    } catch (error) {
      const message = (error as Error).message;
      const offline =
        message?.toLowerCase().includes("network") ||
        message?.toLowerCase().includes("fetch") ||
        message?.toLowerCase().includes("timed out");
      set({ error: message, isLoading: false, isOffline: offline });
    }
  },

  selectInquiry: (inquiry) => {
    set({ selectedInquiry: inquiry });
  },

  updateInquiryStatus: async (id, status) => {
    const previousInquiries = get().inquiries;
    const previousSelected = get().selectedInquiry;

    // Optimistically update UI
    const optimistic = previousInquiries.map((inquiry) =>
      inquiry.id === id ? { ...inquiry, status, updated_at: new Date().toISOString() } : inquiry
    );
    set({
      isLoading: true,
      error: null,
      inquiries: optimistic,
      selectedInquiry: previousSelected && previousSelected.id === id ? { ...previousSelected, status } : previousSelected,
    });

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

      set({
        inquiries,
        isLoading: false,
        selectedInquiry: get().selectedInquiry?.id === id ? (data as CustomerInquiry) : get().selectedInquiry,
      });
    } catch (error) {
      // Roll back optimistic update on error
      set({
        error: (error as Error).message,
        isLoading: false,
        inquiries: previousInquiries,
        selectedInquiry: previousSelected,
      });
    }
  },
}));
