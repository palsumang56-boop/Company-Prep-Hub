import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Markdown from './Markdown';

function SourceStrip({ retrieval, streaming }) {
  if (!retrieval) {
    return streaming ? <p className="pp-sources-note pp-searching">Searching the question bank…</p> : null;
  }
  const { sources = [] } = retrieval;
  if (!sources.length) {
    return <p className="pp-sources-note">No matching questions in the bank, so this answer uses general knowledge.</p>;
  }
  return (
    <div className="pp-sources">
      <p className="pp-sources-note">
        {sources.length === 1 ? 'Answering from 1 question' : `Answering from ${sources.length} questions`}
      </p>
      <ol className="pp-source-list">
        {sources.map((s) => (
          <li key={s.id}>
            <Link to={`/question/${s.id}`} className="pp-source" title={s.companies?.join(', ')}>
              <span className="pp-source-n">{s.n}</span>
              <span className="pp-source-title">{s.focus ? 'This question' : s.title}</span>
              {s.difficulty && <span className={`pp-diff pp-diff--${s.difficulty.toLowerCase()}`}>{s.difficulty}</span>}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Message({ message, onRetry }) {
  if (message.role === 'user') {
    return (
      <div className="pp-msg pp-msg--user">
        <p>{message.content}</p>
      </div>
    );
  }
  const streaming = message.status === 'streaming';
  const sources = message.retrieval?.sources || [];
  return (
    <div className="pp-msg pp-msg--bot" aria-busy={streaming}>
      <SourceStrip retrieval={message.retrieval} streaming={streaming} />
      {message.content && <Markdown text={message.content} sources={sources} />}
      {streaming && message.retrieval && <span className="pp-caret" aria-hidden="true" />}
      {message.status === 'stopped' && <p className="pp-sources-note">Stopped.</p>}
      {message.status === 'error' && (
        <div className="pp-error" role="alert">
          <p>{message.error}</p>
          <button type="button" className="pp-btn pp-btn--ghost" onClick={() => onRetry(message.id)}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

export default function ChatPanel({ chat, suggestions = [], actions = [], placeholder, intro, autoFocus = false, disabledReason }) {
  const { messages, busy, waking, sticky, send, stop, retry, endMode } = chat;
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const stickToBottom = useRef(true);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Follow the streaming answer unless the user has scrolled up to read.
  useEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = listRef.current;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  const submit = (text, options) => {
    if (busy || disabledReason) return;
    stickToBottom.current = true;
    send(text, options);
    setDraft('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit(draft);
    }
  };

  return (
    <div className="pp-chat">
      <div className="pp-log" ref={listRef} onScroll={onScroll} aria-live="polite">
        {messages.length === 0 ? (
          <div className="pp-empty">
            {intro}
            {suggestions.length > 0 && (
              <div className="pp-suggestions">
                {suggestions.map((s) => (
                  <button
                    type="button"
                    key={s.label}
                    className="pp-suggestion"
                    disabled={Boolean(disabledReason)}
                    onClick={() => submit(s.text || s.label, { mode: s.mode })}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((m) => <Message key={m.id} message={m} onRetry={retry} />)
        )}
        {waking && <p className="pp-sources-note pp-waking">Starting the server. On the free plan this can take up to a minute.</p>}
      </div>

      {disabledReason && <p className="pp-disabled">{disabledReason}</p>}

      {sticky === 'interview' && (
        <div className="pp-mode-bar">
          <span>Mock interview in progress. Reply to the interviewer below.</span>
          <button type="button" className="pp-btn pp-btn--ghost" onClick={endMode}>
            End interview
          </button>
        </div>
      )}

      {actions.length > 0 && (
        <div className="pp-actions" role="group" aria-label="Quick actions">
          {actions.map((a) => (
            <button
              type="button"
              key={a.label}
              className="pp-action"
              disabled={busy || Boolean(disabledReason)}
              onClick={() => submit(a.text || a.label, { mode: a.mode })}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      <form
        className="pp-composer"
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={draft}
          maxLength={2000}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Message"
          disabled={Boolean(disabledReason)}
        />
        {busy ? (
          <button type="button" className="pp-btn pp-btn--stop" onClick={stop}>
            Stop
          </button>
        ) : (
          <button type="submit" className="pp-btn pp-btn--send" disabled={!draft.trim() || Boolean(disabledReason)}>
            Send
          </button>
        )}
      </form>
    </div>
  );
}
