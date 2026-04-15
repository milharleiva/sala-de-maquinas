import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";

export default async function Home() {
  return <h1>Hola</h1>;
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();

  // if (user) {
  //   redirect("/clientes");
  // } else {
  //   redirect("/login");
  // }
}
