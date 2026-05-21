// Sprint 43-stable — Section Plan et facturation (V1 mockée)

export function CompteSectionPlan() {
  return (
    <section className="compte-section glass-z2">
      <h2 className="compte-section-title">Plan et facturation</h2>
      <p className="compte-section-subtitle">Ton abonnement actuel et historique.</p>

      <div className="compte-plan-card">
        <div className="compte-plan-info">
          <div className="compte-plan-name">Plan Pro</div>
          <div className="compte-plan-price">490 € par mois</div>
          <div className="compte-plan-status">Renouvellement automatique le 15 juin 2026</div>
        </div>
      </div>

      <h3 className="compte-subsection-title">Historique des factures</h3>
      <ul className="compte-invoices">
        {[
          { date: '15 mai 2026', amount: '490 €', status: 'Payée' },
          { date: '15 avril 2026', amount: '490 €', status: 'Payée' },
          { date: '15 mars 2026', amount: '490 €', status: 'Payée' },
        ].map((inv, i) => (
          <li key={i} className="compte-invoice">
            <span>{inv.date}</span>
            <span>{inv.amount}</span>
            <span className="compte-invoice-status">{inv.status}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
