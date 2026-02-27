import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Config {
  id: string;
  whatsapp_numero: string | null;
  whatsapp_mensaje_template: string | null;
}

export const useConfig = () => {
  return useQuery({
    queryKey: ["configuracion"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracion")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as Config;
    },
  });
};
