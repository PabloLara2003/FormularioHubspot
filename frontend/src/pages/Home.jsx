import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n";

export default function Home() {
  const { t } = useTranslation();
  return (
    <section className="home-full">
      <div className="container home-inner">
        <h1 className="home-title">{t("home_title")}</h1>

        <div className="home-actions" role="navigation" aria-label="Acciones principales">
          <Link to="/view" className="home-btn">{t("view_contacts")}</Link>
          <Link to="/add" className="home-btn ghost">{t("add_contact")}</Link>
        </div>

        <p className="home-note muted">{t("app_note")}</p>
      </div>
    </section>
  );
}
