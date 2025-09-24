import React from "react";
import { useTranslation } from "../i18n";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { lang, setLang, t } = useTranslation();

  return (
    <header className="nav">
      <div className="nav-inner container">
                <div className="brand" role="img" aria-label="Atria style logo">
          {/* Logo por URL (rápido). Alt conciso para accesibilidad. */}
          <img
            src="https://tryatria.ai/logo.png"
            alt="Atria"
            className="brand-logo"
            width="140"
            height="36"
          />
        </div>

        <nav className="nav-links" aria-label="Main navigation">
          <Link to="#" className="link">{t("products")}</Link>
          <Link to="#" className="link">{t("contact")}</Link>
        </nav>

        <div className="nav-actions">
          <select
            className="lang"
            aria-label="Seleccionar idioma"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="es">{t("lang_es")}</option>
            <option value="en">{t("lang_en")}</option>
          </select>

          <button className="cta">{t("schedule_demo")}</button>
        </div>
      </div>
    </header>
  );
}
