// Define generic filter option type
export interface FilterOption {
  id: string;
  label: string;
}

// Define filter configuration
export interface FilterConfig {
  id: string;
  name: string;
  options: FilterOption[];
}

// Predefined filter configurations
export const STATUS_FILTERS: FilterConfig = {
  id: "status",
  name: "Status",
  options: [
    { id: "all", label: "All Jobs" },
    { id: "new", label: "New Inquiries" },
    { id: "contacted", label: "Contacted" },
    { id: "completed", label: "Completed" },
  ],
};

export const JOB_TYPE_FILTERS: FilterConfig = {
  id: "jobType",
  name: "Job Type",
  options: [
    { id: "all", label: "All Types" },
    { id: "plumbing", label: "Plumbing" },
    { id: "electrical", label: "Electrical" },
    { id: "painting", label: "Painting" },
    { id: "carpentry", label: "Carpentry" },
    { id: "cleaning", label: "Cleaning" },
  ],
};

// You can add more filter configurations as needed
