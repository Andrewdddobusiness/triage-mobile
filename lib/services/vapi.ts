import { supabase } from "../supabase";

export async function importTwilioNumberToVapi({
  twilioPhoneNumber,
  twilioAccountSid,
  twilioAuthToken,
  assistantId,
  vapiApiKey,
}: {
  twilioPhoneNumber: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  assistantId: string;
  vapiApiKey: string;
}) {
  try {
    // Make the API call to Vapi to import the Twilio number
    const response = await fetch("https://api.vapi.ai/phone-number", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vapiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: "twilio",
        number: twilioPhoneNumber,
        twilioAccountSid: twilioAccountSid,
        twilioAuthToken: twilioAuthToken,
        assistantId: assistantId,
        numberE164CheckEnabled: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to import number: ${response.statusText}`);
    }

    const data = await response.json();

    // Update the Supabase twilio_phone_numbers table
    const { error } = await supabase
      .from("twilio_phone_numbers")
      .update({
        vapi_phone_number_id: data.id,
        vapi_status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("phone_number", twilioPhoneNumber);

    if (error) {
      throw new Error(`Failed to update Supabase: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error importing phone number:", error);
    throw error;
  }
}
