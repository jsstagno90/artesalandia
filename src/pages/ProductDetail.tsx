import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ChevronLeft, Loader2, Package } from "lucide-react";

const ProductDetail = () => {
  const { nombre } = useParams<{ nombre: string }>();
  const decodedName = decodeURIComponent(nombre || "");
  const { addItem } = useCart();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [mainImage, setMainImage] = useState<string | null>(null);

  const { data: variants, isLoading } = useQuery({
    queryKey: ["product-detail", decodedName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("*, categorias(nombre)")
        .eq("nombre", decodedName);
      if (error) throw error;
      return data;
    },
    enabled: !!decodedName,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!variants?.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-lg">Producto no encontrado</p>
        <Link to="/productos">
          <Button variant="outline" className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Volver a productos
          </Button>
        </Link>
      </div>
    );
  }

  const selected = variants[selectedIdx];
  const images = [selected.imagen_url, selected.imagen_url_2, selected.imagen_url_3].filter(Boolean) as string[];
  const currentMain = mainImage || images[0] || null;
  const hasVariants = variants.length > 1;
  const attrName = selected.nombre_atributo;
  const categoryName = (selected as any).categorias?.nombre || selected.categoria;

  const handleAdd = () => {
    addItem({
      id: selected.id,
      nombre: selected.nombre,
      valor_atributo: selected.valor_atributo,
      nombre_atributo: selected.nombre_atributo,
      precio: selected.precio,
      imagen_url: selected.imagen_url,
    });
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Link to="/productos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" /> Volver a productos
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image gallery */}
          <div className="space-y-3">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted border">
              {currentMain ? (
                <img src={currentMain} alt={selected.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground/40" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentMain === img ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <img src={img} alt={`${selected.nombre} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-6">
            {categoryName && (
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {categoryName}
              </span>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-bold">{selected.nombre}</h1>
            <p className="text-3xl font-bold text-primary">${selected.precio.toFixed(2)}</p>

            {hasVariants && attrName && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{attrName}</label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedIdx(i);
                        setMainImage(null);
                      }}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        selectedIdx === i
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card hover:bg-muted border-border"
                      }`}
                    >
                      {v.valor_atributo || `Variante ${i + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selected.sku && (
              <p className="text-xs text-muted-foreground">SKU: {selected.sku}</p>
            )}

            <Button size="lg" className="gap-2 w-full md:w-auto" onClick={handleAdd}>
              <ShoppingCart className="h-5 w-5" /> Agregar al carrito
            </Button>
          </div>
        </div>
      </div>

      <footer className="bg-card border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} Artesalandia. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;
