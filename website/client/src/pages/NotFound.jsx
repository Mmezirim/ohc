import { Link } from 'react-router-dom';
import { Eyebrow } from '../components/Sections.jsx';
import { usePageMeta } from '../lib/hooks.js';

export default function NotFound() {
  usePageMeta('Page not found');
  return (
    <section className="section section--white page-top not-found">
      <div className="container">
        <Eyebrow>404</Eyebrow>
        <h1 className="h1">This page could not be found</h1>
        <p>The page you’re looking for may have moved. Let’s get you back home.</p>
        <Link to="/" className="btn">
          Back to home
        </Link>
      </div>
    </section>
  );
}
