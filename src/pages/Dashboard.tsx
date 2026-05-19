import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users, AlertTriangle, TrendingUp, Plus, Upload } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { supabase } from "@/lib/supabase";
import { INCIDENT_TYPE_LABELS } from "@/types";

export default function Dashboard() {
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "groups" },
        loadData
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        loadData
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        loadData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadData() {
    setLoading(true);

    const [{ data: groupsData }, { data: studentsData }, { data: incidentsData }] =
      await Promise.all([
        supabase.from("groups").select("*"),
        supabase.from("students").select("*"),
        supabase.from("incidents").select("*"),
      ]);

    setGroups(groupsData || []);
    setStudents(studentsData || []);
    setIncidents(incidentsData || []);
    setLoading(false);
  }

  const recentIncidents = useMemo(() => {
    return [...incidents]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
      .slice(0, 5);
  }, [incidents]);

  const topStudents = useMemo(() => {
    const counts: Record<string, number> = {};

    incidents.forEach((i) => {
      counts[i.student_id] = (counts[i.student_id] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => Number(b) - Number(a))
      .slice(0, 5)
      .map(([id, count]) => {
        const student = students.find((s) => s.id === id);
        const group = groups.find((g) => g.id === student?.group_id);

        return {
          student,
          group,
          count,
        };
      });
  }, [incidents, students, groups]);

  const incidentsThisMonth = useMemo(() => {
    const now = new Date();

    return incidents.filter((i) => {
      const d = new Date(i.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [incidents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Resumen general del sistema
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link to="/incidencias?new=1">
              <Plus className="h-4 w-4 mr-1" />
              Nueva Incidencia
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link to="/grupos?import=1">
              <Upload className="h-4 w-4 mr-1" />
              Importar Lista
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Grupos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : groups.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alumnos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : students.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Incidencias</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : incidents.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Este mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : incidentsThisMonth}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Incidencias Recientes
            </CardTitle>
          </CardHeader>

          <CardContent>
            {recentIncidents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay incidencias registradas.
              </p>
            ) : (
              <div className="space-y-3">
                {recentIncidents.map((inc) => {
                  const student = students.find(
                    (s) => s.id === inc.student_id
                  );

                  return (
                    <div
                      key={inc.id}
                      className="flex items-start justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {student
                            ? `${student.name} ${student.last_name}`
                            : "Desconocido"}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {inc.type === "otro"
                            ? inc.custom_type || "Otro"
                            : INCIDENT_TYPE_LABELS[inc.type]}
                          {" · "}
                          {inc.date}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Students */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Alumnos con Más Incidencias
            </CardTitle>
          </CardHeader>

          <CardContent>
            {topStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay datos aún.
              </p>
            ) : (
              <div className="space-y-3">
                {topStudents.map(({ student, group, count }) => (
                  <div
                    key={student?.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {student
                          ? `${student.name} ${student.last_name}`
                          : "—"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {group?.name || "Sin grupo"}
                      </p>
                    </div>

                    <span
                      className={`text-sm font-bold ${
                        Number(count) >= 5
                          ? "text-destructive"
                          : Number(count) >= 3
                          ? "text-orange-600"
                          : "text-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}