import { useState } from "react";
import { useProducts, groupProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Package, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const ImageManager = () => {
  const { data: products, isLoading } = useProducts();
  const [uploading, setUploading] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const grouped = groupProducts(products || []);

  const handleUpload = async (nombre: string, ids: string[], file: File) => {
    setUploading(nombre);

    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${nombre.replace(/\s+/g, "-")}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file);

    if (uploadError) {
      toast.error("Error al subir: " + uploadError.message);
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);

    // Update all variants with this image
    const { error: updateError } = await supabase
      .from("productos")
      .update({ imagen_url: urlData.publicUrl })
      .in("id", ids);

    setUploading(null);

    if (updateError) {
      toast.error("Error al guardar URL: " + updateError.message);
    } else {
      toast.success(`Imagen actualizada para "${nombre}"`);
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold mb-1">Gestión de Imágenes</h2>
        <p className="text-sm text-muted-foreground">Subí una imagen por producto</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : grouped.length === 0 ? (
        <p className="text-muted-foreground">No hay productos cargados.</p>
      ) : (
        <div className="grid gap-4">
          {grouped.map((g) => (
            <div key={g.nombre} className="flex items-center gap-4 bg-card border rounded-xl p-4">
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {g.imagen_url ? (
                  <img src={g.imagen_url} alt={g.nombre} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-6 w-6 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{g.nombre}</h4>
                <p className="text-xs text-muted-foreground">{g.variantes.length} variante(s) · {g.categoria}</p>
              </div>
              <label>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 cursor-pointer"
                  disabled={uploading === g.nombre}
                  asChild
                >
                  <span>
                    {uploading === g.nombre ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Subir imagen
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(g.nombre, g.variantes.map((v) => v.id), file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageManager;
