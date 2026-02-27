import { MessageCircle, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/hooks/useConfig";

const Contact = () => {
  const { data: config } = useConfig();

  const handleWhatsApp = () => {
    if (!config?.whatsapp_numero) {
      alert("El número de WhatsApp no está configurado.");
      return;
    }
    window.open(`https://wa.me/${config.whatsapp_numero}?text=${encodeURIComponent("Hola! Quiero hacer una consulta.")}`, "_blank");
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">Contactanos</h1>
          <p className="text-muted-foreground text-lg mb-10">
            ¿Tenés alguna consulta? Escribinos por WhatsApp y te respondemos al instante.
          </p>

          <Button size="lg" className="gap-3 text-lg px-8 py-6" onClick={handleWhatsApp}>
            <MessageCircle className="h-6 w-6" />
            Escribinos por WhatsApp
          </Button>

          <div className="grid sm:grid-cols-2 gap-6 mt-16">
            <div className="bg-card border rounded-xl p-6 text-center">
              <MapPin className="h-8 w-8 mx-auto text-primary mb-3" />
              <h3 className="font-display font-semibold text-lg mb-1">Ubicación</h3>
              <p className="text-muted-foreground text-sm">Argentina</p>
            </div>
            <div className="bg-card border rounded-xl p-6 text-center">
              <Clock className="h-8 w-8 mx-auto text-primary mb-3" />
              <h3 className="font-display font-semibold text-lg mb-1">Horario</h3>
              <p className="text-muted-foreground text-sm">Lunes a Viernes 9:00 - 18:00</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-card border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} Artesalandia. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Contact;
