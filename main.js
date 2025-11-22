const html = document.documentElement;
const btn = document.getElementById("themeToggle");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  html.classList.add("dark");
}

btn.addEventListener("click", () => {
  const isDark = html.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Rest of your burger menu code remains the same...
const burgerMenu = document.getElementById("burgerMenu");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav a");

burgerMenu.addEventListener("click", () => {
  burgerMenu.classList.toggle("active");
  navMenu.classList.toggle("active");
  document.body.classList.toggle("menu-open");
});

// Close menu when clicking on a link
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    burgerMenu.classList.remove("active");
    navMenu.classList.remove("active");
    document.body.classList.remove("menu-open");
  });
});

// Close menu when clicking overlay
document.addEventListener("click", (e) => {
  if (
    document.body.classList.contains("menu-open") &&
    !navMenu.contains(e.target) &&
    !burgerMenu.contains(e.target)
  ) {
    burgerMenu.classList.remove("active");
    navMenu.classList.remove("active");
    document.body.classList.remove("menu-open");
  }
});