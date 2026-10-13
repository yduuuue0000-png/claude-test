"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, type Contact } from "@/lib/supabase";
import { digitsOnly, formatPhone } from "@/lib/phone";

type FormState = {
  name: string;
  phone: string;
  email: string;
  group_name: string;
  memo: string;
  favorite: boolean;
};

const emptyForm: FormState = { name: "", phone: "", email: "", group_name: "", memo: "", favorite: false };

export default function ContactsApp() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [editing, setEditing] = useState<Contact | "new" | null>(null);
  const [deleting, setDeleting] = useState<Contact | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("favorite", { ascending: false })
      .order("name", { ascending: true });
    if (error) setError("불러오기 실패: " + error.message);
    else setContacts(data as Contact[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groups = useMemo(
    () => Array.from(new Set(contacts.map((c) => c.group_name).filter(Boolean) as string[])).sort(),
    [contacts]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = digitsOnly(q);
    return contacts.filter((c) => {
      if (favOnly && !c.favorite) return false;
      if (group && c.group_name !== group) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (qDigits !== "" && digitsOnly(c.phone).includes(qDigits)) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.memo ?? "").toLowerCase().includes(q)
      );
    });
  }, [contacts, query, group, favOnly]);

  async function toggleFavorite(c: Contact) {
    const { error } = await supabase.from("contacts").update({ favorite: !c.favorite }).eq("id", c.id);
    if (error) setError("수정 실패: " + error.message);
    else load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    const { error } = await supabase.from("contacts").delete().eq("id", deleting.id);
    if (error) setError("삭제 실패: " + error.message);
    setDeleting(null);
    load();
  }

  return (
    <main className="container">
      <header className="topbar">
        <h1>📒 전화번호부</h1>
      </header>

      <div className="toolbar">
        <input
          className="search"
          placeholder="이름, 번호, 이메일, 메모 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="">전체 그룹</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <label className="check">
          <input type="checkbox" checked={favOnly} onChange={(e) => setFavOnly(e.target.checked)} />
          즐겨찾기만
        </label>
        <button className="primary" onClick={() => setEditing("new")}>
          + 새 연락처
        </button>
      </div>

      {error && (
        <div className="notice error" onClick={() => setError(null)}>
          {error}
        </div>
      )}

      <p className="muted count">
        {loading ? "불러오는 중…" : `${filtered.length}개 / 전체 ${contacts.length}개`}
      </p>

      {!loading && filtered.length === 0 ? (
        <div className="empty">
          {contacts.length === 0 ? "아직 연락처가 없습니다. ‘+ 새 연락처’로 추가하세요." : "검색 결과가 없습니다."}
        </div>
      ) : (
        <ul className="list">
          {filtered.map((c) => (
            <li key={c.id} className="item">
              <button
                className={`star ${c.favorite ? "on" : ""}`}
                title="즐겨찾기"
                onClick={() => toggleFavorite(c)}
              >
                {c.favorite ? "★" : "☆"}
              </button>
              <div className="info">
                <div className="name">
                  {c.name}
                  {c.group_name && <span className="tag">{c.group_name}</span>}
                </div>
                <a className="phone" href={`tel:${digitsOnly(c.phone)}`}>
                  {c.phone}
                </a>
                {c.email && <div className="muted small">{c.email}</div>}
                {c.memo && <div className="muted small memo">{c.memo}</div>}
              </div>
              <div className="actions">
                <button onClick={() => setEditing(c)}>수정</button>
                <button className="danger" onClick={() => setDeleting(c)}>
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <ContactForm
          contact={editing === "new" ? null : editing}
          groups={groups}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {deleting && (
        <div className="overlay" onClick={() => setDeleting(null)}>
          <div className="card modal" onClick={(e) => e.stopPropagation()}>
            <h2>연락처 삭제</h2>
            <p>
              <b>{deleting.name}</b> ({deleting.phone}) 연락처를 삭제할까요?
            </p>
            <div className="row end">
              <button onClick={() => setDeleting(null)}>취소</button>
              <button className="danger solid" onClick={confirmDelete}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ContactForm({
  contact,
  groups,
  onClose,
  onSaved,
}: {
  contact: Contact | null;
  groups: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(
    contact
      ? {
          name: contact.name,
          phone: contact.phone,
          email: contact.email ?? "",
          group_name: contact.group_name ?? "",
          memo: contact.memo ?? "",
          favorite: contact.favorite,
        }
      : emptyForm
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (digitsOnly(form.phone).length < 7) {
      setError("전화번호를 올바르게 입력하세요.");
      return;
    }
    setBusy(true);
    const payload = {
      name: form.name.trim(),
      phone: formatPhone(form.phone),
      email: form.email.trim() || null,
      group_name: form.group_name.trim() || null,
      memo: form.memo.trim() || null,
      favorite: form.favorite,
    };
    const { error } = contact
      ? await supabase.from("contacts").update(payload).eq("id", contact.id)
      : await supabase.from("contacts").insert(payload);
    setBusy(false);
    if (error) setError("저장 실패: " + error.message);
    else onSaved();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{contact ? "연락처 수정" : "새 연락처"}</h2>
        <label>
          이름 *
          <input required autoFocus value={form.name} onChange={(e) => set("name", e.target.value)} />
        </label>
        <label>
          전화번호 *
          <input
            required
            inputMode="tel"
            placeholder="010-1234-5678"
            value={form.phone}
            onChange={(e) => set("phone", formatPhone(e.target.value))}
          />
        </label>
        <label>
          이메일
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </label>
        <label>
          그룹
          <input
            list="group-list"
            placeholder="가족, 회사, 친구…"
            value={form.group_name}
            onChange={(e) => set("group_name", e.target.value)}
          />
          <datalist id="group-list">
            {groups.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </label>
        <label>
          메모
          <textarea rows={3} value={form.memo} onChange={(e) => set("memo", e.target.value)} />
        </label>
        <label className="check">
          <input type="checkbox" checked={form.favorite} onChange={(e) => set("favorite", e.target.checked)} />
          즐겨찾기
        </label>
        {error && <div className="notice error">{error}</div>}
        <div className="row end">
          <button type="button" onClick={onClose}>
            취소
          </button>
          <button className="primary" disabled={busy}>
            {busy ? "저장 중…" : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}
