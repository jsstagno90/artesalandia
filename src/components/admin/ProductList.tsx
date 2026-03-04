import { useState } from "react";
import { useProducts, useCategories, Producto } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Search, Trash2 } from "lucide-react";
import { driveUrlToImage } from "@/lib/driveUrl";

const ProductList = () => {
  const { data: productos, isLoading } = useProducts();
  const { data: categorias } = useCategories();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const filtered = (productos ?? []).filter((p) => {
    const matchSearch =
      !search ||
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat =
      catFilter === "all" || p.categoria_id === catFilter || (!p.categoria_id && catFilter === "none");
    return matchSearch && matchCat;
  });

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`¿Eliminar ${selected.size} producto(s)? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    const { error } = await supabase
      .from("productos")
      .delete()
      .in("id", Array.from(selected));
    setDeleting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${selected.size} producto(s) eliminado(s)`);
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Producto eliminado");
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold mb-1">Productos</h2>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Cargando..." : `${filtered.length} producto(s)`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="none">Sin categoría</SelectItem>
            {categorias?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-muted/50 border rounded-lg px-4 py-2">
          <span className="text-sm font-medium">{selected.size} seleccionado(s)</span>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={deleting}
            className="ml-auto gap-1"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Eliminar
          </Button>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">No se encontraron productos</p>
      ) : (
        <div className="border rounded-xl overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 w-10">
                  <Checkbox
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="p-3 w-14">Img</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3 hidden md:table-cell">SKU</th>
                <th className="text-left p-3 hidden md:table-cell">Categoría</th>
                <th className="text-left p-3 hidden lg:table-cell">Atributo</th>
                <th className="text-right p-3">Precio</th>
                <th className="p-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const imgSrc = driveUrlToImage(p.imagen_url);
                return (
                  <tr key={p.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <Checkbox
                        checked={selected.has(p.id)}
                        onCheckedChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td className="p-3">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={p.nombre}
                          className="h-10 w-10 rounded object-cover bg-muted"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted" />
                      )}
                    </td>
                    <td className="p-3 font-medium max-w-[200px] truncate">{p.nombre}</td>
                    <td className="p-3 text-muted-foreground font-mono text-xs hidden md:table-cell">
                      {p.sku ?? "—"}
                    </td>
                    <td className="p-3 hidden md:table-cell">{p.categoria ?? "—"}</td>
                    <td className="p-3 hidden lg:table-cell text-muted-foreground">
                      {p.valor_atributo ? `${p.nombre_atributo}: ${p.valor_atributo}` : "—"}
                    </td>
                    <td className="p-3 text-right font-medium">
                      ${p.precio.toLocaleString("es-AR")}
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductList;
