UPDATE productos SET imagen_url = NULL WHERE imagen_url IS NOT NULL AND imagen_url NOT LIKE 'https://%';
UPDATE productos SET imagen_url_2 = NULL WHERE imagen_url_2 IS NOT NULL AND imagen_url_2 NOT LIKE 'https://%';
UPDATE productos SET imagen_url_3 = NULL WHERE imagen_url_3 IS NOT NULL AND imagen_url_3 NOT LIKE 'https://%';