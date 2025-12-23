import './App.css'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import About from './pages/About'
import Experience from './pages/Experience'

function App() {
  return (
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column'}}>
      <Header />
      <div style={{flex:1}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/experience" element={<Experience />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App
