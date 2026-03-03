import { useState } from "react";
import { useCategories, useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Percent } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const PriceUpdater = () => {
  const { data: categories } = useCategories();
  const { data: products } = useProducts();
  const [selected, setSelected] = useState<Set<string>>(new Set()); // category IDs
  const [percentage, setPercentage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const queryClient = useQueryClient();

  const toggleCat = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    setShowConfirm(false);
  };

  const affectedCount = (products || []).filter((p) => p.categoria_id && selected.has(p.categoria_id)).length;

  const selectedNames = (categories || []).filter((c) => selected.has(c.id)).map((c) => c.nombre);

  const handlePreview = () => {
    if (selected.size === 0 || !percentage) {
      toast.error("Seleccioná al menos una categoría y un porcentaje");
      return;
    }
    setShowConfirm(true);
  };

  const handleApply = async () => {
    const pct = parseFloat(percentage);
    if (isNaN(pct)) return;

    setUpdating(true);
    const factor = 1 + pct / 100;

    const toUpdate = (products || []).filter((p) => p.categoria_id && selected.has(p.categoria_id));

    const promises = toUpdate.map((p) =>
      supabase
        .from("productos")
        .update({ precio: Math.round(p.precio * factor * 100) / 100 })
        .eq("id", p.id)
    );

    const results = await Promise.all(promises);
    const errors = results.filter((r) => r.error);

    setUpdating(false);
    setShowConfirm(false);

    if (errors.length > 0) {
      toast.error(`Hubo ${errors.length} errores al actualizar`);
    } else {
      toast.success(`Se actualizaron ${toUpdate.length} productos`);
      setSelected(new Set());
      setPercentage("");
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold mb-1">Actualización de precios</h2>
        <p className="text-sm text-muted-foreground">Ajustá precios por categoría con un porcentaje</p>
      </div>

      {categories && categories.length > 0 ? (
        <>
          <div className="space-y-3">
            <Label>Categorías</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selected.has(cat.id) ? "bg-primary/10 border-primary" : "bg-card"
                  }`}
                >
                  <Checkbox
                    checked={selected.has(cat.id)}
                    onCheckedChange={() => toggleCat(cat.id)}
                  />
                  <span className="text-sm font-medium">{cat.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-3 max-w-xs">
            <div className="flex-1">
              <Label>Porcentaje de ajuste</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={percentage}
                  onChange={(e) => { setPercentage(e.target.value); setShowConfirm(false); }}
                  placeholder="ej: 15 o -10"
                  className="pr-8"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <Button onClick={handlePreview} variant="outline">Vista previa</Button>
          </div>

          {showConfirm && (
            <div className="bg-muted border rounded-xl p-5 space-y-3">
              <p className="font-semibold">
                Se van a actualizar <span className="text-primary">{affectedCount} productos</span> en las categorías:{" "}
                {selectedNames.join(", ")}
              </p>
              <p className="text-sm text-muted-foreground">
                Ajuste: {parseFloat(percentage) > 0 ? "+" : ""}{percentage}%
              </p>
              <div className="flex gap-3">
                <Button onClick={handleApply} disabled={updating} className="gap-2">
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Confirmar actualización
                </Button>
                <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">No hay categorías disponibles. Importá productos primero.</p>
      )}
    </div>
  );
};

export default PriceUpdater;
