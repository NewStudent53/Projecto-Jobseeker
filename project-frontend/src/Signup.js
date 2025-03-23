import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./styles.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }
    return "";
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const error = validatePassword(newPassword);
    setPasswordError(error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordError) {
      alert("Corrige los errores antes de enviar el formulario.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/signup", {
        username,
        password,
      });
      alert("Cuenta creada exitosamente");
    } catch (error) {
      console.error(error);
      alert("Error al crear la cuenta.");
    }
  };

  return (
    <div className="form-container">
      <h1>Signup</h1>
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
          onChange={handlePasswordChange}
          required
        />
        {passwordError && <p className="error-message">{passwordError}</p>}
        <button type="submit" className="form-button">
          Sign Up
        </button>
        <Link to="/login" className="form-link">
          Ya tienes cuenta? Inicia sesión
        </Link>
      </form>
    </div>
  );
}

export default Signup;
