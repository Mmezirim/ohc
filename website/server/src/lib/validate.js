const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s().-]{5,24}$/;

export const clean = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function badRequest(errors) {
  const err = new Error('Please check the highlighted fields.');
  err.status = 400;
  err.fields = errors;
  return err;
}

export function validateVisit(body) {
  const data = {
    full_name: clean(body.fullName, 120),
    email: clean(body.email, 190).toLowerCase(),
    phone: clean(body.phone, 40) || null,
    source: clean(body.source, 60) || null,
  };
  const errors = {};
  if (data.full_name.length < 2) errors.fullName = 'Please enter your full name.';
  if (!EMAIL_RE.test(data.email)) errors.email = 'Please enter a valid email address.';
  if (data.phone && !PHONE_RE.test(data.phone)) errors.phone = 'Please enter a valid phone number.';
  if (Object.keys(errors).length) throw badRequest(errors);
  return data;
}

export function validateComment(body) {
  const data = {
    name: clean(body.name, 120),
    email: clean(body.email, 190).toLowerCase(),
    website: clean(body.website, 255) || null,
    body: clean(body.comment, 5000),
  };
  const errors = {};
  if (data.name.length < 2) errors.name = 'Name is required.';
  if (!EMAIL_RE.test(data.email)) errors.email = 'Please enter a valid email address.';
  if (data.website && !/^https?:\/\/\S+$/i.test(data.website)) errors.website = 'Website must start with http:// or https://';
  if (data.body.length < 2) errors.comment = 'Comment is required.';
  if (Object.keys(errors).length) throw badRequest(errors);
  return data;
}

export const ENQUIRY_INTENTS = ['general', 'visit', 'clusters', 'prayer', 'serving', 'giving', 'program', 'accessibility'];

export function validateEnquiry(body) {
  const intent = clean(body.intent, 30) || 'general';
  const data = {
    full_name: clean(body.fullName, 120),
    email: clean(body.email, 190).toLowerCase(),
    phone: clean(body.phone, 40) || null,
    intent: ENQUIRY_INTENTS.includes(intent) ? intent : 'general',
    subject: clean(body.subject, 160) || null,
    message: clean(body.message, 5000),
    consent: body.consent === true ? 1 : 0,
  };
  const errors = {};
  if (data.full_name.length < 2) errors.fullName = 'Please enter your name.';
  if (!EMAIL_RE.test(data.email)) errors.email = 'Please enter a valid email address.';
  if (data.phone && !PHONE_RE.test(data.phone)) errors.phone = 'Please enter a valid phone number.';
  if (data.message.length < 2) errors.message = 'Please write a short message.';
  if (!data.consent) errors.consent = 'Please confirm we may use your details to respond.';
  if (Object.keys(errors).length) throw badRequest(errors);
  return data;
}

/** Hidden "company" field: real visitors leave it empty, most bots fill it in. */
export const isBot = (body) => Boolean(body && typeof body.company === 'string' && body.company.trim());
