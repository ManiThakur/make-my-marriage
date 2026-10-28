export function AuthShowcase() {
  return (
    <section className="auth-showcase" aria-label="A preview of your shared wedding workspace">
      <div>
        <span className="auth-badge"><span aria-hidden="true">✳</span> Shared family workspace</span>
        <h1>Your family’s <em>wedding</em> sanctuary.</h1>
        <p className="auth-intro">Bring the ceremonies, guest list, and all the people you love into one thoughtful place.</p>
      </div>

      <div className="preview-card">
        <div className="preview-accent" />
        <div className="preview-couple">
          <span className="couple-monogram">A&amp;M</span>
          <span><b>Aarav &amp; Meera</b><small>Winter celebration · 2027</small></span>
          <span className="active-pill"><i /> Sample</span>
        </div>
        <div className="preview-countdown"><span>▣</span><b>118 days until the wedding</b><small>UDAIPUR</small></div>
        <div className="preview-metrics">
          <div><small>RSVP responses</small><b>69%</b><span className="metric-bar"><i /></span><small>312 of 450 confirmed</small></div>
          <div><small>Vendor budget</small><b>₹19,45,000</b><small className="on-track">✓ &nbsp;On track</small></div>
        </div>
        <div className="preview-task"><span>♫</span><span><b>Sangeet choreography &amp; transport</b><small>Assigned to Uncle Alok · Due in 4 days</small></span></div>
        <div className="preview-family"><span>Currently in the room:</span><span className="preview-avatars"><i>M</i><i>A</i><i>S</i><i>R</i></span></div>
      </div>
      <p className="auth-note"><span aria-hidden="true">❧</span> “Keeping every celebration in calm harmony.”</p>
    </section>
  );
}
