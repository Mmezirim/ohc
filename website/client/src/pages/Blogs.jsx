import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import { Eyebrow } from '../components/Sections.jsx';
import { formatDate, getJson, mediaUrl } from '../lib/api.js';
import { usePageMeta } from '../lib/hooks.js';

export default function Blogs() {
  usePageMeta('Blogs', 'Messages and teachings from Oak House Church.');
  const [state, setState] = useState({ status: 'loading', posts: [] });

  useEffect(() => {
    let alive = true;
    getJson('/api/posts')
      .then((posts) => alive && setState({ status: 'ready', posts }))
      .catch(() => alive && setState({ status: 'error', posts: [] }));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="section section--white page-top">
      <div className="container">
        <header className="section-head section-head--center">
          <Eyebrow>Messages &amp; teachings</Eyebrow>
          <h1 className="h1">Blogs</h1>
        </header>

        {state.status === 'error' && <p className="notice">We couldn’t load posts right now. Please try again shortly.</p>}

        <div className="post-grid" aria-busy={state.status === 'loading'}>
          {state.status === 'loading' && Array.from({ length: 3 }, (_, i) => <div className="skeleton skeleton--card" key={i} />)}
          {state.posts.map((p, i) => (
            <Reveal as="article" className="post-card" key={p.slug} delay={i * 80}>
              <Link to={`/blog/${p.slug}`} className="post-card__link">
                <div className="post-card__image">
                  <img src={mediaUrl(p.featuredImage)} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="post-card__body">
                  <span className="post-card__cat">{p.category}</span>
                  <h2>{p.title}</h2>
                  <p className="post-card__meta">
                    {p.author} / {formatDate(p.publishedAt)}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
