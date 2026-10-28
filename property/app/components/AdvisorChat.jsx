import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaTimes, FaComments } from 'react-icons/fa';
import { api } from '../api';

const Fab = styled.button`
  position: fixed;
  right: 1.25rem;
  bottom: 1.5rem;
  z-index: 1200;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.85rem 1.15rem;
  border: none;
  border-radius: 999px;
  background: var(--color-green-deep);
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 12px 32px rgba(25, 28, 31, 0.22);
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 36px rgba(25, 28, 31, 0.28);
  }

  /* Sit above the mobile tab bar so the two don't overlap. */
  @media (max-width: 960px) {
    bottom: calc(var(--mobile-tabbar-h) + 1rem + env(safe-area-inset-bottom, 0px));
  }

  @media (max-width: 640px) {
    right: 1rem;
    padding: 0.9rem;
    span { display: none; }
  }
`;

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1300;
  background: rgba(16, 18, 24, 0.3);
  backdrop-filter: blur(2px);
  opacity: ${(p) => (p.$open ? 1 : 0)};
  pointer-events: ${(p) => (p.$open ? 'auto' : 'none')};
  transition: opacity 0.25s ease;
`;

const Panel = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1400;
  width: min(400px, 100vw);
  height: 100vh;
  background: #fff;
  border-left: 1px solid var(--color-line);
  /* No shadow while parked off-screen, or it bleeds a grey fade down the
     right edge of every page. */
  box-shadow: ${(p) => (p.$open ? '-20px 0 60px rgba(25, 28, 31, 0.12)' : 'none')};
  visibility: ${(p) => (p.$open ? 'visible' : 'hidden')};
  display: flex;
  flex-direction: column;
  transform: translateX(${(p) => (p.$open ? '0' : '100%')});
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear ${(p) => (p.$open ? '0s' : '0.32s')};
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.15rem 1.2rem;
  border-bottom: 1px solid var(--color-line);
  flex-shrink: 0;
`;

const HeadTitle = styled.div`
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: -0.02em;
`;

const HeadSub = styled.div`
  font-size: 0.75rem;
  color: var(--color-ink-muted);
  margin-top: 0.15rem;
`;

const CloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: var(--color-bg-panel);
  color: var(--color-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover { background: var(--color-green-soft); color: var(--color-green-deep); }
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.1rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  background: linear-gradient(180deg, var(--color-green-wash) 0%, #fff 40%);
`;

const Bubble = styled.div`
  align-self: ${(p) => (p.$user ? 'flex-end' : 'flex-start')};
  max-width: 88%;
  padding: 0.7rem 0.9rem;
  border-radius: ${(p) => (p.$user ? '16px 16px 4px 16px' : '16px 16px 16px 4px')};
  background: ${(p) => (p.$user ? 'var(--color-green-deep)' : '#fff')};
  color: ${(p) => (p.$user ? '#fff' : 'var(--color-ink)')};
  border: ${(p) => (p.$user ? 'none' : '1px solid var(--color-line)')};
  font-size: 0.88rem;
  line-height: 1.55;
  white-space: pre-wrap;
  box-shadow: ${(p) => (p.$user ? 'none' : 'var(--shadow-card)')};
`;

const Suggestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.35rem;
`;

const Suggestion = styled.button`
  border: 1px solid var(--color-line-strong);
  background: #fff;
  border-radius: 999px;
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-ink-muted);
  cursor: pointer;
  text-align: left;
  &:hover { color: var(--color-ink); border-color: var(--color-ink); }
`;

const Form = styled.form`
  display: flex;
  gap: 0.5rem;
  padding: 0.9rem 1.1rem 1.15rem;
  border-top: 1px solid var(--color-line);
  background: #fff;
  flex-shrink: 0;
`;

const Input = styled.input`
  flex: 1;
  border: 1px solid var(--color-line-strong);
  border-radius: 999px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  background: var(--color-bg-panel);
  &:focus {
    outline: none;
    background: #fff;
    border-color: var(--color-ink);
  }
`;

const SendBtn = styled.button`
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: var(--color-green-deep);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const PROMPTS = [
  'Where is my rent this month?',
  'Why was this deducted from my payout?',
  'Which management plan am I on?',
  'What should this property be earning?',
];

/**
 * EasyAdviser — a slide-over chat grounded in the signed-in owner's own
 * properties, tenancies and payouts (see server/routes/ai.js). Mounted
 * app-wide from Layout, so an owner can ask a question from any page.
 */
export default function AdvisorChat({ open, onOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { messages: history } = await api.getChatHistory();
        if (active && history?.length) setMessages(history);
      } catch { /* ignore */ }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 280);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open, messages]);

  const sendText = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: trimmed }]);
    setSending(true);
    try {
      const { reply } = await api.chat(trimmed);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: err.message || 'Could not reach the advisor.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {!open && (
        <Fab type="button" onClick={onOpen} aria-label="Open the AI adviser">
          <FaComments size={15} />
          <span>Ask the AI adviser</span>
        </Fab>
      )}

      <Scrim $open={open} onClick={onClose} />

      <Panel $open={open} role="dialog" aria-label="AI adviser" aria-hidden={!open}>
        <Head>
          <div>
            <HeadTitle>AI adviser</HeadTitle>
            <HeadSub>Your plan · your holdings · your markets</HeadSub>
          </div>
          <CloseBtn type="button" onClick={onClose} aria-label="Close advisor">
            <FaTimes />
          </CloseBtn>
        </Head>

        <Messages>
          {messages.length === 0 ? (
            <>
              <Bubble>
                Ask me about your properties, your rent or your statements. Once a property is under
                management, I answer from your real numbers rather than generic examples.
              </Bubble>
              <Suggestions>
                {PROMPTS.map((p) => (
                  <Suggestion key={p} type="button" onClick={() => sendText(p)}>{p}</Suggestion>
                ))}
              </Suggestions>
            </>
          ) : null}
          {messages.map((m, i) => (
            <Bubble key={i} $user={m.role === 'user'}>{m.content}</Bubble>
          ))}
          <div ref={bottomRef} />
        </Messages>

        <Form
          onSubmit={(e) => {
            e.preventDefault();
            sendText(input);
          }}
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            disabled={sending}
          />
          <SendBtn type="submit" disabled={sending || !input.trim()} aria-label="Send">
            <FaPaperPlane size={13} />
          </SendBtn>
        </Form>
      </Panel>
    </>
  );
}
