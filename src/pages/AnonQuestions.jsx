import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { MessageSquare, ThumbsUp, Plus, Eye, Clock, EyeOff, ChevronRight, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Hormones', 'Relationships', 'Work & Stress', 'Body Changes', 'Mental Health', 'Nutrition'];

const STATIC_QUESTIONS = [
  {
    id: '1',
    body: 'Has anyone else experienced brain fog during perimenopause? Some days I literally cannot form a sentence properly. My GP just said it was stress — but I know it is not just stress.',
    category: 'Hormones',
    upvotes: 47,
    answers: 23,
    views: 312,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_answered: true,
  },
  {
    id: '2',
    body: "I'm 44 and started experiencing heart palpitations. Doctors checked my heart — all fine. My sister said it could be hormones? Has this happened to anyone here? It's terrifying.",
    category: 'Body Changes',
    upvotes: 89,
    answers: 41,
    views: 620,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    is_answered: true,
  },
  {
    id: '3',
    body: "How do you explain to a partner who doesn't understand what you're going through? He thinks I'm 'being dramatic' about how tired I am all the time.",
    category: 'Relationships',
    upvotes: 134,
    answers: 67,
    views: 891,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_answered: false,
  },
  {
    id: '4',
    body: 'Can anyone recommend a good supplement stack for energy? I\'ve tried magnesium and it helped with sleep but I still feel drained by noon.',
    category: 'Nutrition',
    upvotes: 28,
    answers: 18,
    views: 203,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_answered: false,
  },
  {
    id: '5',
    body: 'My workplace is completely unsupportive of what I\'m going through. No flexibility, no understanding. Anyone know their rights around menopause and workplace accommodations in SA?',
    category: 'Work & Stress',
    upvotes: 66,
    answers: 12,
    views: 445,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_answered: false,
  },
];

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AnonQuestions() {
  const navigate = useNavigate();
  const isGuest = useAuthStore((state) => state.isGuest);
  const user = useAuthStore((state) => state.user);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newCategory, setNewCategory] = useState('Hormones');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        if (isGuest) {
          setQuestions([]);
          return;
        }
        const { data, error } = await supabase
          .from('anon_questions')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setQuestions(data || []);
      } catch (err) {
        console.error('[AnonQuestions] Fetch error:', err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [isGuest]);

  async function handlePost() {
    if (!newQuestion.trim()) {
      toast.error('Please enter your question');
      return;
    }
    try {
      setPosting(true);
      const { error } = await supabase.from('anon_questions').insert({
        body: newQuestion.trim(),
        category: newCategory,
        user_id: user?.id || null,
        upvotes: 0,
        answers: 0,
        views: 0,
        is_answered: false,
      });
      if (error) throw error;
      toast.success('Your question was posted anonymously ✨');
      setNewQuestion('');
      setShowModal(false);
      // Refetch
      const { data } = await supabase
        .from('anon_questions')
        .select('*')
        .order('created_at', { ascending: false });
      setQuestions(data || []);
    } catch (err) {
      console.error('[AnonQuestions] Post error:', err);
      toast.error('Could not post your question. Please try again.');
    } finally {
      setPosting(false);
    }
  }

  const displayQuestions = questions.length > 0 ? questions : STATIC_QUESTIONS;
  const filtered =
    activeCategory === 'All'
      ? displayQuestions
      : displayQuestions.filter((q) => q.category === activeCategory);

  return (
    <PageWrapper>
      <main className="pt-8 pb-32 px-margin-mobile max-w-3xl mx-auto">
        {/* Header */}
        <section className="mb-stack-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <EyeOff className="w-5 h-5 text-tertiary" />
                <span className="font-label-caps text-label-caps text-tertiary uppercase tracking-widest">Anonymous Space</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Sista Speaks</h1>
              <p className="text-on-surface-variant max-w-md text-body-sm">
                Ask anything, anonymously. No judgement — just honest answers from sisters who get it.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="shrink-0 bg-secondary text-on-secondary px-5 py-3 rounded-full font-label-caps text-label-caps flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-secondary/20 hover:brightness-110"
            >
              <Plus className="w-4 h-4" /> Ask
            </button>
          </div>
        </section>

        {/* Premium CTA Banner */}
        <div className="rose-gradient-border mb-stack-lg rounded-2xl overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-title-md text-title-md text-secondary mb-1">Empower Your Voice</h3>
              <p className="text-body-sm text-on-surface-variant">Don't see your question? Ask anonymously and let the circle support you.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-secondary text-on-secondary px-8 py-3 rounded-full font-label-caps text-label-caps transition-all active:scale-95 shadow-lg shadow-secondary/10 whitespace-nowrap hover:brightness-110"
            >
              POST A QUESTION
            </button>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-4 mb-stack-md">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-label-caps text-label-caps transition-all active:scale-95 ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Question Feed */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-6 animate-pulse h-40 bg-surface-variant"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <MessageSquare className="w-12 h-12 text-outline-variant mx-auto mb-4" />
                <p className="text-on-surface-variant">No questions in this category yet. Be the first to ask!</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 bg-primary text-on-primary px-6 py-3 rounded-full font-label-caps text-label-caps"
                >
                  Ask First
                </button>
              </div>
            ) : (
              filtered.map((q) => (
                <div
                  key={q.id}
                  className="glass-card rounded-xl p-6 hover:border-primary/20 transition-all cursor-pointer group"
                  onClick={() => navigate(`/community/anon/${q.id}`)}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                        <EyeOff className="w-4 h-4 text-on-surface-variant" />
                      </div>
                      <div>
                        <p className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">Anonymous Sista</p>
                        <p className="text-[10px] text-outline-variant">{timeAgo(q.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          q.is_answered
                            ? 'bg-tertiary-container text-on-tertiary-container'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {q.is_answered ? '✓ Answered' : 'Open'}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-primary-container/30 text-on-primary-container text-[10px] font-bold uppercase tracking-wide">
                        {q.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-on-surface font-body-lg text-body-lg leading-relaxed mb-4 line-clamp-3 group-hover:text-primary transition-colors">
                    {q.body}
                  </p>

                  <div className="flex items-center gap-5 text-on-surface-variant text-body-sm">
                    <span className="flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4" /> {q.upvotes || 0}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" /> {q.answers || 0} answers
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> {q.views || 0}
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity font-semibold text-[12px]">
                      Read more <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Post Question Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-card rounded-2xl p-6 w-full max-w-lg border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-5 h-5 text-tertiary" />
                  <h3 className="font-title-md text-title-md text-on-surface">Ask Anonymously</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface transition-colors text-xl leading-none">&times;</button>
              </div>

              <p className="text-body-sm text-on-surface-variant mb-4">
                Your identity is never revealed. Ask freely, Sista.
              </p>

              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-surface-container text-on-surface rounded-xl px-4 py-3 mb-3 font-body-sm text-body-sm border border-white/5 focus:border-primary/30 focus:outline-none transition-colors"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                rows={5}
                maxLength={800}
                placeholder="What's on your mind, Sista? Ask anything..."
                className="w-full bg-surface-container text-on-surface rounded-xl px-4 py-3 mb-2 font-body-sm text-body-sm border border-white/5 focus:border-primary/30 focus:outline-none resize-none transition-colors placeholder:text-outline-variant"
              />
              <p className="text-[10px] text-outline-variant mb-4 text-right">{newQuestion.length}/800</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-on-surface-variant font-label-caps text-label-caps hover:border-primary/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePost}
                  disabled={posting || !newQuestion.trim()}
                  className="flex-1 py-3 rounded-xl bg-secondary text-on-secondary font-label-caps text-label-caps active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
                >
                  {posting ? 'Posting...' : 'Post Anonymously'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </PageWrapper>
  );
}
