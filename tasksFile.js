// tasksFile.js

import {
  tasks,
  projectList,
  getCurrentLang,
  setCurrentLang,
  getCurrentTheme,
  setCurrentTheme,
  getTodayLineColor,
  setTodayLineColor as setLineColorInState,
  getShowRemainingDays,
  setShowRemainingDays as setRemainingDaysInState,
  getShowTotalDays,
  setShowTotalDays as setTotalDaysInState,
  translations,
  saveAllToLocalStorage
} from './state.js';

import { rebuildProjectDropdown, renderTaskList } from './main.js';
import { renderGantt } from './gantt.js';

/** "Speichern unter..." => JSON */
export function saveTasksAsFile() {
  // Hol dir die aktuelle Sprache aus dem State
  const lang = getCurrentLang();
  
  let defaultName = (lang === "de") ? "tasks.json" : "tasks_en.json";
  const filename = prompt(translations[lang].promptFilename, defaultName);
  if (!filename) return;

  let finalName = filename;
  if (!finalName.toLowerCase().endsWith(".json")) {
    finalName += ".json";
  }

  // Erstelle ein Datenobjekt
  const data = {
    tasks,
    projectList,
    language: getCurrentLang(),
    theme: getCurrentTheme(),
    todayLineColor: getTodayLineColor(),
    showRemainingDays: getShowRemainingDays(),
    showTotalDays: getShowTotalDays()
  };

  // Als JSON-Datei herunterladen
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = finalName;
  a.click();
}

/** "Laden" => JSON-Datei importieren */
export function loadTasksFromFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!imported || !Array.isArray(imported.tasks)) {
          throw new Error("Invalid JSON format (no tasks array)");
        }
        // tasks & projectList direkt leeren und überschreiben
        tasks.splice(0, tasks.length, ...imported.tasks);
        projectList.splice(0, projectList.length, ...(imported.projectList || []));

        // Sprache
        setCurrentLang(imported.language || "de");
        // Theme
        setCurrentTheme(imported.theme || "light");
        // Today-Line
        setLineColorInState(imported.todayLineColor || "#FF0000");
        // Checkboxes
        setRemainingDaysInState(!!imported.showRemainingDays);
        setTotalDaysInState(imported.showTotalDays !== false);

        // Speicherung
        saveAllToLocalStorage();
        
        // UI aktualisieren
        applyLanguage(getCurrentLang());
        applyTheme(getCurrentTheme());

        // HTML-Elemente aktualisieren
        document.getElementById('todayLineColorInput').value = getTodayLineColor();
        document.getElementById('showRemainingDays').checked = getShowRemainingDays();
        document.getElementById('showTotalDays').checked = getShowTotalDays();

        rebuildProjectDropdown();
        renderTaskList();
        renderGantt();
      } catch (err) {
        const lang = getCurrentLang();
        alert((lang === 'de')
          ? "Fehler beim Laden: " + err
          : "Error loading file: " + err);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/** Export Chart als PNG */
export function exportChartAsPNG() {
  const container = document.querySelector('.gantt-chart-container');
  if (!container) return;
  html2canvas(container, { scale: 2 }).then(canvas => {
    const link = document.createElement('a');
    link.download = "gantt-chart.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

/** Theme-Wechseln */
export function applyTheme(theme) {
  const body = document.body;
  body.classList.remove('theme-light','theme-dark','theme-muted');
  switch (theme) {
    case 'dark':
      body.classList.add('theme-dark');
      break;
    case 'muted':
      body.classList.add('theme-muted');
      break;
    default:
      body.classList.add('theme-light');
      break;
  }
  setCurrentTheme(theme); // <-- Speichere im State
  saveAllToLocalStorage();
}

/** Sprach-Wechseln */
export function applyLanguage(lang) {
  setCurrentLang(lang);
  const t = translations[getCurrentLang()];

  // Beispiel: aktualisiere nur ein paar Elemente
  document.getElementById('title').textContent = t.title;
  // ... hier ggf. weitere UI-Elemente anpassen ...

  saveAllToLocalStorage();
}

/** Set Heute-Linienfarbe (Proxy-Funktion) */
export function setTodayLineColor(color) {
  setLineColorInState(color);
  saveAllToLocalStorage();
}

/** Set showRemainingDays */
export function setShowRemainingDays(val) {
  setRemainingDaysInState(val);
  saveAllToLocalStorage();
}

/** Set showTotalDays */
export function setShowTotalDays(val) {
  setTotalDaysInState(val);
  saveAllToLocalStorage();
}
