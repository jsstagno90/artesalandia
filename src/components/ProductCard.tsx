import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import type { ProductGroup } from "@/hooks/useProducts";

interface Props {
  product: ProductGroup;
}

const ProductCard = ({ product }: Props) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [imgError, setImgError] = useState<Set<number>>(new Set());
  const [imgLoaded, setImgLoaded] = useState<Set<number>>(new Set());
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const { addItem } = useCart();
  const hasVariants = product.variantes.length > 1;
  const selected = product.variantes[selectedIdx];

  const images = [product.imagen_url, product.imagen_url_2, product.imagen_url_3].filter(Boolean) as string[];
  const validImages = images.filter((_, i) => !imgError.has(i));

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: selected.id,
      nombre: product.nombre,
      valor_atributo: selected.valor_atributo,
      nombre_atributo: product.nombre_atributo,
      precio: selected.precio,
      imagen_url: product.imagen_url,
    });
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <Link
      to={`/producto/${encodeURIComponent(product.nombre)}`}
      className="bg-card rounded-xl border overflow-hidden group hover:shadow-lg transition-shadow duration-300 flex flex-col"
    >
      <div className="aspect-square bg-muted relative overflow-hidden">
        {validImages.length > 0 ? (
          <>
            {!imgLoaded.has(currentImgIdx) && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
                <Package className="h-10 w-10 text-muted-foreground/30" />
              </div>
            )}
            <img
              src={validImages[currentImgIdx]}
              alt={product.nombre}
              loading="lazy"
              referrerPolicy="no-referrer"
              onLoad={() => setImgLoaded((prev) => new Set(prev).add(currentImgIdx))}
              onError={() => setImgError((prev) => new Set(prev).add(currentImgIdx))}
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
                imgLoaded.has(currentImgIdx) ? "opacity-100" : "opacity-0"
              }`}
            />
            {validImages.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-1 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {validImages.map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === currentImgIdx ? "bg-primary" : "bg-background/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{product.categoria}</p>
        <h3 className="font-display text-lg font-semibold leading-tight">{product.nombre}</h3>

        {hasVariants && (
          <div className="mt-1" onClick={(e) => e.preventDefault()}>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {product.nombre_atributo}
            </label>
            <Select
              value={String(selectedIdx)}
              onValueChange={(v) => setSelectedIdx(Number(v))}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {product.variantes.map((v, i) => (
                  <SelectItem key={v.id} value={String(i)}>
                    {v.valor_atributo} — ${v.precio.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">${selected.precio.toFixed(2)}</span>
          <Button size="sm" className="gap-2" onClick={handleAdd}>
            <ShoppingCart className="h-4 w-4" />
            Agregar
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
