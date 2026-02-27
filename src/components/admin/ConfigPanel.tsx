import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useConfig } from "@/hooks/useConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const ConfigPanel = () => {
  const { data: config, isLoading } = useConfig();
  const [numero, setNumero] = useState("");
  const [template, setTemplate] = useState("");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (config) {
      setNumero(config.whatsapp_numero || "");
      setTemplate(config.whatsapp_mensaje_template || "");
    }
  }, [config]);

  const handleSave = async () => {
    if (!config?.id) return;
    setSaving(true);

    const { error } = await supabase
      .from("configuracion")
      .update({
        whatsapp_numero: numero,
        whatsapp_mensaje_template: template,
      })
      .eq("id", config.id);

    setSaving(false);

    if (error) {
      toast.error("Error al guardar: " + error.message);
    } else {
      toast.success("Configuración guardada");
      queryClient.invalidateQueries({ queryKey: ["configuracion"] });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="font-display text-xl font-semibold mb-1">Configuración</h2>
        <p className="text-sm text-muted-foreground">Ajustá los datos de WhatsApp para el checkout</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Número de WhatsApp</Label>
          <Input
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="5491112345678"
          />
          <p className="text-xs text-muted-foreground mt-1">Formato internacional sin + ni espacios</p>
        </div>

        <div>
          <Label>Template del mensaje</Label>
          <Textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={5}
            placeholder="Hola! Quiero hacer el siguiente pedido..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            Variables disponibles: <code className="bg-muted px-1 rounded">{"{detalle_pedido}"}</code> y <code className="bg-muted px-1 rounded">{"{total}"}</code>
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar configuración
        </Button>
      </div>
    </div>
  );
};

export default ConfigPanel;
