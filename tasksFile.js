// tasksFile.js
import {
    tasks, projectList, currentLang, currentTheme,
    todayLineColor, showRemainingDays, showTotalDays,
    translations, saveAllToLocalStorage
  } from './state.js';
  import { rebuildProjectDropdown, renderTaskList } from './main.js';
  import { renderGantt } from './gantt.js';
  
  /** "Speichern unter..." => JSON */
  export function saveTasksAsFile() {
    let defaultName = (currentLang === "de") ? "tasks.json" : "tasks_en.json";
    const filename = prompt(translations[currentLang].promptFilename, defaultName);
    if (!filename) return;
  
    let finalName = filename;
    if (!finalName.toLowerCase().endsWith(".json")) {
      finalName += ".json";
    }
  
    const data = {
      tasks,
      projectList,
      language: currentLang,
      theme: currentTheme,
      todayLineColor,
      showRemainingDays,
      showTotalDays
    };
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
          tasks.splice(0, tasks.length, ...imported.tasks);
          projectList.splice(0, projectList.length, ...(imported.projectList || []));
          currentLang = imported.language || "de";
          currentTheme = imported.theme || "light";
          todayLineColor = imported.todayLineColor || "#FF0000";
          showRemainingDays = !!imported.showRemainingDays;
          showTotalDays = (imported.showTotalDays !== false);
  
          saveAllToLocalStorage();
          applyLanguage(currentLang);
          applyTheme(currentTheme);
  
          document.getElementById('todayLineColorInput').value = todayLineColor;
          document.getElementById('showRemainingDays').checked = showRemainingDays;
          document.getElementById('showTotalDays').checked = showTotalDays;
  
          rebuildProjectDropdown();
          renderTaskList();
          renderGantt();
        } catch (err) {
          alert((currentLang === 'de')
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
  
  /** Theme + Language Setter (wenn Du sie auslagern willst) */
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
    currentTheme = theme;
    saveAllToLocalStorage();
  }
  
  export function applyLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
  
    document.getElementById('title').textContent = t.title;
    // usw... (die restlichen UI-Elemente)
    saveAllToLocalStorage();
  }
  
  /** Set Heute-Linienfarbe */
  export function setTodayLineColor(color) {
    todayLineColor = color;
    saveAllToLocalStorage();
  }
  
  /** Set showRemainingDays */
  export function setShowRemainingDays(val) {
    showRemainingDays = val;
    saveAllToLocalStorage();
  }
  
  /** Set showTotalDays */
  export function setShowTotalDays(val) {
    showTotalDays = val;
    saveAllToLocalStorage();
  }
  