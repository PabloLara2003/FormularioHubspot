import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n";

export default function ViewContacts() {
  const { t, lang } = useTranslation();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [after, setAfter] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // carga contactos (paginated)
  const load = async (useAfter = null) => {
    setLoading(true);
    setError(null);
    try {
      const q = useAfter ? `?limit=50&after=${encodeURIComponent(useAfter)}` : `?limit=50`;
      const res = await fetch(`/api/contacts${q}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || JSON.stringify(data));
      setContacts(prev => (useAfter ? [...prev, ...(data.results || [])] : (data.results || [])));
      const next = data.paging?.next?.after;
      setAfter(next || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // atajo Esc para volver
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") navigate("/"); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  // borrar contacto por id
  const handleDelete = async (id, email) => {
    const confirmMsg = lang === "es"
      ? `¿Borrar contacto ${email || id}? Esta acción es irreversible.`
      : `Delete contact ${email || id}? This action is irreversible.`;
    const ok = window.confirm(confirmMsg);
    if (!ok) return;

    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || JSON.stringify(data));
      setContacts(prev => prev.filter(c => String(c.id) !== String(id)));
    } catch (err) {
      const msg = (lang === "es") ? `Error borrando: ${err.message}` : `Delete error: ${err.message}`;
      alert(msg);
    }
  };

  // helpers para labels que no están en el map de i18n
  const loadingLabel = loading ? (lang === "es" ? "Cargando..." : "Loading...") : (lang === "es" ? "Cargar más" : "Load more");
  const noContactsLabel = lang === "es" ? "No hay contactos." : "No contacts.";

  return (
    <section className="section container">
      <div className="panel">
        {/* Breadcrumb + atajo hint */}
        <div className="page-header">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="crumb">{t("breadcrumb_home")}</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb current">{t("breadcrumb_contacts")}</span>
          </nav>
          <div className="kbd-hint">{t("kbd_hint")}</div>
        </div>

        <h2 className="panel-title" style={{ marginTop: 6 }}>{t("list_title")}</h2>
        <p className="panel-sub">{t("list_sub")}</p>

        {error && <div className="status err">Error: {error}</div>}

        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ textAlign: "left", color: "#374151" }}>
              <tr>
                <th>ID</th>
                <th>{t("name_label")}</th>
                <th>{t("lastname_label")}</th>
                <th>{t("email_label")}</th>
                <th>{/* acciones */}Acciones</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 && !loading && <tr><td colSpan="5" className="muted">{noContactsLabel}</td></tr>}
              {contacts.map((c) => {
                const p = c.properties || {};
                return (
                  <tr key={c.id} style={{ borderTop: "1px solid #eef2f6" }}>
                    <td style={{ padding: "10px 8px" }}>{c.id}</td>
                    <td style={{ padding: "10px 8px" }}>{p.firstname || "-"}</td>
                    <td style={{ padding: "10px 8px" }}>{p.lastname || "-"}</td>
                    <td style={{ padding: "10px 8px" }}>{p.email || "-"}</td>
                    <td style={{ padding: "10px 8px" }}>
                      <button className="ghost" onClick={() => handleDelete(c.id, p.email)}>{t("delete_button")}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
          {after ? (
            <button className="btn" onClick={() => load(after)} disabled={loading}>{loading ? loadingLabel : loadingLabel}</button>
          ) : (
            <div className="muted">{t("end_of_list")}</div>
          )}
        </div>
      </div>
    </section>
  );
}
