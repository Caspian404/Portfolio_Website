import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  return (
    <div className="card h-100 bg-dark text-light border-secondary">
      {project.image && (
        <Link to={`/projects/${project.id}`} className="d-block">
          <img src={project.image} alt={project.title} className="card-img-top" style={{height:180,objectFit:'cover'}} />
        </Link>
      )}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title mb-2">{project.title}</h5>
        <p className="card-text text-secondary">{project.description}</p>
        <div className="d-flex flex-wrap gap-2 my-2">
          {project.tech?.map(t => (
            <span key={t} className="badge bg-secondary-subtle text-secondary-emphasis border border-secondary">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-auto d-flex gap-2">
          <Link className="btn btn-outline-light btn-sm" to={`/projects/${project.id}`}>Details</Link>
          {project.url && <a className="btn btn-outline-primary btn-sm" href={project.url} target="_blank" rel="noreferrer">Live</a>}
          {project.repo && <a className="btn btn-outline-secondary btn-sm" href={project.repo} target="_blank" rel="noreferrer">Repo</a>}
        </div>
      </div>
    </div>
  );
}
