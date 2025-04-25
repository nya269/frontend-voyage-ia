import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

function App() {
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: ""
  });
  const [editId, setEditId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/contacts`, {
      headers: { "x-api-key": API_KEY }
    })
      .then((response) => setContacts(response.data))
      .catch((error) => {
        console.error("Erreur récupération :", error);
        setErrorMessage("❌ Erreur récupération des contacts");
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("❌ Adresse email invalide.");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.telephone)) {
      setErrorMessage("❌ Le téléphone doit contenir exactement 10 chiffres.");
      return;
    }

    const config = {
      headers: { "x-api-key": API_KEY }
    };

    if (editId) {
      axios.put(`${API_URL}/contacts/${editId}`, formData, config)
        .then(() => {
          setContacts(contacts.map(c => c.id === editId ? { id: editId, ...formData } : c));
          setSuccessMessage("✏️ Contact modifié !");
          resetForm();
        })
        .catch(err => setErrorMessage("❌ " + (err.response?.data?.error || "Erreur modification")));
    } else {
      axios.post(`${API_URL}/contacts`, formData, config)
        .then((res) => {
          const newContact = { id: res.data.id, ...formData };
          setContacts(prev => [...prev, newContact]);
          setSuccessMessage("✅ Contact ajouté !");
          resetForm();
        })
        .catch(err => setErrorMessage("❌ " + (err.response?.data?.error || "Erreur ajout")));
    }
  };

  const resetForm = () => {
    setFormData({ nom: "", prenom: "", email: "", telephone: "" });
    setEditId(null);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      axios.delete(`${API_URL}/contacts/${id}`, {
        headers: { "x-api-key": API_KEY }
      })
        .then(() => {
          setContacts(contacts.filter(c => c.id !== id));
          setDeletingId(null);
          setSuccessMessage("🗑️ Contact supprimé !");
        })
        .catch((err) => {
          console.error("Erreur suppression :", err);
          setErrorMessage("❌ Erreur lors de la suppression");
        });
    }, 300);
  };

  return (
    <div className="container">
      <h1>Liste des contacts 📇</h1>

      {successMessage && <div className="toast success">{successMessage}</div>}
      {errorMessage && <div className="toast error">{errorMessage}</div>}

      <h2>{editId ? "Modifier un contact ✏️" : "Ajouter un contact 📝"}</h2>
      <form onSubmit={handleSubmit} className="form">
        <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required />
        <input name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} required />
        <button type="submit">{editId ? "Enregistrer" : "Ajouter"}</button>
      </form>

      {contacts.length === 0 ? (
        <p>Aucun contact trouvé.</p>
      ) : (
        <table className="contact-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr
                key={contact.id}
                className={`fade ${deletingId === contact.id ? "fade-out" : "fade-in"}`}
              >
                <td>{contact.nom}</td>
                <td>{contact.prenom}</td>
                <td>{contact.email}</td>
                <td>{contact.telephone}</td>
                <td>
                  <button className="edit" onClick={() => {
                    setFormData(contact);
                    setEditId(contact.id);
                    setSuccessMessage("");
                    setErrorMessage("");
                  }}>
                    Modifier
                  </button>
                  <button className="delete" onClick={() => handleDelete(contact.id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;