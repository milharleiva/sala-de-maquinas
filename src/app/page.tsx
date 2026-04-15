import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      redirect("/clientes");
    } else {
      redirect("/login");
    }
  } catch (e) {
    console.error(e);
    return <div>Error: {(e as Error).message}</div>;
  }
}