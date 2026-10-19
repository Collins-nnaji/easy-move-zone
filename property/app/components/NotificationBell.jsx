import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { api } from '../api';
import { LOCALE } from '../config/markets';

/**
 * The bell in the portal header: the signed-in person's notices for this
 * portal (owner or tenant). The same notices go out by email and SMS when a
 * provider is configured, but this inbox never depends on one.
 */

const POLL_MS = 60 * 1000;

const Wrap = styled.div`
  position: relative;
  flex: 0 0 auto;
`;

const BellBtn = styled.button`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--color-line-strong);
  background: #fff;
  color: var(--color-ink);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover { border-color: var(--color-ink-faint); }

  .n {
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--color-warn);
    color: #fff;
    font-size: 0.66rem;
    font-weight: 700;
    line-height: 18px;
    text-align: center;
  }
`;

const Panel = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  z-index: 200;
  width: min(360px, calc(100vw - 2rem));
  max-height: min(70vh, 480px);
  overflow-y: auto;
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: 14px;
  box-shadow: var(--shadow-lift);

  .head { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; border-bottom: 1px solid var(--color-line); font-weight: 650; font-size: 0.92rem; }
  .head button { border: 0; background: none; color: var(--color-green-deep); font-weight: 600; font-size: 0.8rem; cursor: pointer; }
  .empty { padding: 1.5rem 1rem; text-align: center; color: var(--color-ink-muted); font-size: 0.88rem; }

  @media (max-width: 720px) { position: fixed; left: 1rem; right: 1rem; top: 4.25rem; width: auto; }
`;

const Item = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  border-bottom: 1px solid var(--color-line);
  background: ${(p) => (p.$unread ? 'var(--color-green-wash)' : '#fff')};
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-family: var(--font-sans);
  &:last-child { border-bottom: 0; }
  &:hover { background: var(--color-bg-sunken); }
  .t { font-size: 0.88rem; font-weight: ${(p) => (p.$unread ? 650 : 500)}; color: var(--color-ink); }
  .b { font-size: 0.8rem; color: var(--color-ink-muted); margin-top: 0.15rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .d { font-size: 0.72rem; color: var(--color-ink-faint); margin-top: 0.25rem; }
`;

function ago(value) {
  const mins = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(value).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });
}

export default function NotificationBell({ audience }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ notifications: [], unread: 0 });
  const ref = useRef(null);

  const load = useCallback(() => {
    api.notifications.list(audience).then(setData).catch(() => {});
  }, [audience]);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const markAll = async () => {
    await api.notifications.markRead(audience).catch(() => {});
    load();
  };

  const go = async (n) => {
    setOpen(false);
    if (!n.read_at) {
      await api.notifications.markRead(audience, [n.id]).catch(() => {});
      load();
    }
    if (n.link) navigate(n.link);
  };

  const list = data.notifications || [];
  return (
    <Wrap ref={ref}>
      <BellBtn
        type="button"
        aria-label={data.unread ? `Notifications, ${data.unread} unread` : 'Notifications'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <FaBell />
        {data.unread > 0 && <span className="n">{data.unread > 9 ? '9+' : data.unread}</span>}
      </BellBtn>
      {open && (
        <Panel role="dialog" aria-label="Notifications">
          <div className="head">
            Notifications
            {data.unread > 0 && <button type="button" onClick={markAll}>Mark all read</button>}
          </div>
          {list.length ? list.map((n) => (
            <Item key={n.id} type="button" $unread={!n.read_at} onClick={() => go(n)}>
              <div className="t">{n.title}</div>
              {n.body && <div className="b">{n.body}</div>}
              <div className="d">{ago(n.created_at)}</div>
            </Item>
          )) : <div className="empty">Nothing yet. Rent, repairs and messages show up here.</div>}
        </Panel>
      )}
    </Wrap>
  );
}
