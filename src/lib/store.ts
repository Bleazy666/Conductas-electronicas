import { supabase } from "./supabase";

export interface Group {
  id: string;
  name: string;
  created_at?: string;
}

export interface Student {
  id: string;
  group_id: string;
  name: string;
  last_name: string;
  matricula: string;
}

export interface Incident {
  id: string;
  student_id: string;
  date: string;
  type: string;
  custom_type?: string;
  description?: string;
  created_at?: string;
}

/* =========================
   GROUPS
========================= */

export const getGroups = async (): Promise<Group[]> => {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
};

export const addGroup = async (name: string) => {
  const { data, error } = await supabase
    .from("groups")
    .insert([{ name }])
    .select();

  if (error) throw error;

  return data;
};

export const updateGroup = async (
  id: string,
  name: string
) => {
  const { data, error } = await supabase
    .from("groups")
    .update({ name })
    .eq("id", id)
    .select();

  if (error) throw error;

  return data;
};

export const deleteGroup = async (id: string) => {
  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

/* =========================
   STUDENTS
========================= */

export const getStudents = async (
  groupId?: string
): Promise<Student[]> => {
  let query = supabase
  .from("students")
  .select("*")
  .eq("active", true);

  if (groupId) {
    query = query.eq("group_id", groupId);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
};

export const addStudent = async (
  group_id: string,
  name: string,
  last_name: string,
  matricula: string
) => {
  const { data, error } = await supabase
    .from("students")
    .insert([
      {
        group_id,
        name,
        last_name,
        matricula,
      },
    ])
    .select();

  if (error) throw error;

  return data;
};

export const addStudents = async (
  students: {
    group_id: string;
    name: string;
    last_name: string;
    matricula: string;
  }[]
) => {
  const { data, error } = await supabase
    .from("students")
    .insert(students)
    .select();

  if (error) throw error;

  return data;
};

export const updateStudent = async (
  id: string,
  data: {
    name: string;
    last_name: string;
    matricula: string;
  }
) => {
  const { data: updatedData, error } = await supabase
    .from("students")
    .update({
      name: data.name,
      last_name: data.last_name,
      matricula: data.matricula,
    })
    .eq("id", id)
    .select();

  if (error) throw error;

  return updatedData;
};

export const deleteStudent = async (id: string) => {
  const { error } = await supabase
    .from("students")
    .update({ active: false })
    .eq("id", id);

  if (error) throw error;
};






/* =========================
   INCIDENTS
========================= */

export const getIncidents = async (): Promise<Incident[]> => {
  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
};

export const addIncident = async (
  student_id: string,
  date: string,
  type: string,
  custom_type: string,
  description: string
) => {
  const { data, error } = await supabase
    .from("incidents")
    .insert([
      {
        student_id,
        date,
        type,
        custom_type,
        description,
      },
    ])
    .select();

  if (error) throw error;

  return data;
};

export const updateIncident = async (
  id: string,
  data: {
    student_id: string;
    date: string;
    type: string;
    custom_type?: string;
    description?: string;
  }
) => {
  const { data: updatedData, error } = await supabase
    .from("incidents")
    .update({
      student_id: data.student_id,
      date: data.date,
      type: data.type,
      custom_type: data.custom_type,
      description: data.description,
    })
    .eq("id", id)
    .select();

  if (error) throw error;

  return updatedData;
};

export const deleteIncident = async (id: string) => {
  const { error } = await supabase
    .from("incidents")
    .delete()
    .eq("id", id);

  if (error) throw error;
};