// Stats Card Component
export const StatsCard = {
  render({ icon, value, label, sublabel, iconClass }) {
    return `
      <div class="stat-card">
        <div class="stat-icon ${iconClass}" aria-hidden="true">${icon}</div>
        <div class="stat-content">
          <div class="stat-value">${value}</div>
          <div class="stat-label">${label}</div>
          ${sublabel ? `<div class="stat-sublabel">${sublabel}</div>` : ''}
        </div>
      </div>
    `;
  }
};