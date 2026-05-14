import express from "express";
import cors from "cors";
import pool from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

/* ===== ALUMNOS ===== */

// crear alumno
app.post("/api/alumnos", async (req, res) => {
  try {
    const { nombre, apellidos, matricula } = req.body;

    const result = await pool.query(
      "INSERT INTO alumnos(nombre, apellidos, matricula) VALUES($1,$2,$3) RETURNING *",
      [nombre, apellidos, matricula]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

// obtener alumnos
app.get("/api/alumnos", async (req, res) => {
  const result = await pool.query("SELECT * FROM alumnos");
  res.json(result.rows);
});

// eliminar alumno
app.delete("/api/alumnos/:id", async (req, res) => {
  await pool.query("DELETE FROM alumnos WHERE id = $1", [req.params.id]);
  res.send("Eliminado");
});

// actualizar alumno
app.put("/api/alumnos/:id", async (req, res) => {
  const { nombre, apellidos, matricula } = req.body;

  await pool.query(
    "UPDATE alumnos SET nombre=$1, apellidos=$2, matricula=$3 WHERE id=$4",
    [nombre, apellidos, matricula, req.params.id]
  );

  res.send("Actualizado");
});

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});