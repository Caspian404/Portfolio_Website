export default function Experience() {
  const experiences = [
    {
      company: 'University of Wisconsin – Eau Claire',
      role: 'Software Developer',
      location: 'Eau Claire, WI',
      period: 'Feb 2025 — May 2025',
      highlights: [
        'Collaborated with Mayo Clinic to build a web application leveraging Google Cloud Services.',
        'Implemented frontend features with JavaScript, HTML, and CSS; integrated backend logic with PHP and SQL.',
        'Contributed to database design and data flows, focusing on reliability and usability.'
      ],
      tech: ['Google Cloud', 'JavaScript', 'HTML', 'CSS', 'PHP', 'SQL']
    },
    {
      company: 'University of Wisconsin – Eau Claire',
      role: 'Resident Assistant',
      location: 'Eau Claire, WI',
      period: 'Aug 2024 — May 2025',
      highlights: [
        'Supported academic and personal wellness for ~30 first-year students.',
        'Fostered a safe, inclusive community and provided one-on-one guidance.',
        'Coordinated resources and resolved issues to maintain a positive residential environment.'
      ],
      tech: []
    },
    {
      company: 'Perceptyx',
      role: 'Test Automation Engineer',
      location: 'Remote',
      period: 'May 2024 — Sept 2024',
      highlights: [
        'Collaborated with test engineers and developers to identify API vulnerabilities and document findings in Jira.',
        'Wrote JavaScript test suites to detect regressions across product iterations.',
        'Improved test coverage and repeatability through automation best practices.'
      ],
      tech: ['JavaScript', 'API Testing', 'Automation', 'Jira', 'Mocha', 'Cypress']
    },
    {
      company: 'Aptive Environmental',
      role: 'Route Manager / Sales Representative',
      location: 'Various',
      period: 'Apr 2023 — Aug 2023',
      highlights: [
        'Expanded customer base through networking and relationship building to increase sales revenue.',
        'Delivered tailored product presentations and negotiated long-term contracts.',
        'Developed in-depth product knowledge to address customer needs and objections.'
      ],
      tech: ['Sales', 'Customer Relations', 'Negotiation']
    }
  ];

  return (
    <main>
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold mb-2">Experience</h1>
            <p className="text-secondary">A deeper look into my work history and impact</p>
          </div>

          <div className="row g-4">
            {experiences.map((exp, idx) => (
              <div key={idx} className="col-12">
                <div className="p-4 rounded-4" style={{background: 'var(--bg-card)', border: '1px solid var(--border-color)'}}>
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                    <div>
                      <h3 className="h4 fw-semibold mb-1">{exp.role}</h3>
                      <div className="text-secondary">{exp.company} • {exp.location}</div>
                    </div>
                    <div className="text-secondary" style={{whiteSpace: 'nowrap'}}>{exp.period}</div>
                  </div>

                  <ul className="mb-3" style={{marginLeft: '1rem'}}>
                    {exp.highlights.map((h, i) => (
                      <li key={i} className="mb-1">{h}</li>
                    ))}
                  </ul>

                  {exp.tech?.length ? (
                    <div className="d-flex flex-wrap gap-2">
                      {exp.tech.map(t => (
                        <span key={t} className="badge" style={{fontSize: '0.8rem'}}>{t}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
