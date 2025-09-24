import React, { useState } from "react";
import { useTranslation } from "../i18n";

export default function ContactForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const validEmail = (s) => /\S+@\S+\.\S+/.test(s);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!validEmail(form.email)) {
      setStatus({ type: "error", message: t("invalid_email") });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", message: `${t("save_button_full")}: ${data.id}` });
        setForm({ firstname: "", lastname: "", email: "" });
      } else {
        setStatus({ type: "error", message: data.detail || JSON.stringify(data) });
      }
    } catch (err) {
      setStatus({ type: "error", message: `${t("network_error")}: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="contact" onSubmit={handleSubmit} className="form" aria-label="contact-form">
      <div className="row">
        <label>{t("name_label")}
          <input name="firstname" value={form.firstname} onChange={onChange} required />
        </label>
        <label>{t("lastname_label")}
          <input name="lastname" value={form.lastname} onChange={onChange} required />
        </label>
      </div>

      <label>{t("email_label")}
        <input name="email" type="email" value={form.email} onChange={onChange} required />
      </label>

      <div className="form-actions">
        <button type="submit" className="btn" disabled={loading}>{loading ? "..." : t("save_button")}</button>
        <button type="button" className="ghost" onClick={() => { setForm({ firstname: "", lastname: "", email: "" }); setStatus(null); }}>
          {t("clear_button")}
        </button>
      </div>

      {status && <div className={`status ${status.type === "success" ? "ok" : "err"}`}>{status.message}</div>}
    </form>
  );
}
