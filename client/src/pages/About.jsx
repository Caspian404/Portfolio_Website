import { useState } from 'react';

export default function About() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: 'c9d12a25-b94e-4ea7-9b18-db13ce8d9cad',
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: `Portfolio Contact from ${formData.name}`,
          reply_to: formData.email
        })
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data && data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => {
          setShowModal(false);
          setStatus('');
        }, 2000);
      } else {
        console.error('Web3Forms error:', data);
        setStatus('error');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setStatus('error');
    }
  };

  const skills = [
  { category: 'Frontend', items: ['React', 'Angular', 'JavaScript', 'HTML', 'CSS', 'Bootstrap'] },
  { category: 'Backend', items: ['Node.js', 'Express', 'PHP', 'MySQL', 'Python'] },
  { category: 'Security', items: ['JWT', 'TLS/SSL', 'Authentication & Authorization', 'Rate Limiting', 'reCAPTCHA'] },
  { category: 'Systems & Infrastructure', items: ['Linux (Oracle Linux 9)', 'Bash', 'SSH', 'systemd', 'Docker', 'Nginx', 'WireGuard'] },
  { category: 'Tools & Practices', items: ['Git', 'GitHub', 'MVC Architecture', 'Cypress', 'Mocha'] }
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
                  style={{width: '280px', height: '280px', borderRadius: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', margin: '0 auto', overflow: 'hidden'}}>
                  <img src="../../public/images/profile.JPG" alt="Kevin Hagstrom" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
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
              <p className="lead" style={{ color: 'var(--text-secondary)' }}>
                I’m a Computer Science graduate focused on building secure, scalable web applications.
                With full-stack experience, I develop solutions that balance reliability, performance, and user experience.
                I’m also interested in cloud systems and have built projects using Google Workspace and Oracle Cloud.
                I graduated from the University of Wisconsin–Eau Claire in December 2025 with my B.S. in Computer Science and a minor in Mathematics and am currently seeking remote employment opportunities or opportunities to work in Minnesota.
              </p>

              <div className="d-flex gap-3 mt-4 flex-wrap">
                <a href="https://github.com/Caspian404" target="_blank" rel="noreferrer" className="btn btn-outline-light">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/kevin-hagstrom-24232b1b3" target="_blank" rel="noreferrer" className="btn btn-outline-light">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                  </svg>
                  LinkedIn
                </a>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                  Contact Me
                </button>
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

      {/* Contact Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--bg-card)', borderRadius: '16px', padding: '2rem',
            width: '90%', maxWidth: '500px', border: '1px solid var(--border-color)'
          }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="h4 fw-bold mb-0">Get In Touch</h3>
              <button onClick={() => setShowModal(false)} className="btn-close btn-close-white"></button>
            </div>
            
            {status === 'success' ? (
              <div className="text-center py-4">
                <div style={{fontSize: '3rem'}}>✅</div>
                <p className="mt-3 mb-0">Message sent successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Your Name</label>
                  <input type="text" className="form-control" required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    style={{background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)'}}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Your Email</label>
                  <input type="email" className="form-control" required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    style={{background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)'}}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Message</label>
                  <textarea className="form-control" rows="4" required
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    style={{background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', resize: 'none'}}
                  ></textarea>
                </div>
                {status === 'error' && (
                  <div className="alert alert-danger mb-3">Failed to send. Please try again.</div>
                )}
                <button type="submit" className="btn btn-primary w-100" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

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
