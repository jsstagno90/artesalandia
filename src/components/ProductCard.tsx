import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import type { ProductGroup } from "@/hooks/useProducts";

interface Props {
  product: ProductGroup;
}

const ProductCard = ({ product }: Props) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const { addItem } = useCart();
  const hasVariants = product.variantes.length > 1;
  const selected = product.variantes[selectedIdx];

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

  return (
    <Link
      to={`/producto/${encodeURIComponent(product.nombre)}`}
      className="bg-card rounded-xl border overflow-hidden group hover:shadow-lg transition-shadow duration-300 flex flex-col"
    >
      <div className="aspect-square bg-muted relative overflow-hidden">
        {product.imagen_url ? (
          <img
            src={product.imagen_url}
            alt={product.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
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
