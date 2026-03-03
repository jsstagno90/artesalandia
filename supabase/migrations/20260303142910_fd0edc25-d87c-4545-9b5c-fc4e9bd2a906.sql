DELETE FROM productos
WHERE id NOT IN (
  SELECT DISTINCT ON (nombre, COALESCE(valor_atributo, '')) id
  FROM productos
  ORDER BY nombre, COALESCE(valor_atributo, ''), created_at DESC
);