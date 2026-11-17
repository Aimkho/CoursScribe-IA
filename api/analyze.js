// Proxy serveur : la clé OpenAI reste dans les variables d'environnement Vercel.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: { message: 'Méthode non autorisée' } });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: { message: 'OPENAI_API_KEY non configurée sur Vercel.' } });
  const code = process.env.ACCESS_CODE;
  if (code && req.headers['x-access-code'] !== code) return res.status(401).json({ error: { message: 'Code d’accès invalide.' } });
  const { model, messages } = req.body || {};
  if (!['gpt-4o-mini', 'gpt-4o'].includes(model) || !Array.isArray(messages) || JSON.stringify(messages).length > 200000)
    return res.status(400).json({ error: { message: 'Requête invalide.' } });
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ model, messages, temperature: 0.2 })
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(502).json({ error: { message: 'OpenAI injoignable : ' + e.message } });
  }
};
