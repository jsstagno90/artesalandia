import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const EXPECTED_FIELDS = [
  { key: "sku", label: "SKU" },
  { key: "nombre", label: "Nombre" },
  { key: "precio", label: "Precio" },
  { key: "categoria", label: "Categoría" },
  { key: "nombre_atributo", label: "Nombre atributo" },
  { key: "valor_atributo", label: "Valor atributo" },
] as const;

type FieldKey = (typeof EXPECTED_FIELDS)[number]["key"];

interface ParsedRow {
  sku: string;
  nombre: string;
  precio: number;
  categoria: string;
  nombre_atributo: string;
  valor_atributo: string;
}

const ExcelImport = () => {
  const [rawData, setRawData] = useState<Record<string, unknown>[]>([]);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<FieldKey, string>>({
    sku: "",
    nombre: "",
    precio: "",
    categoria: "",
    nombre_atributo: "",
    valor_atributo: "",
  });
  const [step, setStep] = useState<"upload" | "map" | "preview">("upload");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];

      // First get all headers from the sheet range
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      const headers: string[] = [];
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r: range.s.r, c })];
        headers.push(cell ? String(cell.v).trim() : `Columna ${c + 1}`);
      }

      // Parse with defval to keep empty cells
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

      if (data.length === 0) {
        toast.error("El archivo está vacío");
        return;
      }

      setExcelColumns(headers);
      setRawData(data);

      // Auto-match columns by similarity
      const autoMap: Record<FieldKey, string> = {
        sku: "", nombre: "", precio: "", categoria: "", nombre_atributo: "", valor_atributo: "",
      };
      const matchers: Record<FieldKey, string[]> = {
        sku: ["sku"],
        nombre: ["nombre"],
        precio: ["precio"],
        categoria: ["categoria", "categoría", "categorias", "categorías"],
        nombre_atributo: ["nombre atributo", "nombre_atributo", "atributo nombre"],
        valor_atributo: ["valor atributo", "valor_atributo", "atributo valor"],
      };

      for (const col of headers) {
        const lower = col.toLowerCase().trim();
        for (const [field, patterns] of Object.entries(matchers)) {
          if (patterns.some((p) => lower === p || lower.includes(p))) {
            if (!autoMap[field as FieldKey]) {
              autoMap[field as FieldKey] = col;
            }
          }
        }
      }

      setMapping(autoMap);
      setStep("map");
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  }, []);

  const handleConfirmMapping = () => {
    if (!mapping.nombre || !mapping.precio) {
      toast.error("Al menos Nombre y Precio son obligatorios");
      return;
    }

    const parsed: ParsedRow[] = rawData.map((r) => ({
      sku: mapping.sku ? String(r[mapping.sku] ?? "") : "",
      nombre: String(r[mapping.nombre] ?? ""),
      precio: Number(r[mapping.precio] ?? 0),
      categoria: mapping.categoria ? String(r[mapping.categoria] ?? "") : "",
      nombre_atributo: mapping.nombre_atributo ? String(r[mapping.nombre_atributo] ?? "") : "",
      valor_atributo: mapping.valor_atributo ? String(r[mapping.valor_atributo] ?? "") : "",
    }));

    setRows(parsed);
    setStep("preview");
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);

    const inserts = rows.map((r) => ({
      sku: r.sku || null,
      nombre: r.nombre,
      precio: r.precio,
      categoria: r.categoria || null,
      nombre_atributo: r.nombre_atributo || null,
      valor_atributo: r.valor_atributo || null,
    }));

    const { error } = await supabase.from("productos").insert(inserts);
    setImporting(false);

    if (error) {
      toast.error("Error al importar: " + error.message);
    } else {
      toast.success(`Se importaron ${rows.length} registros correctamente`);
      handleReset();
    }
  };

  const handleReset = () => {
    setRawData([]);
    setExcelColumns([]);
    setMapping({ sku: "", nombre: "", precio: "", categoria: "", nombre_atributo: "", valor_atributo: "" });
    setRows([]);
    setStep("upload");
  };

  const grouped = rows.reduce<Record<string, ParsedRow[]>>((acc, r) => {
    (acc[r.nombre] = acc[r.nombre] || []).push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold mb-1">Importar productos desde Excel</h2>
        <p className="text-sm text-muted-foreground">
          Subí tu archivo .xlsx y mapeá las columnas a los campos correspondientes
        </p>
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
          <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-3" />
          <span className="text-sm font-medium text-muted-foreground">
            Hacé clic o arrastrá un archivo .xlsx
          </span>
          <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
        </label>
      )}

      {/* Step 2: Column mapping */}
      {step === "map" && (
        <div className="space-y-4">
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Mapeo de columnas</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {excelColumns.length} columnas detectadas · {rawData.length} filas
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Seleccioná a qué campo corresponde cada columna de tu Excel. <strong>Nombre</strong> y <strong>Precio</strong> son obligatorios.
            </p>

            <div className="grid gap-3">
              {EXPECTED_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-36 shrink-0 text-right">
                    {field.label}
                    {(field.key === "nombre" || field.key === "precio") && (
                      <span className="text-destructive ml-0.5">*</span>
                    )}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Select
                    value={mapping[field.key] || "__none__"}
                    onValueChange={(v) =>
                      setMapping((prev) => ({ ...prev, [field.key]: v === "__none__" ? "" : v }))
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="No asignada" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— No asignada —</SelectItem>
                      {excelColumns.map((col) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* Preview of first 3 raw rows */}
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Vista previa de las primeras filas del Excel:</p>
              <div className="overflow-x-auto max-h-40 border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      {excelColumns.map((col) => (
                        <th key={col} className="text-left p-2 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rawData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-t">
                        {excelColumns.map((col) => (
                          <td key={col} className="p-2 whitespace-nowrap">{String(row[col] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleConfirmMapping} className="gap-2">
              Confirmar mapeo
            </Button>
            <Button variant="outline" onClick={handleReset}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Import */}
      {step === "preview" && (
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
            <Button variant="outline" onClick={() => setStep("map")}>Volver al mapeo</Button>
            <Button variant="outline" onClick={handleReset}>Cancelar</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExcelImport;
