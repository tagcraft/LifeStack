const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
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
const budgetTotal = document.getElementById("budget-total");
const budgetLegend = document.getElementById("budget-legend");
const budgetDonut = document.getElementById("budget-donut");
const budgetCount = document.getElementById("budget-count");

const eventForm = document.getElementById("event-form");
const calendarGrid = document.getElementById("calendar-grid");
const plannerMonth = document.getElementById("planner-month");
const plannerPrev = document.getElementById("planner-prev");
const plannerNext = document.getElementById("planner-next");
const plannerToday = document.getElementById("planner-today");
const dashboardGreeting = document.getElementById("dashboard-greeting");
const dashboardDate = document.getElementById("dashboard-date");
const dashboardTodos = document.getElementById("dashboard-todos");
const habitStackedBar = document.getElementById("habit-stacked-bar");
const dashboardBudgetTotal = document.getElementById("dashboard-budget-total");
const dashboardBudgetTop = document.getElementById("dashboard-budget-top");
const dashboardCalendar = document.getElementById("dashboard-mini-calendar");
const dashboardUpcomingList = document.getElementById("dashboard-upcoming-list");
const dashboardQuote = document.getElementById("dashboard-quote");
const dashboardQuoteAuthor = document.getElementById("dashboard-quote-author");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
});

const habitPalette = [
  { accent: "#8a5bff", soft: "rgba(138, 91, 255, 0.25)" },
  { accent: "#2ed3ff", soft: "rgba(46, 211, 255, 0.22)" },
  { accent: "#ff7a5c", soft: "rgba(255, 122, 92, 0.22)" },
  { accent: "#57f4b6", soft: "rgba(87, 244, 182, 0.2)" },
  { accent: "#ffc857", soft: "rgba(255, 200, 87, 0.2)" }
];

const expensePalette = ["#ff2ea6", "#8a5bff", "#2ed3ff", "#57f4b6", "#ffc857", "#ff7a5c"];

const apiRequest = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

const dashboardState = {
  todos: [],
  habits: [],
  expenses: [],
  events: []
};

const quotes = [
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Small steps every day lead to big results.", author: "Unknown" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "You don’t have to be great to start, but you have to start to be great.", author: "Zig Ziglar" }
];

const setQuote = () => {
  if (!dashboardQuote || !dashboardQuoteAuthor) return;
  const dayIndex = new Date().getDate() % quotes.length;
  const quote = quotes[dayIndex];
  dashboardQuote.textContent = quote.text;
  dashboardQuoteAuthor.textContent = `— ${quote.author}`;
};

const formatDateLong = (date) =>
  date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

const getStoredUserName = () => {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    const user = JSON.parse(stored);
    return user && user.name ? user.name : null;
  } catch {
    return null;
  }
};

const renderDashboardList = (container, items) => {
  if (!container) return;
  container.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.textContent = "Nothing here yet.";
    container.appendChild(empty);
    return;
  }
  items.forEach((item) => container.appendChild(item));
};

const updateDashboard = () => {
  if (!dashboardGreeting) return;

  const name = getStoredUserName();
  dashboardGreeting.textContent = name ? `Welcome back, ${name}.` : "Welcome back.";
  if (dashboardDate) {
    dashboardDate.textContent = formatDateLong(new Date());
  }

  setQuote();

  const todos = dashboardState.todos || [];
  const pending = todos.filter((todo) => !todo.completed);
  const focus = (pending.length ? pending : todos).slice(0, 3);
  const todoItems = focus.map((todo) => {
    const row = document.createElement("div");
    row.className = "dashboard-item";
    const title = document.createElement("span");
    title.textContent = todo.title;
    const badge = document.createElement("span");
    badge.className = "dashboard-badge";
    badge.textContent = todo.completed ? "Done" : "Pending";
    row.append(title, badge);
    return row;
  });
  renderDashboardList(dashboardTodos, todoItems);

  const habits = dashboardState.habits || [];
  renderHabitStackedBars(habits);

  const expenses = dashboardState.expenses || [];
  const totals = expenses.reduce((acc, expense) => {
    const category = expense.category ? expense.category.trim() : "Other";
    const amount = Number(expense.amount) || 0;
    if (!acc[category]) acc[category] = 0;
    acc[category] += amount;
    return acc;
  }, {});
  const totalAmount = Object.values(totals).reduce((sum, value) => sum + value, 0);
  const topEntry = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  if (dashboardBudgetTotal) dashboardBudgetTotal.textContent = formatCurrency(totalAmount);
  if (dashboardBudgetTop) {
    dashboardBudgetTop.textContent = topEntry
      ? `${topEntry[0]} (${formatCurrency(topEntry[1])})`
      : "—";
  }

  const events = dashboardState.events || [];
  renderMiniCalendar(events);
  renderUpcomingEvents(events);
};

const renderMiniCalendar = (events) => {
  if (!dashboardCalendar) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const todayKey = dateKey(now);

  const eventKeys = new Set(
    events
      .map((eventItem) => eventDateKey(eventItem.date))
      .filter((key) => key && key.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`))
  );

  const header = document.createElement("div");
  header.className = "mini-calendar-header";
  header.textContent = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const weekdays = document.createElement("div");
  weekdays.className = "mini-calendar-weekdays";
  ["S", "M", "T", "W", "T", "F", "S"].forEach((label) => {
    const span = document.createElement("span");
    span.textContent = label;
    weekdays.appendChild(span);
  });

  const grid = document.createElement("div");
  grid.className = "mini-calendar-grid";

  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - startOffset + 1;
    const cell = document.createElement("div");
    cell.className = "mini-day";
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      cell.classList.add("empty");
      grid.appendChild(cell);
      continue;
    }
    cell.textContent = dayNumber;
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(
      2,
      "0"
    )}`;
    if (key === todayKey) {
      cell.classList.add("today");
    }
    if (eventKeys.has(key)) {
      cell.classList.add("has-event");
    }
    grid.appendChild(cell);
  }

  dashboardCalendar.innerHTML = "";
  dashboardCalendar.append(header, weekdays, grid);
};

const renderUpcomingEvents = (events) => {
  if (!dashboardUpcomingList) return;
  const todayKey = dateKey(new Date());
  const upcoming = events
    .map((eventItem) => ({
      ...eventItem,
      key: eventDateKey(eventItem.date)
    }))
    .filter((eventItem) => eventItem.key && eventItem.key >= todayKey)
    .sort((a, b) => (a.key > b.key ? 1 : -1))
    .slice(0, 3);

  const items = upcoming.map((eventItem) => {
    const row = document.createElement("div");
    row.className = "dashboard-item";
    const title = document.createElement("span");
    title.textContent = eventItem.title;
    const badge = document.createElement("span");
    badge.className = "dashboard-badge";
    badge.textContent = eventItem.key;
    row.append(title, badge);
    return row;
  });

  renderDashboardList(dashboardUpcomingList, items);
};

const renderHabitStackedBars = (habits) => {
  if (!habitStackedBar) return;

  const weekDates = getWeekDates();
  const keys = weekDates.map(dateKey);
  const totalHabits = habits.length;
  const habitColors = habits.map(
    (_, index) => habitPalette[index % habitPalette.length].accent
  );

  habitStackedBar.innerHTML = "";

  keys.forEach((key, index) => {
    const completedHabits = habits.filter(
      (habit) => Array.isArray(habit.completionHistory) && habit.completionHistory.includes(key)
    );

    const bar = document.createElement("div");
    bar.className = "stacked-bar";
    bar.title = `${weekDates[index].toLocaleDateString("en-US", { weekday: "long" })}: ${completedHabits.length}/${totalHabits}`;

    completedHabits.forEach((habit) => {
      const habitIndex = habits.indexOf(habit);
      const color = habitColors[habitIndex] || habitPalette[0].accent;
      const segment = document.createElement("div");
      segment.className = "stacked-segment filled";
      segment.style.background = color;
      bar.appendChild(segment);
    });

    habitStackedBar.appendChild(bar);
  });
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

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.action;
    if (!target) return;
    switchSection(target);

    if (target === "todos") {
      todoForm?.querySelector("input[name=\"title\"]")?.focus();
    }
    if (target === "habits") {
      habitForm?.querySelector("input[name=\"name\"]")?.focus();
    }
    if (target === "money") {
      expenseForm?.querySelector("input[name=\"title\"]")?.focus();
    }
    if (target === "planner") {
      eventForm?.querySelector("input[name=\"title\"]")?.focus();
    }
  });
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
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
  dashboardState.todos = todos;
  renderList(todoList, todos.map(createTodoItem));
  updateDashboard();
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

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const getWeekDates = () => {
  const today = startOfDay(new Date());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
};

const getHabitWeek = (habit) => {
  const history = Array.isArray(habit.completionHistory)
    ? habit.completionHistory
    : [];
  const historySet = new Set(history);
  const today = startOfDay(new Date());

  return getWeekDates().map((date) => {
    const key = dateKey(date);
    const isCompleted = historySet.has(key);
    const isPast = date.getTime() < today.getTime();
    const isMissed = !isCompleted && isPast;
    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
      completed: isCompleted,
      missed: isMissed
    };
  });
};


const createHabitItem = (habit, index) => {
  const item = document.createElement("div");
  item.className = "habit-card";

  const palette = habitPalette[index % habitPalette.length];
  item.style.setProperty("--habit-accent", palette.accent);
  item.style.setProperty("--habit-accent-soft", palette.soft);

  const week = getHabitWeek(habit);
  const completedCount = week.filter((day) => day.completed).length;
  const progressPercent = Math.round((completedCount / 7) * 100);

  const progress = document.createElement("div");
  progress.className = "habit-progress";

  const progressLabel = document.createElement("div");
  progressLabel.className = "habit-progress-label";
  progressLabel.textContent = `${progressPercent}%`;
  progress.style.setProperty("--progress", `${progressPercent}%`);
  progress.append(progressLabel);

  const header = document.createElement("div");
  header.className = "habit-header";

  const title = document.createElement("div");
  title.className = "habit-title";
  title.textContent = habit.name;

  const meta = document.createElement("div");
  meta.className = "habit-meta";
  const description = habit.description ? habit.description.trim() : "";
  meta.textContent = description
    ? `${description} - This week: ${completedCount}/7 completed`
    : `This week: ${completedCount}/7 completed`;

  header.append(title, meta);

  const tracker = document.createElement("div");
  tracker.className = "habit-tracker";

  const weekRow = document.createElement("div");
  weekRow.className = "habit-week";
  week.forEach((day) => {
    const dayEl = document.createElement("div");
    dayEl.className = "habit-day";
    if (day.completed) {
      dayEl.classList.add("completed");
    }
    if (day.missed) {
      dayEl.classList.add("missed");
    }
    dayEl.title = day.label;

    const label = document.createElement("span");
    label.className = "habit-day-label";
    label.textContent = day.label;

    const mark = document.createElement("span");
    mark.className = "habit-day-mark";
    mark.textContent = day.completed ? "v" : day.missed ? "x" : "";

    dayEl.append(label, mark);
    weekRow.appendChild(dayEl);
  });

  const actions = document.createElement("div");
  actions.className = "habit-actions";

  const completeButton = document.createElement("button");
  completeButton.className = "ghost-button";
  completeButton.textContent = "Complete";
  completeButton.addEventListener("click", async () => {
    try {
      await apiRequest(`/api/habits/complete/${habit._id}`, { method: "PUT" });
      loadHabits();
    } catch (error) {
      if (error.message && error.message.toLowerCase().includes("already completed")) {
        return;
      }
      console.error(error);
    }
  });

  const deleteButton = document.createElement("button");
  deleteButton.className = "ghost-button danger";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", async () => {
    await apiRequest(`/api/habits/${habit._id}`, { method: "DELETE" });
    loadHabits();
  });

  actions.append(completeButton, deleteButton);
  tracker.append(weekRow, actions);

  item.append(progress, header, tracker);
  return item;
};

const loadHabits = async () => {
  const habits = await apiRequest("/api/habits");
  dashboardState.habits = habits;
  renderList(
    habitList,
    habits.map((habit, index) => createHabitItem(habit, index))
  );
  updateDashboard();
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

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const updateBudgetChart = (expenses) => {
  const totals = expenses.reduce((acc, expense) => {
    const category = expense.category ? expense.category.trim() : "Other";
    const amount = Number(expense.amount) || 0;
    if (!acc[category]) acc[category] = 0;
    acc[category] += amount;
    return acc;
  }, {});

  const totalAmount = Object.values(totals).reduce((sum, value) => sum + value, 0);

  if (budgetTotal) {
    budgetTotal.textContent = formatCurrency(totalAmount);
  }

  if (budgetCount) {
    budgetCount.textContent = `${expenses.length} item${expenses.length === 1 ? "" : "s"}`;
  }

  if (!budgetDonut || !budgetLegend) return;

  const entries = Object.entries(totals).filter(([, value]) => value > 0);
  if (!entries.length) {
    budgetDonut.style.background =
      "conic-gradient(rgba(255, 255, 255, 0.08) 0deg, rgba(255, 255, 255, 0.08) 360deg)";
    budgetLegend.innerHTML = '<div class="muted">No expenses yet.</div>';
    return;
  }

  let current = 0;
  const segments = entries.map(([category, value], index) => {
    const fraction = value / totalAmount;
    const deg = fraction * 360;
    const start = current;
    const end = current + deg;
    current = end;
    const color = expensePalette[index % expensePalette.length];
    return { category, value, color, start, end };
  });

  budgetDonut.style.background = `conic-gradient(${segments
    .map((seg) => `${seg.color} ${seg.start}deg ${seg.end}deg`)
    .join(", ")})`;

  budgetLegend.innerHTML = "";
  segments.forEach((segment) => {
    const row = document.createElement("div");
    row.className = "budget-legend-item";

    const left = document.createElement("div");
    left.className = "budget-legend-left";

    const swatch = document.createElement("span");
    swatch.className = "budget-legend-swatch";
    swatch.style.background = segment.color;

    const label = document.createElement("span");
    label.textContent = segment.category;

    const amount = document.createElement("span");
    amount.className = "muted";
    amount.textContent = formatCurrency(segment.value);

    left.append(swatch, label);
    row.append(left, amount);
    budgetLegend.appendChild(row);
  });
};

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

const loadExpenses = async () => {
  const expenses = await apiRequest("/api/expenses");
  dashboardState.expenses = expenses;
  renderList(expenseList, expenses.map(createExpenseItem));
  updateBudgetChart(expenses);
  updateDashboard();
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

let plannerDate = new Date();
let plannerEvents = [];

const padNumber = (value) => String(value).padStart(2, "0");

const toDateKey = (date) =>
  `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;

const eventDateKey = (value) => {
  if (!value) return null;
  const raw = String(value);
  const datePart = raw.split("T")[0];
  const parts = datePart.split("-");
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    return `${parts[0]}-${parts[1]}-${parts[2]}`;
  }
  return toDateKey(new Date(value));
};

const formatMonthYear = (date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const renderCalendar = () => {
  if (!calendarGrid || !plannerMonth) return;

  const year = plannerDate.getFullYear();
  const month = plannerDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  plannerMonth.textContent = formatMonthYear(plannerDate);
  calendarGrid.innerHTML = "";

  const eventsByDay = plannerEvents.reduce((acc, eventItem) => {
    const key = eventDateKey(eventItem.date);
    if (!key) return acc;
    acc[key] = acc[key] || [];
    acc[key].push(eventItem);
    return acc;
  }, {});

  const today = new Date();
  const todayKey = toDateKey(today);

  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - startOffset + 1;
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      cell.classList.add("is-empty");
      calendarGrid.appendChild(cell);
      continue;
    }

    const cellDate = new Date(year, month, dayNumber);
    const dateKey = toDateKey(cellDate);
    cell.dataset.date = dateKey;
    if (dateKey === todayKey) {
      cell.classList.add("is-today");
    }

    const dayLabel = document.createElement("div");
    dayLabel.className = "calendar-day";
    dayLabel.textContent = dayNumber;
    cell.appendChild(dayLabel);

    const eventsForDay = eventsByDay[dateKey] || [];
    eventsForDay.slice(0, 3).forEach((eventItem) => {
      const eventRow = document.createElement("div");
      eventRow.className = "calendar-event";

      const title = document.createElement("span");
      title.textContent = eventItem.title;
      title.title = eventItem.title;

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "event-delete";
      deleteBtn.textContent = "x";
      deleteBtn.dataset.eventId = eventItem._id;
      deleteBtn.setAttribute("aria-label", `Delete ${eventItem.title}`);

      eventRow.append(title, deleteBtn);
      cell.appendChild(eventRow);
    });

    if (eventsForDay.length > 3) {
      const more = document.createElement("div");
      more.className = "event-more";
      more.textContent = `+${eventsForDay.length - 3} more`;
      cell.appendChild(more);
    }

    calendarGrid.appendChild(cell);
  }
};

const loadEvents = async () => {
  const events = await apiRequest("/api/events");
  plannerEvents = events;
  renderCalendar();
  dashboardState.events = events;
  updateDashboard();
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

if (plannerPrev && plannerNext && plannerToday) {
  plannerPrev.addEventListener("click", () => {
    plannerDate = new Date(plannerDate.getFullYear(), plannerDate.getMonth() - 1, 1);
    renderCalendar();
  });

  plannerNext.addEventListener("click", () => {
    plannerDate = new Date(plannerDate.getFullYear(), plannerDate.getMonth() + 1, 1);
    renderCalendar();
  });

  plannerToday.addEventListener("click", () => {
    plannerDate = new Date();
    renderCalendar();
  });
}

if (calendarGrid) {
  calendarGrid.addEventListener("click", async (event) => {
    const deleteBtn = event.target.closest(".event-delete");
    if (!deleteBtn) return;
    const eventId = deleteBtn.dataset.eventId;
    if (!eventId) return;
    await apiRequest(`/api/events/${eventId}`, { method: "DELETE" });
    loadEvents();
  });
}

const initDashboard = async () => {
  switchSection("dashboard");
  renderCalendar();
  await Promise.all([loadTodos(), loadHabits(), loadExpenses(), loadEvents()]);
};

initDashboard().catch((error) => {
  console.error(error);
});



