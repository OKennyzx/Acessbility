export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    console.error("Erro na API:", e);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
 } const apiSecret = process.env.API_SECRET;

export default function handler(req, res) {
  res.status(200).json({
    message: 'Variável capturada com sucesso!',
    secret: apiSecret // apenas para testes! (remova em produção)
  });
}

