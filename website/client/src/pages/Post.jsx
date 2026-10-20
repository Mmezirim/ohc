import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { YouTubePlayer } from '../components/YouTube.jsx';
import NotFound from './NotFound.jsx';
import { formatDate, getJson, postJson } from '../lib/api.js';
import { usePageMeta } from '../lib/hooks.js';

const EMPTY = { name: '', email: '', website: '', comment: '', company: '' };

function CommentForm({ slug }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: 'idle', message: '', fields: {} });
  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setStatus({ state: 'sending', message: '', fields: {} });
    try {
      await postJson(`/api/posts/${slug}/comments`, form);
      setForm(EMPTY);
      setStatus({ state: 'done', message: 'Thank you! Your comment is awaiting moderation.', fields: {} });
    } catch (err) {
      setStatus({ state: 'error', message: err.message, fields: err.fields || {} });
    }
  }

  const err = (name) => status.fields[name] && <span className="field__error">{status.fields[name]}</span>;

  return (
    <form className="comment-form" onSubmit={submit} noValidate>
      <h2 className="comment-form__title">Leave a Reply</h2>
      <p className="muted">
        Your email address will not be published. Required fields are marked <span className="req">*</span>
      </p>
      <div className="comment-form__row">
        <label className="field">
          <span className="field__label">Name <span>· required</span></span>
          <input name="name" autoComplete="name" value={form.name} onChange={update} aria-invalid={Boolean(status.fields.name)} />
          {err('name')}
        </label>
        <label className="field">
          <span>
            Email <span className="req">*</span>
          </span>
          <input type="email" name="email" autoComplete="email" value={form.email} onChange={update} aria-invalid={Boolean(status.fields.email)} />
          {err('email')}
        </label>
        <label className="field">
          <span>Website</span>
          <input type="url" name="website" autoComplete="url" value={form.website} onChange={update} aria-invalid={Boolean(status.fields.website)} />
          {err('website')}
        </label>
      </div>
      <label className="field">
        <span>
          Add Comment <span className="req">*</span>
        </span>
        <textarea name="comment" rows={6} value={form.comment} onChange={update} aria-invalid={Boolean(status.fields.comment)} />
        {err('comment')}
      </label>
      <label className="hp" aria-hidden="true">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" value={form.company} onChange={update} />
      </label>
      {status.state === 'done' && (
        <p className="note" role="status">
          {status.message}
        </p>
      )}
      {status.state === 'error' && !Object.keys(status.fields).length && (
        <p className="form-summary" role="alert">
          {status.message}
        </p>
      )}
      <button type="submit" className="btn" disabled={status.state === 'sending'}>
        {status.state === 'sending' ? 'Posting…' : 'Post Comment'}
      </button>
    </form>
  );
}

export default function Post() {
  const { slug } = useParams();
  const [state, setState] = useState({ status: 'loading', post: null });

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading', post: null });
    getJson(`/api/posts/${slug}`)
      .then((post) => alive && setState({ status: 'ready', post }))
      .catch((e) => alive && setState({ status: e.status === 404 ? 'missing' : 'error', post: null }));
    return () => {
      alive = false;
    };
  }, [slug]);

  const post = state.post;
  usePageMeta(post?.title || 'Blog');

  if (state.status === 'missing') return <NotFound />;

  return (
    <article className="section section--white page-top post">
      <div className="container container--narrow">
        {state.status === 'loading' && <div className="skeleton skeleton--player" aria-busy="true" />}
        {state.status === 'error' && <p className="notice">We couldn’t load this post. Please try again shortly.</p>}
        {post && (
          <>
            <header className="post__header">
              <Link to="/blogs" className="text-link back-link">
                <Icon name="arrowLeft" size={16} /> All posts
              </Link>
              <h1 className="h1">{post.title}</h1>
              <p className="post__meta">
                {post.author} / {formatDate(post.publishedAt)} / {post.category}
              </p>
            </header>

            {post.youtubeId ? <YouTubePlayer id={post.youtubeId} title={post.title} /> : post.featuredImage && <img className="post__image" src={post.featuredImage} alt="" />}

            {post.body && <div className="post__body" dangerouslySetInnerHTML={{ __html: post.body }} />}

            {(post.newer || post.older) && (
              <nav className="post__nav" aria-label="More posts">
                {post.older ? (
                  <Link to={`/blog/${post.older.slug}`}>
                    <span>Previous</span>
                    {post.older.title}
                  </Link>
                ) : (
                  <span />
                )}
                {post.newer && (
                  <Link to={`/blog/${post.newer.slug}`} className="post__nav-next">
                    <span>Next</span>
                    {post.newer.title}
                  </Link>
                )}
              </nav>
            )}

            {post.comments?.length > 0 && (
              <section className="comments" aria-label="Comments">
                <h2 className="comment-form__title">
                  {post.comments.length} Comment{post.comments.length === 1 ? '' : 's'}
                </h2>
                <ol>
                  {post.comments.map((c) => (
                    <li key={c.id}>
                      <p className="comments__author">
                        {c.website ? (
                          <a href={c.website} rel="nofollow ugc noopener noreferrer" target="_blank">
                            {c.name}
                          </a>
                        ) : (
                          c.name
                        )}
                        <span>{formatDate(c.createdAt)}</span>
                      </p>
                      <p>{c.body}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <CommentForm slug={post.slug} />
          </>
        )}
      </div>
    </article>
  );
}
