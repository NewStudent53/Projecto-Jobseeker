import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "./UserContext";
import "./styles.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUsername: setGlobalUsername } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", username);
      setGlobalUsername(username);
      alert("Login exitoso");
      navigate("/home");
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión");
    }
  };

  return (
    <div className="form-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          className="input-field"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="form-button">
          Login
        </button>
        <Link to="/signup" className="form-link">
          No tienes cuenta? Regístrate
        </Link>
      </form>
    </div>
  );
}

export default Login;
