export default function About() {
  const skills = [
    { category: 'Frontend', items: ['React', 'Angular', 'JavaScript', 'Bootstrap', 'HTML/CSS'] },
    { category: 'Backend', items: ['Node.js', 'Express', 'PHP', 'MySQL', 'Python'] },
    { category: 'Security & Tools', items: ['JWT', 'SSL/TLS', 'Git', 'MVC Architecture'] },
  ];

  return (
    <main>
      <section className="py-5">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-5">
              <div className="about-image-wrapper position-relative">
                <div className="about-image-bg"></div>
                <div className="about-avatar d-flex align-items-center justify-content-center" 
                     style={{width: '280px', height: '280px', borderRadius: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', margin: '0 auto'}}>
                  <span style={{fontSize: '6rem'}}>👨‍💻</span>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <p className="text-uppercase mb-2" style={{letterSpacing: '0.15em', fontSize: '0.85rem', color: 'var(--primary-light)'}}>
                About Me
              </p>
              <h1 className="display-5 fw-bold mb-4">
                Hi, I'm <span style={{background: 'var(--gradient-1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Kevin Hagstrom</span>
              </h1>
              <p className="lead" style={{color: 'var(--text-secondary)'}}>
                I'm a Computer Science student passionate about building secure, scalable web applications. 
                With experience in full-stack development, I focus on creating solutions that are both functional and user-friendly.
              </p>
              <p style={{color: 'var(--text-secondary)'}}>
                My projects range from inventory management systems to secure student information platforms, 
                demonstrating expertise in authentication, database design, and modern web frameworks.
              </p>
              <div className="d-flex gap-3 mt-4 flex-wrap">
                <a href="https://github.com/Caspian404" target="_blank" rel="noreferrer" className="btn btn-outline-light">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                  GitHub
                </a>
                <a href="https://linkedin.com/in/kevin-hagstrom" target="_blank" rel="noreferrer" className="btn btn-outline-light">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                  </svg>
                  LinkedIn
                </a>
                <a href="mailto:your@email.com" className="btn btn-primary">
                  Contact Me
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5" style={{background: 'var(--bg-card)'}}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="h2 fw-bold mb-2">Skills & Technologies</h2>
            <p className="text-secondary">Tools and technologies I work with</p>
          </div>
          <div className="row g-4">
            {skills.map(skill => (
              <div key={skill.category} className="col-md-4">
                <div className="p-4 rounded-4 h-100" style={{background: 'var(--bg-dark)', border: '1px solid var(--border-color)'}}>
                  <h3 className="h5 fw-semibold mb-3" style={{color: 'var(--primary-light)'}}>{skill.category}</h3>
                  <div className="d-flex flex-wrap gap-2">
                    {skill.items.map(item => (
                      <span key={item} className="badge">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container text-center">
          <h2 className="h2 fw-bold mb-3">Let's Work Together</h2>
          <p className="text-secondary mb-4" style={{maxWidth: '500px', margin: '0 auto'}}>
            Have a project in mind? I'd love to hear about it. Let's create something amazing together.
          </p>
          <a href="mailto:your@email.com" className="btn btn-primary btn-lg px-5">
            Get In Touch
          </a>
        </div>
      </section>

      <style>{`
        .about-image-wrapper {
          display: flex;
          justify-content: center;
        }
        .about-image-bg {
          position: absolute;
          width: 250px;
          height: 250px;
          background: var(--gradient-1);
          border-radius: 24px;
          top: 20px;
          left: calc(50% - 105px);
          opacity: 0.3;
          filter: blur(40px);
        }
      `}</style>
    </main>
  );
}
