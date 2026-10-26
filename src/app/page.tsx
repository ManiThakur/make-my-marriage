const features = [
  {
    number: "01",
    title: "Every celebration, in one plan",
    description:
      "Keep your Mehendi, Haldi, Sangeet and wedding day details together, with timings and venues easy to find.",
    icon: "✳",
  },
  {
    number: "02",
    title: "A to-do list your family can share",
    description:
      "Create tasks, assign an owner and due date, and see what is done without chasing updates across chats.",
    icon: "✓",
  },
  {
    number: "03",
    title: "Guests and RSVPs, less scattered",
    description:
      "Keep guest details and invitations together, then see who is coming as responses arrive.",
    icon: "♡",
  },
  {
    number: "04",
    title: "Keep the little details close",
    description:
      "Save vendor details and expenses in your wedding workspace, and gather everyone’s favourite photos after the celebrations.",
    icon: "⌂",
  },
];

const events = [
  { day: "08", month: "FEB", name: "Mehendi", time: "4:00 PM", tone: "sage" },
  { day: "09", month: "FEB", name: "Sangeet Night", time: "7:30 PM", tone: "peach" },
  { day: "10", month: "FEB", name: "Wedding Ceremony", time: "10:00 AM", tone: "sand" },
];

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true">m<span>♥</span>m</span>;
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Make My Marriage home">
          <BrandMark />
          <span>make my marriage</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">What you can do</a>
        </nav>
        <a className="header-cta" href="#get-started">Get started <span aria-hidden="true">↗</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> MADE FOR THE WAY WE CELEBRATE</p>
          <h1>Plan the wedding.<br /><em>Enjoy the moments.</em></h1>
          <p className="hero-description">
            A shared place for you and your family to bring every wedding detail together — so you can spend less time coordinating and more time celebrating.
          </p>
          <div className="hero-actions" id="get-started">
            <a className="button button-primary" href="/signup">Start planning <span aria-hidden="true">→</span></a>
            <a className="text-link" href="#how-it-works">Take a look around <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-note"><span className="avatar-stack"><i>A</i><i>M</i><i>+</i></span><span>For the two of you, and everyone who makes it special.</span></div>
        </div>

        <div className="hero-art" aria-label="Illustration of a wedding planning dashboard">
          <div className="art-sun" />
          <div className="art-arch"><div className="arch-inner"><span className="arch-spark">✳</span><span className="arch-script">together<br />is a lovely<br />place to be</span><span className="arch-flower">✿</span></div></div>
          <span className="art-stem stem-one">❧</span><span className="art-stem stem-two">❧</span>
          <div className="floating-card card-date"><span className="mini-label">THE WEDDING OF</span><strong>Aarav <i>+</i> Meera</strong><span>10 February 2027 · Jaipur</span></div>
          <div className="floating-card card-count"><span className="count-icon">♡</span><span><strong>One big day</strong><small>A hundred little moments</small></span></div>
          <span className="art-caption">a celebration, made yours</span>
        </div>
      </section>

      <div className="ribbon"><span>ONE SHARED WEDDING SPACE</span><i>✳</i><span>MADE FOR FAMILY</span><i>✳</i><span>ROOM FOR EVERY RITUAL</span><i>✳</i><span>ONE SHARED WEDDING SPACE</span></div>

      <section className="workspace-section" aria-labelledby="workspace-title">
        <div className="section-heading centered">
          <p className="eyebrow">A LITTLE MORE TOGETHER</p>
          <h2 id="workspace-title">All the moving pieces,<br /><em>finally in one place.</em></h2>
          <p>From the first guest list to the last dance, bring your plans out of scattered chats and into a space your family can share.</p>
        </div>

        <div className="dashboard-wrap">
          <div className="dashboard">
            <aside className="dash-sidebar">
              <div className="dash-brand"><BrandMark /><span>make my marriage</span></div>
              <div className="wedding-switch"><span className="couple-avatar">A<span>♥</span>M</span><span><b>Aarav &amp; Meera</b><small>Our wedding</small></span><span className="chevron">⌄</span></div>
              <span className="side-label">YOUR WEDDING</span>
              <span className="side-link active"><i>⌂</i> Overview</span>
              <span className="side-link"><i>✳</i> Events</span>
              <span className="side-link"><i>✓</i> To-do list</span>
              <span className="side-link"><i>♡</i> Guests &amp; RSVPs</span>
              <span className="side-link"><i>♧</i> Vendors &amp; expenses</span>
              <span className="side-link"><i>▧</i> Photos</span>
              <div className="sidebar-help"><span>✿</span><b>It takes a family</b><small>Bring your favourite people into the plans.</small></div>
              <div className="side-profile"><i>AM</i><span><b>Aarav &amp; Meera</b><small>Wedding hosts</small></span><span>···</span></div>
            </aside>

            <div className="dash-main">
              <div className="dash-topline"><span>MONDAY, 12 JANUARY 2027</span><span className="dash-help-link">A little help <b>?</b></span></div>
              <div className="dash-welcome"><div><p className="mini-label">YOUR WEDDING, AT A GLANCE</p><h3>It’s all coming together, Aarav &amp; Meera <span>✳</span></h3><p>Here’s a little look at what’s on your plate.</p></div><div className="countdown"><strong>29</strong><span>DAYS TO GO</span></div></div>
              <div className="stat-grid">
                <div className="stat-card"><span>EVENTS PLANNED</span><strong>6</strong><small>across 3 celebration days</small><i className="stat-icon icon-lilac">✳</i></div>
                <div className="stat-card"><span>TO-DOS COMPLETE</span><strong>18 <small>/ 32</small></strong><small><b className="progress-line"><i /></b> A lovely bit of progress</small><i className="stat-icon icon-green">✓</i></div>
                <div className="stat-card"><span>GUESTS INVITED</span><strong>186</strong><small>42 responses received</small><i className="stat-icon icon-rose">♡</i></div>
              </div>
              <div className="dash-content-grid">
                <div className="panel events-panel"><div className="panel-heading"><span><small>COMING UP</small><b>Your celebrations</b></span><span className="view-all">See all <i>→</i></span></div><div className="event-list">{events.map((event) => <div className="event-row" key={event.name}><div className={`event-date ${event.tone}`}><b>{event.day}</b><small>{event.month}</small></div><div className="event-info"><b>{event.name}</b><small>Jaipur · {event.time}</small></div><span className="event-arrow">↗</span></div>)}</div><div className="panel-foot">+ Add a celebration</div></div>
                <div className="panel tasks-panel"><div className="panel-heading"><span><small>A FEW THINGS TO DO</small><b>Your to-do list</b></span><span className="more">···</span></div><div className="task-row"><span className="check checked">✓</span><span><b>Choose the wedding invitation</b><small>Wedding day</small></span><i className="task-owner">M</i></div><div className="task-row"><span className="check" /><span><b>Confirm the Sangeet playlist</b><small>Sangeet · Due 14 Jan</small></span><i className="task-owner owner-green">R</i></div><div className="task-row"><span className="check" /><span><b>Share guest list with family</b><small>Guests · Due 16 Jan</small></span><i className="task-owner owner-blue">A</i></div><div className="panel-foot">Open your to-do list <span>→</span></div></div>
              </div>
            </div>
          </div>
          <div className="dashboard-caption"><span><i /> A glimpse of your shared wedding space</span><span>Sample wedding details</span></div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="features-intro"><p className="eyebrow">THE GOOD STUFF, IN ONE PLACE</p><h2>Less keeping track.<br /><em>More being there.</em></h2><p>Planning a wedding takes a village. Give yours one welcoming place to make the plans together.</p><a href="#how-it-works" className="text-link">See how it works <span>→</span></a><span className="intro-flower">✳</span></div>
        <div className="feature-list">{features.map((feature) => <article className="feature-row" key={feature.number}><span className="feature-number">{feature.number}</span><span className="feature-icon">{feature.icon}</span><div><h3>{feature.title}</h3><p>{feature.description}</p></div><span className="feature-arrow">↗</span></article>)}</div>
      </section>

      <section className="how-section" id="how-it-works"><div className="how-heading"><p className="eyebrow">A SIMPLE PLACE TO START</p><h2>Start with the two of you.<br /><em>Bring your people along.</em></h2></div><div className="steps"><article><span className="step-number">01</span><span className="step-icon">♡</span><h3>Create your wedding space</h3><p>Add your names, date and location to make it yours.</p></article><article><span className="step-number">02</span><span className="step-icon">✿</span><h3>Invite your inner circle</h3><p>Bring family and trusted friends into the planning.</p></article><article><span className="step-number">03</span><span className="step-icon">✳</span><h3>Make the celebrations yours</h3><p>Plan events, share tasks and keep everyone in the loop.</p></article></div></section>

      <section className="closing-cta"><span className="cta-flower flower-left">✿</span><p className="eyebrow">YOUR PEOPLE. YOUR CELEBRATION.</p><h2>Let the planning feel<br /><em>a little more like you.</em></h2><p>Bring everyone who matters into one shared wedding space.</p><a className="button button-light" href="/signup">Start planning together <span>→</span></a><span className="cta-flower flower-right">✳</span></section>

      <footer className="site-footer"><a className="brand" href="#top"><BrandMark /><span>make my marriage</span></a><span>Made with love, for the ones you love.</span><div><a href="#features">What you can do</a><a href="#how-it-works">How it works</a></div><small>© 2027 Make My Marriage</small></footer>
    </main>
  );
}
