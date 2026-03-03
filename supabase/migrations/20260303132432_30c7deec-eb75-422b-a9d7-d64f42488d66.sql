
-- Create categorias table
CREATE TABLE public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  slug text NOT NULL UNIQUE,
  activa boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Lectura pública de categorias"
ON public.categorias FOR SELECT
USING (true);

-- Authenticated insert
CREATE POLICY "Escritura autenticada de categorias"
ON public.categorias FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated update
CREATE POLICY "Actualización autenticada de categorias"
ON public.categorias FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Authenticated delete
CREATE POLICY "Eliminación autenticada de categorias"
ON public.categorias FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Add categoria_id to productos
ALTER TABLE public.productos ADD COLUMN categoria_id uuid REFERENCES public.categorias(id) ON DELETE SET NULL;
