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
