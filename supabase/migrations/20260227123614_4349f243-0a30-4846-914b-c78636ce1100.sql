
-- Tabla productos
CREATE TABLE public.productos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT,
  nombre TEXT NOT NULL,
  categoria TEXT,
  nombre_atributo TEXT,
  valor_atributo TEXT,
  precio NUMERIC NOT NULL,
  imagen_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de productos"
  ON public.productos FOR SELECT
  USING (true);

CREATE POLICY "Escritura autenticada de productos"
  ON public.productos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Actualización autenticada de productos"
  ON public.productos FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Eliminación autenticada de productos"
  ON public.productos FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Tabla configuracion
CREATE TABLE public.configuracion (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp_numero TEXT,
  whatsapp_mensaje_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de configuracion"
  ON public.configuracion FOR SELECT
  USING (true);

CREATE POLICY "Escritura autenticada de configuracion"
  ON public.configuracion FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Actualización autenticada de configuracion"
  ON public.configuracion FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Storage bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY "Lectura pública de imágenes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Subida autenticada de imágenes"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Actualización autenticada de imágenes"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Eliminación autenticada de imágenes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Registro inicial de configuración
INSERT INTO public.configuracion (whatsapp_numero, whatsapp_mensaje_template)
VALUES ('', 'Hola! Quiero hacer el siguiente pedido:\n\n{detalle_pedido}\n\nTotal: ${total}');
