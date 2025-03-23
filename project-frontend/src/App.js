import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Home from "./Home";
import SavedOffers from "./SavedOffers"; // SavedOffers importado
import { UserProvider } from "./UserContext";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/saved-offers" element={<SavedOffers />} />{" "}
          {/* Anadir ruta */}
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
