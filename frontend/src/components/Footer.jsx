import React from "react";
import { useTranslation } from "../i18n";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <strong>{t("footer_brand")}</strong>
          <div className="muted">{t("footer_sub")}</div>
        </div>
        <div className="footer-links">  
          <a href="#">{t("terms")}</a>
        </div>
      </div>
    </footer>
  );
}
