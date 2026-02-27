import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Producto {
  id: string;
  sku: string | null;
  nombre: string;
  categoria: string | null;
  nombre_atributo: string | null;
  valor_atributo: string | null;
  precio: number;
  imagen_url: string | null;
  created_at: string;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ["productos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("nombre");
      if (error) throw error;
      return data as Producto[];
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("categoria")
        .order("categoria");
      if (error) throw error;
      const unique = [...new Set(data.map((d) => d.categoria).filter(Boolean))] as string[];
      return unique;
    },
  });
};

export interface ProductGroup {
  nombre: string;
  categoria: string | null;
  imagen_url: string | null;
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
        imagen_url: p.imagen_url,
        nombre_atributo: p.nombre_atributo,
        variantes: [],
      });
    }
    const group = map.get(p.nombre)!;
    if (!group.imagen_url && p.imagen_url) group.imagen_url = p.imagen_url;
    group.variantes.push({
      id: p.id,
      valor_atributo: p.valor_atributo,
      precio: p.precio,
      sku: p.sku,
    });
  }
  return Array.from(map.values());
};
