export interface Itinerary {
  itinerary_id: number;
  title?: string; // We'll construct this from the destinations
  imageUrl?: string | null; // We'll get this from the first destination's city
  startDate?: string; // From first destination's from_date
  endDate?: string; // From last destination's to_date
  destinations: {
    city: string;
    country: string;
    from_date: string;
    to_date: string;
  }[];
}
