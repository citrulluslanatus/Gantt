// tasks.js

import {
    tasks, projectList, currentLang,
    saveAllToLocalStorage, translations
  } from './state.js';
  
  import { rebuildProjectDropdown, renderTaskList } from './main.js';
  import { renderGantt } from './gantt.js';
  
  /** Fügt einen neuen Task hinzu */
  export function addTask(newProject, selectedProject, newProjectColor, taskValue, startDate, endDate) {
    const project = newProject || selectedProject;
    const color = getProjectColor(project) || newProjectColor;
    if (!project || !taskValue || !startDate || !endDate) {
      alert((currentLang === "de")
        ? "Bitte alle Felder ausfüllen!"
        : "Please fill in all fields!");
      return;
      saveAllToLocalStorage();
    }
    // Projekt evtl. anlegen
    if (newProject && !getProjectColor(newProject)) {
      projectList.push({ name: newProject, color });
    } else if (!getProjectColor(project)) {
      projectList.push({ name: project, color });
    }
  
    const id = Date.now();
    tasks.push({
      id,
      project,
      projectColor: color,
      task: taskValue,
      start: startDate,
      end: endDate,
      completed: false
    });
  
    saveAllToLocalStorage();
    rebuildProjectDropdown();
    renderTaskList();
    renderGantt();
  }
  
  /** Holt die Farbe eines Projekts */
  export function getProjectColor(projectName) {
    const found = projectList.find((p) => p.name === projectName);
    return found ? found.color : null;
  }
  
  /** Löscht einen Task aus dem Array */
  export function deleteTask(taskId) {
    const t = translations[currentLang];
    if (!confirm(t.confirmDeleteTask)) return;
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index !== -1) {
      tasks.splice(index, 1);
      saveAllToLocalStorage();
      rebuildProjectDropdown();
      renderTaskList();
      renderGantt();
    }
  }
  
  /** Markiert einen Task als completed / uncompleted */
  export function toggleTaskCompletion(taskId, completed) {
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index !== -1) {
      tasks[index].completed = completed;
      saveAllToLocalStorage();
    }
    renderTaskList();
    renderGantt();
  }
  
  /** Öffnet das Modal zum Bearbeiten eines Tasks */
  export function openEditModal(taskId) {
    const modal = document.getElementById('editModal');
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
  
    document.getElementById('editTaskId').value = String(task.id);
    document.getElementById('editProjectName').value = task.project;
    document.getElementById('editProjectColor').value = task.projectColor;
    document.getElementById('editTaskName').value = task.task;
    document.getElementById('editStart').value = task.start;
    document.getElementById('editEnd').value = task.end;
  
    modal.style.display = 'block';
  }
  
  /** Speichert Änderungen aus dem Aufgaben-Modal */
  export function saveModalChanges() {
    const taskId = parseInt(document.getElementById('editTaskId').value, 10);
    const newProjectName = document.getElementById('editProjectName').value.trim();
    const newProjectColor = document.getElementById('editProjectColor').value;
    const newTaskName = document.getElementById('editTaskName').value.trim();
    const newStart = document.getElementById('editStart').value;
    const newEnd = document.getElementById('editEnd').value;
  
    const modal = document.getElementById('editModal');
  
    if (!newProjectName || !newTaskName || !newStart || !newEnd) {
      alert((currentLang === "de")
        ? "Bitte alle Felder ausfüllen!"
        : "Please fill in all fields!");
      return;
    }
  
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      tasks[index].project = newProjectName;
      tasks[index].projectColor = newProjectColor;
      tasks[index].task = newTaskName;
      tasks[index].start = newStart;
      tasks[index].end = newEnd;
    }
  
    // Falls Projekt noch nicht in projectList existiert:
    let proj = projectList.find((p) => p.name === newProjectName);
    if (!proj) {
      projectList.push({ name: newProjectName, color: newProjectColor });
    } else {
      proj.color = newProjectColor;
    }
  
    saveAllToLocalStorage();
    modal.style.display = 'none';
  
    rebuildProjectDropdown();
    renderTaskList();
    renderGantt();
  }
  
  /** Leert sämtliche Daten */
  export function clearAllData() {
    const t = translations[currentLang];
    if (!confirm(t.confirmClear)) return;
    tasks.splice(0, tasks.length);
    projectList.splice(0, projectList.length);
  
    saveAllToLocalStorage();
    rebuildProjectDropdown();
    renderTaskList();
    renderGantt();
  }
  
