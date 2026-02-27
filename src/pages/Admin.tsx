import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, FileSpreadsheet, Image, DollarSign, Settings } from "lucide-react";
import ExcelImport from "@/components/admin/ExcelImport";
import ImageManager from "@/components/admin/ImageManager";
import PriceUpdater from "@/components/admin/PriceUpdater";
import ConfigPanel from "@/components/admin/ConfigPanel";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/admin/login");
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/admin/login");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <h1 className="font-display text-xl font-bold text-primary">Artesalandia — Admin</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="import" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-transparent p-0">
            <TabsTrigger value="import" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 border">
              <FileSpreadsheet className="h-4 w-4" /> Importar
            </TabsTrigger>
            <TabsTrigger value="images" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 border">
              <Image className="h-4 w-4" /> Imágenes
            </TabsTrigger>
            <TabsTrigger value="prices" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 border">
              <DollarSign className="h-4 w-4" /> Precios
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 border">
              <Settings className="h-4 w-4" /> Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import"><ExcelImport /></TabsContent>
          <TabsContent value="images"><ImageManager /></TabsContent>
          <TabsContent value="prices"><PriceUpdater /></TabsContent>
          <TabsContent value="config"><ConfigPanel /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
