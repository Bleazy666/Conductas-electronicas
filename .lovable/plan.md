

## Sistema de Gestión de Incidencias Escolares

### Descripción General
Aplicación web donde maestros y directivos pueden registrar y dar seguimiento a incidencias de conducta de alumnos, con la posibilidad de importar listas desde Excel o CSV. Los datos se almacenan localmente en el navegador.

---

### Páginas y Funcionalidades

#### 1. Pantalla Principal / Dashboard
- Vista general con resumen: total de alumnos, incidencias recientes, alumnos con más incidencias
- Acceso rápido a registrar incidencia o importar lista
- Filtro por grupo/grado

#### 2. Gestión de Grupos y Alumnos
- Crear grupos (ej: "3ro A", "5to B")
- **Importar lista de alumnos** desde archivo Excel (.xlsx) o CSV
  - El sistema detecta columnas automáticamente (nombre, apellido, matrícula, etc.)
  - Vista previa antes de confirmar la importación
- Ver lista de alumnos por grupo
- Agregar/editar alumnos manualmente

#### 3. Registro de Incidencias
- Seleccionar alumno (con buscador)
- Fecha de la incidencia
- Tipo de incidencia (categorías predefinidas: falta de respeto, agresión, impuntualidad, daño a materiales, etc. + opción personalizada)
- Descripción libre del incidente
- Registro rápido desde la lista de alumnos

#### 4. Historial de Incidencias por Alumno
- Ver todas las incidencias de un alumno en orden cronológico
- Indicador visual de frecuencia (alumno con muchas incidencias resaltado)
- Posibilidad de editar o eliminar incidencias

#### 5. Reportes y Exportación
- Reporte por grupo: tabla con alumnos y cantidad de incidencias
- Reporte por alumno: historial detallado
- **Exportar reportes a PDF** para impresión o envío

---

### Diseño y Experiencia
- Interfaz limpia y sencilla, fácil de usar en computadora y tablet
- Colores institucionales (tonos azules y grises, profesional)
- Navegación con menú lateral
- Almacenamiento local (localStorage) — los datos permanecen en el navegador del dispositivo

