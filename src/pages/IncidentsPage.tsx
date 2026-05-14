import { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, Edit2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import {
  getGroups,
  getStudents,
  getIncidents,
  addIncident,
  deleteIncident,
  updateIncident,
} from "@/lib/store";

import { useSearchParams } from "react-router-dom";

export default function IncidentsPage() {
  const [searchParams] = useSearchParams();

  const [incidents, setIncidents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [dialog, setDialog] = useState(
    searchParams.get("new") === "1"
  );
  const [editing, setEditing] = useState<any>(null);

  const [studentId, setStudentId] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [type, setType] = useState("falta_respeto");
  const [customType, setCustomType] = useState("");
  const [description, setDescription] = useState("");

  const refresh = async () => {
    const dataIncidents = await getIncidents();
    const dataGroups = await getGroups();
    const dataStudents = await getStudents();

    setIncidents(dataIncidents || []);
    setGroups(dataGroups || []);
    setStudents(dataStudents || []);
  };

  useEffect(() => {
    refresh();
  }, []);

  const filteredIncidents = useMemo(() => {
    let result = [...incidents];

    result.sort(
      (a, b) =>
        new Date(b.created_at || b.date).getTime() -
        new Date(a.created_at || a.date).getTime()
    );

    if (filterGroup !== "all") {
      const ids = students
        .filter((s) => s.group_id === filterGroup)
        .map((s) => s.id);

      result = result.filter((i) =>
        ids.includes(i.student_id)
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter((i) => {
        const student = students.find(
          (s) => s.id === i.student_id
        );

        return (
          student?.name?.toLowerCase().includes(q) ||
          student?.last_name?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [incidents, students, filterGroup, search]);

  const getStudent = (id: string) =>
    students.find((s) => s.id === id);

  const getGroup = (id: string) =>
    groups.find((g) => g.id === id);

  const openNew = () => {
    setEditing(null);
    setStudentId("");
    setDate(new Date().toISOString().split("T")[0]);
    setType("falta_respeto");
    setCustomType("");
    setDescription("");
    setDialog(true);
  };

  const openEdit = (inc: any) => {
    setEditing(inc);
    setStudentId(inc.student_id);
    setDate(inc.date);
    setType(inc.type);
    setCustomType(inc.custom_type || "");
    setDescription(inc.description || "");
    setDialog(true);
  };

  const handleSave = async () => {
    if (!studentId) {
      toast.error("Selecciona un alumno");
      return;
    }

    if (editing) {
      await updateIncident(editing.id, {
        studentId,
        date,
        type,
        customType,
        description,
      });

      toast.success("Incidencia actualizada");
    } else {
      await addIncident(
        studentId,
        date,
        type,
        customType,
        description
      );

      toast.success("Incidencia creada");
    }

    setDialog(false);
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar incidencia?")) return;

    await deleteIncident(id);
    toast.success("Incidencia eliminada");
    refresh();
  };

  const groupedStudents = groups.map((g) => ({
    group: g,
    students: students.filter(
      (s) => s.group_id === g.id
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Incidencias
        </h1>

        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            className="pl-9"
            placeholder="Buscar..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <Select
          value={filterGroup}
          onValueChange={setFilterGroup}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              Todos los grupos
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
      </div>

      {filteredIncidents.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No hay incidencias registradas
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((inc) => {
            const student = getStudent(
              inc.student_id
            );

            const group = student
              ? getGroup(student.group_id)
              : null;

            return (
              <Card key={inc.id}>
                <CardContent className="py-4 flex justify-between">
                  <div className="space-y-1">
                    <div className="flex gap-2 items-center">
                      <span className="font-medium">
                        {student
                          ? `${student.name} ${student.last_name}`
                          : "Alumno eliminado"}
                      </span>

                      <Badge variant="secondary">
                        {group?.name || "—"}
                      </Badge>

                      <Badge variant="outline">
                        {inc.type === "otro"
                          ? inc.custom_type
                          : inc.type}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {inc.date}
                    </p>

                    {inc.description && (
                      <p className="text-sm">
                        {inc.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        openEdit(inc)
                      }
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() =>
                        handleDelete(inc.id)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={dialog}
        onOpenChange={setDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing
                ? "Editar incidencia"
                : "Nueva incidencia"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Alumno</Label>

              <Select
                value={studentId}
                onValueChange={setStudentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona alumno" />
                </SelectTrigger>

                <SelectContent>
                  {groupedStudents.map(
                    ({ group, students }) => (
                      <div key={group.id}>
                        <div className="px-2 py-1 text-xs text-muted-foreground">
                          {group.name}
                        </div>

                        {students.map((s) => (
                          <SelectItem
                            key={s.id}
                            value={s.id}
                          >
                            {s.name}{" "}
                            {s.last_name}
                          </SelectItem>
                        ))}
                      </div>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fecha</Label>

              <Input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <Label>Tipo</Label>

              <Input
                value={type}
                onChange={(e) =>
                  setType(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <Label>
                Tipo personalizado
              </Label>

              <Input
                value={customType}
                onChange={(e) =>
                  setCustomType(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <Label>
                Descripción
              </Label>

              <Textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}