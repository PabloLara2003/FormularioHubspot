// frontend/src/i18n.jsx
// Provider mínimo de i18n con persistencia en localStorage.

import React, { createContext, useContext, useState } from "react";

const translations = {
  es: {
    products: "Productos",
    verticals: "Verticales",
    contact: "Contacto",
    schedule_demo: "Agendar un Demo",
    lang_es: "ES Español",
    lang_en: "EN English",

    hero_title: "Gestiona contactos rápidamente",
    hero_lead: "Interfaz limpia para crear y actualizar contactos en HubSpot.",

    home_title: "Gestión de contactos",
    view_contacts: "Ver contactos",
    add_contact: "Agregar contacto",
    app_note: "Aplicación de prueba técnica · integración con HubSpot",

    panel_create_title: "Crear contacto",
    panel_create_sub: "Rellena el formulario y guarda el contacto en HubSpot.",
    name_label: "Nombre",
    lastname_label: "Apellido",
    email_label: "Correo",
    save_button: "Guardar",
    save_button_full: "Guardar en HubSpot",
    clear_button: "Limpiar",
    invalid_email: "Correo inválido",
    network_error: "Error de red",

    list_title: "Contactos",
    list_sub: "Lista de contactos recuperados desde HubSpot.",
    delete_button: "Borrar",
    end_of_list: "Fin de la lista",

    breadcrumb_home: "Inicio",
    breadcrumb_contacts: "Contactos",
    breadcrumb_add: "Agregar contacto",
    kbd_hint: "Presiona Esc para volver",

    footer_brand: "Prueba técnica",
    footer_sub: "Integración HubSpot",
    terms: "Términos y condiciones",
    privacy: "Privacidad"
  },
  en: {
    products: "Products",
    verticals: "Verticals",
    contact: "Contact",
    schedule_demo: "Schedule a demo",
    lang_es: "ES Spanish",
    lang_en: "EN English",

    hero_title: "Manage contacts quickly",
    hero_lead: "Clean UI to create and update contacts in HubSpot.",

    home_title: "Contact management",
    view_contacts: "View contacts",
    add_contact: "Add contact",
    app_note: "Technical test app · HubSpot integration",

    panel_create_title: "Create contact",
    panel_create_sub: "Fill the form and save the contact into HubSpot.",
    name_label: "First name",
    lastname_label: "Last name",
    email_label: "Email",
    save_button: "Save",
    save_button_full: "Save to HubSpot",
    clear_button: "Clear",
    invalid_email: "Invalid email",
    network_error: "Network error",

    list_title: "Contacts",
    list_sub: "Contacts list fetched from HubSpot.",
    delete_button: "Delete",
    end_of_list: "End of list",

    breadcrumb_home: "Home",
    breadcrumb_contacts: "Contacts",
    breadcrumb_add: "Add contact",
    kbd_hint: "Press Esc to go back",

    footer_brand: "Technical test",
    footer_sub: "HubSpot integration",
    terms: "Terms & conditions",
    privacy: "Privacy"
  }
};

const LangContext = createContext();

export function LanguageProvider({ children }) {
  // leer preferencia guardada (si existe)
  const initial = (typeof window !== "undefined" && localStorage.getItem("lang")) || "es";
  const [lang, setLangState] = useState(initial);

  // wrapper para persistir en localStorage
  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch (e) { /* ignore */ }
  };

  const t = (key) => {
    return translations[lang] && translations[lang][key] ? translations[lang][key] : key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider");
  return ctx;
}
