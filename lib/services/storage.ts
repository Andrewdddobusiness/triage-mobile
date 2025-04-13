import { supabase } from "~/lib/supabase";

export async function getCityImage(country: string, city: string): Promise<string | null> {
  try {
    // Format the bucket path: convert to lowercase and replace spaces with hyphens
    const bucketPath = `${country.toLowerCase()}-${city.toLowerCase()}`.replace(/\s+/g, "-");

    // Try common image extensions for the first image (1.*)
    const extensions = ["jpg"];

    for (const ext of extensions) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("cities").getPublicUrl(`${bucketPath}/1.${ext}`);

      // Try to fetch the image to see if it exists
      try {
        const response = await fetch(publicUrl, { method: "HEAD" });
        if (response.ok) {
          return publicUrl;
        }
      } catch (e) {
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching city image:", error);
    return null;
  }
}
