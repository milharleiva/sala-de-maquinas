import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import NuevoClienteForm from "./NuevoClienteForm";

export default async function NuevoClientePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || (user as any).user_metadata?.role !== "ADMIN") {
    redirect("/clientes");
  }

  return <NuevoClienteForm />;
}
