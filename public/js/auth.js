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

const handleAuthSuccess = (token, user) => {
  localStorage.setItem("token", token);
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
  window.location.href = "main.html";
};

const toggleTab = (tab) => {
  tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tab));
  loginForm.classList.toggle("hidden", tab !== "login");
  registerForm.classList.toggle("hidden", tab !== "register");
  clearError();
};

const getDefaultTab = () => {
  const fromDataset = document.body.dataset.defaultTab;
  const fromQuery = new URLSearchParams(window.location.search).get("tab");
  return fromDataset || fromQuery || "login";
};

tabButtons.forEach((button) => {
  button.addEventListener("click", () => toggleTab(button.dataset.tab));
});

toggleTab(getDefaultTab());

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const formData = new FormData(loginForm);
  const payload = {
    email: formData.get("email"),
    password: formData.get("password")
  };

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    handleAuthSuccess(data.token, data.user);
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
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    handleAuthSuccess(data.token, data.user);
  } catch (error) {
    showError(error.message);
  }
});

if (localStorage.getItem("token")) {
  window.location.href = "main.html";
}
