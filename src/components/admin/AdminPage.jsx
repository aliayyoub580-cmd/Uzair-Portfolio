/**
 * Shared page wrapper used by every admin panel.
 * Renders the standard welcome-row header + optional action buttons.
 */
export default function AdminPage({ eyebrow = 'PORTFOLIO', title, subtitle, actions, children }) {
  return (
    <div className="dashboard-content">
      <section className="welcome-row">
        <div>
          <p className="eyebrow"><span />{eyebrow}</p>
          <h1>{title} <span>✦</span></h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="date-actions">{actions}</div>}
      </section>
      {children}
    </div>
  );
}
