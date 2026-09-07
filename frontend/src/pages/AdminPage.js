import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  MailCheck,
  MailX,
  UserCheck,
  UserX,
  SquarePen,
  UserPlus,
  X,
} from 'lucide-react';

import apiBaseUrl from '../config/apiBaseUrl';
import { usePageMeta } from '../utils/pageMeta';
import {
  adminLogin,
  adminLogout,
  createAdminInvite,
  fetchAdminMe,
  fetchPeople,
  removeBoardMember,
  resendMailVerification,
  setBoardMember,
} from '../utils/adminAuth';

/* Deliberately large, high-contrast and plain: the people using this are elderly. */
const loginShell = 'mx-auto flex w-full max-w-[36rem] flex-col px-4 py-10';
const dashShell = 'mx-auto flex w-full max-w-[64rem] flex-col px-4 py-10';
const heading = 'mb-2 text-[1.75rem] font-normal leading-tight text-[var(--main-text)]';
const subtle = 'mb-6 text-base leading-relaxed text-[var(--grey-text)]';
const sectionTitle = 'mb-4 text-[1.25rem] font-normal text-[var(--main-text)]';
const label = 'mb-1 block text-base font-medium text-[var(--main-text)]';
const input =
  'mb-4 w-full rounded-md border border-black/20 bg-white px-3 py-3 text-lg text-[var(--main-text)] ' +
  'outline-none focus:border-[var(--accent-one)] focus:ring-2 focus:ring-[var(--accent-one)]/30';
const button =
  'w-full rounded-md bg-[var(--accent-one)] px-4 py-3 text-lg font-medium text-white ' +
  'transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';
/* One huge, unmistakable target: icon, what it is, and what you do there. */
const primaryLink =
  'flex w-full items-center gap-4 rounded-xl bg-[var(--accent-one)] px-6 py-6 text-left text-white no-underline ' +
  'shadow-sm transition-transform hover:scale-[1.01] hover:opacity-95 ' +
  'focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent-one)]/40';
const linkButton =
  'mt-8 self-start rounded-md border border-black/20 bg-white px-4 py-2 text-base text-[var(--main-text)] hover:bg-black/5';
const errorBox = 'mb-4 rounded-md bg-[#b3261e]/10 px-3 py-2 text-base text-[#b3261e]';

const addButton =
  'mt-4 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--accent-one)]/60 ' +
  'bg-white px-4 py-4 text-lg font-medium text-[var(--accent-one)] transition-colors hover:bg-[var(--accent-one)]/5';
const dialogBackdrop =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto';
const dialogBox = 'w-full max-w-[32rem] rounded-xl bg-white p-6 shadow-xl';
const dialogTitle = 'mb-1 text-[1.4rem] font-normal text-[var(--main-text)]';
const smallButton =
  'rounded-md bg-[var(--accent-one)] px-4 py-3 text-base font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60';
const ghostButton =
  'rounded-md border border-black/20 bg-white px-4 py-3 text-base text-[var(--main-text)] hover:bg-black/5';
const linkBox =
  'mb-3 w-full break-all rounded-md bg-[var(--bg-white-accent)] px-3 py-3 text-sm text-[var(--main-text)]';

/** Two columns on a wide screen, stacked on anything narrower. */
const splitGrid = 'grid w-full grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-0';
const leftCol = 'min-w-0 lg:pr-10';
const rightCol =
  'min-w-0 border-t border-black/10 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0';

const userRow = 'flex flex-col rounded-md px-3 py-3';
const userRowSelf = `${userRow} bg-[var(--bg-white-accent)]`;

/** One line per person telling you whether their @simonstorp.se address actually works. */
const MAIL_STATES = {
  ok: { icon: MailCheck, text: 'E-post fungerar', tone: 'text-[var(--accent-one)]' },
  unverified: {
    icon: AlertTriangle,
    text: 'Väntar på bekräftelse',
    tone: 'text-[#b26b00]',
  },
  disabled: { icon: MailX, text: 'Vidarebefordran avstängd', tone: 'text-[#b3261e]' },
  missing: { icon: MailX, text: 'Ingen vidarebefordran', tone: 'text-[#b3261e]' },
};

const ROLE_LABELS = {
  'strapi-super-admin': 'Superadmin',
  'strapi-editor': 'Redaktör',
  'strapi-author': 'Skribent',
};

/** "idag" / "igår" / a date — precise enough without a timestamp nobody reads. */
function formatSeen(value) {
  if (!value) return '';

  const then = new Date(value);
  const days = Math.floor((Date.now() - then.getTime()) / 86400000);

  if (days <= 0) return 'idag';
  if (days === 1) return 'igår';
  if (days < 30) return `för ${days} dagar sedan`;

  return then.toLocaleDateString('sv-SE');
}

function displayName(user) {
  return [user.firstname, user.lastname].filter(Boolean).join(' ') || user.email;
}

function roleText(roles) {
  if (!roles?.length) return 'Ingen behörighet';
  return roles.map((code) => ROLE_LABELS[code] ?? code).join(', ');
}

function InviteDialog({ onClose, onCreated, prefill }) {
  const [first = '', ...rest] = String(prefill?.name ?? '').trim().split(/\s+/);
  const [firstname, setFirstname] = useState(first);
  const [lastname, setLastname] = useState(rest.join(' '));
  const [email, setEmail] = useState(prefill?.email ?? '');
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Suggest the föreningen address, but leave it editable — some prefer their private one.
  function suggestEmail(value) {
    const slug = value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]/g, '');

    if (slug && !email) setEmail(`${slug}@simonstorp.se`);
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const url = await createAdminInvite({ firstname, lastname, email });
      setInviteUrl(url);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
    } catch (err) {
      setCopied(false);
    }
  }

  return (
    <div className={dialogBackdrop} role="dialog" aria-modal="true">
      <div className={dialogBox}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className={dialogTitle}>
            {inviteUrl ? 'Inbjudan är klar' : 'Lägg till ny medlem'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Stäng" className="p-1">
            <X className="h-6 w-6" aria-hidden />
          </button>
        </div>

        {inviteUrl ? (
          <>
            <p className="mb-3 text-base leading-relaxed text-[var(--grey-text)]">
              Skicka den här länken till personen. Den fungerar en gång — där väljer de sitt
              eget lösenord.
            </p>
            <p className={linkBox}>{inviteUrl}</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" className={smallButton} onClick={handleCopy}>
                {copied ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-5 w-5" aria-hidden /> Kopierad
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Copy className="h-5 w-5" aria-hidden /> Kopiera länken
                  </span>
                )}
              </button>
              <button type="button" className={ghostButton} onClick={onClose}>
                Stäng
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleCreate} noValidate>
            {error ? <p className={errorBox}>{error}</p> : null}

            <label className={label} htmlFor="inv-firstname">
              Förnamn
            </label>
            <input
              id="inv-firstname"
              className={input}
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              onBlur={(e) => suggestEmail(e.target.value)}
              required
            />

            <label className={label} htmlFor="inv-lastname">
              Efternamn
            </label>
            <input
              id="inv-lastname"
              className={input}
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
            />

            <label className={label} htmlFor="inv-email">
              E-post
            </label>
            <input
              id="inv-email"
              className={input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="flex flex-wrap gap-3">
              <button className={smallButton} type="submit" disabled={submitting}>
                {submitting ? 'Skapar…' : 'Skapa inbjudan'}
              </button>
              <button type="button" className={ghostButton} onClick={onClose}>
                Avbryt
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  usePageMeta({ title: 'Administration', noIndex: true });

  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [people, setPeople] = useState([]);
  const [usersError, setUsersError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(null);

  const loadUsers = useCallback(() => {
    fetchPeople()
      .then((data) => {
        setPeople(data.people ?? []);
        setUsersError('');
      })
      .catch((err) => setUsersError(err.message));
  }, []);

  async function resendVerification(entry) {
    setBusyId(entry.userId ?? entry.boardId);
    setUsersError('');

    try {
      await resendMailVerification(entry.mail.forwardsTo);
      loadUsers();
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  /** Manual fallback for when Cloudflare has no rule to derive the match from. */
  async function linkToAccount(entry, userId) {
    setBusyId(entry.boardId);
    setUsersError('');

    try {
      await setBoardMember(userId, { boardId: entry.board.id });
      loadUsers();
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  /** Confirms a Cloudflare-derived match, merging a board profile into an account row. */
  async function linkExisting(entry) {
    setBusyId(entry.boardId);
    setUsersError('');

    try {
      await setBoardMember(entry.suggested.userId, { boardId: entry.board.id });
      loadUsers();
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function toggleBoard(entry, checked) {
    if (!entry.userId) return;

    setBusyId(entry.userId);
    setUsersError('');

    try {
      if (checked) {
        const roll = window.prompt('Vilken roll i styrelsen?', entry.board?.roll || 'ledamot');
        if (roll === null) return;
        await setBoardMember(entry.userId, { roll });
      } else {
        await removeBoardMember(entry.userId);
      }

      loadUsers();
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    let active = true;

    fetchAdminMe().then((me) => {
      if (!active) return;
      setUser(me);
      setChecking(false);
      if (me) loadUsers();
    });

    return () => {
      active = false;
    };
  }, [loadUsers]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      setUser(await adminLogin(email.trim(), password, rememberMe));
      setPassword('');
      loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    adminLogout();
    setUser(null);
    setPeople([]);
  }

  if (checking) {
    return (
      <div className={loginShell}>
        <p className={subtle}>Laddar…</p>
      </div>
    );
  }

  const accounts = people.filter((p) => p.userId && !p.board);

  if (user) {
    return (
      <div className={dashShell}>
        <h1 className={heading}>Administration</h1>
        <p className={subtle}>
          Inloggad som {displayName(user)} ({roleText(user.roles)}).
        </p>

        <div className={splitGrid}>
          <section className={leftCol}>
            <h2 className={sectionTitle}>Användare</h2>

            {usersError ? <p className={errorBox}>{usersError}</p> : null}

            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {people.map((entry) => {
                const key = entry.userId ? `u${entry.userId}` : `b${entry.boardId}`;
                const mail = entry.mail ? MAIL_STATES[entry.mail.state] : null;
                const MailIcon = mail?.icon;

                return (
                  <li key={key} className={entry.isSelf ? userRowSelf : userRow}>
                    <span className="text-base text-[var(--main-text)]">
                      <strong>{entry.name}</strong>
                      {entry.isSelf ? ' (du)' : ''}
                    </span>
                    <span className="text-sm text-[var(--grey-text)]">{entry.email}</span>

                    <span className="text-sm text-[var(--grey-text)]">
                      {entry.userId ? roleText(entry.roles) : 'Inget konto'}
                      {entry.board ? ` · Styrelse: ${entry.board.roll}` : ''}
                    </span>

                    {entry.userId ? (
                      <span
                        className={`mt-1 flex items-center gap-2 text-sm ${
                          entry.isActive ? 'text-[var(--accent-one)]' : 'text-[#b26b00]'
                        }`}
                      >
                        {entry.isActive ? (
                          <UserCheck className="h-4 w-4 shrink-0" aria-hidden />
                        ) : (
                          <UserX className="h-4 w-4 shrink-0" aria-hidden />
                        )}
                        {entry.isActive
                          ? `Konto klart${
                              entry.hasUsedSite ? ` · besökte sidan ${formatSeen(entry.lastSeenAt)}` : ''
                            }`
                          : 'Inbjuden – har inte valt lösenord än'}
                      </span>
                    ) : null}

                    {mail ? (
                      <span className="mt-1 flex flex-col gap-1">
                        <span className={`flex items-center gap-2 text-sm ${mail.tone}`}>
                          <MailIcon className="h-4 w-4 shrink-0" aria-hidden />
                          {mail.text}
                          {entry.mail.forwardsTo ? ` → ${entry.mail.forwardsTo}` : ''}
                        </span>

                        {entry.mail.state === 'unverified' && entry.mail.forwardsTo ? (
                          <button
                            type="button"
                            className={ghostButton + ' self-start py-2 text-sm'}
                            disabled={busyId === (entry.userId ?? entry.boardId)}
                            onClick={() => resendVerification(entry)}
                          >
                            Skicka bekräftelsemejl igen
                          </button>
                        ) : null}
                      </span>
                    ) : null}

                    {entry.userId ? (
                      <label className="mt-2 flex items-center gap-2 text-sm text-[var(--main-text)]">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-[var(--accent-one)]"
                          checked={Boolean(entry.board)}
                          disabled={busyId === entry.userId}
                          onChange={(e) => toggleBoard(entry, e.target.checked)}
                        />
                        Sitter i styrelsen
                      </label>
                    ) : (
                      entry.suggested ? (
                        <span className="mt-2 flex flex-col gap-2">
                          <span className="text-sm text-[var(--grey-text)]">
                            Samma person som kontot <strong>{entry.suggested.email}</strong>?
                            <br />
                            {entry.email} vidarebefordras dit.
                          </span>
                          <button
                            type="button"
                            className={ghostButton + ' self-start py-2'}
                            disabled={busyId === entry.boardId}
                            onClick={() => linkExisting(entry)}
                          >
                            Koppla ihop
                          </button>
                        </span>
                      ) : (
                        <span className="mt-2 flex flex-col gap-2">
                          <span className="text-sm text-[var(--grey-text)]">
                            Styrelseprofil utan konto.
                          </span>

                          <span className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              className={ghostButton + ' py-2'}
                              onClick={() => setInviteOpen({ name: entry.name, email: entry.email })}
                            >
                              Bjud in {entry.name.split(' ')[0]}
                            </button>

                            {accounts.length ? (
                              <select
                                className="rounded-md border border-black/20 bg-white px-3 py-2 text-sm"
                                value=""
                                disabled={busyId === entry.boardId}
                                onChange={(e) =>
                                  e.target.value && linkToAccount(entry, Number(e.target.value))
                                }
                              >
                                <option value="">Koppla till befintligt konto…</option>
                                {accounts.map((a) => (
                                  <option key={a.userId} value={a.userId}>
                                    {a.name} ({a.email})
                                  </option>
                                ))}
                              </select>
                            ) : null}
                          </span>
                        </span>
                      )
                    )}
                  </li>
                );
              })}
            </ul>

            <button type="button" className={addButton} onClick={() => setInviteOpen({})}>
              <UserPlus className="h-7 w-7" strokeWidth={1.75} aria-hidden />
              Lägg till ny medlem
            </button>
          </section>

          <section className={rightCol}>
            <h2 className={sectionTitle}>Innehåll</h2>
            <p className="mb-5 text-base leading-relaxed text-[var(--grey-text)]">
              Här redigerar du nyheter, sidor och bilder. Klicka på den gröna rutan.
            </p>

            <a className={primaryLink} href={`${apiBaseUrl}/admin`}>
              <SquarePen className="h-12 w-12 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-[1.4rem] font-semibold leading-tight">
                  Innehållshanteraren
                </span>
                <span className="block text-lg leading-snug opacity-95">Redigera innehåll</span>
              </span>
              <ArrowRight className="h-8 w-8 shrink-0" strokeWidth={2} aria-hidden />
            </a>

            <p className="mt-3 text-base leading-relaxed text-[var(--grey-text)]">
              Öppnas i samma fönster. Du kan behöva logga in en gång till.
            </p>
          </section>
        </div>

        <button type="button" className={linkButton} onClick={handleLogout}>
          Logga ut
        </button>

        {inviteOpen ? (
          <InviteDialog
            prefill={inviteOpen}
            onClose={() => setInviteOpen(null)}
            onCreated={loadUsers}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className={loginShell}>
      <h1 className={heading}>Logga in</h1>
      <p className={subtle}>Använd samma e-post och lösenord som du har till Strapi.</p>

      <form onSubmit={handleSubmit} noValidate>
        {error ? <p className={errorBox}>{error}</p> : null}

        <label className={label} htmlFor="admin-email">
          E-post
        </label>
        <input
          id="admin-email"
          className={input}
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className={label} htmlFor="admin-password">
          Lösenord
        </label>
        <input
          id="admin-password"
          className={input}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="mb-5 flex items-center gap-3 text-base text-[var(--main-text)]">
          <input
            type="checkbox"
            className="h-5 w-5 accent-[var(--accent-one)]"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Håll mig inloggad
        </label>

        <button className={button} type="submit" disabled={submitting}>
          {submitting ? 'Loggar in…' : 'Logga in'}
        </button>
      </form>
    </div>
  );
}
