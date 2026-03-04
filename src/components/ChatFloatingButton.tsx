import { useState } from "react";
import { MessageCircle, X } from "lucide-react"; // Iconos que ya trae tu proyecto

export const ChatFloatingButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-10 right-6 z-50">
            {/* Ventana del Chat */}
            {isOpen && (
                <div className="mb-4 w-72 h-96 bg-white rounded-lg shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-primary p-4 text-white flex justify-between items-center">
                        <span className="font-bold text-sm">Soporte Artesalandia</span>
                        <button onClick={() => setIsOpen(false)}><X size={18} /></button>
                    </div>
                    <div className="flex-1 p-4 text-sm text-gray-600 bg-gray-50">
                        ¡Hola! ¿En qué podemos ayudarte con tus artesanías hoy?
                    </div>
                    <div className="p-3 border-t">
                        <input
                            type="text"
                            placeholder="Escribe un mensaje..."
                            className="w-full text-sm p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>
            )}

            {/* Botón Flotante (El globito) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
};