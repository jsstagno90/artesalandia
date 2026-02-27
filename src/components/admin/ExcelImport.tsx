import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ParsedRow {
  sku: string;
  nombre: string;
  precio: number;
  categoria: string;
  nombre_atributo: string;
  valor_atributo: string;
}

const ExcelImport = () => {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

      const parsed: ParsedRow[] = data.map((r) => ({
        sku: String(r["SKU"] ?? r["sku"] ?? ""),
        nombre: String(r["Nombre"] ?? r["nombre"] ?? ""),
        precio: Number(r["Precio"] ?? r["precio"] ?? 0),
        categoria: String(r["Categorías"] ?? r["Categorias"] ?? r["Categoría"] ?? r["Categoria"] ?? r["categorias"] ?? r["categoria"] ?? ""),
        nombre_atributo: String(r["Nombre atributo"] ?? r["Nombre Atributo"] ?? r["nombre_atributo"] ?? r["nombre atributo"] ?? ""),
        valor_atributo: String(r["Valor atributo"] ?? r["Valor Atributo"] ?? r["valor_atributo"] ?? r["valor atributo"] ?? ""),
      }));

      setRows(parsed);
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  }, []);

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);

    const inserts = rows.map((r) => ({
      sku: r.sku,
      nombre: r.nombre,
      precio: r.precio,
      categoria: r.categoria,
      nombre_atributo: r.nombre_atributo || null,
      valor_atributo: r.valor_atributo || null,
    }));

    const { error } = await supabase.from("productos").insert(inserts);
    setImporting(false);

    if (error) {
      toast.error("Error al importar: " + error.message);
    } else {
      toast.success(`Se importaron ${rows.length} registros correctamente`);
      setRows([]);
    }
  };

  // Group preview by product name
  const grouped = rows.reduce<Record<string, ParsedRow[]>>((acc, r) => {
    (acc[r.nombre] = acc[r.nombre] || []).push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold mb-1">Importar productos desde Excel</h2>
        <p className="text-sm text-muted-foreground">
          Columnas esperadas: SKU | Nombre | Precio | Categorías | Nombre atributo | Valor atributo
        </p>
      </div>

      <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
        <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-3" />
        <span className="text-sm font-medium text-muted-foreground">
          Hacé clic o arrastrá un archivo .xlsx
        </span>
        <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
      </label>

      {rows.length > 0 && (
        <>
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <p className="font-semibold">{rows.length} filas parseadas · {Object.keys(grouped).length} productos</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-3">SKU</th>
                    <th className="text-left p-3">Nombre</th>
                    <th className="text-left p-3">Categoría</th>
                    <th className="text-left p-3">Atributo</th>
                    <th className="text-left p-3">Valor</th>
                    <th className="text-right p-3">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3 font-mono text-xs">{r.sku}</td>
                      <td className="p-3">{r.nombre}</td>
                      <td className="p-3">{r.categoria}</td>
                      <td className="p-3">{r.nombre_atributo}</td>
                      <td className="p-3">{r.valor_atributo}</td>
                      <td className="p-3 text-right font-medium">${r.precio.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleImport} disabled={importing} className="gap-2">
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Confirmar importación
            </Button>
            <Button variant="outline" onClick={() => setRows([])}>Cancelar</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExcelImport;
