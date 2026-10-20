import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import { DarkCta, Eyebrow, PageIntro, Scripture } from '../components/Sections.jsx';
import { useContent } from '../lib/content.jsx';
import { usePageMeta } from '../lib/hooks.js';

async function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}

function CopyRow({ label, value, copy, onCopied }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const handle = async () => {
    await copyText(copy ?? value);
    setCopied(true);
    onCopied(label);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="copy-row">
      <dt>{label}</dt>
      <dd>
        <span className="copy-row__value">{value}</span>
        <button type="button" className="copy-btn" onClick={handle} aria-label={`Copy ${label.toLowerCase()}: ${value}`}>
          <Icon name={copied ? 'check' : 'copy'} size={16} strokeWidth={copied ? 2.4 : 1.7} />
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </dd>
    </div>
  );
}

export default function Giving() {
  usePageMeta('Giving', 'Advancing the mission together — bank details for tithes, offerings, building fund, missions and domiciliary giving at Oak House Church.');
  const { content } = useContent();
  const [tab, setTab] = useState('local');
  const [toast, setToast] = useState('');
  const toastTimer = useRef();
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const accounts = (content?.giving || []).filter((a) => a.group === tab);
  const givingEmail = content?.settings?.giving_email || 'give@oakhousechurch.org';

  const showToast = (label) => {
    setToast(`${label} copied to clipboard`);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };

  return (
    <>
      <PageIntro
        page="giving"
        eyebrow="Give · Generosity with care"
        title="Advancing the Mission Together."
        lead="Giving is an expression of worship, stewardship, and partnership in God’s work. Through your generosity, lives are transformed, disciples are raised, communities are impacted, and the Gospel continues to reach people."
        quote={{
          text: '“The liberal soul shall be made fat: and he that watereth shall be watered also himself.”',
          reference: 'Proverbs 11:25',
        }}
        actions={
          <a href="#ways-to-give" className="btn">
            See ways to give <Icon name="arrowRight" size={16} />
          </a>
        }
      />

      <section className="section section--white" id="ways-to-give">
        <div className="container">
          <Reveal className="section-head">
            <Eyebrow>Ways to give · Bank transfer</Eyebrow>
            <h2 className="h2">Clarity before you give.</h2>
            <p>Every gift contributes to our mission of helping people know Christ and become more like Him.</p>
          </Reveal>

          <div className="tabs" role="tablist" aria-label="Account currency">
            <button type="button" role="tab" id="tab-local" aria-selected={tab === 'local'} aria-controls="panel-giving" onClick={() => setTab('local')}>
              ₦ Nigerian Naira
            </button>
            <button type="button" role="tab" id="tab-dom" aria-selected={tab === 'dom'} aria-controls="panel-giving" onClick={() => setTab('dom')}>
              $ £ Domiciliary
            </button>
          </div>

          <div className="giving" id="panel-giving" role="tabpanel" aria-labelledby={`tab-${tab}`}>
            <div className="giving__accounts">
              {accounts.map((a) => (
                <article className="card account" key={`${a.purpose}-${a.accountNumber}`}>
                  <p className="card__label">
                    <Icon name={a.icon} size={14} /> {a.purpose}
                  </p>
                  <h3 className="card__title">{a.bank}</h3>
                  <dl className="account__rows">
                    <CopyRow label="Account name" value={a.accountName} onCopied={showToast} />
                    <CopyRow label="Account number" value={a.accountNumber} onCopied={showToast} />
                    <CopyRow label={a.codeLabel} value={a.codeDisplay} copy={a.codeCopy} onCopied={showToast} />
                    {a.bankAddress && <CopyRow label="Bank address" value={a.bankAddress} onCopied={showToast} />}
                  </dl>
                </article>
              ))}
            </div>

            <aside className="giving__aside">
              <div className="card card--white">
                <p className="card__label">Transfer narration</p>
                <h3 className="card__title">{tab === 'local' ? 'Help us acknowledge your gift.' : 'Giving from abroad.'}</h3>
                {tab === 'local' ? (
                  <p className="card__body">
                    Please use your <strong>full name</strong> as the transfer narration so we can acknowledge your giving. For
                    tithes, add <strong>“Tithe”</strong> to the narration.
                  </p>
                ) : (
                  <p className="card__body">
                    For international wire transfers, provide your bank with the SWIFT code and full bank address. Please email{' '}
                    <a href={`mailto:${givingEmail}`}>{givingEmail}</a> after transferring so we can confirm receipt.
                  </p>
                )}
              </div>
              <div className="giving__verify">
                <p className="eyebrow">Please verify before payment</p>
                <h3 className="h4">Give with confidence, not uncertainty.</h3>
                <p>
                  Only use the account details published here or confirmed through an official church channel. Do not rely on
                  bank details sent in unexpected messages.
                </p>
                <Link to="/contact?intent=giving" className="btn btn--light">
                  Ask a giving question <Icon name="arrowRight" size={16} />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Scripture
        eyebrow="Generosity"
        text="“Give, and it shall be given unto you; good measure, pressed down, and shaken together, and running over…”"
        reference="Luke 6:38"
      />

      <section className="section section--white">
        <div className="container qa">
          <Reveal className="qa__intro">
            <Eyebrow>Before you give</Eyebrow>
            <h2 className="h2">Your questions are welcome.</h2>
            <p>If anything here is unclear, the church office is glad to help you give with confidence.</p>
          </Reveal>
          <Reveal className="qa__list" delay={80}>
            <div>
              <h3>Which giving methods are available?</h3>
              <p>Bank transfer to the Naira accounts above, or to the USD and GBP domiciliary accounts for giving from abroad.</p>
            </div>
            <div>
              <h3>How do I give my tithe?</h3>
              <p>Transfer to the Tithe &amp; General Offering account and add “Tithe” to your full name in the narration.</p>
            </div>
            <div>
              <h3>Who can help with a giving question?</h3>
              <p>
                Use <Link to="/contact?intent=giving">Contact with the Giving enquiry type</Link>, or email{' '}
                <a href={`mailto:${givingEmail}`}>{givingEmail}</a>.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <DarkCta
        title="Let’s make the next step clear."
        text="For questions about giving or stewardship, send us a giving enquiry and the church office will respond."
        to="/contact?intent=giving"
        label="Contact giving support"
      />

      <div className={`toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  );
}
