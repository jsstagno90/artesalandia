import { useState } from "react";
import { useProducts, groupProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Package, Loader2, ImagePlus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const IMAGE_FIELDS = ["imagen_url", "imagen_url_2", "imagen_url_3"] as const;
const IMAGE_LABELS = ["Imagen 1", "Imagen 2", "Imagen 3"];

const ImageManager = () => {
  const { data: products, isLoading } = useProducts();
  const [uploading, setUploading] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const grouped = groupProducts(products || []);

  // Collect all image URLs for a product group
  const getImages = (g: ReturnType<typeof groupProducts>[0]) => {
    const firstWithImages = (products || []).find((p) => p.nombre === g.nombre);
    if (!firstWithImages) return [null, null, null];
    return [firstWithImages.imagen_url, firstWithImages.imagen_url_2, firstWithImages.imagen_url_3];
  };

  const handleUpload = async (nombre: string, ids: string[], slotIndex: number, file: File) => {
    const key = `${nombre}-${slotIndex}`;
    setUploading(key);

    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${nombre.replace(/\s+/g, "-")}-${slotIndex + 1}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file);

    if (uploadError) {
      toast.error("Error al subir: " + uploadError.message);
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    const field = IMAGE_FIELDS[slotIndex];

    const { error: updateError } = await supabase
      .from("productos")
      .update({ [field]: urlData.publicUrl })
      .in("id", ids);

    setUploading(null);

    if (updateError) {
      toast.error("Error al guardar URL: " + updateError.message);
    } else {
      toast.success(`${IMAGE_LABELS[slotIndex]} actualizada para "${nombre}"`);
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    }
  };

  const handleRemove = async (nombre: string, ids: string[], slotIndex: number) => {
    const field = IMAGE_FIELDS[slotIndex];
    const { error } = await supabase
      .from("productos")
      .update({ [field]: null })
      .in("id", ids);

    if (error) {
      toast.error("Error: " + error.message);
    } else {
      toast.success(`${IMAGE_LABELS[slotIndex]} eliminada de "${nombre}"`);
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold mb-1">Gestión de Imágenes</h2>
        <p className="text-sm text-muted-foreground">Subí hasta 3 imágenes por producto</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : grouped.length === 0 ? (
        <p className="text-muted-foreground">No hay productos cargados.</p>
      ) : (
        <div className="grid gap-4">
          {grouped.map((g) => {
            const images = getImages(g);
            const variantIds = g.variantes.map((v) => v.id);

            return (
              <div key={g.nombre} className="bg-card border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {g.imagen_url ? (
                      <img src={g.imagen_url} alt={g.nombre} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Package className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{g.nombre}</h4>
                    <p className="text-xs text-muted-foreground">{g.variantes.length} variante(s) · {g.categoria}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {IMAGE_LABELS.map((label, idx) => {
                    const imgUrl = images[idx];
                    const uploadKey = `${g.nombre}-${idx}`;
                    const isUploading = uploading === uploadKey;

                    return (
                      <div key={idx} className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground">{label}</p>
                        <div className="aspect-square rounded-lg bg-muted border overflow-hidden flex items-center justify-center relative group">
                          {imgUrl ? (
                            <>
                              <img src={imgUrl} alt={`${g.nombre} ${label}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <button
                                onClick={() => handleRemove(g.nombre, variantIds, idx)}
                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Eliminar imagen"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </>
                          ) : (
                            <ImagePlus className="h-6 w-6 text-muted-foreground/30" />
                          )}
                        </div>
                        <label>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 w-full cursor-pointer text-xs"
                            disabled={isUploading}
                            asChild
                          >
                            <span>
                              {isUploading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}
                              {imgUrl ? "Cambiar" : "Subir"}
                            </span>
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpload(g.nombre, variantIds, idx, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageManager;
