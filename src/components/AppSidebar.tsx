import { LayoutDashboard, Users, AlertTriangle, FileText, DatabaseBackup } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";
import { generateBackup } from "@/lib/backup";
import { toast } from "sonner";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Grupos y Alumnos", url: "/grupos", icon: Users },
  { title: "Incidencias", url: "/incidencias", icon: AlertTriangle },
  { title: "Reportes", url: "/reportes", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
  <Sidebar collapsible="icon">
    <SidebarContent className="flex flex-col h-full">
      {!collapsed && (
        <div className="px-4 py-5">
          <h2 className="text-lg font-bold text-primary">
            Control Escolar
          </h2>

          <p className="text-xs text-muted-foreground">
            Gestión de Incidencias
          </p>
        </div>
      )}

      <SidebarGroup>
        <SidebarGroupLabel>
          Navegación
        </SidebarGroupLabel>

        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                >
                  <NavLink
                    to={item.url}
                    end={item.url === "/"}
                    className="hover:bg-accent/50"
                    activeClassName="bg-accent text-primary font-medium"
                  >
                    <item.icon className="h-4 w-4" />

                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* BOTÓN ABAJO */}
      <div className="mt-auto p-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={async () => {
            const ok = await generateBackup();

            if (ok) {
              toast.success(
                "Respaldo generado"
              );
            } else {
              toast.error(
                "Error generando respaldo"
              );
            }
          }}
        >
          <DatabaseBackup className="h-4 w-4 mr-2" />

          {!collapsed && (
            <span>
              Generar respaldo
            </span>
          )}
        </Button>
      </div>
    </SidebarContent>
  </Sidebar>
);
}
