import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import { Eyebrow, PageIntro } from '../components/Sections.jsx';
import { postJson } from '../lib/api.js';
import { useContent } from '../lib/content.jsx';
import { usePageMeta } from '../lib/hooks.js';

const INTENTS = [
  ['general', 'General enquiry'],
  ['visit', 'Planning a visit'],
  ['clusters', 'Clusters'],
  ['prayer', 'Prayer request'],
  ['serving', 'Serving'],
  ['giving', 'Giving'],
  ['program', 'Program query'],
  ['accessibility', 'Accessibility support'],
];

const FIELD_ORDER = ['fullName', 'email', 'phone', 'intent', 'message', 'consent'];
const LABELS = { fullName: 'Your name', email: 'Email address', phone: 'Phone number', intent: 'Enquiry type', message: 'Message', consent: 'Consent' };

function validate(f) {
  const e = {};
  if (f.fullName.trim().length < 2) e.fullName = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Enter a valid email address.';
  if (f.phone.trim() && !/^[+\d][\d\s().-]{5,24}$/.test(f.phone.trim())) e.phone = 'Enter a valid phone number, or leave it blank.';
  if (f.message.trim().length < 2) e.message = 'Please write a short message.';
  if (!f.consent) e.consent = 'Please confirm we may use your details to respond.';
  return e;
}

function EnquiryForm() {
  const [params] = useSearchParams();
  const initialIntent = INTENTS.some(([k]) => k === params.get('intent')) ? params.get('intent') : 'general';
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    intent: initialIntent,
    subject: params.get('subject') || '',
    message: '',
    consent: false,
    company: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const summaryRef = useRef(null);
  const successRef = useRef(null);

  useEffect(() => {
    setForm((f) => ({ ...f, intent: initialIntent, subject: params.get('subject') || f.subject }));
  }, [initialIntent, params]);

  const update = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // Validate a field when the visitor leaves it (only once they've typed something or after a submit attempt).
  const onBlur = (e) => {
    const name = e.target.name;
    if (!form[name] && !errors[name]) return;
    const all = validate(form);
    setErrors((prev) => {
      const next = { ...prev };
      if (all[name]) next[name] = all[name];
      else delete next[name];
      return next;
    });
  };

  async function submit(e) {
    e.preventDefault();
    if (status.state === 'sending') return;
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus({ state: 'invalid', message: '' });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus({ state: 'sending', message: '' });
    try {
      await postJson('/api/enquiries', form);
      setStatus({ state: 'done', message: '' });
      requestAnimationFrame(() => successRef.current?.focus());
    } catch (err) {
      if (err.fields && Object.keys(err.fields).length) {
        setErrors(err.fields);
        setStatus({ state: 'invalid', message: '' });
        requestAnimationFrame(() => summaryRef.current?.focus());
      } else {
        setStatus({ state: 'error', message: err.message });
      }
    }
  }

  if (status.state === 'done') {
    return (
      <div className="card card--white enquiry-success" tabIndex={-1} ref={successRef} role="status">
        <span className="enquiry-success__icon">
          <Icon name="check" size={26} strokeWidth={2.2} />
        </span>
        <h2 className="h3">Enquiry received.</h2>
        <p className="card__body">Thank you, {form.fullName.split(' ')[0]}. Your message has reached the church office and someone will get back to you by email.</p>
        <div className="card__footer">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              setForm((f) => ({ ...f, message: '', consent: false }));
              setStatus({ state: 'idle', message: '' });
            }}
          >
            Send another enquiry
          </button>
        </div>
      </div>
    );
  }

  const errorList = FIELD_ORDER.filter((k) => errors[k]);
  const describedBy = (name, hint) => [hint && `${name}-hint`, errors[name] && `${name}-error`].filter(Boolean).join(' ') || undefined;

  return (
    <form className="card card--white enquiry" onSubmit={submit} noValidate aria-labelledby="enquiry-title">
      <p className="card__label">Send an enquiry</p>
      <h2 className="h3" id="enquiry-title">
        Start a conversation.
      </h2>

      {status.state === 'invalid' && errorList.length > 0 && (
        <div className="form-summary" tabIndex={-1} ref={summaryRef} role="alert">
          <h3>Check your enquiry.</h3>
          <ul>
            {errorList.map((k) => (
              <li key={k}>
                <a href={`#f-${k}`}>
                  {LABELS[k]}: {errors[k]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <label className="field">
        <span className="field__label">
          Your name <span>· required</span>
        </span>
        <input id="f-fullName" name="fullName" autoComplete="name" value={form.fullName} onChange={update} onBlur={onBlur} aria-invalid={Boolean(errors.fullName)} aria-describedby={describedBy('fullName')} />
        {errors.fullName && <span className="field__error" id="fullName-error">Error: {errors.fullName}</span>}
      </label>

      <label className="field">
        <span className="field__label">
          Email address <span>· required</span>
        </span>
        <input id="f-email" type="email" name="email" autoComplete="email" value={form.email} onChange={update} onBlur={onBlur} aria-invalid={Boolean(errors.email)} aria-describedby={describedBy('email')} />
        {errors.email && <span className="field__error" id="email-error">Error: {errors.email}</span>}
      </label>

      <label className="field">
        <span className="field__label">
          Phone number <span>· optional</span>
        </span>
        <input id="f-phone" type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={update} onBlur={onBlur} aria-invalid={Boolean(errors.phone)} aria-describedby={describedBy('phone')} />
        {errors.phone && <span className="field__error" id="phone-error">Error: {errors.phone}</span>}
      </label>

      <label className="field">
        <span className="field__label">
          Enquiry type <span>· required</span>
        </span>
        <select id="f-intent" name="intent" value={form.intent} onChange={update} aria-describedby="intent-hint">
          {INTENTS.map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
        <span className="field__hint" id="intent-hint">
          For giving, programs or clusters, include the subject or name in your message.
        </span>
      </label>

      {form.subject && (
        <label className="field">
          <span className="field__label">
            About <span>· optional</span>
          </span>
          <input name="subject" value={form.subject} onChange={update} />
        </label>
      )}

      <label className="field">
        <span className="field__label">
          Message <span>· required</span>
        </span>
        <textarea id="f-message" name="message" placeholder="How can we help?" value={form.message} onChange={update} onBlur={onBlur} aria-invalid={Boolean(errors.message)} aria-describedby={describedBy('message', true)} />
        <span className="field__hint" id="message-hint">
          Please avoid including sensitive personal, financial or medical details.
        </span>
        {errors.message && <span className="field__error" id="message-error">Error: {errors.message}</span>}
      </label>

      <label className="hp" aria-hidden="true">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" value={form.company} onChange={update} />
      </label>

      <div>
        <label className="checkbox">
          <input id="f-consent" type="checkbox" name="consent" checked={form.consent} onChange={update} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? 'consent-error' : undefined} />
          <span>I agree to Oak House Church using the information I’ve shared to respond to this enquiry.</span>
        </label>
        {errors.consent && (
          <span className="field__error" id="consent-error">
            Error: {errors.consent}
          </span>
        )}
      </div>

      {status.state === 'error' && (
        <p className="form-summary" role="alert">
          {status.message} Your details are still here — please try again.
        </p>
      )}

      <button type="submit" className="btn btn--block" disabled={status.state === 'sending'} aria-busy={status.state === 'sending'}>
        {status.state === 'sending' ? 'Sending…' : 'Send enquiry'} {status.state !== 'sending' && <Icon name="arrowRight" size={16} />}
      </button>
    </form>
  );
}

export default function Contact() {
  usePageMeta('Contact', 'Contact Oak House Church — ask a question, plan a visit, request prayer or find a way to serve.');
  const { content } = useContent();
  const s = content?.settings || {};
  const email = s.contact_email || 'contact@oakhousechurch.org';

  return (
    <>
      <PageIntro
        page="contact"
        eyebrow="Contact / Let’s connect"
        title="Every conversation can be a beginning."
        lead="Have a question, planning a visit, or looking for a place to connect? Choose the kind of enquiry below and share what you would like the church to know."
      />

      <section className="section section--white">
        <div className="container contact">
          <div className="contact__info">
            <Reveal>
              <Eyebrow>A warm hello starts here</Eyebrow>
              <h2 className="serif">We’d love to hear from you.</h2>
            </Reveal>
            <Reveal className="card contact__card" delay={60}>
              <dl className="facts">
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${email}`}>{email}</a>
                  </dd>
                </div>
                {s.contact_phone && (
                  <div>
                    <dt>Telephone</dt>
                    <dd>
                      <a href={`tel:${s.contact_phone.replace(/[^\d+]/g, '')}`}>{s.contact_phone}</a>
                    </dd>
                  </div>
                )}
                {s.office_address && (
                  <div>
                    <dt>HQ · Yaba</dt>
                    <dd>{s.office_address}</dd>
                  </div>
                )}
                <div>
                  <dt>Giving questions</dt>
                  <dd>
                    <a href={`mailto:${s.giving_email || 'give@oakhousechurch.org'}`}>{s.giving_email || 'give@oakhousechurch.org'}</a>
                  </dd>
                </div>
              </dl>
            </Reveal>
            <Reveal delay={100}>
              <h3 className="h3">What would help you take part?</h3>
              <p className="muted contact__help">
                If you have access or communication needs, choose Accessibility support and describe what would help. We’ll get
                back to you to talk it through.
              </p>
              <Link to="/contact?intent=accessibility#f-intent" className="text-link">
                Accessibility support enquiry <Icon name="arrowRight" size={16} />
              </Link>
            </Reveal>
          </div>
          <Reveal delay={80}>
            <EnquiryForm />
          </Reveal>
        </div>
      </section>

      <section className="section section--canvas">
        <div className="container">
          <Reveal className="section-head">
            <Eyebrow>Find your next step</Eyebrow>
            <h2 className="h2">A question, a visit, a connection.</h2>
          </Reveal>
          <div className="grid grid--3">
            {[
              { title: 'Planning a visit?', text: 'Find a location near you, check service times, and come as you are.', to: '/locations', label: 'Plan Your Visit' },
              { title: 'Looking for community?', text: 'Discover Clusters — a smaller circle for friendship and growing in faith.', to: '/clusters', label: 'Explore Clusters' },
              { title: 'Prayer or serving?', text: 'Choose Prayer request or Serving in the enquiry form and we’ll be in touch.', to: '/contact?intent=prayer', label: 'Choose an enquiry type' },
            ].map((c, i) => (
              <Reveal className="card" key={c.title} delay={i * 60}>
                <h3 className="card__title">{c.title}</h3>
                <p className="card__body">{c.text}</p>
                <div className="card__footer">
                  <Link to={c.to} className="text-link">
                    {c.label} <Icon name="arrowRight" size={16} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
