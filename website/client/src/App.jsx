import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';

const About = lazy(() => import('./pages/About.jsx'));
const Sermons = lazy(() => import('./pages/Sermons.jsx'));
const Locations = lazy(() => import('./pages/Locations.jsx'));
const Giving = lazy(() => import('./pages/Giving.jsx'));
const Clusters = lazy(() => import('./pages/Clusters.jsx'));
const Programs = lazy(() => import('./pages/Programs.jsx'));
const ProgramDetail = lazy(() => import('./pages/ProgramDetail.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Blogs = lazy(() => import('./pages/Blogs.jsx'));
const Post = lazy(() => import('./pages/Post.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // Wait a frame so the target section has rendered.
      requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }));
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return (
      <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    );
  }
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <ScrollManager />
      <Header />
      <main id="main">
        <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/sermons" element={<Sermons />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/giving" element={<Giving />} />
            <Route path="/clusters" element={<Clusters />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/programs/:slug" element={<ProgramDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:slug" element={<Post />} />
            {/* Old WordPress URLs */}
            <Route path="/donor-dashboard" element={<Navigate to="/giving" replace />} />
            <Route path="/donation-confirmation" element={<Navigate to="/giving" replace />} />
            <Route path="/donation-failed" element={<Navigate to="/giving" replace />} />
            <Route path="/understanding-the-conscience-rev-oyiks-alfred" element={<Navigate to="/blog/understanding-the-conscience-rev-oyiks-alfred" replace />} />
            <Route path="/how-to-build-faith-pastor-john-ndubuisi" element={<Navigate to="/blog/how-to-build-faith-pastor-john-ndubuisi" replace />} />
            <Route path="/overcoming-ungodliness-through-faith-pastor-akin-afolabi" element={<Navigate to="/blog/overcoming-ungodliness-through-faith-pastor-akin-afolabi" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
