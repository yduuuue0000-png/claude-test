"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import AuthForm from "./AuthForm";
import ContactsApp from "./ContactsApp";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!supabaseConfigured) {
    return (
      <main className="container narrow">
        <h1>전화번호부</h1>
        <div className="notice error">
          Supabase 환경변수가 설정되지 않았습니다.
          <br />
          <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> 를 설정하세요.
        </div>
      </main>
    );
  }

  if (loading) return <main className="container narrow"><p className="muted">불러오는 중…</p></main>;
  if (!session) return <AuthForm />;
  return <ContactsApp session={session} />;
}
