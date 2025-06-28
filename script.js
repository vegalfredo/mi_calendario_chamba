document.addEventListener('DOMContentLoaded', function() {
    // --- NUEVA AGRUPACIÓN POR TRIMESTRES (Q) ---
    const quartersData = {
        'Q1': [
            { id: 'P01', title: 'DIC 29 - ENE 25', startDate: '2024-12-29' },
            { id: 'P02', title: 'ENE 26 - FEB 22', startDate: '2025-01-26' },
            { id: 'P03', title: 'FEB 23 - MAR 22', startDate: '2025-02-23' }
        ],
        'Q2': [
            { id: 'P04', title: 'MAR 23 - ABR 19', startDate: '2025-03-23' },
            { id: 'P05', title: 'ABR 20 - MAY 17', startDate: '2025-04-20' },
            { id: 'P06', title: 'MAY 18 - JUN 14', startDate: '2025-05-18' }
        ],
        'Q3': [
            { id: 'P07', title: 'JUN 15 - JUL 12', startDate: '2025-06-15' },
            { id: 'P08', title: 'JUL 13 - AGO 9', startDate: '2025-07-13' },
            { id: 'P09', title: 'AGO 10 - SEP 6', startDate: '2025-08-10' }
        ],
        'Q4': [
            { id: 'P10', title: 'SEP 7 - OCT 4', startDate: '2025-09-07' },
            { id: 'P11', title: 'OCT 5 - NOV 1', startDate: '2025-10-05' },
            { id: 'P12', title: 'NOV 2 - NOV 29', startDate: '2025-11-02' },
            { id: 'P13', title: 'NOV 30 - DIC 27', startDate: '2025-11-30' }
        ]
    };

    const container = document.getElementById('calendar-container');
    const modal = document.getElementById('note-modal');
    const modalDateDisplay = document.getElementById('modal-date-display');
    const noteTextarea = document.getElementById('note-textarea');
    const saveBtn = document.getElementById('save-note-btn');
    const deleteBtn = document.getElementById('delete-note-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    let currentEditingDate = null;

    function initCalendar() {
        for (const quarterName in quartersData) {
            const quarterContainer = document.createElement('div');
            quarterContainer.className = 'quarter-container';

            const quarterTitle = document.createElement('div');
            quarterTitle.className = 'quarter-title';
            quarterTitle.textContent = quarterName;
            quarterContainer.appendChild(quarterTitle);

            const periodsWrapper = document.createElement('div');
            periodsWrapper.className = 'periods-wrapper';

            quartersData[quarterName].forEach(period => {
                periodsWrapper.appendChild(createPeriodCalendar(period));
            });

            quarterContainer.appendChild(periodsWrapper);
            container.appendChild(quarterContainer);
        }
        
        addEventListeners();
        updateHighlights();
    }

    function createPeriodCalendar(period) {
        const periodDiv = document.createElement('div');
        periodDiv.className = 'period-calendar';

        const idDiv = document.createElement('div');
        idDiv.className = 'period-id';
        idDiv.textContent = period.id;
        periodDiv.appendChild(idDiv);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'calendar-content';

        const header = document.createElement('div');
        header.className = 'period-header';
        header.textContent = period.title;
        contentDiv.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'calendar-grid';
        const daysOfWeek = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            grid.appendChild(dayHeader);
        });

        const startDate = new Date(period.startDate + 'T00:00:00');
        
        for (let i = 0; i < 28; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const cell = document.createElement('div');
            cell.className = 'date-cell';
            cell.textContent = currentDate.getDate();
            cell.dataset.date = currentDate.toISOString().split('T')[0];
            
            grid.appendChild(cell);
        }

        contentDiv.appendChild(grid);
        periodDiv.appendChild(contentDiv);
        return periodDiv;
    }

    // --- LÓGICA DE COLORES COMPLETAMENTE ACTUALIZADA ---
    function updateHighlights() {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalizar a medianoche

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        document.querySelectorAll('.date-cell').forEach(cell => {
            const cellDateStr = cell.dataset.date;
            const cellDate = new Date(cellDateStr + 'T00:00:00');

            // Limpiar clases previas
            cell.classList.remove('has-note', 'is-due-today', 'is-due-soon', 'today-special', 'disabled');

            const note = localStorage.getItem(`note-${cellDateStr}`);
            const isPast = cellDate < today;
            const isToday = cellDate.getTime() === today.getTime();
            const isTomorrow = cellDate.getTime() === tomorrow.getTime();

            // Lógica para fechas pasadas
            if (isPast) {
                cell.classList.add('disabled');
                // Si tiene nota, no se le pone color.
            } 
            // Lógica para el día de hoy
            else if (isToday) {
                if (note) {
                    cell.classList.add('is-due-today'); // Rojo
                } else {
                    const tomorrowNote = localStorage.getItem(`note-${tomorrow.toISOString().split('T')[0]}`);
                    if (tomorrowNote) {
                        cell.classList.add('is-due-soon'); // Amarillo
                    } else {
                        cell.classList.add('today-special'); // Verde especial
                    }
                }
            } 
            // Lógica para fechas futuras
            else {
                if (note) {
                    cell.classList.add('has-note'); // Verde normal
                }
            }
        });
    }

    function openModal(date) {
        currentEditingDate = date;
        modalDateDisplay.textContent = date;
        noteTextarea.value = localStorage.getItem(`note-${date}`) || '';
        modal.classList.remove('hidden');
        noteTextarea.focus();
    }

    function closeModal() {
        modal.classList.add('hidden');
        currentEditingDate = null;
    }

    function addEventListeners() {
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('date-cell')) {
                openModal(e.target.dataset.date);
            }
        });

        closeBtn.addEventListener('click', closeModal);

        saveBtn.addEventListener('click', () => {
            if (currentEditingDate) {
                const noteText = noteTextarea.value.trim();
                if (noteText) {
                    localStorage.setItem(`note-${currentEditingDate}`, noteText);
                } else {
                    localStorage.removeItem(`note-${currentEditingDate}`);
                }
                updateHighlights();
                closeModal();
            }
        });

        deleteBtn.addEventListener('click', () => {
             if (currentEditingDate) {
                localStorage.removeItem(`note-${currentEditingDate}`);
                updateHighlights();
                closeModal();
            }
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
        // --- NUEVA FUNCIÓN PARA EL AUTO-SCROLL ---
    function scrollToCurrentPeriod() {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayCell = document.querySelector(`.date-cell[data-date="${todayStr}"]`);

        // Si se encuentra la celda de hoy en alguno de los calendarios...
        if (todayCell) {
            // Buscamos el contenedor del calendario completo al que pertenece la celda
            const parentCalendar = todayCell.closest('.quarter-container');
            if (parentCalendar) {
                // Hacemos scroll suave hasta ese contenedor para que quede centrado en la pantalla
                parentCalendar.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }





    initCalendar();


    // Luego, inmediatamente después, haz scroll al periodo actual
    scrollToCurrentPeriod();
});


