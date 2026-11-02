
/* ========== Settings Elements ========== */

const settingsForm = document.querySelector("#settingsForm");
const resetSettingsBtn = document.querySelector("#resetSettings");
const settingsMessage = document.querySelector("#settingsMessage");

const SETTINGS_KEY = "nexahrSettings";

const defaultSettings = {
    fullName: "Ahmed Hassan",
    email: "ahmed@nexahr.com",
    phone: "",
    jobTitle: "Administrator",

    companyName: "NexaHR",
    companyEmail: "info@nexahr.com",
    companyPhone: "",
    companyLocation: "Cairo, Egypt",

    language: "en",
    dateFormat: "DD/MM/YYYY",
    timezone: "Africa/Cairo",

    emailNotifications: true,
    leaveNotifications: true,
    attendanceNotifications: true
};

/* ========== Load Settings ========== */

function loadSettings() {
    let settings = { ...defaultSettings };

    try {
        const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY));

        if (savedSettings && !Array.isArray(savedSettings) && typeof savedSettings === "object") {
            settings = { ...settings, ...savedSettings };
        }
    } catch (error) {
        console.error("Failed to load settings:", error);
    }

    Object.keys(defaultSettings).forEach(key => {
        const field = settingsForm.elements.namedItem(key);

        if (!field) return;

        if (field.type === "checkbox") {
            field.checked = settings[key] === true;
        } else {
            field.value = settings[key] ?? defaultSettings[key];
        }
    });
}

/* ========== Save Settings ========== */

function saveSettings(event) {
    event.preventDefault();

    const newPassword = document.querySelector("#newPassword").value;
    const confirmPassword = document.querySelector("#confirmPassword").value;

    settingsMessage.textContent = "";
    settingsMessage.classList.remove("error");

    if (newPassword || confirmPassword) {
        if (newPassword.length < 8) {
            return showSettingsMessage("Password must contain at least 8 characters.", true);
        }

        if (newPassword !== confirmPassword) {
            return showSettingsMessage("Passwords do not match.", true);
        }

        return showSettingsMessage(
            "Password changes require a secure backend. Other settings were not saved.",
            true
        );
    }

    const settings = {};

    Object.keys(defaultSettings).forEach(key => {
        const field = settingsForm.elements.namedItem(key);

        if (!field) return;

        settings[key] = field.type === "checkbox"
            ? field.checked
            : field.value.trim();
    });

    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        showSettingsMessage("Settings saved successfully.");
    } catch (error) {
        console.error("Failed to save settings:", error);
        showSettingsMessage("Unable to save settings in this browser.", true);
    }
}

/* ========== Reset Settings ========== */

function resetSettings() {
    if (!confirm("Are you sure you want to reset all settings to their default values?")) return;

    try {
        localStorage.removeItem(SETTINGS_KEY);
        settingsForm.reset();
        loadSettings();

        document.querySelector("#newPassword").value = "";
        document.querySelector("#confirmPassword").value = "";

        showSettingsMessage("Settings have been reset.");
    } catch (error) {
        console.error("Failed to reset settings:", error);
        showSettingsMessage("Unable to reset settings.", true);
    }
}

/* ========== Show Message ========== */

function showSettingsMessage(message, isError = false) {
    settingsMessage.textContent = message;
    settingsMessage.classList.toggle("error", isError);
}

/* ========== Event Listeners ========== */

settingsForm.addEventListener("submit", saveSettings);
resetSettingsBtn.addEventListener("click", resetSettings);


/* ========== Start Settings ========== */

loadSettings();
