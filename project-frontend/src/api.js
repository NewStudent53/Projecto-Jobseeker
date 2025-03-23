import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Obtener los trabajos
export const fetchJobs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/jobs`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
};

// Obtener el usuario actual
export const fetchUser = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};
