import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Newspaper,
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
  activateMail,
  fetchNewsPreview,
  fetchPeople,
  importNewsPost,
  removeBoardMember,
  setBoardMember,
  setProfileOnBoard,
} from '../utils/adminAuth';

/* Deliberately large, high-contrast and plain: the people using this are elderly. */
const loginShell = 'mx-auto flex w-full max-w-[36rem] flex-col px-4 py-10';
const dashShell = 'mx-auto flex w-full max-w-[84rem] flex-col px-4 py-10';
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
  'flex w-full items-center gap-3 rounded-xl bg-[var(--accent-one)] px-4 py-5 text-left text-white no-underline ' +
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

/** Members take the width; tools sit in a narrower rail beside them. */
const pageGrid = 'mt-8 grid w-full grid-cols-1 gap-8 lg:grid-cols-[7fr_3fr] lg:gap-0';

/** Ruled off from the member lists: these are tools, not more people. */
const toolRail =
  'min-w-0 border-t border-black/10 pt-8 lg:sticky lg:top-6 lg:self-start ' +
  'lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0';

/** The two member lists split the wide side once there is room for both. */
const splitGrid = 'grid w-full grid-cols-1 gap-8 xl:grid-cols-2 xl:gap-8';
const listCol = 'min-w-0';

/** Fixed height so the two lists line up and nothing jumps as statuses change. */
const rowBase =
  'flex h-[4.25rem] items-center gap-2.5 rounded-md px-3 text-left';
const userRow = rowBase;
const userRowSelf = `${rowBase} bg-[var(--bg-white-accent)]`;

const rowName = 'truncate text-base text-[var(--main-text)]';
const rowSub = 'truncate text-xs text-[var(--grey-text)]';
const emptyNote = 'px-3 py-4 text-sm text-[var(--grey-text)]';

/**
 * A live green light. Deliberately a vivid signal green rather than the muted brand
 * green, so it reads as a lit indicator instead of another decorative element.
 */
const readyDot = 'relative flex h-4 w-4 shrink-0 items-center justify-center';
const readyPing =
  'absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[#22c55e] opacity-75';
const readyCore = 'relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]';

const newsRow = 'flex flex-col gap-2 border-b border-black/5 py-3 last:border-b-0';
const newsBadge = 'rounded-full px-2 py-0.5 text-xs font-medium';
const newsButton =
  'mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-black/20 bg-white px-4 py-3 text-base text-[var(--main-text)] hover:bg-black/5 disabled:opacity-50';

const checkBar = 'mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--grey-text)]';
const checkButton =
  'rounded-md border border-black/20 bg-white px-3 py-2 text-sm text-[var(--main-text)] hover:bg-black/5 disabled:opacity-50';

const helpCard = 'mt-4 rounded-xl bg-[var(--bg-white-accent)] px-4 py-4';
const helpTitle = 'm-0 mb-2 text-[1.05rem] font-medium text-[var(--main-text)]';
const helpText = 'm-0 text-base leading-relaxed text-[var(--grey-text)]';
const helpExample =
  'mt-3 mb-0 whitespace-pre-wrap rounded-md bg-white px-3 py-3 font-mono text-sm leading-relaxed text-[var(--main-text)]';

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

/** Whether an @simonstorp.se address actually reaches the person. */
const MAIL_STATES = {
  ok: { icon: MailCheck, text: 'E-post fungerar', tone: 'text-[#22c55e]' },
  unverified: { icon: AlertTriangle, text: 'Väntar på bekräftelse', tone: 'text-[#b26b00]' },
  disabled: { icon: MailX, text: 'Vidarebefordran avstängd', tone: 'text-[#b3261e]' },
  missing: { icon: MailX, text: 'Ingen vidarebefordran', tone: 'text-[#b3261e]' },
};

/** One person, fixed height: identity plus at-a-glance status. Detail lives in a dialog. */
function PersonRow({ entry, onOpen }) {
  const mail = entry.mail ? MAIL_STATES[entry.mail.state] : null;
  const MailIcon = mail?.icon;
  const hasAccount = Boolean(entry.userId);

  return (
    <li className={entry.isSelf ? userRowSelf : userRow}>
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 flex-col text-left"
        title="Visa detaljer"
      >
        <span className={rowName}>
          <strong>{entry.name}</strong>
          {entry.isSelf ? ' (du)' : ''}
        </span>
        <span className={rowSub}>{entry.email}</span>
      </button>

      <span className="flex shrink-0 items-center gap-2.5">
        {entry.mail?.state === 'ok' ? (
          <span className={readyDot} title="E-posten fungerar" aria-label="E-posten fungerar">
            <span className={readyPing} />
            <span className={readyCore} />
          </span>
        ) : null}

        {hasAccount ? (
          <UserCheck
            className={`h-4 w-4 ${entry.isActive ? 'text-[#22c55e]' : 'text-[#b26b00]'}`}
            aria-label={entry.isActive ? 'Konto klart' : 'Har inte valt lösenord'}
          >
            <title>{entry.isActive ? 'Konto klart' : 'Har inte valt lösenord'}</title>
          </UserCheck>
        ) : (
          <UserX className="h-4 w-4 text-[var(--grey-text)]" aria-label="Inget konto" />
        )}

        {mail ? <MailIcon className={`h-4 w-4 ${mail.tone}`} aria-label={mail.text} /> : null}
      </span>

    </li>
  );
}

/**
 * Shared shell so both dialogs close the same way — clicking the backdrop or pressing
 * Escape, which is what people try first.
 */
function Dialog({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className={dialogBackdrop}
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={dialogBox} role="dialog" aria-modal="true" aria-label={title}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className={dialogTitle}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Stäng"
            className="-m-1 rounded-md p-1 text-[var(--grey-text)] hover:bg-black/5"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
        </div>

        {children}

        {footer ? <div className="mt-6 flex flex-col gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}

/** A labelled line in the dialog's summary block. */
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-black/5 py-2 last:border-b-0">
      <span className="text-xs uppercase tracking-[0.06em] text-[var(--grey-text)]">{label}</span>
      <span className="text-base text-[var(--main-text)]">{children}</span>
    </div>
  );
}

/** Everything that would otherwise clutter the row: aliases, status, and the actions. */
function PersonDialog({
  entry,
  accounts,
  busy,
  onClose,
  onInvite,
  onLink,
  onResend,
  onMove,
  onFixMail,
}) {
  const mail = entry.mail ? MAIL_STATES[entry.mail.state] : null;
  const MailIcon = mail?.icon;

  const status = !entry.userId
    ? 'Inget konto'
    : entry.isActive
      ? `Konto klart${entry.hasUsedSite ? ` · besökte sidan ${formatSeen(entry.lastSeenAt)}` : ''}`
      : 'Inbjuden – har inte valt lösenord än';

  return (
    <Dialog
      title={entry.name}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={smallButton} disabled={busy} onClick={onMove}>
            {entry.board ? 'Flytta till Övriga' : 'Flytta till Styrelsen'}
          </button>

          {!entry.userId && entry.suggested ? (
            <button
              type="button"
              className={ghostButton}
              disabled={busy}
              onClick={() => onLink(entry.suggested.userId)}
            >
              Koppla ihop med {entry.suggested.email}
            </button>
          ) : null}

          {!entry.userId ? (
            <button type="button" className={ghostButton} onClick={onInvite}>
              Bjud in {entry.name.split(' ')[0]}
            </button>
          ) : null}

          {!entry.userId && accounts.length ? (
            <select
              className="w-full rounded-md border border-black/20 bg-white px-3 py-3 text-base"
              value=""
              disabled={busy}
              onChange={(e) => e.target.value && onLink(Number(e.target.value))}
            >
              <option value="">Koppla till befintligt konto…</option>
              {accounts.map((a) => (
                <option key={a.userId} value={a.userId}>
                  {a.name} ({a.email})
                </option>
              ))}
            </select>
          ) : null}

          {entry.mail?.state === 'unverified' && entry.mail.forwardsTo ? (
            <button type="button" className={ghostButton} disabled={busy} onClick={onFixMail}>
              Skicka bekräftelse till {entry.name.split(' ')[0]}
            </button>
          ) : null}
        </>
      }
    >
      <div className="flex flex-col">
        <Field label={entry.userId ? 'Inloggning' : 'E-post'}>{entry.email}</Field>

        {/* Without an account, behörighet and status would both just read "Inget konto". */}
        {entry.userId ? (
          <>
            <Field label="Behörighet">{roleText(entry.roles)}</Field>
            <Field label="Status">{status}</Field>
          </>
        ) : (
          <Field label="Konto">Inget konto än</Field>
        )}

        <Field label="Styrelsen">
          {entry.board ? entry.board.roll : 'Sitter inte i styrelsen'}
        </Field>
        <Field label="E-postadresser">
          {entry.aliases?.length ? (
            <span className="flex flex-col gap-1">
              {entry.aliases.map((a) => (
                <span key={a.alias} className="flex flex-wrap items-baseline gap-x-2">
                  <span>{a.alias}</span>
                  {a.forwardsTo ? (
                    <span className="text-sm text-[var(--grey-text)]">→ {a.forwardsTo}</span>
                  ) : null}
                  {a.verified ? null : (
                    <span className="text-sm text-[#b26b00]">väntar på bekräftelse</span>
                  )}
                </span>
              ))}
            </span>
          ) : (
            <span className={`flex items-center gap-2 ${mail ? mail.tone : ''}`}>
              {MailIcon ? <MailIcon className="h-4 w-4 shrink-0" aria-hidden /> : null}
              {mail ? mail.text : 'Ingen @simonstorp.se-adress'}
            </span>
          )}
        </Field>
      </div>
    </Dialog>
  );
}

/** Recent Facebook posts and whether each one made it onto the site. */
function NewsDialog({ onClose }) {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setError('');
    fetchNewsPreview(30)
      .then(setPosts)
      .catch((err) => {
        setPosts([]);
        setError(err.message);
      });
  }, []);

  useEffect(load, [load]);

  async function addPost(post) {
    setBusyId(post.facebookPostId);
    setError('');

    try {
      await importNewsPost(post.facebookPostId);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Dialog title="Inlägg från Facebook" onClose={onClose}>
      {error ? <p className={errorBox}>{error}</p> : null}

      {posts === null ? (
        <p className={helpText}>Hämtar inlägg…</p>
      ) : posts.length === 0 ? (
        <p className={helpText}>Inga inlägg de senaste 30 dagarna.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {posts.map((post) => (
            <li key={post.facebookPostId} className={newsRow}>
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-[var(--grey-text)]">
                  {post.createdTime ? post.createdTime.slice(0, 10) : ''}
                </span>
                {post.imported ? (
                  <span className={`${newsBadge} bg-[#22c55e]/15 text-[#15803d]`}>
                    Redan på hemsidan
                  </span>
                ) : post.tagged ? (
                  <span className={`${newsBadge} bg-[#22c55e]/15 text-[#15803d]`}>
                    Klar att läggas till
                  </span>
                ) : (
                  <span className={`${newsBadge} bg-black/5 text-[var(--grey-text)]`}>
                    Saknar simonstorp.se
                  </span>
                )}
              </span>

              <span className="text-base text-[var(--main-text)]">
                {post.title || post.excerpt.split('\n')[0] || '(ingen text)'}
              </span>

              {!post.imported ? (
                <span>
                  <button
                    type="button"
                    className={ghostButton + ' py-2 text-sm'}
                    disabled={busyId === post.facebookPostId || !post.importable}
                    onClick={() => addPost(post)}
                  >
                    {busyId === post.facebookPostId ? 'Lägger till…' : 'Lägg till på hemsidan'}
                  </button>
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
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
    <Dialog title={inviteUrl ? 'Inbjudan är klar' : 'Lägg till ny medlem'} onClose={onClose}>
      <div>
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
    </Dialog>
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
  const [detail, setDetail] = useState(null);
  const [notice, setNotice] = useState('');
  const [checkedAt, setCheckedAt] = useState(null);
  const [checking2, setChecking2] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);

  const loadUsers = useCallback(
    ({ refresh = false } = {}) => {
      if (refresh) setChecking2(true);

      return fetchPeople({ refresh })
        .then((data) => {
          setPeople(data.people ?? []);
          setCheckedAt(data.mailCheckedAt ?? null);
          setUsersError('');
        })
        .catch((err) => setUsersError(err.message))
        .finally(() => setChecking2(false));
    },
    []
  );

  /**
   * "Make this address work" — connects the alias and sends the confirmation the person
   * has to click. Splitting these was a distinction only the API cared about.
   */
  async function fixMail(entry) {
    setBusyId(entry.userId ?? entry.boardId);
    setUsersError('');
    setNotice('');

    try {
      const result = await activateMail(entry.board?.email ?? null, entry.mail.forwardsTo);
      setNotice(result.message);
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

  /**
   * Works for everyone: with an account the profile is created or unpublished, and
   * without one the existing profile is simply published or unpublished — otherwise
   * board members with no login could never be moved.
   */
  async function moveMember(entry) {
    const toBoard = !entry.board;
    setBusyId(entry.userId ?? entry.boardId);
    setUsersError('');

    try {
      if (entry.userId) {
        await toggleBoard(entry, toBoard, { silent: true });
      } else {
        await setProfileOnBoard(entry.board?.id ?? entry.formerBoardId ?? entry.boardId, toBoard);
        loadUsers();
      }
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function toggleBoard(entry, checked, { silent = false } = {}) {
    if (!entry.userId) return;

    if (!silent) {
      setBusyId(entry.userId);
      setUsersError('');
    }

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
      if (silent) throw err;
      setUsersError(err.message);
    } finally {
      if (!silent) setBusyId(null);
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
  const styrelsen = people.filter((p) => p.board);
  const ovriga = people.filter((p) => !p.board);

  if (user) {
    return (
      <div className={dashShell}>
        <h1 className={heading}>Administration</h1>
        <p className={subtle}>
          Inloggad som {displayName(user)} ({roleText(user.roles)}).
        </p>

        {usersError ? <p className={`${errorBox} mt-6`}>{usersError}</p> : null}
        {notice ? (
          <p className="mt-6 rounded-md bg-[var(--bg-white-accent)] px-3 py-2 text-base">
            {notice}
          </p>
        ) : null}

        <div className={pageGrid}>
          <div className="min-w-0 lg:pr-10">
            <div className={splitGrid}>
          <section className={listCol}>
            <h2 className={sectionTitle}>Styrelsen</h2>
            <p className="mb-2 flex items-center gap-2 px-3 text-sm text-[var(--grey-text)]">
              <span className={readyDot}>
                <span className={readyPing} />
                <span className={readyCore} />
              </span>
              betyder att personens e-post fungerar
            </p>

            {styrelsen.length ? (
              <ul className="m-0 flex list-none flex-col p-0">
                {styrelsen.map((entry) => (
                  <PersonRow
                    key={entry.userId ? `u${entry.userId}` : `b${entry.boardId}`}
                    entry={entry}
                    onOpen={() => setDetail(entry)}
                  />
                ))}
              </ul>
            ) : (
              <p className={emptyNote}>Ingen är markerad som styrelsemedlem än.</p>
            )}
          </section>

          <section className={listCol}>
            <h2 className={sectionTitle}>Övriga</h2>

            {ovriga.length ? (
              <ul className="m-0 flex list-none flex-col p-0">
                {ovriga.map((entry) => (
                  <PersonRow
                    key={entry.userId ? `u${entry.userId}` : `b${entry.boardId}`}
                    entry={entry}
                    onOpen={() => setDetail(entry)}
                  />
                ))}
              </ul>
            ) : (
              <p className={emptyNote}>Alla med konto sitter i styrelsen.</p>
            )}

            <button type="button" className={addButton} onClick={() => setInviteOpen({})}>
              <UserPlus className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              Lägg till ny medlem
            </button>
          </section>
            </div>

            <div className={checkBar}>
              <span>
                {checkedAt
                  ? `E-postadresserna kontrollerades ${new Date(checkedAt).toLocaleTimeString(
                      'sv-SE',
                      { hour: '2-digit', minute: '2-digit' }
                    )}`
                  : 'E-postadresserna har inte kontrollerats än'}
              </span>
              <button
                type="button"
                className={checkButton}
                disabled={checking2}
                onClick={() => loadUsers({ refresh: true })}
              >
                {checking2 ? 'Kontrollerar…' : 'Kontrollera nu'}
              </button>
            </div>
          </div>

          <aside className={toolRail}>
        <a className={primaryLink} href={`${apiBaseUrl}/admin`}>
          <SquarePen className="h-10 w-10 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-[1.25rem] font-semibold leading-tight">
              Innehållshanteraren
            </span>
            <span className="block text-base leading-snug opacity-95">Redigera innehåll</span>
          </span>
        </a>

        <div className={helpCard}>
          <h2 className={helpTitle}>Nyheter från Facebook</h2>
          <p className={helpText}>
            Skriv inlägget som vanligt på Facebook och lägg till raden{' '}
            <strong>simonstorp.se</strong>. Varje natt hämtas nya inlägg med den raden
            automatiskt hit. Bilden i inlägget följer med.
          </p>
          <p className={`${helpText} mt-2`}>
            <strong>Titel</strong>, <strong>Datum</strong> och <strong>Plats</strong> är
            frivilliga — skriv dem på egna rader så hamnar de på rätt plats på hemsidan.
          </p>
          <pre className={helpExample}>{`Kom och fira in våren med grannar och vänner!
simonstorp.se
Titel: Valborg
Datum: 2026-04-30 19:00
Plats: Bolenparken`}</pre>

          <button type="button" className={newsButton} onClick={() => setNewsOpen(true)}>
            <Newspaper className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Leta efter nya inlägg
          </button>
        </div>
          </aside>
        </div>

        <button type="button" className={linkButton} onClick={handleLogout}>
          Logga ut
        </button>

        {detail ? (
          <PersonDialog
            entry={detail}
            accounts={accounts}
            busy={busyId === (detail.userId ?? detail.boardId)}
            onClose={() => setDetail(null)}
            onInvite={() => {
              setDetail(null);
              setInviteOpen({ name: detail.name, email: detail.email });
            }}
            onLink={(userId) => {
              setDetail(null);
              linkToAccount(detail, userId);
            }}
            onMove={() => {
              const target = detail;
              setDetail(null);
              moveMember(target);
            }}
            onFixMail={() => {
              const target = detail;
              setDetail(null);
              fixMail(target);
            }}
          />
        ) : null}

        {newsOpen ? <NewsDialog onClose={() => setNewsOpen(false)} /> : null}

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
