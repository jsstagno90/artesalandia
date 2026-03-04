ALTER TABLE public.productos
  DROP CONSTRAINT productos_categoria_id_fkey,
  ADD CONSTRAINT productos_categoria_id_fkey
    FOREIGN KEY (categoria_id) REFERENCES public.categorias(id)
    ON DELETE CASCADE;