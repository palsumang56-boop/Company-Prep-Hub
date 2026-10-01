import { FaRegCompass } from 'react-icons/fa';
import ChatPanel from './ChatPanel';
import { useAIStatus, useChat } from './useChat';
import './ai.css';

const ACTIONS = [
  { label: 'Give me a hint', mode: 'hint' },
  { label: 'Walk me through the solution', mode: 'approach' },
  { label: 'What follow-ups might they ask?', mode: 'followups' },
  { label: 'Mock interview me', text: "I'm ready. Interview me on this question.", mode: 'interview' },
];

// AI coach scoped to the question on the page. Every answer is grounded in this question first.
export default function PrepCoach({ question }) {
  const chat = useChat({ questionId: question._id });
  const { status } = useAIStatus();
  const notReady = status && !status.configured;
  const companies = question.companies?.length ? question.companies.join(', ') : null;

  return (
    <section className="pp-coach" aria-labelledby="pp-coach-title">
      <header className="pp-coach-head">
        <div className="pp-mark" aria-hidden="true">
          <FaRegCompass />
        </div>
        <div>
          <h2 id="pp-coach-title">Practise with PrepPilot</h2>
          <p>
            Hints, the full solution, or a mock interview on this question
            {companies ? `, the way ${companies} would ask it.` : '.'}
          </p>
        </div>
        {chat.messages.length > 0 && (
          <button type="button" className="pp-btn pp-btn--ghost pp-coach-reset" onClick={chat.reset} disabled={chat.busy}>
            Start over
          </button>
        )}
      </header>

      <ChatPanel
        chat={chat}
        actions={ACTIONS}
        placeholder="Ask anything about this question"
        disabledReason={notReady ? 'The AI coach is not set up yet: the server needs a Gemini API key.' : undefined}
        intro={
          <p className="pp-intro">
            Try a hint first if you're stuck. Each hint goes one step further without giving the answer away.
          </p>
        }
      />
    </section>
  );
}
