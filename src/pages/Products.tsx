import { useState } from "react";
import { useProducts, useCategories, groupProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Products = () => {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? (products || []).filter((p) => p.categoria === activeCategory)
    : products || [];

  const grouped = groupProducts(filtered);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Nuestros Productos</h1>
        <p className="text-muted-foreground mb-8">Explorá nuestro catálogo completo</p>

        {/* Category filter */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(null)}
            >
              Todos
            </Button>
            {categories.map((c) => (
              <Button
                key={c}
                variant={activeCategory === c ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No hay productos disponibles todavía.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {grouped.map((g) => (
              <ProductCard key={g.nombre} product={g} />
            ))}
          </div>
        )}
      </div>

      <footer className="bg-card border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} Artesalandia. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Products;
