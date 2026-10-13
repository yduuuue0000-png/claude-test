"use client";

import { supabaseConfigured } from "@/lib/supabase";
import ContactsApp from "./ContactsApp";

export default function Home() {
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

  return <ContactsApp />;
}
