// state.js
export let tasks = [];
export let projectList = [];
export let currentLang = "de";
export let currentTheme = "light";
export let todayLineColor = "#FF0000";
export let showRemainingDays = true;
export let showTotalDays = true;

/** i18n-Objekt (Deutsch, Englisch) */
export const translations = {
  de: {
    title: "Projektmanager",
    // ... dein kompletter i18n-Code ...
    confirmClear: "Achtung! Alle Eingaben werden gelöscht. Fortfahren?",
    // etc...
  },
  en: {
    title: "Project Manager",
    // ... ...
    confirmClear: "Warning! This will clear all data. Continue?",
    // ...
  }
};

/** Lädt den State aus localStorage (falls vorhanden) */
export function loadStateFromLocalStorage() {
  const storedData = JSON.parse(localStorage.getItem('ganttData')) || {};
  tasks = storedData.tasks || [];
  projectList = storedData.projectList || [];
  currentLang = storedData.language || "de";
  currentTheme = storedData.theme || "light";
  todayLineColor = storedData.todayLineColor || "#FF0000";
  showRemainingDays = !!storedData.showRemainingDays;
  showTotalDays = (storedData.showTotalDays !== false);
}

/** Speichert den aktuellen State ins localStorage */
export function saveAllToLocalStorage() {
  const dataToSave = {
    tasks,
    projectList,
    language: currentLang,
    theme: currentTheme,
    todayLineColor,
    showRemainingDays,
    showTotalDays
  };
  localStorage.setItem('ganttData', JSON.stringify(dataToSave));
}
