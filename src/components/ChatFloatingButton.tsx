import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export const ChatFloatingButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [responses, setResponses] = useState<{ text: string; isUser: boolean }[]>([
        { text: "¡Hola! Bienvenido a Artesalandia. ¿En qué puedo ayudarte hoy?", isUser: false }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(""); // Estado para la sesión
    const scrollRef = useRef<HTMLDivElement>(null);

    const inputRef = useRef<HTMLInputElement>(null); // Nueva referencia para el input
    useEffect(() => {
        if (isOpen && inputRef.current) {
            // Un pequeño delay de 100ms ayuda a que la animación de apertura termine
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);
    // Al cargar el componente, buscamos o creamos un ID de sesión único
    useEffect(() => {
        let sId = localStorage.getItem("artesalandia_chat_session");
        if (!sId) {
            sId = `session_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem("artesalandia_chat_session", sId);
        }
        setSessionId(sId);
    }, []);

    // Auto-scroll al final del chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [responses, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMsg = message;
        setResponses((prev) => [...prev, { text: userMsg, isUser: true }]);
        setMessage("");
        setIsLoading(true);

        try {
            // USAMOS LA URL DE TEST PARA TUS PRUEBAS ACTUALES
            const response = await fetch("https://jsstagno.app.n8n.cloud/webhook/artesalandia", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chatMessage: userMsg,
                    session_id: sessionId // Enviamos el ID persistente a n8n
                }),
            });

            if (!response.ok) throw new Error("Error en la conexión");

            const data = await response.json();

            const botText = data.output || data.response || data.text || "Recibí tu mensaje en n8n correctamente.";

            setResponses((prev) => [...prev, { text: botText, isUser: false }]);
        } catch (error) {
            console.error(error);
            setResponses((prev) => [...prev, { text: "No pude conectar con el servidor de chat.", isUser: false }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <div className="mb-4 w-80 h-[450px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-orange-800 p-4 text-white flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="font-bold text-sm tracking-wide">Chat Artesalandia</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-orange-900 rounded-full p-1 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto bg-stone-50 space-y-3">
                        {responses.map((msg, i) => (
                            <div key={i} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.isUser
                                        ? "bg-orange-700 text-white rounded-br-none"
                                        : "bg-white text-stone-800 border border-stone-200 rounded-bl-none"
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-stone-200 p-3 rounded-2xl rounded-bl-none animate-pulse text-[10px] uppercase tracking-widest font-bold text-stone-500">
                                    Pensando...
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Pregúntanos lo que quieras..."
                            className="flex-1 text-sm p-2 bg-stone-100 border-none rounded-xl focus:ring-2 focus:ring-orange-800/20 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-orange-800 text-white p-2 rounded-xl hover:bg-orange-900 disabled:bg-stone-300 transition-all shadow-md active:scale-90"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-orange-800 hover:bg-orange-900 text-white p-4 rounded-full shadow-2xl transition-all hover:rotate-12 active:scale-90"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
};