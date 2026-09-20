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

/*
========================================
FUNCIÓN: SUGERENCIA DE DESCRIPCIÓN
========================================
*/
app.post("/api/ai/sugerir-descripcion", async (req, res) => {
  try {
    const {
      tipo,
      motivo,
      descripcion,
    } = req.body;

    if (!tipo && !motivo && !descripcion) {
      return res.status(400).json({
        error: "No se recibió información suficiente para generar una sugerencia.",
      });
    }

    const prompt = `
Eres un asistente para un sistema escolar de registro de incidencias.

Tu tarea es mejorar la descripción de una incidencia escolar.

REGLAS OBLIGATORIAS:
- Corrige errores de ortografía y gramática.
- Mejora la claridad y formalidad del texto.
- Conserva exactamente el significado de la información proporcionada.
- NO inventes hechos.
- NO inventes nombres.
- NO inventes fechas.
- NO inventes lugares.
- NO inventes acciones que no estén mencionadas.
- NO agregues información que no aparezca en los datos proporcionados.
- NO hagas diagnósticos ni suposiciones sobre el alumno.
- No repitas innecesariamente información que ya pertenece a otros campos del formulario.
- La descripción debe centrarse únicamente en lo ocurrido según la información proporcionada.
- Si la descripción ya está correctamente redactada, puedes devolver una versión equivalente con mejoras mínimas.
- Devuelve únicamente la descripción sugerida, sin explicaciones adicionales.

Datos disponibles:

Tipo de incidencia:
${tipo || "No especificado"}

Motivo:
${motivo || "No especificado"}

Descripción original:
${descripcion || "No se proporcionó una descripción."}
`;

    const response = await client.responses.create({
      model: "gpt-5.6",
      input: prompt,
    });

    res.json({
      sugerencia: response.output_text.trim(),
    });

  } catch (error) {
    console.error("Error de OpenAI:", error);

    res.status(500).json({
      error: "Error al generar la sugerencia con OpenAI.",
    });
  }
});


/*
========================================
RUTA DE PRUEBA GENERAL
========================================
*/
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