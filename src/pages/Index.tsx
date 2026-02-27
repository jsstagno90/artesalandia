import { Link } from "react-router-dom";
import { ArrowRight, Palette, Brush, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-artesalandia.jpg";

const features = [
  { icon: Boxes, title: "MDF & Madera", desc: "Figuras, letras y bases en MDF de primera calidad" },
  { icon: Palette, title: "Pinturas", desc: "Acrílicos, lacas y pinturas especiales para cada proyecto" },
  { icon: Brush, title: "Pinceles & Más", desc: "Herramientas y accesorios para artesanos" },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Taller artesanal" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 py-28 md:py-40">
          <div className="max-w-xl space-y-6 animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              Hacé realidad tu <span className="text-warm-gold">imaginación</span>
            </h1>
            <p className="text-lg text-primary-foreground/85 font-body leading-relaxed">
              Los mejores productos en madera MDF, pinturas, pinceles y todo lo que necesitás para crear piezas únicas.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button asChild size="lg" className="gap-2 text-base">
                <Link to="/productos">
                  Ver Productos <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                <Link to="/contacto">Contactanos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            Todo para tus <span className="text-primary">artesanías</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="bg-card rounded-xl p-8 text-center border hover:shadow-lg transition-shadow"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 mb-5">
                  <f.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} Artesalandia. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Index;
