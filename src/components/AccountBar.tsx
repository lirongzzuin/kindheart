"use client";
/** 로그인 계정 표시 + 로그아웃 (데모/Supabase 공용). */
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { useAuth, demoSignOut } from "@/hooks/useAuth";
import { getBrowserSupabase } from "@/lib/supabase/client";

export function AccountBar() {
  const router = useRouter();
  const { user } = useAuth();

  async function logout() {
    const supabase = getBrowserSupabase();
    if (supabase) await supabase.auth.signOut();
    else demoSignOut();
    router.push("/");
  }

  if (!user) return null;
  return (
    <div className="flex items-center justify-between bg-surface-container-low rounded-2xl border border-outline-variant/40 p-4 mb-6">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
          <Icon name="account_circle" fill className="text-primary" />
        </span>
        <div className="min-w-0">
          <p className="font-label-md text-on-surface-variant">로그인됨</p>
          <p className="font-body-md text-on-surface font-bold truncate">{user.name}</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="shrink-0 px-4 h-10 rounded-full border border-outline-variant text-on-surface-variant font-label-md tap-scale hover:bg-surface-container"
      >
        로그아웃
      </button>
    </div>
  );
}
