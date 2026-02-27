import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useConfig } from "@/hooks/useConfig";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total, clearCart } = useCart();
  const { data: config } = useConfig();

  const handleCheckout = () => {
    if (!config?.whatsapp_numero) {
      alert("El número de WhatsApp no está configurado.");
      return;
    }

    const detalle = items
      .map(
        (i) =>
          `• ${i.nombre}${i.valor_atributo ? ` (${i.nombre_atributo}: ${i.valor_atributo})` : ""} x${i.cantidad} - $${(i.precio * i.cantidad).toFixed(2)}`
      )
      .join("\n");

    let template = config.whatsapp_mensaje_template || "Hola! Quiero hacer el siguiente pedido:\n\n{detalle_pedido}\n\nTotal: ${total}";
    const mensaje = template
      .replace("{detalle_pedido}", detalle)
      .replace("{total}", total.toFixed(2));

    const url = `https://wa.me/${config.whatsapp_numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
    clearCart();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Tu Carrito</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-card rounded-lg p-3">
                  {item.imagen_url && (
                    <img
                      src={item.imagen_url}
                      alt={item.nombre}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{item.nombre}</h4>
                    {item.valor_atributo && (
                      <p className="text-xs text-muted-foreground">{item.nombre_atributo}: {item.valor_atributo}</p>
                    )}
                    <p className="text-sm font-bold text-primary">${item.precio.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.cantidad - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">{item.cantidad}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.cantidad + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-destructive" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
              <Button className="w-full gap-2" size="lg" onClick={handleCheckout}>
                <MessageCircle className="h-5 w-5" />
                Enviar pedido por WhatsApp
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
