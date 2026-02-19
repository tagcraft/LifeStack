const API_BASE = "http://localhost:5000";

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const tabButtons = document.querySelectorAll(".tab-button");
const errorBox = document.getElementById("auth-error");

const showError = (message) => {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
};

const clearError = () => {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
};

const handleAuthSuccess = (token) => {
  localStorage.setItem("token", token);
  window.location.href = "dashboard.html";
};

const toggleTab = (tab) => {
  tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tab));
  loginForm.classList.toggle("hidden", tab !== "login");
  registerForm.classList.toggle("hidden", tab !== "register");
  clearError();
};

tabButtons.forEach((button) => {
  button.addEventListener("click", () => toggleTab(button.dataset.tab));
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const formData = new FormData(loginForm);
  const payload = {
    email: formData.get("email"),
    password: formData.get("password")
  };

  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    handleAuthSuccess(data.token);
  } catch (error) {
    showError(error.message);
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const formData = new FormData(registerForm);
  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password")
  };

  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    handleAuthSuccess(data.token);
  } catch (error) {
    showError(error.message);
  }
});

if (localStorage.getItem("token")) {
  window.location.href = "dashboard.html";
}
