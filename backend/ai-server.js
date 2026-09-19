import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/ai", async (req, res) => {
  try {
    const { mensaje } = req.body;

    if (!mensaje) {
      return res.status(400).json({
        error: "No se recibió ningún mensaje",
      });
    }

    const response = await client.responses.create({
      model: "gpt-5.6",
      input: mensaje,
    });

    res.json({
      respuesta: response.output_text,
    });
  } catch (error) {
    console.error("Error de OpenAI:", error);

    res.status(500).json({
      error: "Error al comunicarse con OpenAI",
    });
  }
});

app.listen(3001, () => {
  console.log("Servidor de IA funcionando en http://localhost:3001");
});