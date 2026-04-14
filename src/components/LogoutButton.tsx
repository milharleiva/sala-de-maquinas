"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  return (
    <button 
      onClick={handleLogout} 
      className="text-red-600 hover:underline text-sm sm:text-base"
    >
      Cerrar sesion
    </button>
  );
}
