import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractGDriveUrl(mdOrUrl: string): string | null {
  if (!mdOrUrl || !mdOrUrl.trim()) return null;
  // Extract URL from markdown link [text](url)
  const mdMatch = mdOrUrl.match(/\[.*?\]\((https?:\/\/[^)]+)\)/);
  const url = mdMatch ? mdMatch[1] : mdOrUrl.trim();
  // Convert Google Drive sharing URL to direct image URL
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  if (url.startsWith("http")) return url;
  return null;
}

function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { products } = await req.json();
  if (!products || !Array.isArray(products)) {
    return new Response(JSON.stringify({ error: "products array required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  // Collect unique categories
  const uniqueCats = [...new Set(products.map((p: any) => p.categoria?.trim()).filter(Boolean))];

  // Fetch existing categories
  const { data: existingCats } = await supabase.from("categorias").select("id, nombre");
  const catMap = new Map<string, string>();
  for (const c of existingCats || []) {
    catMap.set(c.nombre.toLowerCase(), c.id);
  }

  // Create missing categories
  const toCreate = uniqueCats.filter((c: string) => !catMap.has(c.toLowerCase()));
  if (toCreate.length > 0) {
    const { data: created, error: catErr } = await supabase
      .from("categorias")
      .insert(toCreate.map((c: string) => ({ nombre: c, slug: slugify(c) })))
      .select("id, nombre");
    if (catErr) {
      return new Response(JSON.stringify({ error: "Category error: " + catErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    for (const c of created || []) {
      catMap.set(c.nombre.toLowerCase(), c.id);
    }
  }

  // Build product inserts
  const inserts = products.map((p: any) => ({
    sku: p.sku || null,
    nombre: p.nombre,
    precio: Number(p.precio) || 0,
    categoria: p.categoria || null,
    categoria_id: p.categoria ? (catMap.get(p.categoria.toLowerCase().trim()) || null) : null,
    nombre_atributo: p.nombre_atributo || null,
    valor_atributo: p.valor_atributo || null,
    imagen_url: extractGDriveUrl(p.url1 || ""),
    imagen_url_2: extractGDriveUrl(p.url2 || ""),
    imagen_url_3: extractGDriveUrl(p.url3 || ""),
  }));

  // Batch insert (500 at a time)
  let inserted = 0;
  for (let i = 0; i < inserts.length; i += 500) {
    const batch = inserts.slice(i, i + 500);
    const { error } = await supabase.from("productos").insert(batch);
    if (error) {
      return new Response(JSON.stringify({ error: `Batch error at ${i}: ${error.message}`, inserted }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    inserted += batch.length;
  }

  return new Response(JSON.stringify({ 
    success: true, 
    inserted, 
    categories_created: toCreate.length,
    categories: [...catMap.entries()].map(([name, id]) => ({ name, id }))
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
