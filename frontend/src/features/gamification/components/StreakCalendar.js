// Streak Calendar Component
export const StreakCalendar = {
  render(days) {
    if (!days?.length) return '<div class="empty-state"><p>Sem dados de streak</p></div>';

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Group by week
    const weeks = [];
    let currentWeek = [];
    
    days.forEach((day, i) => {
      currentWeek.push(day);
      if (day.date.getDay() === 6 || i === days.length - 1) { // Saturday or last day
        // Pad beginning of week if needed
        while (currentWeek.length < 7 && currentWeek[0]?.date.getDay() !== 0) {
          currentWeek.unshift(null);
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return `
      <div class="streak-calendar" role="table" aria-label="Calendário de streak das últimas ${weeks.length} semanas">
        <table>
          <thead>
            <tr>
              ${weekDays.map(d => `<th scope="col">${d}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${weeks.map((week, weekIndex) => `
              <tr>
                ${week.map((day, dayIndex) => `
                  ${day ? `
                    <td>
                      <div class="streak-day ${day.completed ? 'completed' : ''} ${day.today ? 'today' : ''}" 
                           role="gridcell" 
                           aria-label="${day.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}: ${day.completed ? 'Completado' : 'Pendente'}${day.today ? ' (hoje)' : ''}"
                           tabindex="0">
                      </div>
                    </td>
                  ` : '<td aria-hidden="true"></td>'}
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
};