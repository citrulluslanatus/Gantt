// gantt.js
import {
    tasks, projectList, currentLang, translations,
    settodayLineColor, showRemainingDays, showTotalDays
  } from './state.js';

  /** Rendert das Gantt-Diagramm */
  export function renderGantt() {
    const gantt = document.getElementById('gantt');
    const ganttCalendarMonths = document.getElementById('ganttCalendarMonths');
    const ganttCalendarDays = document.getElementById('ganttCalendarDays');
    const todayLine = document.getElementById('todayLine');

    gantt.innerHTML = '';
    ganttCalendarMonths.innerHTML = '';
    ganttCalendarDays.innerHTML = '';
    todayLine.style.display = 'none';

    if (tasks.length === 0) return;

    const allDates = tasks.flatMap(t => [new Date(t.start), new Date(t.end)]);
    let minDate = new Date(Math.min(...allDates));
    let maxDate = new Date(Math.max(...allDates));

    // "Heute"
    const now = new Date();
    now.setHours(0,0,0,0);

    // Set times to 0
    minDate.setHours(0,0,0,0);
    maxDate.setHours(0,0,0,0);

    const dayMs = 1000 * 60 * 60 * 24;
    const totalDays = Math.round((maxDate - minDate) / dayMs);
    if (totalDays < 0) return;

    let currentMonth = -1;
    let monthStartIndex = 0;

    // Render day columns
    for (let i = 0; i <= totalDays; i++) {
      // => i Tage nach minDate
      const currentDate = new Date(minDate.getTime() + i * dayMs);

      const thisMonth = currentDate.getMonth();
      const thisYear = currentDate.getFullYear();

      if (thisMonth !== currentMonth) {
        if (currentMonth !== -1) {
          // Bisherigen Monat abschließen
          createMonthBlock(currentMonth, thisYear, monthStartIndex, i-1, totalDays, minDate, ganttCalendarMonths);
        }
        currentMonth = thisMonth;
        monthStartIndex = i;
      }

      // Tag-Spalte
      const dayDiv = document.createElement('div');
      dayDiv.className = 'gantt-day';

      // Nur Montags anzeigen
      if (translations[currentLang].isMonday(currentDate)) {
        dayDiv.textContent = translations[currentLang].formatDate(currentDate);
      }
      ganttCalendarDays.appendChild(dayDiv);

      // Heute-Linie
      if (currentDate.getTime() === now.getTime()) {
        placeTodayLine(i, totalDays);
      }

      // Letzter Tag => Monat beenden
      if (i === totalDays) {
        createMonthBlock(currentMonth, thisYear, monthStartIndex, i, totalDays, minDate, ganttCalendarMonths);
      }
    }

    // Gruppierung nach Projekt
    const grouped = {};
    tasks.forEach((t) => {
      if (!grouped[t.project]) {
        grouped[t.project] = [];
      }
      grouped[t.project].push(t);
    });

    // Sortierte Projektnamen
    const sortedProjects = Object.keys(grouped).sort();
    sortedProjects.forEach((projName, projIndex) => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'gantt-group';
      if (projIndex === 0) {
        groupDiv.style.borderTop = 'none';
      }

      // Projekt-Header
      const headerDiv = document.createElement('div');
      headerDiv.className = 'gantt-group-header';

      const h4 = document.createElement('h4');
      h4.className = 'gantt-project-title';
      const color = projectList.find((p) => p.name === projName)?.color || '#444';
      h4.style.color = color;
      h4.textContent = projName;
      headerDiv.appendChild(h4);

      groupDiv.appendChild(headerDiv);

      // Tasks
      const projectTasks = grouped[projName].sort((a, b) => a.start.localeCompare(b.start));
      projectTasks.forEach((taskObj) => {
        const row = document.createElement('div');
        row.className = 'gantt-row';

        // Label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'gantt-label';

        // Nur Task-Name
        const taskSpan = document.createElement('span');
        taskSpan.className = 'label-task';
        taskSpan.textContent = taskObj.task;
        taskSpan.style.color = taskObj.completed ? '#999' : taskObj.projectColor;

        labelDiv.appendChild(taskSpan);

        // Balken
        const bar = document.createElement('div');
        bar.className = 'gantt-bar';
        if (taskObj.completed) {
          bar.classList.add('completed');
        } else {
          bar.style.backgroundColor = taskObj.projectColor;
        }

        const startDate = new Date(taskObj.start);
        const endDate = new Date(taskObj.end);
        const offsetDays = Math.round((startDate - minDate) / dayMs);
        const durationDays = Math.round((endDate - startDate) / dayMs);

        if (totalDays > 0) {
          bar.style.marginLeft = `${(offsetDays / totalDays) * 100}%`;
          bar.style.width = `${(durationDays / totalDays) * 100}%`;
        } else {
          bar.style.marginLeft = '0%';
          bar.style.width = '100%';
        }

        // Beschriftung (Gesamtzeit / Restzeit)
        let barText = "";
        if (showTotalDays) {
          barText = (currentLang === "de")
            ? `${durationDays} Tage`
            : `${durationDays} days`;
        }
        // Resttage
        if (showRemainingDays && !taskObj.completed) {
          const diffNow = Math.round((endDate - now) / dayMs);
          if (diffNow >= 0) {
            if (barText) barText += " ";
            barText += (currentLang === "de")
              ? `(${diffNow} übrig)`
              : `(${diffNow} left)`;
          }
        }
        if (barText) {
          bar.appendChild(document.createTextNode(barText));
        }

        row.appendChild(labelDiv);
        row.appendChild(bar);
        groupDiv.appendChild(row);
      });

      gantt.appendChild(groupDiv);
    });
  }

  /** Erzeugt einen Monat-Block in der oberen Zeile */
  function createMonthBlock(
    month, year, startIndex, endIndex, totalDays,
    minDate, parent
  ) {
    const monthDiv = document.createElement('div');
    monthDiv.className = 'gantt-month';

    // i18n
    // (gekürzt, nimm Dein vollständiges monthNamesDe / monthNamesEn)
    const t = translations[currentLang];
    const monthNamesDe = [
      'Januar','Februar','März','April','Mai','Juni',
      'Juli','August','September','Oktober','November','Dezember'
    ];
    const monthNamesEn = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];
    const name = (currentLang === 'de')
      ? monthNamesDe[month]
      : monthNamesEn[month];

    const title = `${name} ${year}`;
    monthDiv.textContent = title;

    const span = endIndex - startIndex + 1;
    if (totalDays > 0) {
      monthDiv.style.flex = `0 0 ${(span / (totalDays + 1)) * 100}%`;
    } else {
      monthDiv.style.flex = '0 0 100%';
    }

    parent.appendChild(monthDiv);
  }

  /** Platziert die "Heute"-Linie */
  function placeTodayLine(index, totalDays) {
    const todayLine = document.getElementById('todayLine');
    if (!todayLine || totalDays <= 0) return;

    const percent = (index / totalDays) * 100;
    todayLine.style.display = 'block';
    todayLine.style.left = `calc(${percent}% + 180px)`;
    todayLine.style.backgroundColor = todayLineColor;
  }
