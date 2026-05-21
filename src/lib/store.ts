import { supabase } from "./supabase";

export interface ActivityLog {
  id: string;
  action:string;
  entity_type: string;
  entity_id?: string;
  description: string;
  created_at?: string;
}

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

  //Obtener gupo antes de aliminarlo para el log
  const {data: group} = await supabase
  .from("groups")
  .select("name")
  .eq("id", id)
  .single();

  //Soft delete
  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", id);

  if (error) throw error;

  //Mandar el registro al log
  await addLog(
    "DELETE_GROUP",
    "group", 
    id,
    `Se eliminó el grupo ${group?.name}`
  );
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

export const getAllStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase
  .from("students")
  .select("*");

  if(error) {
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

  // Obtener alumno antes de eliminarlo para el log
  const {data: student } = await supabase
    .from("students")
    .select(`
      name,
      last_name,
      groups(name)
      `)
      .eq("id", id)
      .single();

  const { error } = await supabase
    .from("students")
    .update({ active: false })
    .eq("id", id);

  if (error) throw error;

  //Mandar el registro al log
  await addLog(
    "DELETE_STUDENT",
    "student",
    id,
    `Se elimninó el alumno ${student?.name} ${student?.last_name} del grupo 
    ${(student?.groups as any)?.name || "Sin grupo"
    }`
  );
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
    .select()
    .single();

  if (error) throw error;

  // Obtener alumno
  const { data: student } = await supabase
    .from("students")
    .select(`
      name,
      last_name,
      groups(name)
    `)
    .eq("id", student_id)
    .single();

  // Tipo legible
  const incidentType =
    type === "otro"
      ? custom_type
      : type;

  // Registrar log
  await addLog(
    "CREATE",
    "incident",
    data.id,
    `Se registró incidencia "${incidentType}" al alumno ${student?.name} ${student?.last_name}`
  );

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

/** =========================
 *  ACTIVITY LOG
========================= */

export const addLog = async (
  action: string,
  entity_type: string,
  entity_id: string,
  description: string
) => {
  const { error } = await supabase
  .from("activity_logs")
  .insert([
    {
      action,
      entity_type,
      entity_id,
      description,
    },
  ]);
  if (error) {
    console.log("LOG Error", error);
    console.log("LOG OK")
  }
};