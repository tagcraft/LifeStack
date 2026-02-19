const API_BASE = "http://localhost:5000";

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "index.html";
}

const navButtons = document.querySelectorAll(".nav-button[data-section]");
const sections = document.querySelectorAll(".content-section");
const logoutButton = document.getElementById("logout-button");

const todoForm = document.getElementById("todo-form");
const todoList = document.getElementById("todo-list");

const habitForm = document.getElementById("habit-form");
const habitList = document.getElementById("habit-list");

const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const monthlyTotal = document.getElementById("monthly-total");

const eventForm = document.getElementById("event-form");
const eventList = document.getElementById("event-list");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
});

const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

const switchSection = (sectionKey) => {
  navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.section === sectionKey));
  sections.forEach((section) =>
    section.classList.toggle("active", section.id === `section-${sectionKey}`)
  );
};

navButtons.forEach((button) => {
  button.addEventListener("click", () => switchSection(button.dataset.section));
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

const renderList = (container, items) => {
  container.innerHTML = "";
  items.forEach((item) => container.appendChild(item));
};

const createTodoItem = (todo) => {
  const item = document.createElement("div");
  item.className = "list-item";

  const label = document.createElement("div");
  label.innerHTML = `<strong>${todo.title}</strong>`;
  if (todo.completed) {
    label.innerHTML += '<div class="muted">Completed</div>';
  }

  const actions = document.createElement("div");
  actions.className = "item-actions";

  const toggle = document.createElement("label");
  toggle.className = "toggle";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.addEventListener("change", async () => {
    await apiRequest(`/api/todos/${todo._id}`, {
      method: "PUT",
      body: JSON.stringify({ completed: checkbox.checked })
    });
    loadTodos();
  });
  toggle.appendChild(checkbox);
  toggle.appendChild(document.createTextNode("Complete"));

  const deleteButton = document.createElement("button");
  deleteButton.className = "ghost-button danger";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", async () => {
    await apiRequest(`/api/todos/${todo._id}`, { method: "DELETE" });
    loadTodos();
  });

  actions.append(toggle, deleteButton);
  item.append(label, actions);
  return item;
};

const loadTodos = async () => {
  const todos = await apiRequest("/api/todos");
  renderList(todoList, todos.map(createTodoItem));
};

todoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(todoForm);
  const title = formData.get("title");
  if (!title) return;
  await apiRequest("/api/todos", {
    method: "POST",
    body: JSON.stringify({ title })
  });
  todoForm.reset();
  loadTodos();
});

const createHabitItem = (habit) => {
  const item = document.createElement("div");
  item.className = "list-item";

  const info = document.createElement("div");
  info.innerHTML = `<strong>${habit.name}</strong><div class="muted">Streak: ${
    habit.streak || 0
  }</div>`;
  if (habit.description) {
    info.innerHTML += `<div class="muted">${habit.description}</div>`;
  }

  const actions = document.createElement("div");
  actions.className = "item-actions";

  const completeButton = document.createElement("button");
  completeButton.className = "ghost-button";
  completeButton.textContent = "Complete";
  completeButton.addEventListener("click", async () => {
    await apiRequest(`/api/habits/complete/${habit._id}`, { method: "PUT" });
    loadHabits();
  });

  const deleteButton = document.createElement("button");
  deleteButton.className = "ghost-button danger";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", async () => {
    await apiRequest(`/api/habits/${habit._id}`, { method: "DELETE" });
    loadHabits();
  });

  actions.append(completeButton, deleteButton);
  item.append(info, actions);
  return item;
};

const loadHabits = async () => {
  const habits = await apiRequest("/api/habits");
  renderList(habitList, habits.map(createHabitItem));
};

habitForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(habitForm);
  const name = formData.get("name");
  const description = formData.get("description");
  if (!name) return;
  await apiRequest("/api/habits", {
    method: "POST",
    body: JSON.stringify({ name, description })
  });
  habitForm.reset();
  loadHabits();
});

const createExpenseItem = (expense) => {
  const item = document.createElement("div");
  item.className = "list-item";

  const info = document.createElement("div");
  const amount = Number(expense.amount || 0).toFixed(2);
  info.innerHTML = `<strong>${expense.title}</strong><div class="muted">${expense.category}</div>`;

  const actions = document.createElement("div");
  actions.className = "item-actions";

  const amountBadge = document.createElement("span");
  amountBadge.className = "muted";
  amountBadge.textContent = `$${amount}`;

  const deleteButton = document.createElement("button");
  deleteButton.className = "ghost-button danger";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", async () => {
    await apiRequest(`/api/expenses/${expense._id}`, { method: "DELETE" });
    loadExpenses();
  });

  actions.append(amountBadge, deleteButton);
  item.append(info, actions);
  return item;
};

const loadMonthlySummary = async () => {
  const data = await apiRequest("/api/expenses/summary/month");
  monthlyTotal.textContent = `$${Number(data.total || 0).toFixed(2)}`;
};

const loadExpenses = async () => {
  const expenses = await apiRequest("/api/expenses");
  renderList(expenseList, expenses.map(createExpenseItem));
  loadMonthlySummary();
};

expenseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(expenseForm);
  const payload = {
    title: formData.get("title"),
    amount: Number(formData.get("amount")),
    category: formData.get("category")
  };
  await apiRequest("/api/expenses", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  expenseForm.reset();
  loadExpenses();
});

const createEventItem = (event) => {
  const item = document.createElement("div");
  item.className = "list-item";

  const info = document.createElement("div");
  const dateText = event.date ? new Date(event.date).toLocaleDateString() : "";
  info.innerHTML = `<strong>${event.title}</strong><div class="muted">${dateText}</div>`;

  const actions = document.createElement("div");
  actions.className = "item-actions";

  const deleteButton = document.createElement("button");
  deleteButton.className = "ghost-button danger";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", async () => {
    await apiRequest(`/api/events/${event._id}`, { method: "DELETE" });
    loadEvents();
  });

  actions.append(deleteButton);
  item.append(info, actions);
  return item;
};

const loadEvents = async () => {
  const events = await apiRequest("/api/events");
  renderList(eventList, events.map(createEventItem));
};

eventForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(eventForm);
  const payload = {
    title: formData.get("title"),
    date: formData.get("date")
  };
  await apiRequest("/api/events", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  eventForm.reset();
  loadEvents();
});

const initDashboard = async () => {
  switchSection("todos");
  await Promise.all([loadTodos(), loadHabits(), loadExpenses(), loadEvents()]);
};

initDashboard().catch((error) => {
  console.error(error);
});
