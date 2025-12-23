import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { listProjects } from '../api/client';
import ProjectCard from '../components/ProjectCard';

export default function Home() {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const data = await listProjects();
        setProjects(data);
      } catch {}
    })();
  }, []);

  const featured = projects.slice(0, 3);

  return (
    <main>
      <section className="hero-section position-relative overflow-hidden" style={{padding: '6rem 0 5rem'}}>
        <div className="hero-bg-effects">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
        </div>
        <div className="container text-center position-relative">
          <div className="animate-fade-in">
            <p className="text-uppercase tracking-wide mb-3" style={{letterSpacing: '0.2em', fontSize: '0.85rem', color: 'var(--primary-light)'}}>
              Welcome to my portfolio
            </p>
            <h1 className="display-3 fw-bold mb-3" style={{background: 'var(--gradient-1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              Kevin Hagstrom
            </h1>
            <p className="lead mb-4" style={{color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto'}}>
              Computer Science Student & Full-Stack Developer building secure, scalable web applications.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link className="btn btn-primary btn-lg px-4" to="/projects">
                View My Work
              </Link>
              <a className="btn btn-outline-light btn-lg px-4" href="/resume.pdf" target="_blank" rel="noreferrer">
                Download Resume
              </a>
            </div>
          </div>
          <div className="tech-stack mt-5 pt-4">
            <p className="text-secondary mb-3" style={{fontSize: '0.85rem'}}>Technologies I work with</p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              {['React', 'Angular', 'Node.js', 'PHP', 'MySQL', 'Python'].map(tech => (
                <span key={tech} className="badge" style={{fontSize: '0.85rem', padding: '0.5em 1em'}}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="h2 fw-bold mb-2">Featured Projects</h2>
          <p className="text-secondary">Some of my recent work</p>
        </div>
        <div className="row g-4">
          {featured.map((p, i) => (
            <div key={p.id} className="col-12 col-md-6 col-lg-4" style={{animationDelay: `${i * 0.1}s`}}>
              <ProjectCard project={p} />
            </div>
          ))}
        </div>
        <div className="text-center mt-5">
          <Link className="btn btn-outline-light btn-lg" to="/projects">
            View All Projects →
          </Link>
        </div>
      </section>

      <style>{`
        .hero-section {
          background: transparent;
        }
        .hero-bg-effects {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
        }
        .hero-orb-1 {
          width: 400px;
          height: 400px;
          background: var(--primary);
          top: -100px;
          left: 10%;
          animation: float 8s ease-in-out infinite;
        }
        .hero-orb-2 {
          width: 300px;
          height: 300px;
          background: var(--accent);
          bottom: -50px;
          right: 15%;
          animation: float 6s ease-in-out infinite reverse;
        }
      `}</style>
    </main>
  );
}
