import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Plus, Upload, Trash2, Edit2, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useSearchParams } from "react-router-dom";

import { Group, Student } from "@/types";
import {
  getGroups,
  addGroup,
  updateGroup,
  deleteGroup,
  getStudents,
  addStudent,
  addStudents,
  updateStudent,
  deleteStudent,
} from "@/lib/store";

export default function GroupsPage() {
  const [searchParams] = useSearchParams();

  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [groupDialog, setGroupDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState("");

  const [studentDialog, setStudentDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [sName, setSName] = useState("");
  const [sLastName, setSLastName] = useState("");
  const [sMatricula, setSMatricula] = useState("");

  const [importDialog, setImportDialog] = useState(
    searchParams.get("import") === "1"
  );

  const [importRows, setImportRows] = useState<any[]>([]);
  const [importGroupId, setImportGroupId] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  /* ==========================================
     LOAD DATA
  ========================================== */

  const refresh = useCallback(async () => {
  try {
    const g = await getGroups();
    const s = await getStudents();

    setGroups((g || []) as Group[]);

    setStudents(
      (s || []).map((item: any) => ({
        id: item.id,
        groupId: item.group_id,
        name: item.name,
        lastName: item.last_name,
        matricula: item.matricula,
      }))
    );

  } catch {
    toast.error("Error cargando datos");
  }
}, []);

  useEffect(() => {
    refresh();

    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  /* ==========================================
     FILTERED STUDENTS
  ========================================== */

  const filteredStudents = useMemo(() => {
    if (!selectedGroupId) return students;

    return students.filter(
      (student) => student.groupId === selectedGroupId
    );
  }, [students, selectedGroupId]);

  /* ==========================================
     GROUP CRUD
  ========================================== */

  const handleSaveGroup = async () => {
    if (!groupName.trim()) return;

    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, groupName.trim());
        toast.success("Grupo actualizado");
      } else {
        await addGroup(groupName.trim());
        toast.success("Grupo creado");
      }

      setGroupDialog(false);
      setEditingGroup(null);
      setGroupName("");

      await refresh();
    } catch {
      toast.error("Error guardando grupo");
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("¿Eliminar grupo y alumnos?")) return;

    try {
      await deleteGroup(id);

      if (selectedGroupId === id) {
        setSelectedGroupId(null);
      }

      toast.success("Grupo eliminado");
      await refresh();
    } catch {
      toast.error("Error eliminando grupo");
    }
  };

  /* ==========================================
     STUDENTS CRUD
  ========================================== */

  const handleSaveStudent = async () => {
    const groupId = selectedGroupId || groups[0]?.id;

    if (!groupId) {
      toast.error("Primero crea un grupo");
      return;
    }

    if (!sName.trim() || !sLastName.trim()) {
      toast.error("Completa nombre y apellido");
      return;
    }

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, {
          name: sName.trim(),
          lastName: sLastName.trim(),
          matricula: sMatricula.trim(),
        });

        toast.success("Alumno actualizado");
      } else {
        await addStudent(
          groupId,
          sName.trim(),
          sLastName.trim(),
          sMatricula.trim()
        );

        toast.success("Alumno agregado");
      }

      setStudentDialog(false);
      setEditingStudent(null);

      setSName("");
      setSLastName("");
      setSMatricula("");

      await refresh();
    } catch {
      toast.error("Error guardando alumno");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("¿Eliminar alumno?")) return;

    try {
      await deleteStudent(id);
      toast.success("Alumno eliminado");
      await refresh();
    } catch {
      toast.error("Error eliminando alumno");
    }
  };

  /* ==========================================
     IMPORT EXCEL
  ========================================== */

  const handleFile = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target?.result, {
        type: "array",
      });

      const sheet =
        workbook.Sheets[workbook.SheetNames[0]];

      const data = XLSX.utils.sheet_to_json(sheet);

      setImportRows(data);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!importGroupId) {
      toast.error("Selecciona grupo");
      return;
    }

    if (importRows.length === 0) {
      toast.error("Archivo vacío");
      return;
    }

    try {
      const rows = importRows.map((row: any) => ({
        groupId: importGroupId,
        name: row.nombre || row.Nombre || "",
        lastName:
          row.apellido ||
          row.Apellido ||
          row.apellidos ||
          "",
        matricula:
          row.matricula ||
          row.Matricula ||
          row.id ||
          "",
      }));

      await addStudents(rows);

      toast.success(`${rows.length} alumnos importados`);

      setImportDialog(false);
      setImportRows([]);
      setImportGroupId("");

      await refresh();
    } catch {
      toast.error("Error importando");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">
          Grupos y Alumnos
        </h1>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setEditingGroup(null);
              setGroupName("");
              setGroupDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nuevo Grupo
          </Button>

          <Button
            variant="outline"
            onClick={() => setImportDialog(true)}
          >
            <Upload className="h-4 w-4 mr-1" />
            Importar
          </Button>
        </div>
      </div>

      {/* GROUP FILTER */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!selectedGroupId ? "default" : "outline"}
          onClick={() => setSelectedGroupId(null)}
        >
          Todos ({students.length})
        </Button>

        {groups.map((g) => (
          <div key={g.id} className="flex gap-1">
            <Button
              variant={
                selectedGroupId === g.id
                  ? "default"
                  : "outline"
              }
              onClick={() => setSelectedGroupId(g.id)}
            >
              {g.name}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setEditingGroup(g);
                setGroupName(g.name);
                setGroupDialog(true);
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleDeleteGroup(g.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      {/* STUDENTS TABLE */}
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>Alumnos</CardTitle>

          <Button
            onClick={() => {
              setEditingStudent(null);
              setSName("");
              setSLastName("");
              setSMatricula("");
              setStudentDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredStudents.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.lastName}</TableCell>
                  <TableCell>{s.matricula}</TableCell>

                  <TableCell>
                    {groups.find(
                      (g) => g.id === s.groupId
                    )?.name || "—"}
                  </TableCell>

                  <TableCell className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingStudent(s);
                        setSName(s.name);
                        setSLastName(s.lastName);
                        setSMatricula(s.matricula);
                        setStudentDialog(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        handleDeleteStudent(s.id)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* GROUP DIALOG */}
      <Dialog open={groupDialog} onOpenChange={setGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGroup
                ? "Editar Grupo"
                : "Nuevo Grupo"}
            </DialogTitle>
            <DialogDescription>
              Ingresa el nombre del grupo.
            </DialogDescription>
          </DialogHeader>

          <Input
            value={groupName}
            onChange={(e) =>
              setGroupName(e.target.value)
            }
          />

          <DialogFooter>
            <Button onClick={handleSaveGroup}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STUDENT DIALOG */}
      <Dialog
        open={studentDialog}
        onOpenChange={setStudentDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStudent
                ? "Editar Alumno"
                : "Nuevo Alumno"}
            </DialogTitle>

            <DialogDescription>
              Captura los datos del alumno.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Nombre"
              value={sName}
              onChange={(e) =>
                setSName(e.target.value)
              }
            />

            <Input
              placeholder="Apellido"
              value={sLastName}
              onChange={(e) =>
                setSLastName(e.target.value)
              }
            />

            <Input
              placeholder="Matrícula"
              value={sMatricula}
              onChange={(e) =>
                setSMatricula(e.target.value)
              }
            />
          </div>

          <DialogFooter>
            <Button onClick={handleSaveStudent}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IMPORT */}
      <Dialog
        open={importDialog}
        onOpenChange={setImportDialog}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              <FileSpreadsheet className="inline mr-2 h-4 w-4" />
              Importar Excel
            </DialogTitle>

            <DialogDescription>
              Sube archivo Excel con alumnos.
            </DialogDescription>
          </DialogHeader>

          <Input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFile}
          />

          {importRows.length > 0 && (
            <>
              <Select
                value={importGroupId}
                onValueChange={setImportGroupId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Grupo destino" />
                </SelectTrigger>

                <SelectContent>
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

              <Button onClick={handleImport}>
                Importar {importRows.length}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}