export interface Group {
  id: string;
  name: string; // e.g. "3ro A"
  createdAt: string;
}

export interface Student {
  id: string;
  groupId: string;
  name: string;
  lastName: string;
  matricula?: string;
}

export interface Incident {
  id: string;
  studentId: string;
  date: string;
  type: IncidentType;
  customType?: string;
  description: string;
  createdAt: string;
}

export type IncidentType =
  | "falta_respeto"
  | "agresion"
  | "impuntualidad"
  | "dano_materiales"
  | "indisciplina"
  | "otro";

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  falta_respeto: "Falta de respeto",
  agresion: "Agresión",
  impuntualidad: "Impuntualidad",
  dano_materiales: "Daño a materiales",
  indisciplina: "Indisciplina",
  otro: "Otro",
};
