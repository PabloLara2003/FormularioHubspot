import React from "react";
import { useTranslation } from "../i18n";

export default function Hero() {
  const { t } = useTranslation();
  return (
    <section className="hero hero-minimal">
      <div className="container hero-inner">
        <div className="hero-copy">
          <h1>{t("hero_title")}</h1>
          <p className="lead">{t("hero_lead")}</p>
        </div>
      </div>
    </section>
  );
}
