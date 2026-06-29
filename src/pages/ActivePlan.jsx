import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { ChevronLeft, CheckSquare, Square, Award, Flame, Quote, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_PLANS = [
  {
    id: '1',
    title: '7-Day Cycle Realignment',
    category: 'Cycle Syncing',
    duration_days: 7,
    current_day: 3,
    tasks: [
      { id: 't1', title: 'Seed Rotation Morning Infusion', desc: 'Mix 1 tbsp flaxseeds with raw honey and warm hot water. Grounding support for estrogen pathways.' },
      { id: 't2', title: '15-Minute Dynamic Flow Yoga', desc: 'Gentle core stretching focused on blood flow to the pelvic region. Clear cortisol buildup.' },
      { id: 't3', title: 'Write down 3 gratitude points', desc: 'Settle down before sleep. Reflect on your daily wins in your notebook.' }
    ]
  },
  {
    id: '2',
    title: 'Second Spring Comfort',
    category: 'Second Spring',
    duration_days: 14,
    current_day: 1,
    tasks: [
      { id: 't4', title: 'Cooling Sage Infusion', desc: 'Brew loose sage leaves for 5 minutes. Best taken iced in the afternoon.' },
      { id: 't5', title: 'Vagus Nerve Reset Exercise', desc: 'Deep breathing with prolonged exhalation to relax your nervous system.' }
    ]
  }
];

export default function ActivePlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isGuest } = useAuthStore();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    async function loadActivePlan() {
      try {
        setLoading(true);

        // Match base plan details
        const matchedPlan = MOCK_PLANS.find((p) => p.id === id) || MOCK_PLANS[0];
        setPlan(matchedPlan);

        if (isGuest) {
          const cached = localStorage.getItem(`mysista-plan-${id}`);
          if (cached) {
            setCompletedTasks(JSON.parse(cached));
          }
          return;
        }

        // Fetch user plan checklist from Supabase
        const { data, error } = await supabase
          .from('user_wellness_plans')
          .select('completed_tasks')
          .eq('user_id', user?.id)
          .eq('plan_id', id)
          .single();

        if (data && data.completed_tasks) {
          setCompletedTasks(data.completed_tasks);
        }
      } catch (err) {
        console.error('[ActivePlan] Error loading active plan:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadActivePlan();
    }
  }, [id, user, isGuest]);

  const handleToggleTask = async (taskId) => {
    let updated;
    if (completedTasks.includes(taskId)) {
      updated = completedTasks.filter((id) => id !== taskId);
      toast.success('Task marked incomplete.');
    } else {
      updated = [...completedTasks, taskId];
      toast.success('Task completed! Keep shining, Sister!');
    }

    setCompletedTasks(updated);

    try {
      if (isGuest) {
        localStorage.setItem(`mysista-plan-${id}`, JSON.stringify(updated));
        return;
      }

      // Upsert to user_wellness_plans table
      const { error } = await supabase
        .from('user_wellness_plans')
        .upsert({
          user_id: user?.id,
          plan_id: id,
          completed_tasks: updated,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,plan_id' });

      if (error) throw error;
    } catch (err) {
      console.error('[ActivePlan] Error saving checklist progress:', err);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
          <p className="text-on-surface-variant text-body-sm font-label-caps">Hydrating daily tracker...</p>
        </div>
      </PageWrapper>
    );
  }

  if (!plan) {
    return (
      <PageWrapper>
        <div className="max-w-md mx-auto py-20 text-center space-y-6">
          <h2 className="font-display-lg text-headline-lg text-primary">Plan Not Found</h2>
          <p className="text-on-surface-variant">We couldn't locate details for this wellness pathway.</p>
          <button
            onClick={() => navigate('/wellness-plans')}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-caps text-label-caps"
          >
            Back to Plans
          </button>
        </div>
      </PageWrapper>
    );
  }

  const progressPct = Math.round((completedTasks.length / plan.tasks.length) * 100);

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-margin-mobile pt-4 pb-24 space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/wellness-plans')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-label-caps"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Pathways
        </button>

        {/* Plan Header Card */}
        <section className="glass-card rounded-2xl p-6 border border-outline/10 bg-gradient-to-br from-surface-container-low to-primary/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-label-caps bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
              {plan.category}
            </span>
            <span className="text-[11px] font-label-caps text-on-surface-variant">
              Day {plan.current_day} of {plan.duration_days}
            </span>
          </div>

          <h2 className="font-display-lg text-headline-lg text-primary">{plan.title}</h2>

          {/* Progress gauge */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-label-caps text-on-surface-variant">
              <span>Day Completion progress</span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
              <div className="bg-secondary h-2 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section className="space-y-4">
          <h3 className="font-title-sm text-primary font-label-caps flex items-center gap-2">
            <Flame className="w-4 h-4 text-secondary fill-secondary/15" /> Daily Rituals
          </h3>

          <div className="space-y-3">
            {plan.tasks.map((task) => {
              const isDone = completedTasks.includes(task.id);
              return (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`glass-card rounded-xl p-4 border transition-all cursor-pointer flex gap-4 items-start hover:border-primary/20 ${
                    isDone ? 'bg-primary/5 border-primary/10 opacity-80' : 'bg-surface-container-low border-outline/5'
                  }`}
                >
                  <button className="text-primary hover:text-primary-hover mt-0.5 flex-shrink-0">
                    {isDone ? <CheckSquare className="w-5 h-5 text-secondary" /> : <Square className="w-5 h-5 text-outline-variant" />}
                  </button>
                  <div className="space-y-1">
                    <h4 className={`font-title-sm text-body-md ${isDone ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                      {task.title}
                    </h4>
                    <p className="text-on-surface-variant text-xs leading-relaxed">{task.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Affirmation Footer */}
        <div className="glass-card rounded-xl p-5 border border-outline/5 bg-surface-container-low flex gap-3 text-on-surface-variant italic text-xs leading-relaxed">
          <Quote className="w-5 h-5 text-secondary flex-shrink-0" />
          <p>
            "The rhythm of the body is the rhythm of nature itself. By aligning with our cycle, we reclaim our natural strength, grace, and community village care."
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
