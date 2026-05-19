import { useState, useMemo, useEffect } from "react";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { INCIDENT_TYPE_LABELS } from "@/types";
import { 
  getGroups, 
  getStudents,
  getAllStudents,
  getIncidents } from "@/lib/store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);

  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const g = await getGroups();
    const s = await getAllStudents();
    const i = await getIncidents();

    setGroups(Array.isArray(g) ? g : []);
    setStudents(Array.isArray(s) ? s : []);
    setIncidents(Array.isArray(i) ? i : []);
  };

  const groupReport = useMemo(() => {
    const filtered =
      selectedGroup === "all"
        ? students
        : students.filter((s) => s.group_id === selectedGroup);

    return filtered
      .map((student) => {
        const count = incidents.filter(
          (inc) => inc.student_id === student.id
        ).length;

        const group = groups.find(
          (g) => g.id === student.group_id
        );

        return {
          student,
          group,
          count,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [selectedGroup, students, incidents, groups]);

  const studentIncidents = useMemo(() => {
    if (selectedStudent === "all") return [];

    return incidents
      .filter((i) => i.student_id === selectedStudent)
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );
  }, [selectedStudent, incidents]);

  const selectedStudentData = students.find(
    (s) => s.id === selectedStudent
  );

  const exportGroupPDF = () => {
    const doc = new jsPDF();

    const groupName =
      selectedGroup === "all"
        ? "Todos"
        : groups.find((g) => g.id === selectedGroup)?.name || "";

    doc.setFontSize(16);
    doc.text(`Reporte por Grupo - ${groupName}`, 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Alumno", "Grupo", "Incidencias"]],
      body: groupReport.map((r) => [
        `${r.student.name} ${r.student.last_name}`,
        r.group?.name || "—",
        r.count.toString(),
      ]),
    });

    doc.save("reporte-grupo.pdf");
  };

  const exportStudentPDF = () => {
    if (!selectedStudentData) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(
      `${selectedStudentData.name} ${selectedStudentData.last_name}`,
      14,
      20
    );

    autoTable(doc, {
      startY: 30,
      head: [["Fecha", "Tipo", "Descripción"]],
      body: studentIncidents.map((i) => [
        i.date,
        i.type === "otro"
          ? i.custom_type || "Otro"
          : INCIDENT_TYPE_LABELS[i.type],
        i.description || "—",
      ]),
    });

    doc.save("historial-alumno.pdf");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reportes</h1>

      {/* REPORTE POR GRUPO */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Reporte por Grupo
          </CardTitle>

          <div className="flex gap-2">
            <Select
              value={selectedGroup}
              onValueChange={setSelectedGroup}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  Todos
                </SelectItem>

                {groups.map((g) => (
                  <SelectItem
                    key={g.id}
                    value={g.id}
                  >
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              size="sm"
              variant="outline"
              onClick={exportGroupPDF}
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead className="text-right">
                  Incidencias
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {groupReport.map((r) => (
                <TableRow key={r.student.id}>
                  <TableCell>
                    {r.student.name} {r.student.last_name}
                  </TableCell>

                  <TableCell>
                    {r.group?.name || "—"}
                  </TableCell>

                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {r.count}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* HISTORIAL POR ALUMNO */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Historial por Alumno
          </CardTitle>

          <div className="flex gap-2">
            <Select
              value={selectedStudent}
              onValueChange={setSelectedStudent}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Selecciona alumno" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  Selecciona
                </SelectItem>

                {students.map((s) => (
                  <SelectItem
                    key={s.id}
                    value={s.id}
                  >
                    {s.name} {s.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedStudent !== "all" && (
              <Button
                size="sm"
                variant="outline"
                onClick={exportStudentPDF}
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {selectedStudent === "all" ? (
            <p className="text-sm text-muted-foreground">
              Selecciona un alumno.
            </p>
          ) : studentIncidents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin incidencias.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {studentIncidents.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.date}</TableCell>

                    <TableCell>
                      <Badge variant="outline">
                        {i.type === "otro"
                          ? i.custom_type || "Otro"
                          : INCIDENT_TYPE_LABELS[i.type]}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {i.description || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}