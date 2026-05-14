import { supabase } from "../supabase";

export async function getStudents() {
  const { data, error } = await supabase
    .from("students")
    .select(`
      *,
      groups(name)
    `);

  if (error) throw error;
  return data;
}

export async function addStudent(student: any) {
  const { error } = await supabase
    .from("students")
    .insert([student]);

  if (error) throw error;
}