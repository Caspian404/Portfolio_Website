import { useEffect, useState } from 'react';
import { listProjects } from '../api/client';
import ProjectCard from '../components/ProjectCard';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await listProjects();
        setProjects(data);
      } catch (e) {
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <main className="container py-5 text-center">Loading...</main>;
  if (error) return <main className="container py-5 text-center">{error}</main>;

  return (
    <main>
      <section className="py-5 text-center position-relative overflow-hidden">
        <div className="container position-relative">
          <p className="text-uppercase mb-2" style={{letterSpacing: '0.15em', fontSize: '0.85rem', color: 'var(--primary-light)'}}>
            My Work
          </p>
          <h1 className="display-5 fw-bold mb-3">Projects</h1>
          <p className="text-secondary" style={{maxWidth: '500px', margin: '0 auto'}}>
            A collection of projects I've built, from web applications to tools and experiments.
          </p>
        </div>
      </section>
      <section className="container pb-5">
        <div className="row g-4">
          {projects.map((p, i) => (
            <div key={p.id} className="col-12 col-sm-6 col-lg-4" style={{animationDelay: `${i * 0.1}s`}}>
              <ProjectCard project={p} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
