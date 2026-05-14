import { supabase } from "../supabase";

export async function getIncidents() {
  const { data, error } = await supabase
    .from("incidents")
    .select(`
      *,
      students(
        name,
        last_name,
        groups(name)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}