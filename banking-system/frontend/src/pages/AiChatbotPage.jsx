// ============================================================
// src/pages/AiChatbotPage.jsx  — AI Banking Assistant
// ============================================================
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/Contexts';
import { FaRobot, FaPaperPlane, FaSpinner, FaTrash } from 'react-icons/fa';

const SYSTEM_PROMPT = `You are an intelligent banking assistant for a Banking Management System.
You help customers with:
- Account inquiries, balance information, and account types (Savings, Current, Fixed Deposit)
- Transaction guidance: deposits, withdrawals, fund transfers, UPI payments
- Loan information: Personal, Home, Education loans, EMI calculations
- Card management: Debit/Credit cards, blocking, PIN management
- KYC requirements and verification process
- General banking help and financial advice

Be concise, professional, and helpful. For security, never ask for passwords, OTPs, or full card numbers.
Always remind users to use secure channels for sensitive operations.
Keep responses brief and actionable. Use bullet points for lists.`;

const SUGGESTIONS = [
  'How do I transfer money?',
  'What is my account balance?',
  'How do I apply for a loan?',
  'How to block my card?',
  'What is UPI and how to use it?',
  'How to complete KYC?',
];

export default function AiChatbotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello ${user?.firstName || 'there'}! 👋 I'm your AI Banking Assistant. How can I help you today?` }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text) {
    const userText = (text || input).trim();
    if (!userText) return;
    setInput('');
    setError(null);

    const updatedMessages = [...messages, { role: 'user', content: userText }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: updatedMessages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'API error');
      }

      const data = await response.json();
      const reply = data.content?.[0]?.text || 'Sorry, I could not generate a response.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError('Could not reach AI service. Please try again.');
      setMessages(prev => prev.slice(0, -1)); // remove user msg on error
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([{ role: 'assistant', content: `Hello ${user?.firstName || 'there'}! 👋 I'm your AI Banking Assistant. How can I help you today?` }]);
  }

  function renderMessage(content) {
    // Simple markdown-ish rendering: bold **text**, bullet points, line breaks
    return content
      .split('\n')
      .map((line, i) => {
        const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        const bulletLine = boldLine.startsWith('- ') || boldLine.startsWith('• ')
          ? `<span class="flex gap-2"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"></span><span>${boldLine.substring(2)}</span></span>`
          : boldLine;
        return <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: bulletLine }} />;
      });
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-9rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-sm p-4 flex items-center justify-between border-b dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow">
            <FaRobot className="text-white text-lg" />
          </div>
          <div>
            <h2 className="font-semibold dark:text-white">AI Banking Assistant</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Clear chat">
          <FaTrash />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                <FaRobot className="text-white text-xs" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm text-sm space-y-1
              ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'}`}>
              {renderMessage(msg.content)}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center ml-2 mt-1 flex-shrink-0 text-xs font-bold text-blue-600 dark:text-blue-400">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
              <FaRobot className="text-white text-xs" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full">{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="bg-gray-50 dark:bg-gray-900 px-4 pb-2">
          <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)} disabled={loading}
                className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-sm p-4 border-t dark:border-gray-700">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={loading}
            placeholder="Ask me anything about your banking..."
            className="flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 disabled:opacity-50" />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
            {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">Powered by Claude AI · Do not share passwords or OTPs</p>
      </div>
    </div>
  );
}
