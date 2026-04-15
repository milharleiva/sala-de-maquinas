import { redirect, permanentRedirect } from "next/navigation";
import { createClient } from "@/lib/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      throw new Error("REDIRECT:" + "/clientes");
    } else {
      throw new Error("REDIRECT:" + "/login");
    }
  } catch (e) {
    const message = (e as Error).message;
    if (message?.startsWith("REDIRECT:")) {
      permanentRedirect(message.replace("REDIRECT:", ""));
    }
    console.error(e);
    return <div>Error: {message}</div>;
  }
}