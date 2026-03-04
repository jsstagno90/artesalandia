import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Save, X, CheckSquare } from "lucide-react";

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  activa: boolean;
  created_at: string;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const CategoryManager = () => {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: categorias, isLoading } = useQuery({
    queryKey: ["categorias-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("nombre");
      if (error) throw error;
      return data as Categoria[];
    },
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!categorias) return;
    if (selected.size === categorias.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(categorias.map((c) => c.id)));
    }
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    const { error } = await supabase.from("categorias").insert({
      nombre: name,
      slug: slugify(name),
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Categoría creada");
      setNewName("");
      queryClient.invalidateQueries({ queryKey: ["categorias-admin"] });
    }
  };

  const handleUpdate = async (id: string) => {
    const name = editName.trim();
    if (!name) return;
    setSaving(true);
    const { error } = await supabase
      .from("categorias")
      .update({ nombre: name, slug: slugify(name) })
      .eq("id", id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Categoría actualizada");
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["categorias-admin"] });
    }
  };

  const handleToggle = async (id: string, activa: boolean) => {
    const { error } = await supabase
      .from("categorias")
      .update({ activa })
      .eq("id", id);
    if (error) toast.error(error.message);
    else queryClient.invalidateQueries({ queryKey: ["categorias-admin"] });
  };

  const handleDelete = async (id: string) => {
    const cat = categorias?.find((c) => c.id === id);
    if (!confirm(`¿Eliminar esta categoría? Se eliminarán TODOS los productos que contiene.`)) return;
    // Also delete products matched by text categoria field
    if (cat) {
      await supabase.from("productos").delete().eq("categoria", cat.nombre);
    }
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Categoría y sus productos eliminados");
      queryClient.invalidateQueries({ queryKey: ["categorias-admin"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`¿Eliminar ${selected.size} categoría(s)? Se eliminarán TODOS los productos que contienen.`)) return;
    // Delete products matched by text categoria field
    const selectedCats = categorias?.filter((c) => selected.has(c.id)) ?? [];
    const catNames = selectedCats.map((c) => c.nombre);
    if (catNames.length > 0) {
      await supabase.from("productos").delete().in("categoria", catNames);
    }
    const { error } = await supabase
      .from("categorias")
      .delete()
      .in("id", Array.from(selected));
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${selected.size} categoría(s) y sus productos eliminados`);
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ["categorias-admin"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    }
  };

  const handleBulkToggle = async (activa: boolean) => {
    if (selected.size === 0) return;
    const { error } = await supabase
      .from("categorias")
      .update({ activa })
      .in("id", Array.from(selected));
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${selected.size} categoría(s) ${activa ? "activada(s)" : "desactivada(s)"}`);
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ["categorias-admin"] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold mb-1">Gestión de Categorías</h2>
        <p className="text-sm text-muted-foreground">Creá, editá y eliminá las categorías de tus productos</p>
      </div>

      {/* Create */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Label htmlFor="new-cat">Nueva categoría</Label>
          <Input
            id="new-cat"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre de la categoría"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
        </div>
        <Button onClick={handleCreate} disabled={saving || !newName.trim()} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Crear
        </Button>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-muted/50 border rounded-lg px-4 py-2">
          <span className="text-sm font-medium">{selected.size} seleccionada(s)</span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={() => handleBulkToggle(true)}>Activar</Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkToggle(false)}>Desactivar</Button>
            <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="gap-1">
              <Trash2 className="h-3.5 w-3.5" /> Eliminar
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !categorias?.length ? (
        <p className="text-muted-foreground text-center py-10">No hay categorías creadas</p>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 w-10">
                  <Checkbox
                    checked={categorias.length > 0 && selected.size === categorias.length}
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Slug</th>
                <th className="text-center p-3">Activa</th>
                <th className="text-right p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr key={cat.id} className="border-t">
                  <td className="p-3">
                    <Checkbox
                      checked={selected.has(cat.id)}
                      onCheckedChange={() => toggleSelect(cat.id)}
                    />
                  </td>
                  <td className="p-3">
                    {editingId === cat.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8"
                        onKeyDown={(e) => e.key === "Enter" && handleUpdate(cat.id)}
                      />
                    ) : (
                      <span className="font-medium">{cat.nombre}</span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground font-mono text-xs">{cat.slug}</td>
                  <td className="p-3 text-center">
                    <Switch
                      checked={cat.activa}
                      onCheckedChange={(v) => handleToggle(cat.id, v)}
                    />
                  </td>
                  <td className="p-3 text-right">
                    {editingId === cat.id ? (
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => handleUpdate(cat.id)}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditName(cat.nombre);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(cat.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
