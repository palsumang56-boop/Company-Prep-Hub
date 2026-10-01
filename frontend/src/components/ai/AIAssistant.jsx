import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaRegCompass } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import ChatPanel from './ChatPanel';
import { useAIStatus, useChat } from './useChat';
import './ai.css';

function suggestionsFor(status) {
  const [first, second] = status?.topCompanies || [];
  return [
    { label: first ? `What does ${first} ask in their OA?` : 'Which companies are in the question bank?' },
    { label: second ? `Make me a 7-day prep plan for ${second}` : 'Make me a 7-day OA prep plan' },
    { label: 'Which graph questions should I practise first?' },
    { label: 'Explain sliding window using a question from the bank' },
  ];
}

// Site-wide AI coach, opened from a button in the bottom-right corner.
export default function AIAssistant() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const chat = useChat();
  const { status } = useAIStatus(open);
  const launcherRef = useRef(null);

  // Question pages have their own coach built into the page.
  const hidden = pathname.startsWith('/question/');

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    launcherRef.current?.focus();
  };

  if (hidden) return null;

  const subtitle = !status
    ? 'Your AI interview coach'
    : status.configured
      ? `Answers from ${status.questions} real OA questions`
      : 'Not set up yet';

  return (
    <>
      {!open && (
        <button ref={launcherRef} type="button" className="pp-launcher" onClick={() => setOpen(true)} aria-haspopup="dialog">
          <FaRegCompass aria-hidden="true" />
          <span>Ask PrepPilot</span>
        </button>
      )}

      {open && (
        <section className="pp-panel" role="dialog" aria-label="PrepPilot AI coach">
          <header className="pp-panel-head">
            <div className="pp-mark" aria-hidden="true">
              <FaRegCompass />
            </div>
            <div className="pp-head-text">
              <h2>PrepPilot</h2>
              <p>{subtitle}</p>
            </div>
            {chat.messages.length > 0 && (
              <button type="button" className="pp-btn pp-btn--ghost" onClick={chat.reset} disabled={chat.busy}>
                New chat
              </button>
            )}
            <button type="button" className="pp-icon-btn" onClick={close} aria-label="Close PrepPilot">
              <IoClose />
            </button>
          </header>

          <ChatPanel
            chat={chat}
            autoFocus
            placeholder="Ask about a company, a question, or a topic"
            suggestions={suggestionsFor(status)}
            disabledReason={status && !status.configured ? 'The AI coach is not set up yet: the server needs a Gemini API key.' : undefined}
            intro={
              <p className="pp-intro">
                Ask what a company asks, get a study plan, or have a concept explained with real questions from this site. Answers
                link to the questions they use.
              </p>
            }
          />
        </section>
      )}
    </>
  );
}
