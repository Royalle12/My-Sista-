/**
 * src/pages/SistaCoach.jsx
 * Screen 2 — Sista Coach AI (Coach Amara) — Inclusive Terminology
 * Tables: coach_sessions, coach_config
 * Streaming via claude-proxy Edge Function
 */

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../lib/supabase.js';
import { Send, Bot, User, Sparkles, RefreshCw, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

// Second Spring perimenopause context preamble
const SECOND_SPRING_PREAMBLE = `The user has entered from the Second Spring Hub. They are navigating perimenopause or menopause. 
Approach this conversation with deep compassion and celebration of this transition. 
Use inclusive terminology: "Second Spring", "hormonal transition", "cycle evolution" — avoid clinical or pathologising language.
Focus on: hot flashes management, sleep support, emotional wellbeing, libido, bone health, and identity through transition.`;

export default function SistaCoach() {
  const { user, profile, isGuest } = useAuth();
  const [searchParams] = useSearchParams();
  const isSecondSpring = searchParams.get('context') === 'second_spring';

  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [coachConfig, setCoachConfig] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load coach config and existing session
  useEffect(() => {
    loadCoachConfig();
    loadOrCreateSession();
  }, [user?.id]);

  const loadCoachConfig = async () => {
    if (isGuest) return;
    try {
      const { data } = await supabase
        .from('coach_config')
        .select('config_key, config_value');
      if (data) {
        const config = {};
        data.forEach(row => { config[row.config_key] = row.config_value; });
        setCoachConfig(config);
      }
    } catch (err) {
      console.warn('[Coach] config load failed:', err);
    }
  };

  const loadOrCreateSession = async () => {
    if (!user?.id) return;
    setLoadingSession(true);
    try {
      const contextTag = isSecondSpring ? 'second_spring' : 'general';

      if (isGuest) {
        // Guest gets a fresh in-memory session with welcome message
        const welcome = buildWelcomeMessage(contextTag, profile?.display_name);
        setMessages([welcome]);
        setLoadingSession(false);
        return;
      }

      // Try to load most recent session with same context
      const { data: existing } = await supabase
        .from('coach_sessions')
        .select('id, messages, context_tag')
        .eq('user_id', user.id)
        .eq('context_tag', contextTag)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (existing && existing.messages?.length > 0) {
        setSessionId(existing.id);
        setMessages(existing.messages);
      } else {
        // Create new session
        const welcome = buildWelcomeMessage(contextTag, profile?.display_name);
        const { data: newSession, error } = await supabase
          .from('coach_sessions')
          .insert([{
            user_id: user.id,
            context_tag: contextTag,
            messages: [welcome]
          }])
          .select('id')
          .single();
        if (error) throw error;
        setSessionId(newSession.id);
        setMessages([welcome]);
      }
    } catch (err) {
      console.error('[Coach] session init failed:', err);
      const welcome = buildWelcomeMessage(isSecondSpring ? 'second_spring' : 'general', profile?.display_name);
      setMessages([welcome]);
    } finally {
      setLoadingSession(false);
    }
  };

  const buildWelcomeMessage = (contextTag, displayName) => ({
    role: 'assistant',
    content: contextTag === 'second_spring'
      ? `Welcome to your Second Spring sanctuary, ${displayName ?? 'Sista'} 🌸\n\nI'm Coach Amara — your inclusive wellness companion for this powerful transition. Whether you're navigating hot flashes, sleep changes, emotional shifts, or rediscovering your identity — I'm here with you, every step.\n\nWhat's on your mind today?`
      : `Hello ${displayName ?? 'Sista'} 🌸\n\nI'm Coach Amara — your personal wellness companion. I'm here to support your journey with warmth, evidence-based guidance, and a listening heart.\n\nHow can I support you today?`,
    timestamp: new Date().toISOString()
  });

  const buildSystemPrompt = () => {
    const basePrompt = coachConfig?.system_prompt || 
      'You are Coach Amara — a warm, knowledgeable, and inclusive wellness coach for My Sista. Speak with warmth, empathy, and cultural sensitivity. Never diagnose. Always encourage professional consultation for medical concerns. Keep responses under 200 words unless the user asks for detail.';
    const tone = coachConfig?.tone || 'warm, inclusive, empowering';
    const restricted = coachConfig?.restricted_topics || 'illegal activities, specific medication dosages, self-harm';

    let systemPrompt = `${basePrompt}\n\nTone: ${tone}\nDo not discuss: ${restricted}`;

    if (isSecondSpring) {
      systemPrompt = `${systemPrompt}\n\n${SECOND_SPRING_PREAMBLE}`;
    }

    if (profile) {
      systemPrompt += `\n\nUser context: ${profile.display_name ?? 'Sista'}, age range ${profile.age_range ?? 'unknown'}, wellness goals: ${profile.wellness_goals?.join(', ') ?? 'general wellness'}.`;
    }

    return systemPrompt;
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);

    // Placeholder streaming assistant message
    const streamingMsg = { role: 'assistant', content: '', timestamp: new Date().toISOString(), streaming: true };
    setMessages([...updatedMessages, streamingMsg]);

    try {
      const edgeFunctionUrl = import.meta.env.VITE_SUPABASE_URL
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-proxy`
        : null;

      if (!edgeFunctionUrl) throw new Error('No Edge Function URL configured.');

      const { data: { session: authSession } } = await supabase.auth.getSession();

      // Build conversation history (exclude system, last 10 messages)
      const history = updatedMessages
        .filter(m => !m.streaming)
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession?.access_token}`,
        },
        body: JSON.stringify({
          messages: history,
          system: buildSystemPrompt(),
          model: 'claude-sonnet-4-20250514',
          stream: true
        }),
      });

      if (!res.ok) throw new Error(`Coach API error: ${res.statusText}`);

      // Handle streaming response
      let fullContent = '';
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
          for (const line of lines) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.type === 'content_block_delta' && data.delta?.text) {
                fullContent += data.delta.text;
                setMessages(prev => prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: fullContent } : m
                ));
              }
            } catch { /* ignore parse errors on stream chunks */ }
          }
        }
      } else {
        // Fallback: non-streaming
        const json = await res.json();
        fullContent = json.content || '';
      }

      const assistantMessage = {
        role: 'assistant',
        content: fullContent,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Persist to Supabase
      if (!isGuest && sessionId) {
        await supabase
          .from('coach_sessions')
          .update({ messages: finalMessages, updated_at: new Date().toISOString() })
          .eq('id', sessionId);
      }

    } catch (err) {
      console.error('[Coach] send failed:', err);
      // Fallback graceful response
      const fallback = {
        role: 'assistant',
        content: "I'm having a little trouble connecting right now 🌸 Please check your connection and try again. I'm here whenever you're ready.",
        timestamp: new Date().toISOString()
      };
      setMessages([...updatedMessages, fallback]);
      toast.error('Coach Amara is temporarily unavailable.');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewSession = async () => {
    setMessages([]);
    setSessionId(null);
    await loadOrCreateSession();
  };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-var(--nav-height)-var(--bottom-nav-height)-2rem)] animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-primary/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-soft">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-dark text-base">Coach Amara</h1>
              <p className="text-3xs text-mid font-semibold">
                {isSecondSpring ? '🌸 Second Spring Mode — Perimenopause Support' : 'Your inclusive wellness companion'}
              </p>
            </div>
          </div>
          <button
            onClick={startNewSession}
            className="btn-ghost p-2 rounded-xl text-mid hover:text-primary"
            title="Start new session"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {loadingSession ? (
            <div className="flex items-center justify-center py-12 text-mid text-xs">
              <Loader size={16} className="animate-spin mr-2" /> Loading your session...
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'assistant' ? 'bg-gradient-brand' : 'bg-soft border border-primary/20'
                }`}>
                  {msg.role === 'assistant'
                    ? <Sparkles size={12} className="text-white" />
                    : <User size={12} className="text-primary" />
                  }
                </div>

                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'bg-white border border-primary/8 text-dark shadow-soft rounded-tl-none'
                    : 'bg-primary text-white rounded-tr-none'
                }`}>
                  {msg.streaming && !msg.content
                    ? <span className="flex gap-1 items-center py-1">
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    : <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                  }
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="pt-4 border-t border-primary/10 shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Coach Amara anything... (Enter to send, Shift+Enter for new line)"
              disabled={isStreaming}
              className="input flex-1 text-sm py-2.5 resize-none min-h-[56px] max-h-[120px]"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="btn-primary p-3 rounded-xl shrink-0 self-end disabled:opacity-50"
            >
              {isStreaming
                ? <Loader size={16} className="animate-spin" />
                : <Send size={16} />
              }
            </button>
          </div>
          <p className="text-3xs text-mid mt-2 text-center">
            Coach Amara provides wellness guidance only. Always consult a healthcare professional for medical advice.
          </p>
        </div>

      </div>
    </PageWrapper>
  );
}
