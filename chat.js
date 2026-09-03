// MediKiosk backend proxy — deploy this on Vercel (or any Node host).
// It holds your Anthropic API key server-side so the app on people's
// phones/laptops never needs to know it.

module.exports = async (req, res) => {
  // Allow the static app (on any device/browser) to call this endpoint.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  try {
    const { system, messages } = req.body || {};
    if (!process.env.ANTHROPIC_API_KEY) {
      res.status(500).json({ error: { message: "ANTHROPIC_API_KEY is not configured on the server." } });
      return;
    }
    if (!system || !Array.isArray(messages)) {
      res.status(400).json({ error: { message: "Request must include system and messages." } });
      return;
    }
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY, // set this in Vercel's dashboard, never in code
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1400,
        system,
        messages,
      }),
    });
    const data = await apiRes.json();
    res.status(apiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};
