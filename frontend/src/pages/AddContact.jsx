import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ContactForm from "../components/ContactForm";
import { useTranslation } from "../i18n";

export default function AddContact() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") navigate("/"); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  return (
    <section className="section container">
      <div className="single-column">
        <div className="panel centered-panel">
          <div className="page-header">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/" className="crumb">{t("breadcrumb_home")}</Link>
              <span className="crumb-sep">/</span>
              <span className="crumb current">{t("breadcrumb_add")}</span>
            </nav>
            <div className="kbd-hint">{t("kbd_hint")}</div>
          </div>

          <h2 className="panel-title" style={{ marginTop: 6 }}>{t("panel_create_title")}</h2>
          <p className="panel-sub">{t("panel_create_sub")}</p>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
