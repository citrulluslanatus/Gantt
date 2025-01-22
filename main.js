// main.js
import {
    tasks, projectList, currentLang, currentTheme,
    todayLineColor, showRemainingDays, showTotalDays,
    translations, loadStateFromLocalStorage, saveAllToLocalStorage
  } from './state.js';
  
  import {
    addTask, getProjectColor, deleteTask, toggleTaskCompletion,
    openEditModal, saveModalChanges, clearAllData
  } from './tasks.js';
  
  import { renderGantt } from './gantt.js';
  
  /** WICHTIG:
   *  Weil wir tasks + projectList etc. in tasks.js manipulieren,
   *  wollen wir "TaskList" Render-Funktion hier definieren,
   *  um sie aufzurufen, wenn sich tasks ändern.
   */
  
  export function renderTaskList() {
    const tasksContainer = document.getElementById('tasksContainer');
  
    // gruppieren
    const grouped = {};
    tasks.forEach(t => {
      if (!grouped[t.project]) grouped[t.project] = [];
      grouped[t.project].push(t);
    });
  
    const sortedProjectNames = Object.keys(grouped).sort();
    if (sortedProjectNames.length === 0) {
      tasksContainer.innerHTML = (currentLang === 'de')
        ? "<p>Keine Aufgaben vorhanden.</p>"
        : "<p>No tasks available.</p>";
      return;
    }
  
    tasksContainer.innerHTML = '';
  
    sortedProjectNames.forEach(projectName => {
      const projColor = getProjectColor(projectName) || '#444';
  
      // Projektblock
      const blockDiv = document.createElement('div');
      blockDiv.className = 'project-block';
  
      // Header
      const headerDiv = document.createElement('div');
      headerDiv.className = 'project-header';
  
      const h3 = document.createElement('h3');
      h3.textContent = projectName;
      h3.style.color = projColor;
  
      headerDiv.appendChild(h3);
  
      // Toggle
      const toggleBtn = document.createElement('button');
      toggleBtn.textContent = '▲';
      toggleBtn.style.backgroundColor = '#666';
      toggleBtn.style.color = '#fff';
      const tasksDiv = document.createElement('div');
      tasksDiv.className = 'project-tasks';
      toggleBtn.addEventListener('click', () => {
        if (tasksDiv.style.display === 'none') {
          tasksDiv.style.display = 'block';
          toggleBtn.textContent = '▲';
        } else {
          tasksDiv.style.display = 'none';
          toggleBtn.textContent = '▼';
        }
      });
      headerDiv.appendChild(toggleBtn);
  
      blockDiv.appendChild(headerDiv);
  
      // UL
      const ul = document.createElement('ul');
      const projectTasks = grouped[projectName];
      projectTasks.forEach(taskObj => {
        const li = document.createElement('li');
  
        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = taskObj.completed;
        checkbox.addEventListener('change', () => {
          toggleTaskCompletion(taskObj.id, checkbox.checked);
        });
  
        // Label
        const labelSpan = document.createElement('span');
        labelSpan.style.color = taskObj.completed ? '#999' : taskObj.projectColor;
  
        const t = translations[currentLang];
        const startFormatted = formatDateLocal(taskObj.start);
        const endFormatted = formatDateLocal(taskObj.end);
  
        if (currentLang === 'de') {
          labelSpan.textContent = `${taskObj.task} (${startFormatted} bis ${endFormatted})`;
        } else {
          labelSpan.textContent = `${taskObj.task} (${startFormatted} to ${endFormatted})`;
        }
  
        // Edit
        const editButton = document.createElement('button');
        editButton.style.backgroundColor = '#17a2b8';
        editButton.title = t.editButtonTitle;
        editButton.textContent = (currentLang === 'de') ? "Bearbeiten" : "Edit";
        editButton.addEventListener('click', () => openEditModal(taskObj.id));
  
        // Delete
        const deleteButton = document.createElement('button');
        deleteButton.title = t.deleteButtonTitle;
        deleteButton.textContent = (currentLang === 'de') ? "Löschen" : "Delete";
        deleteButton.addEventListener('click', () => deleteTask(taskObj.id));
  
        if (taskObj.completed) li.classList.add('completed');
  
        li.appendChild(checkbox);
        li.appendChild(labelSpan);
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        ul.appendChild(li);
      });
  
      tasksDiv.appendChild(ul);
      blockDiv.appendChild(tasksDiv);
      tasksContainer.appendChild(blockDiv);
    });
  }
  
  /** Kleine Hilfsfunktion zum Formatieren 
   *  (kannst Du an deine i18n anpassen oder so lassen) */
  function formatDateLocal(isoString) {
    const date = new Date(isoString);
    return translations[currentLang].formatDate(date);
  }
  
  /** Aktualisiert das <select> Projekt-Liste */
  export function rebuildProjectDropdown() {
    const projectSelect = document.getElementById('project');
    const firstOption = projectSelect.options[0];
    projectSelect.innerHTML = '';
    projectSelect.appendChild(firstOption);
  
    projectList.sort((a,b) => a.name.localeCompare(b.name));
    projectList.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.textContent = p.name;
      projectSelect.appendChild(opt);
    });
  }
  
  /** Startfunktionen beim Laden */
  document.addEventListener('DOMContentLoaded', () => {
    // 1) State laden
    loadStateFromLocalStorage();
  
    // 2) HTML-Elemente referenzieren
    const btnAddTask = document.getElementById('btnAddTask');
    const newProjectInput = document.getElementById('newProject');
    const projectSelect = document.getElementById('project');
    const newProjectColorInput = document.getElementById('newProjectColor');
    const taskInput = document.getElementById('task');
    const startInput = document.getElementById('start');
    const endInput = document.getElementById('end');
  
    const btnModalSave = document.getElementById('btnModalSave');
    const modalClose = document.getElementById('modalClose');
  
    const btnClearAll = document.getElementById('btnClearAll');
    const btnSaveTasks = document.getElementById('btnSaveTasks');
    const btnSaveAs = document.getElementById('btnSaveAs');
    const btnLoadTasks = document.getElementById('btnLoadTasks');
    const btnExportPNG = document.getElementById('btnExportPNG');
  
    // Minimierbare Bereiche
    const toggleTaskListBtn = document.getElementById('toggleTaskList');
    const taskListWrapper = document.getElementById('taskListWrapper');
    const toggleChartBtn = document.getElementById('toggleChart');
    const chartWrapper = document.getElementById('chartWrapper');
    const toggleSettingsBtn = document.getElementById('toggleSettings');
    const settingsBody = document.getElementById('settingsBody');
  
    // Thema, Sprache etc.
    const themeSelect = document.getElementById('themeSelect');
    const languageSelect = document.getElementById('languageSelect');
    const todayLineColorInput = document.getElementById('todayLineColorInput');
    const showRemainingDaysCheckbox = document.getElementById('showRemainingDays');
    const showTotalDaysCheckbox = document.getElementById('showTotalDays');
  
    // 3) Event Listener
    btnAddTask.addEventListener('click', () => {
      // tasks.js -> addTask()
      addTask(
        newProjectInput.value.trim(),
        projectSelect.value.trim(),
        newProjectColorInput.value,
        taskInput.value.trim(),
        startInput.value,
        endInput.value
      );
      // Inputs resetten
      newProjectInput.value = '';
      taskInput.value = '';
      startInput.value = '';
      endInput.value = '';
    });
  
    btnModalSave.addEventListener('click', () => {
      // tasks.js -> saveModalChanges()
      saveModalChanges();
    });
    modalClose.addEventListener('click', () => {
      document.getElementById('editModal').style.display = 'none';
    });
  
    btnClearAll.addEventListener('click', () => {
      clearAllData();
    });
    btnSaveTasks.addEventListener('click', saveAllToLocalStorage);
  
    // "Speichern unter..."
    btnSaveAs.addEventListener('click', () => {
      import('./tasksFile.js').then(module => {
        module.saveTasksAsFile();
      });
    });
  
    // "Laden"
    btnLoadTasks.addEventListener('click', () => {
      import('./tasksFile.js').then(module => {
        module.loadTasksFromFile();
      });
    });
  
    // "PNG"
    btnExportPNG.addEventListener('click', () => {
      import('./tasksFile.js').then(module => {
        module.exportChartAsPNG();
      });
    });
  
    // Minimier-Logik
    toggleTaskListBtn.addEventListener('click', () => {
      if (taskListWrapper.style.display === 'none') {
        taskListWrapper.style.display = 'block';
        toggleTaskListBtn.textContent = '▲';
      } else {
        taskListWrapper.style.display = 'none';
        toggleTaskListBtn.textContent = '▼';
      }
    });
    toggleChartBtn.addEventListener('click', () => {
      if (chartWrapper.style.display === 'none') {
        chartWrapper.style.display = 'block';
        toggleChartBtn.textContent = '▲';
      } else {
        chartWrapper.style.display = 'none';
        toggleChartBtn.textContent = '▼';
      }
    });
    toggleSettingsBtn.addEventListener('click', () => {
      if (settingsBody.style.display === 'none') {
        settingsBody.style.display = 'block';
        toggleSettingsBtn.textContent = '▲';
      } else {
        settingsBody.style.display = 'none';
        toggleSettingsBtn.textContent = '▼';
      }
    });
  
    themeSelect.addEventListener('change', e => {
      import('./tasksFile.js').then(module => {
        module.applyTheme(e.target.value);
      });
    });
    languageSelect.addEventListener('change', e => {
      import('./tasksFile.js').then(module => {
        module.applyLanguage(e.target.value);
        renderTaskList();
        renderGantt();
      });
    });
  
    todayLineColorInput.addEventListener('change', e => {
      import('./tasksFile.js').then(module => {
        module.setTodayLineColor(e.target.value);
        renderGantt();
      });
    });
  
    showRemainingDaysCheckbox.addEventListener('change', e => {
      import('./tasksFile.js').then(module => {
        module.setShowRemainingDays(e.target.checked);
        renderGantt();
      });
    });
  
    showTotalDaysCheckbox.addEventListener('change', e => {
      import('./tasksFile.js').then(module => {
        module.setShowTotalDays(e.target.checked);
        renderGantt();
      });
    });
  
    // 4) UI initialer Zustand
    themeSelect.value = currentTheme;
    languageSelect.value = currentLang;
    todayLineColorInput.value = todayLineColor;
    showRemainingDaysCheckbox.checked = showRemainingDays;
    showTotalDaysCheckbox.checked = showTotalDays;
  
    // 5) ERSTES Rendering
    rebuildProjectDropdown();
    renderTaskList();
    renderGantt();
  });
  
  /** 
   *  Zusätzliche Hilfsfunktionen, falls wir sie 
   *  in tasks.js oder gantt.js aufrufen wollen.
   */
  