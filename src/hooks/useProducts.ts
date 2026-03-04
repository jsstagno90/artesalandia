import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Producto {
  id: string;
  sku: string | null;
  nombre: string;
  categoria: string | null;
  categoria_id: string | null;
  nombre_atributo: string | null;
  valor_atributo: string | null;
  precio: number;
  imagen_url: string | null;
  imagen_url_2: string | null;
  imagen_url_3: string | null;
  created_at: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  activa: boolean;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ["productos"],
    queryFn: async () => {
      const allProducts: Producto[] = [];
      let from = 0;
      const PAGE = 1000;
      while (true) {
        const { data, error } = await supabase
          .from("productos")
          .select("*")
          .order("nombre")
          .range(from, from + PAGE - 1);
        if (error) throw error;
        allProducts.push(...(data as Producto[]));
        if (data.length < PAGE) break;
        from += PAGE;
      }
      return allProducts;
    },
  });
};

export const useCategoriesFromTable = () => {
  return useQuery({
    queryKey: ["categorias-table"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .eq("activa", true)
        .order("nombre");
      if (error) throw error;
      return data as Categoria[];
    },
  });
};

export const useCategories = () => {
  return useCategoriesFromTable();
};

export interface ProductGroup {
  nombre: string;
  categoria: string | null;
  categoria_id: string | null;
  imagen_url: string | null;
  imagen_url_2: string | null;
  imagen_url_3: string | null;
  nombre_atributo: string | null;
  variantes: { id: string; valor_atributo: string | null; precio: number; sku: string | null }[];
}

export const groupProducts = (products: Producto[]): ProductGroup[] => {
  const map = new Map<string, ProductGroup>();
  for (const p of products) {
    if (!map.has(p.nombre)) {
      map.set(p.nombre, {
        nombre: p.nombre,
        categoria: p.categoria,
        categoria_id: p.categoria_id,
        imagen_url: p.imagen_url,
        imagen_url_2: p.imagen_url_2,
        imagen_url_3: p.imagen_url_3,
        nombre_atributo: p.nombre_atributo,
        variantes: [],
      });
    }
    const group = map.get(p.nombre)!;
    if (!group.imagen_url && p.imagen_url) group.imagen_url = p.imagen_url;
    if (!group.imagen_url_2 && p.imagen_url_2) group.imagen_url_2 = p.imagen_url_2;
    if (!group.imagen_url_3 && p.imagen_url_3) group.imagen_url_3 = p.imagen_url_3;
    group.variantes.push({
      id: p.id,
      valor_atributo: p.valor_atributo,
      precio: p.precio,
      sku: p.sku,
    });
  }
  const groups = Array.from(map.values());
  for (const g of groups) {
    g.variantes.sort((a, b) => a.precio - b.precio);
  }
  return groups;
};
