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
    const apiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, // set this in Vercel's dashboard, never in code
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        max_tokens: 1000,
        messages: [
          { role: "system", content: system },
          ...messages,
        ],
      }),
    });
    const data = await apiRes.json();
    // Groq returns { choices: [{ message: { content: "..." } }] }
    const content = data.choices?.[0]?.message?.content || "";
    res.status(apiRes.status).json({ 
      content: [{ type: "text", text: content }],
      error: data.error || null 
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};
