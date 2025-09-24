import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ViewContacts from "./pages/ViewContacts";
import AddContact from "./pages/AddContact";

export default function App() {
  return (
    <div className="site">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/view" element={<ViewContacts />} />
          <Route path="/add" element={<AddContact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
