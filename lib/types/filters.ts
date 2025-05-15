// Define generic filter option type
export interface IFilterOption {
  id: string;
  label: string;
}

// Define filter configuration
export interface IFilterConfig {
  id: string;
  name: string;
  options: IFilterOption[];
}

// Predefined filter configurations
export const STATUS_FILTERS: IFilterConfig = {
  id: "status",
  name: "Status",
  options: [
    { id: "all", label: "All Statuses" },
    { id: "new", label: "New Inquiries" },
    { id: "contacted", label: "Contacted" },
    { id: "completed", label: "Completed" },
  ],
};

export const JOB_TYPE_FILTERS: IFilterConfig = {
  id: "jobType",
  name: "Job Type",
  options: [
    { id: "all", label: "All Types" },
    { id: "plumbing", label: "Plumbing" },
    { id: "electrical", label: "Electrical" },
    { id: "painting", label: "Painting" },
    { id: "carpentry", label: "Carpentry" },
    { id: "cleaning", label: "Cleaning" },
    { id: "other", label: "Other" },
  ],
};

// You can add more filter configurations as needed
