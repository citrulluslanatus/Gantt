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
      labelProject: "Projekt:",
      placeholderProjectSelect: "Projekt auswählen oder eingeben",
      placeholderProjectInput: "Neues Projekt eingeben",
      labelTask: "Aufgabe:",
      labelStart: "Startdatum:",
      labelEnd: "Enddatum:",
      btnAddTask: "Hinzufügen",

      taskListHeading: "Aufgabenliste",
      chartHeading: "Gantt-Chart",
      settingsHeading: "Einstellungen",
      themeLabel: "Farbschema:",
      languageLabel: "Sprache:",
      todayLineColorLabel: "Heute-Linienfarbe:",
      showRemainingDaysLabel: "Verbleibende Tage anzeigen",
      showTotalDaysLabel: "Gesamtzeit in Tagen anzeigen",

      btnSave: "Speichern",
      btnSaveAs: "Speichern unter...",
      btnLoad: "Laden",
      btnExportPNG: "Chart als PNG",
      btnClearAll: "Neu",

      editModalTitle: "Aufgabe bearbeiten",
      editLabelProjectName: "Projekt:",
      editLabelProjectColor: "Farbe:",
      editLabelTaskName: "Aufgabe:",
      editLabelStart: "Startdatum:",
      editLabelEnd: "Enddatum:",

      promptFilename: "Bitte Dateinamen eingeben",
      confirmClear: "Achtung! Alle Eingaben werden gelöscht. Fortfahren?",
      confirmDeleteTask: "Bist du sicher, dass du diese Aufgabe löschen möchtest?",
      confirmDeleteProject: "Möchtest du wirklich das gesamte Projekt löschen (alle Aufgaben)?",

      editButtonTitle: "Bearbeiten",
      deleteButtonTitle: "Löschen",

      formatDate: (date) => {
        const d = String(date.getDate()).padStart(2, "0");
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const y = date.getFullYear();
        return `${d}.${m}.${y}`;
      },
      isMonday: (date) => date.getDay() === 1,

      // Projekt-Modal
      editProjectModalTitle: "Projekt bearbeiten",
      placeholderProjectName: "Neuer Projektname",
    },
    en: {
      title: "Project Manager",
      labelProject: "Project:",
      placeholderProjectSelect: "Select or enter a project",
      placeholderProjectInput: "Enter a new project",
      labelTask: "Task:",
      labelStart: "Start date:",
      labelEnd: "End date:",
      btnAddTask: "Add",

      taskListHeading: "Task List",
      chartHeading: "Gantt Chart",
      settingsHeading: "Settings",
      themeLabel: "Color Scheme:",
      languageLabel: "Language:",
      todayLineColorLabel: "Today line color:",
      showRemainingDaysLabel: "Show remaining days",
      showTotalDaysLabel: "Show total days",

      btnSave: "Save",
      btnSaveAs: "Save as...",
      btnLoad: "Load",
      btnExportPNG: "Chart as PNG",
      btnClearAll: "New",

      editModalTitle: "Edit Task",
      editLabelProjectName: "Project:",
      editLabelProjectColor: "Color:",
      editLabelTaskName: "Task:",
      editLabelStart: "Start date:",
      editLabelEnd: "End date:",

      promptFilename: "Please enter a filename",
      confirmClear: "Warning! This will clear all data. Continue?",
      confirmDeleteTask: "Are you sure you want to delete this task?",
      confirmDeleteProject: "Are you sure you want to delete this entire project (all tasks)?",

      editButtonTitle: "Edit",
      deleteButtonTitle: "Delete",

      formatDate: (date) => {
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      },
      isMonday: (date) => date.getDay() === 1,

      // Projekt-Modal
      editProjectModalTitle: "Edit Project",
      placeholderProjectName: "New project name",
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
