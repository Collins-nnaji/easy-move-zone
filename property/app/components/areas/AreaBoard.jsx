import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  FaCheckCircle, FaRegThumbsUp, FaThumbsUp, FaRegComment, FaRegFlag, FaTrashAlt, FaMapPin, FaClock, FaWhatsapp,
} from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { api } from '../../api';
import {
  Panel, Pill, PrimaryBtn, ErrorText, SignInLink, timeAgo, whatsappShare,
} from './shared';

/**
 * The residents' board on an area page: write a post, filter and sort the
 * posts, mark one helpful, reply, report, or delete your own. What may be
 * posted is enforced by the server (services/moderation.js); this only
 * explains it and shows the result.
 */

const REPORT_REASONS = [
  { id: 'names_person', label: 'Names or identifies a person' },
  { id: 'false', label: 'Untrue or misleading' },
  { id: 'abusive', label: 'Abusive or hateful' },
  { id: 'contact', label: 'Contact details or advert' },
  { id: 'spam', label: 'Spam' },
  { id: 'other', label: 'Something else' },
];

const Composer = styled.form`
  textarea, input[type='text'] {
    width: 100%; box-sizing: border-box; border: 1px solid var(--color-line-strong); border-radius: 11px;
    padding: 0.7rem 0.85rem; font: inherit; color: var(--color-ink); background: #fff; outline: none;
  }
  textarea { min-height: 110px; resize: vertical; line-height: 1.5; }
  textarea:focus, input:focus { border-color: var(--color-green); box-shadow: 0 0 0 3px rgba(47, 93, 80, 0.1); }
  .cats { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.7rem; }
  .row { display: flex; gap: 0.6rem; margin-top: 0.6rem; align-items: center; justify-content: space-between; flex-wrap: wrap; }
  .check { display: flex; align-items: center; gap: 0.45rem; font-size: 0.84rem; color: var(--color-ink-muted); cursor: pointer; }
  .count { font-size: 0.75rem; color: var(--color-ink-faint); }
  .place { margin-top: 0.6rem; }
  .ok { display: flex; align-items: center; gap: 0.4rem; color: var(--color-green-deep); font-weight: 600; font-size: 0.86rem; margin-top: 0.6rem; }
`;
const Filters = styled.div`
  display: flex; gap: 0.35rem; overflow-x: auto; padding-bottom: 0.25rem; margin: 0.25rem 0 0.75rem;
`;
const SortRow = styled.div`
  display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;
  h2 { margin: 0; font-size: 1.05rem; }
  select { min-height: 36px; border: 1px solid var(--color-line-strong); border-radius: 9px; padding: 0 0.6rem; font: inherit; font-size: 0.84rem; background: #fff; }
`;
const List = styled.div`display: flex; flex-direction: column; gap: 0.75rem;`;
const Card = styled.article`
  background: #fff; border: 1px solid var(--color-line); border-radius: 16px; padding: 1rem 1.1rem; scroll-margin-top: 90px;
  ${(p) => p.$focus && 'box-shadow: 0 0 0 3px rgba(47, 93, 80, 0.35);'}
  ${(p) => p.$held && 'border-style: dashed; background: #fffdf7;'}
  .meta { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; font-size: 0.78rem; color: var(--color-ink-faint); }
  .cat { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-green-deep); background: var(--color-green-soft); padding: 0.2rem 0.5rem; border-radius: 6px; }
  .place { display: inline-flex; align-items: center; gap: 0.25rem; color: var(--color-ink-muted); font-weight: 600; }
  .body { margin: 0.55rem 0 0; white-space: pre-wrap; line-height: 1.55; font-size: 0.93rem; color: var(--color-ink); overflow-wrap: anywhere; }
  .by { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.6rem; font-size: 0.8rem; color: var(--color-ink-muted); flex-wrap: wrap; }
  .held { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.6rem; font-size: 0.8rem; color: #92400e; font-weight: 600; }
`;
const Verified = styled.span`
  display: inline-flex; align-items: center; gap: 0.25rem; color: var(--color-green-deep); font-weight: 700; font-size: 0.75rem;
`;
const Actions = styled.div`
  display: flex; gap: 0.25rem; margin-top: 0.6rem; flex-wrap: wrap;
  button { display: inline-flex; align-items: center; gap: 0.35rem; border: 0; background: transparent; padding: 0.4rem 0.55rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; color: var(--color-ink-muted); cursor: pointer; }
  button:hover { background: var(--color-bg-sunken); color: var(--color-ink); }
  button[aria-pressed='true'] { color: var(--color-green-deep); }
  a { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.55rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; color: var(--color-ink-muted); }
  a:hover { background: var(--color-bg-sunken); color: var(--color-ink); }
`;
const Replies = styled.div`
  margin-top: 0.6rem; padding-left: 0.9rem; border-left: 2px solid var(--color-line); display: flex; flex-direction: column; gap: 0.55rem;
  .reply p { margin: 0; font-size: 0.88rem; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; }
  .reply .by { margin-top: 0.2rem; }
  form { display: flex; gap: 0.4rem; }
  form input { flex: 1; min-width: 0; min-height: 40px; border: 1px solid var(--color-line-strong); border-radius: 10px; padding: 0 0.7rem; font: inherit; font-size: 0.88rem; }
  form button { min-height: 40px; border: 0; border-radius: 10px; padding: 0 0.9rem; background: var(--color-green-deep); color: #fff; font-weight: 700; font-size: 0.82rem; cursor: pointer; }
  form button:disabled { opacity: 0.55; }
`;
const ReportBox = styled.form`
  margin-top: 0.6rem; padding: 0.75rem; border-radius: 12px; background: var(--color-bg-sunken);
  display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem;
  select, input { min-height: 40px; border: 1px solid var(--color-line-strong); border-radius: 9px; padding: 0 0.6rem; font: inherit; font-size: 0.85rem; background: #fff; }
  .btns { display: flex; gap: 0.4rem; }
  .btns button { min-height: 38px; border-radius: 9px; padding: 0 0.85rem; font-weight: 700; font-size: 0.82rem; cursor: pointer; border: 1px solid var(--color-line-strong); background: #fff; }
  .btns button[type='submit'] { background: var(--color-ink); color: #fff; border-color: var(--color-ink); }
`;
const Empty = styled.div`
  padding: 2rem 1rem; text-align: center; color: var(--color-ink-muted); background: #fff; border: 1px dashed var(--color-line-strong); border-radius: 16px;
  h3 { margin: 0 0 0.3rem; color: var(--color-ink); font-size: 1rem; }
  p { margin: 0; font-size: 0.88rem; }
  .invite { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--color-green-deep); font-weight: 700; }
  .invite svg { color: #25d366; }
`;
const More = styled.button`
  align-self: center; margin-top: 0.25rem; border: 1px solid var(--color-line-strong); background: #fff; border-radius: 999px;
  padding: 0.55rem 1.2rem; font-weight: 700; font-size: 0.85rem; cursor: pointer;
`;

function Author({ item }) {
  return (
    <div className="by">
      <span>{item.author_name || 'A neighbour'}</span>
      {item.verified_resident && <Verified title="Rents a home we manage in this area"><FaCheckCircle /> Verified resident</Verified>}
      <span>· {timeAgo(item.created_at)}</span>
    </div>
  );
}

function ReportForm({ onCancel, onSend }) {
  const [reason, setReason] = useState(REPORT_REASONS[0].id);
  const [detail, setDetail] = useState('');
  return (
    <ReportBox onSubmit={(e) => { e.preventDefault(); onSend(reason, detail); }}>
      <strong>What is wrong with it?</strong>
      <select value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Reason">
        {REPORT_REASONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
      </select>
      <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Anything we should know (optional)" maxLength={500} aria-label="Details" />
      <div className="btns">
        <button type="submit">Send report</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </ReportBox>
  );
}

function Post({ post, area, focused, categoryLabel, signedIn, onChange, onRemoved }) {
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [reporting, setReporting] = useState(null); // { type, id }
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const held = post.status === 'held';

  const act = async (fn) => {
    setError('');
    try { await fn(); } catch (e) { setError(e.message || 'Something went wrong. Please try again.'); }
  };

  const toggleHelpful = () => act(async () => {
    const r = await api.areas.helpful(post.id);
    onChange({ ...post, helpful: r.helpful, helpful_count: r.helpful_count });
  });

  const sendReply = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    act(async () => {
      const r = await api.areas.reply(post.id, { body: reply });
      onChange({ ...post, replies: [...post.replies, r] });
      setReply('');
    }).finally(() => setSending(false));
  };

  const sendReport = (reason, detail) => act(async () => {
    await api.areas.report(reporting.type, reporting.id, reason, detail);
    setReporting(null);
    setNotice('Thanks. Our team will review it.');
  });

  const remove = (type, id) => act(async () => {
    if (!window.confirm(`Delete your ${type}? This cannot be undone.`)) return;
    await api.areas.remove(type, id);
    if (type === 'post') onRemoved(post.id);
    else onChange({ ...post, replies: post.replies.filter((r) => r.id !== id) });
  });

  return (
    <Card $held={held} $focus={focused} id={`post-${post.id}`}>
      <div className="meta">
        <span className="cat">{categoryLabel}</span>
        {post.place && <span className="place"><FaMapPin size={10} /> {post.place}</span>}
      </div>
      <p className="body">{post.body}</p>
      <Author item={post} />
      {held && <div className="held"><FaClock /> Waiting for review. Only you can see this until our team approves it.</div>}

      {!held && (
        <Actions>
          {signedIn && !post.mine && (
            <button type="button" aria-pressed={post.helpful} onClick={toggleHelpful}>
              {post.helpful ? <FaThumbsUp /> : <FaRegThumbsUp />} Helpful{post.helpful_count ? ` · ${post.helpful_count}` : ''}
            </button>
          )}
          {(!signedIn || post.mine) && post.helpful_count > 0 && (
            <button type="button" disabled><FaRegThumbsUp /> {post.helpful_count} found this helpful</button>
          )}
          {signedIn && <button type="button" onClick={() => setReplying((v) => !v)}><FaRegComment /> Reply</button>}
          {signedIn && !post.mine && <button type="button" onClick={() => setReporting({ type: 'post', id: post.id })}><FaRegFlag /> Report</button>}
          {post.mine && <button type="button" onClick={() => remove('post', post.id)}><FaTrashAlt /> Delete</button>}
          <a href={whatsappShare(`From the ${area.name} neighbourhood board on EasyMoveZone:`, `/areas/${area.slug}#post-${post.id}`)} target="_blank" rel="noopener noreferrer">
            <FaWhatsapp /> Share
          </a>
        </Actions>
      )}
      {held && post.mine && (
        <Actions><button type="button" onClick={() => remove('post', post.id)}><FaTrashAlt /> Delete</button></Actions>
      )}

      {reporting && <ReportForm onCancel={() => setReporting(null)} onSend={sendReport} />}

      {(post.replies.length > 0 || replying) && (
        <Replies>
          {post.replies.map((r) => (
            <div key={r.id} className="reply">
              <p>{r.body}</p>
              <Author item={r} />
              {r.status === 'held' && <div className="held"><FaClock /> Waiting for review</div>}
              <Actions>
                {signedIn && !r.mine && r.status !== 'held' && <button type="button" onClick={() => setReporting({ type: 'reply', id: r.id })}><FaRegFlag /> Report</button>}
                {r.mine && <button type="button" onClick={() => remove('reply', r.id)}><FaTrashAlt /> Delete</button>}
              </Actions>
            </div>
          ))}
          {replying && (
            <form onSubmit={sendReply}>
              <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply" maxLength={1000} aria-label="Reply" autoFocus />
              <button type="submit" disabled={sending || !reply.trim()}>{sending ? '…' : 'Reply'}</button>
            </form>
          )}
        </Replies>
      )}
      {notice && <div className="by" style={{ color: 'var(--color-green-deep)', fontWeight: 600 }}><FaCheckCircle /> {notice}</div>}
      {error && <ErrorText>{error}</ErrorText>}
    </Card>
  );
}

export default function AreaBoard({ area, categories, signedIn }) {
  const { hash } = useLocation();
  const focusId = /^#post-\d+$/.test(hash) ? Number(hash.slice(6)) : null;
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('recent');
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [draft, setDraft] = useState({ category: categories[0]?.id || '', place: '', body: '', showName: true });
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [posted, setPosted] = useState('');

  const labelOf = (id) => categories.find((c) => c.id === id)?.label || id;

  const load = useCallback(async (offset = 0) => {
    setLoading(true);
    try {
      const r = await api.areas.posts(area.slug, { category, sort, offset });
      setPosts((prev) => (offset ? [...prev, ...r.posts] : r.posts));
      setTotal(r.total);
      setError('');
    } catch (e) {
      setError(e.message || 'Could not load the board.');
    } finally {
      setLoading(false);
    }
  }, [area.slug, category, sort]);

  useEffect(() => { load(0); }, [load, signedIn]);

  // A link to one post (from a notice or a WhatsApp share) scrolls to it once the board is in.
  useEffect(() => {
    if (!focusId || loading) return;
    document.getElementById(`post-${focusId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focusId, loading]);

  const submit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setPostError('');
    setPosted('');
    try {
      const post = await api.areas.createPost(area.slug, draft);
      setPosts((prev) => [post, ...prev]);
      setTotal((t) => t + 1);
      setDraft((d) => ({ ...d, place: '', body: '' }));
      setPosted(post.status === 'held'
        ? 'Posted. Because it may mention a person, our team will read it before it goes public.'
        : 'Posted. Thanks for helping your neighbours.');
    } catch (err) {
      setPostError(err.message || 'Could not post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const update = (next) => setPosts((prev) => prev.map((p) => (p.id === next.id ? next : p)));
  const removed = (id) => { setPosts((prev) => prev.filter((p) => p.id !== id)); setTotal((t) => Math.max(t - 1, 0)); };

  return (
    <>
      <Panel>
        <h2>Share something about {area.name}</h2>
        <p className="sub">Light, water, flooding, a building, the traffic, or a question for people who live here.</p>
        {signedIn ? (
          <Composer onSubmit={submit}>
            <div className="cats" role="group" aria-label="What is it about">
              {categories.map((c) => (
                <Pill key={c.id} type="button" $active={draft.category === c.id} onClick={() => setDraft((d) => ({ ...d, category: c.id }))}>{c.label}</Pill>
              ))}
            </div>
            <textarea
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              placeholder={draft.category === 'question'
                ? `Ask people who live in ${area.name}, e.g. "How many hours of light do you get?"`
                : 'What is it like? e.g. how many hours of light, whether the road floods, borehole or public water. Stick to what you have seen yourself.'}
              maxLength={1500}
              aria-label="Your post"
              required
            />
            <input
              className="place"
              type="text"
              value={draft.place}
              onChange={(e) => setDraft((d) => ({ ...d, place: e.target.value }))}
              placeholder="Street, estate or building (optional)"
              maxLength={160}
              aria-label="Street, estate or building"
            />
            <div className="row">
              <label className="check">
                <input type="checkbox" checked={draft.showName} onChange={(e) => setDraft((d) => ({ ...d, showName: e.target.checked }))} />
                Show my first name
              </label>
              <span className="count">{draft.body.length}/1500</span>
            </div>
            <div className="row">
              <PrimaryBtn type="submit" disabled={posting || draft.body.trim().length < 10}>{posting ? 'Posting…' : 'Post'}</PrimaryBtn>
            </div>
            {posted && <div className="ok"><FaCheckCircle /> {posted}</div>}
            {postError && <ErrorText>{postError}</ErrorText>}
          </Composer>
        ) : (
          <p className="sub" style={{ margin: 0 }}><SignInLink>Sign in to post or reply</SignInLink>. Reading is open to everyone.</p>
        )}
      </Panel>

      <div>
        <SortRow>
          <h2>From the neighbourhood{total ? ` · ${total}` : ''}</h2>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort posts">
            <option value="recent">Newest first</option>
            <option value="helpful">Most helpful</option>
          </select>
        </SortRow>
        <Filters role="group" aria-label="Filter by topic">
          <Pill type="button" $active={!category} onClick={() => setCategory('')}>All</Pill>
          {categories.map((c) => <Pill key={c.id} type="button" $active={category === c.id} onClick={() => setCategory(c.id)}>{c.label}</Pill>)}
        </Filters>

        {error && <ErrorText>{error}</ErrorText>}
        <List>
          {posts.map((p) => (
            <Post key={p.id} post={p} area={area} focused={p.id === focusId} categoryLabel={labelOf(p.category)} signedIn={signedIn} onChange={update} onRemoved={removed} />
          ))}
          {!loading && posts.length === 0 && !error && (
            <Empty>
              <h3>{category ? 'Nothing on this topic yet' : `No posts about ${area.name} yet`}</h3>
              <p>{signedIn ? 'Start the conversation above, or ask a neighbour to.' : 'Sign in and be the first to share what it is like here.'}</p>
              <p style={{ marginTop: '0.6rem' }}>
                <a className="invite" href={whatsappShare(`Do you live in ${area.name}? Help people who want to rent there: rate the light, water and flooding on EasyMoveZone.`, `/areas/${area.slug}`)} target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp /> Invite neighbours on WhatsApp
                </a>
              </p>
            </Empty>
          )}
          {posts.length < total && (
            <More type="button" disabled={loading} onClick={() => load(posts.length)}>{loading ? 'Loading…' : 'Show more'}</More>
          )}
        </List>
      </div>
    </>
  );
}
