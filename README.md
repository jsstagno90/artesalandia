🧵 Artesalandia
Tienda e-commerce de productos artesanales construida con Lovable y Supabase. Permite a los vendedores gestionar su catálogo de productos con fotos y a los clientes explorar y comprar artículos únicos hechos a mano.
🌐 Demo en vivo: artesalandia.lovable.app

✨ Características

Catálogo de productos con imágenes
Subida de fotos de productos (Supabase Storage)
Panel de administración para gestionar el inventario
Interfaz responsive y amigable
Base de datos en tiempo real con Supabase


🛠️ Stack Tecnológico
TecnologíaUsoLovableFrontend / generación de UI con IASupabaseBase de datos, autenticación y storagePostgreSQLMotor de base de datosSupabase StorageAlmacenamiento de imágenes de productos

🗄️ Base de Datos (Supabase)
El proyecto usa el proyecto Supabase con ID tcqjuzkoleezfkefbcxmj.
Tablas principales
sql-- Productos
products (
  id uuid PRIMARY KEY,
  name text,
  description text,
  price numeric,
  image_url text,
  created_at timestamp
)
Storage

Bucket: product-images — almacena las fotos de los productos subidas desde el panel de administración



👤 Autor
Juan Sebastián Stagno
GitHub · LinkedIn
