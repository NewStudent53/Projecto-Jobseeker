import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function SavedOffers() {
  const [savedOffers, setSavedOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedOffers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Error: No hay un token de usuario activo.");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/api/saved-offers", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const offers = await response.json();
          setSavedOffers(offers);
        } else {
          alert("Error al obtener ofertas guardadas.");
        }
      } catch (error) {
        console.error("Error al obtener ofertas guardadas:", error);
      }
    };

    fetchSavedOffers();
  }, [navigate]);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Ofertas Guardadas</h1>
        <button className="back-button" onClick={() => navigate("/home")}>
          Regresar
        </button>
      </header>
      <main className="home-main">
        {savedOffers.length > 0 ? (
          <ul className="job-list">
            {savedOffers.map((offer, index) => (
              <li key={index} className="job-item">
                <h3>{offer.position}</h3>
                <p>{offer.company}</p>
                <a href={offer.url} target="_blank" rel="noopener noreferrer">
                  Ver más detalles
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tienes ofertas guardadas todavía.</p>
        )}
      </main>
    </div>
  );
}

export default SavedOffers;
