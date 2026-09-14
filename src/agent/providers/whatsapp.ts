export async function sendWhatsAppMessage(phoneNumber: string, text: string) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn("[WhatsApp Provider] Missing token or phoneNumberId. Mocking send:", { phoneNumber, text });
    return;
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "text",
      text: {
        body: text
      }
    })
  });

  if (!response.ok) {
    console.error("[WhatsApp Provider] Error sending message:", await response.text());
  }
}
