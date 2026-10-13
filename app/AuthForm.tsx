"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "info"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage({ type: "error", text: "로그인 실패: " + error.message });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) setMessage({ type: "error", text: "회원가입 실패: " + error.message });
      else if (!data.session)
        setMessage({ type: "info", text: "확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인하세요." });
    }
    setBusy(false);
  }

  return (
    <main className="container narrow">
      <h1>📒 전화번호부</h1>
      <form className="card" onSubmit={handleSubmit}>
        <h2>{mode === "signin" ? "로그인" : "회원가입"}</h2>
        <label>
          이메일
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {message && <div className={`notice ${message.type}`}>{message.text}</div>}
        <button className="primary" disabled={busy}>
          {busy ? "처리 중…" : mode === "signin" ? "로그인" : "가입하기"}
        </button>
        <button
          type="button"
          className="link"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setMessage(null);
          }}
        >
          {mode === "signin" ? "계정이 없나요? 회원가입" : "이미 계정이 있나요? 로그인"}
        </button>
      </form>
    </main>
  );
}
