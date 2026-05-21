import { supabase } from "./supabase";

export const generateBackup = async () => {
  try {
    const tables = [
      "groups",
      "students",
      "incidents",
      "activity_logs",
    ];

    let sql = "";

    sql += "-- =====================================\n";
    sql += "-- BACKUP SISTEMA ESCOLAR\n";
    sql += `-- FECHA: ${new Date().toISOString()}\n`;
    sql += "-- =====================================\n\n";

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("*");

      if (error) {
        console.error(error);
        continue;
      }

      sql += `\n-- TABLA: ${table}\n\n`;

      for (const row of data) {
        const columns = Object.keys(row)
          .map((c) => `"${c}"`)
          .join(", ");

        const values = Object.values(row)
          .map((v) => {
            if (v === null) return "NULL";

            return `'${String(v)
              .replace(/'/g, "''")}'`;
          })
          .join(", ");

        sql += `INSERT INTO "${table}" (${columns}) VALUES (${values});\n`;
      }

      sql += "\n";
    }

    const blob = new Blob([sql], {
      type: "application/sql",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = `backup_${new Date()
      .toISOString()
      .split("T")[0]}.sql`;

    a.click();

    URL.revokeObjectURL(url);

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};