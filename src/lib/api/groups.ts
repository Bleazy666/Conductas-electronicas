import { supabase } from "../supabase";

export async function getGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addGroup(name: string) {
  const { error } = await supabase
    .from("groups")
    .insert([{ name }]);

  if (error) throw error;
}

export async function deleteGroup(id: string) {
  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", id);

  if (error) throw error;
}