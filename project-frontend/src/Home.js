import React, { useEffect, useState } from "react";
import { fetchJobs, fetchUser } from "./api";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function Home() {
  const [jobs, setJobs] = useState([]);
  const [popularJobs, setPopularJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [username, setUsername] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const [expandedTags, setExpandedTags] = useState({});
  const [firstJobRemoved, setFirstJobRemoved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Debe iniciar sesión para acceder a esta página.");
        navigate("/login");
        return;
      }

      try {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
          setUsername(storedUsername);
        } else {
          const userData = await fetchUser();
          setUsername(userData.name);
          localStorage.setItem("username", userData.name);
        }

        const jobList = await fetchJobs();

        const formattedJobs = jobList.map((job) => ({
          ...job,
          tags: Array.isArray(job.tags)
            ? job.tags
            : typeof job.tags === "string"
            ? job.tags.split(/(?=[A-Z])|,|\s+/).map((tag) => tag.trim())
            : [],
        }));

        const sortedJobs = [...formattedJobs].sort(
          (a, b) => (b.popularity || 0) - (a.popularity || 0)
        );

        setPopularJobs(sortedJobs.slice(0, 10));
        setJobs(sortedJobs.slice(10));
        setTags([...new Set(formattedJobs.flatMap((job) => job.tags || []))]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [navigate]);

  const handleTagChange = (e) => {
    const selected = e.target.value;
    setSelectedTag(selected);
    setCurrentPage(1);

    if (selected === "" && !firstJobRemoved) {
      setJobs((prevJobs) => prevJobs.slice(1));
      setFirstJobRemoved(true);
    }
  };

  const toggleExpandedTags = (jobId) => {
    setExpandedTags((prevState) => ({
      ...prevState,
      [jobId]: !prevState[jobId],
    }));
  };

  // Función para guardar oferta en la base de datos
  const saveOffer = async (job) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Error: No hay un token de usuario activo.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/save-offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          position: job.position,
          company: job.company,
          url: job.url,
          tags: job.tags,
        }),
      });

      if (response.ok) {
        alert("Oferta guardada exitosamente.");
      } else {
        alert("Error al guardar la oferta.");
      }
    } catch (error) {
      console.error("Error al guardar oferta:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  const goToSavedOffers = () => {
    navigate("/saved-offers");
  };

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const filteredJobs = [...popularJobs, ...jobs].filter(
    (job) => !selectedTag || job.tags?.includes(selectedTag)
  );

  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Página de Inicio</h1>
        <div className="user-info">
          <span className="username">{username}</span>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </header>

      {showLogoutConfirm && (
        <div className="logout-confirm">
          <p>¿Estás seguro de que deseas cerrar sesión?</p>
          <button onClick={handleLogout} className="confirm-button">
            Sí
          </button>
          <button
            onClick={() => setShowLogoutConfirm(false)}
            className="cancel-button"
          >
            No
          </button>
        </div>
      )}

      <div className="home-content">
        <main className="home-main">
          <div className="filter-container">
            <h2>Trabajos Disponibles</h2>
            <select
              value={selectedTag}
              onChange={handleTagChange}
              className="tag-filter"
            >
              <option value="">Todos</option>
              {tags.map((tag, index) => (
                <option key={index} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <p>Cargando trabajos...</p>
          ) : (
            <div>
              <ul className="job-list">
                {currentJobs.map((job) => (
                  <li key={job.id} className="job-item">
                    <h3>{job.position}</h3>
                    <p>{job.company}</p>
                    <div className="tag-list">
                      {job.tags.slice(0, 4).map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                      {job.tags.length > 4 && (
                        <span
                          className="tag tag-more"
                          onClick={() => toggleExpandedTags(job.id)}
                        >
                          {expandedTags[job.id]
                            ? `- ${job.tags.length - 4}`
                            : `+ ${job.tags.length - 4}`}
                        </span>
                      )}
                      {expandedTags[job.id] &&
                        job.tags.slice(4).map((tag, index) => (
                          <span key={`extra-${index}`} className="tag">
                            {tag}
                          </span>
                        ))}
                    </div>
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      Ver más detalles
                    </a>
                    <button
                      className="save-button"
                      onClick={() => saveOffer(job)}
                    >
                      Guardar oferta
                    </button>
                  </li>
                ))}
              </ul>
              <div className="pagination">
                {[...Array(totalPages).keys()].map((page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page + 1)}
                    className={`page-button ${
                      currentPage === page + 1 ? "active" : ""
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
        <aside className="home-menu">
          <ul className="icon-menu">
            <li className="icon-item" onClick={goToSavedOffers}>
              <img src="icon1.png" alt="Icono 1" />
              <p>Opción 1</p>
            </li>
            <li className="icon-item">
              <img src="icon2.png" alt="Icono 2" />
              <p>Opción 2</p>
            </li>
            <li className="icon-item">
              <img src="icon3.png" alt="Icono 3" />
              <p>Opción 3</p>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

export default Home;
