const authModal = document.querySelector("#auth-modal");
const reportModal = document.querySelector("#report-modal");
const claimModal = document.querySelector("#claim-modal");
const toast = document.querySelector("#toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 4200);
}

function showAuth(mode = "login") {
  setAuthMode(mode);
  authModal.showModal();
}

function setAuthMode(mode) {
  const register = mode === "register";
  document.querySelector("#auth-title").textContent = register ? "Make it official." : "Good to see you.";
  document.querySelector("#auth-description").textContent = register
    ? "Create an account to help your campus community."
    : "Log in to connect with your campus community.";
  document.querySelector("#auth-submit").innerHTML = `${register ? "Create account" : "Log in"} <span aria-hidden="true">↗</span>`;
  document.querySelector('[name="password"]').autocomplete = register ? "new-password" : "current-password";
  document.querySelector(".register-only").hidden = !register;
  document.querySelector(".register-only input").required = register;
  document.querySelectorAll("[data-auth-tab]").forEach((tab) => {
    const active = tab.dataset.authTab === mode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  document.querySelector("#auth-notice").hidden = true;
}

document.querySelectorAll("[data-open-auth]").forEach((button) => {
  button.addEventListener("click", () => showAuth(button.dataset.openAuth));
});

document.querySelectorAll("[data-auth-tab]").forEach((button) => {
  button.addEventListener("click", () => setAuthMode(button.dataset.authTab));
});

document.querySelectorAll("[data-open-report]").forEach((button) => {
  button.addEventListener("click", () => {
    reportModal.showModal();
    const dateInput = reportModal.querySelector('[name="date"]');
    if (!dateInput.value) dateInput.value = new Date().toISOString().slice(0, 10);
  });
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

document.querySelector("#auth-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("#auth-notice").hidden = false;
});

const searchInput = document.querySelector("#search-input");
const categoryFilter = document.querySelector("#category-filter");
const dateFilter = document.querySelector("#date-filter");

function filterListings() {
  const term = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const dateRange = dateFilter.value;
  const now = new Date();
  let visibleCount = 0;

  document.querySelectorAll(".item-card").forEach((card) => {
    const categoryMatches = category === "all" || card.dataset.category === category;
    const searchMatches = !term || `${card.dataset.search} ${card.textContent}`.toLowerCase().includes(term);
    const itemDate = new Date(`${card.dataset.date}T00:00:00`);
    const daysOld = (now - itemDate) / 86400000;
    const dateMatches = dateRange === "all" || (dateRange === "week" ? daysOld <= 7 : daysOld <= 31);
    const visible = categoryMatches && searchMatches && dateMatches;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  document.querySelector("#empty-state").hidden = visibleCount > 0;
}

searchInput.addEventListener("input", filterListings);
categoryFilter.addEventListener("change", filterListings);
dateFilter.addEventListener("change", filterListings);

const photoInput = document.querySelector("#photo-input");
let photoUrl;
photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  document.querySelector("#photo-name").textContent = file ? file.name : "Optional, but helpful";
  const preview = document.querySelector("#photo-preview");
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  preview.replaceChildren();
  preview.hidden = !file;
  if (file) {
    photoUrl = URL.createObjectURL(file);
    const image = document.createElement("img");
    image.src = photoUrl;
    image.alt = "Preview of selected item photo";
    preview.append(image);
  }
});

document.querySelector("#report-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const itemName = formData.get("item-name").trim();
  const category = formData.get("category");
  const date = formData.get("date");
  const description = formData.get("description").trim();
  const type = formData.get("report-type");
  const file = photoInput.files[0];
  const card = document.createElement("article");
  const image = document.createElement("div");
  const emoji = document.createElement("span");
  const badge = document.createElement("span");
  const note = document.createElement("span");
  const details = document.createElement("div");
  const meta = document.createElement("div");
  const categoryLabel = document.createElement("span");
  const dateLabel = document.createElement("span");
  const title = document.createElement("h3");
  const summary = document.createElement("p");
  const claimButton = document.createElement("button");
  const claimArrow = document.createElement("span");

  card.className = "item-card";
  card.dataset.category = category;
  card.dataset.date = date;
  card.dataset.search = `${itemName} ${category} ${description}`.toLowerCase();
  image.className = `item-image ${file ? "" : "image-notebook"}`;
  emoji.className = "item-emoji";
  badge.className = "listing-badge";
  badge.textContent = type === "found" ? "FOUND" : "LOST";
  note.className = "image-note";
  note.textContent = file ? "" : "shared with care";
  if (file) {
    const uploadedImage = document.createElement("img");
    uploadedImage.src = URL.createObjectURL(file);
    uploadedImage.alt = `Photo of ${itemName}`;
    uploadedImage.style.cssText = "width:100%;height:100%;object-fit:cover;position:absolute;inset:0";
    image.append(uploadedImage);
  } else {
    emoji.textContent = "📦";
    image.append(emoji);
  }
  image.append(badge, note);

  details.className = "item-details";
  meta.className = "item-meta";
  categoryLabel.textContent = category.toUpperCase();
  dateLabel.textContent = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase();
  meta.append(categoryLabel, dateLabel);
  title.textContent = itemName;
  summary.textContent = description;
  claimButton.className = "claim-link";
  claimButton.type = "button";
  claimButton.dataset.claim = itemName;
  claimButton.textContent = type === "found" ? "This might be mine" : "I found this item";
  claimArrow.textContent = "↗";
  claimButton.append(claimArrow);
  details.append(meta, title, summary, claimButton);
  card.append(image, details);
  document.querySelector("#listing-grid").prepend(card);
  document.querySelector("#report-form").reset();
  document.querySelector("#photo-name").textContent = "Optional, but helpful";
  document.querySelector("#photo-preview").replaceChildren();
  document.querySelector("#photo-preview").hidden = true;
  reportModal.close();
  filterListings();
  document.querySelector("#browse").scrollIntoView({ behavior: "smooth" });
  showToast("Your listing was added to this page. Connect a backend to publish it for everyone.");
});

document.querySelector("#listing-grid").addEventListener("click", (event) => {
  const button = event.target.closest(".claim-link");
  if (button) openClaim(button.dataset.claim, button.textContent.trim());
});

function openClaim(itemName, action) {
  const foundAsResponder = action.toLowerCase().includes("found this item");
  const verificationField = claimModal.querySelector('[name="verification"]');
  document.querySelector("#claim-title").textContent = itemName;
  document.querySelector("#claim-description").textContent = `${foundAsResponder ? "Share where you found this item." : "Tell us how to reach you and share a detail that verifies it's yours."} Claim requests are not sent until a backend is connected.`;
  verificationField.closest("label").firstChild.textContent = foundAsResponder ? "Where did you find it?" : "A detail that verifies it's yours";
  verificationField.placeholder = foundAsResponder
    ? "Add the location and any helpful details..."
    : "Please don't share private information...";
  claimModal.showModal();
}

document.querySelector("#claim-form").addEventListener("submit", (event) => {
  event.preventDefault();
  claimModal.close();
  event.currentTarget.reset();
  showToast("Claim requests aren't connected yet. Your details were not sent or saved.");
});

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  menuToggle.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
  mainNav.classList.toggle("open", !expanded);
});
mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  });
});