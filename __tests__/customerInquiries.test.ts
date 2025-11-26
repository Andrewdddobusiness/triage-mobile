import { useCustomerInquiries } from "../stores/customerInquiries";
import { supabase } from "~/lib/supabase";

jest.mock("~/lib/supabase", () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
    from: jest.fn(),
  },
}));

const baseInquiry = {
  id: "1",
  name: "Test Customer",
  job_type: "plumbing",
  status: "new" as const,
  inquiry_date: "2024-01-01",
  preferred_service_date: null,
  estimated_completion: null,
  budget: null,
  phone: "0400000000",
  email: null,
  job_description: null,
  call_sid: null,
  location: null,
  created_at: "",
  updated_at: "",
};

describe("useCustomerInquiries store", () => {
  afterEach(() => {
    useCustomerInquiries.setState({
      inquiries: [],
      selectedInquiry: null,
      isLoading: false,
      error: null,
      lastFetchedAt: null,
      isOffline: false,
    });
    jest.clearAllMocks();
  });

  it("fetches inquiries successfully and caches state", async () => {
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: { success: true, data: [baseInquiry] },
      error: null,
    });

    await useCustomerInquiries.getState().fetchInquiries(true);

    const state = useCustomerInquiries.getState();
    expect(state.inquiries).toHaveLength(1);
    expect(state.error).toBeNull();
    expect(state.isOffline).toBe(false);
  });

  it("marks offline on network failure", async () => {
    (supabase.functions.invoke as jest.Mock).mockRejectedValue(new Error("Network error"));

    await useCustomerInquiries.getState().fetchInquiries(true);

    const state = useCustomerInquiries.getState();
    expect(state.isOffline).toBe(true);
    expect(state.error).toContain("Network error");
  });
});
