import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const ExcelExport = () => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch all products with pagination
      const allProducts: any[] = [];
      let from = 0;
      const PAGE = 1000;
      while (true) {
        const { data, error } = await supabase
          .from("productos")
          .select(`
            id, sku, nombre, precio, categoria_id, nombre_atributo, valor_atributo, 
            imagen_url, imagen_url_2, imagen_url_3, created_at,
            categorias!inner(nombre)
          `)
          .order("sku", { ascending: true, nullsFirst: false })
          .range(from, from + PAGE - 1);
        if (error) throw error;
        allProducts.push(...data);
        if (data.length < PAGE) break;
        from += PAGE;
      }

      if (allProducts.length === 0) {
        toast.error("No hay productos para exportar");
        setExporting(false);
        return;
      }

      const rows = allProducts.map((p) => ({
        SKU: p.sku ?? "",
        Nombre: p.nombre,
        Categoria: p.categoria ?? "",
        "ID Categoria": p.categoria_id ?? "",
        Precio: p.precio,
        "Atributo": p.nombre_atributo ?? "",
        "Valor Atributo": p.valor_atributo ?? "",
        "Foto 1": p.imagen_url ?? "",
        "Foto 2": p.imagen_url_2 ?? "",
        "Foto 3": p.imagen_url_3 ?? "",
        ID: p.id,
        "Fecha Creacion": p.created_at,
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Productos");
      XLSX.writeFile(wb, "productos_exportados.xlsx");

      toast.success(`Se exportaron ${rows.length} filas`);
    } catch (err: any) {
      toast.error("Error al exportar: " + err.message);
    }
    setExporting(false);
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={exporting} className="gap-2">
      {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Exportar productos
    </Button>
  );
};

export default ExcelExport;
