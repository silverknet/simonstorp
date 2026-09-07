import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { completeInvite, readInvite } from '../utils/adminAuth';

const shell = 'mx-auto flex w-full max-w-[36rem] flex-col px-4 py-10';
const heading = 'mb-2 text-[1.75rem] font-normal leading-tight text-[var(--main-text)]';
const subtle = 'mb-6 text-base leading-relaxed text-[var(--grey-text)]';
const label = 'mb-1 block text-base font-medium text-[var(--main-text)]';
const input =
  'mb-4 w-full rounded-md border border-black/20 bg-white px-3 py-3 text-lg text-[var(--main-text)] ' +
  'outline-none focus:border-[var(--accent-one)] focus:ring-2 focus:ring-[var(--accent-one)]/30';
const button =
  'w-full rounded-md bg-[var(--accent-one)] px-4 py-3 text-lg font-medium text-white ' +
  'transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';
const errorBox = 'mb-4 rounded-md bg-[#b3261e]/10 px-3 py-2 text-base text-[#b3261e]';
const card = 'mb-6 rounded-md bg-[var(--bg-white-accent)] px-4 py-3 text-base';

export default function RegisterPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [invite, setInvite] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [privateEmail, setPrivateEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [mail, setMail] = useState(null);

  useEffect(() => {
    let active = true;

    if (!token) {
      setLoadError('Länken saknar en kod. Be den som bjöd in dig om en ny länk.');
      setLoading(false);
      return undefined;
    }

    readInvite(token)
      .then((data) => {
        if (!active) return;
        setInvite(data);
        setFirstname(data.firstname || '');
        setLastname(data.lastname || '');
      })
      .catch((err) => active && setLoadError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (password !== repeat) {
      setError('Lösenorden är inte lika.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await completeInvite(token, {
        password,
        firstname,
        lastname,
        privateEmail,
      });
      setMail(result.mail ?? null);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={shell}>
        <p className={subtle}>Laddar…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={shell}>
        <h1 className={heading}>Länken fungerar inte</h1>
        <p className={subtle}>{loadError}</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className={shell}>
        <h1 className={heading}>Klart!</h1>
        <p className={subtle}>Ditt konto är skapat. Nu kan du logga in.</p>

        {mail?.linked ? (
          <div className={card}>
            {mail.verified ? (
              <p className="m-0">
                Din adress <strong>{invite?.email}</strong> är kopplad och fungerar redan.
              </p>
            ) : (
              <>
                <p className="m-0 mb-2">
                  <strong>Ett sista steg:</strong> vi har skickat ett mejl till{' '}
                  <strong>{mail.destination}</strong>.
                </p>
                <p className="m-0">
                  Öppna det och klicka på länken — då börjar <strong>{invite?.email}</strong>{' '}
                  fungera. Kolla skräpposten om du inte hittar det.
                </p>
              </>
            )}
          </div>
        ) : null}

        <Link className={button + ' text-center no-underline'} to="/admin">
          Gå till inloggningen
        </Link>
      </div>
    );
  }

  const wantsAlias = String(invite?.email ?? '')
    .toLowerCase()
    .endsWith('@simonstorp.se');

  return (
    <div className={shell}>
      <h1 className={heading}>Skapa ditt konto</h1>
      <p className={subtle}>Välj ett lösenord så är du klar.</p>

      <div className={card}>
        <p className="m-0 text-[var(--grey-text)]">Din e-postadress</p>
        <p className="m-0">
          <strong>{invite?.email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {error ? <p className={errorBox}>{error}</p> : null}

        <label className={label} htmlFor="reg-firstname">
          Förnamn
        </label>
        <input
          id="reg-firstname"
          className={input}
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          required
        />

        <label className={label} htmlFor="reg-lastname">
          Efternamn
        </label>
        <input
          id="reg-lastname"
          className={input}
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
        />

        {wantsAlias ? (
          <>
            <label className={label} htmlFor="reg-private">
              Din vanliga e-postadress
            </label>
            <p className="mb-2 text-sm leading-relaxed text-[var(--grey-text)]">
              Post till {invite?.email} skickas vidare hit. Använd adressen du läser varje dag.
            </p>
            <input
              id="reg-private"
              className={input}
              type="email"
              value={privateEmail}
              onChange={(e) => setPrivateEmail(e.target.value)}
              required
            />
          </>
        ) : null}

        <label className={label} htmlFor="reg-password">
          Lösenord (minst 8 tecken)
        </label>
        <input
          id="reg-password"
          className={input}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className={label} htmlFor="reg-repeat">
          Upprepa lösenordet
        </label>
        <input
          id="reg-repeat"
          className={input}
          type="password"
          autoComplete="new-password"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          required
        />

        <button className={button} type="submit" disabled={submitting}>
          {submitting ? 'Skapar konto…' : 'Skapa konto'}
        </button>
      </form>
    </div>
  );
}
