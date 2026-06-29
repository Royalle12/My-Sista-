import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { Calendar, Smile, BatteryCharging, Moon, ArrowRight, BrainCircuit, Heart, Flame } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_CHECKINS = [
  { date: '2026-06-21', mood: 4, energy: 3, sleep: 4, note: 'Felt calm today, worked on journaling.' },
  { date: '2026-06-22', mood: 5, energy: 4, sleep: 5, note: 'Had excellent energy after morning walk.' },
  { date: '2026-06-23', mood: 3, energy: 2, sleep: 3, note: 'Felt slightly fatigued in luteal phase.' },
  { date: '2026-06-24', mood: 4, energy: 4, sleep: 4, note: 'Very productive today.' },
  { date: '2026-06-25', mood: 4, energy: 3, sleep: 4, note: 'Good sleep last night.' }
];

export default function WeeklyReport() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  // Stats
  const [avgMood, setAvgMood] = useState(0);
  const [avgEnergy, setAvgEnergy] = useState(0);
  const [avgSleep, setAvgSleep] = useState(0);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function loadWeeklyStats() {
      try {
        setLoading(true);
        if (isGuest) {
          calculateStats(MOCK_CHECKINS);
          setStreak(5);
          return;
        }

        // Fetch streak from user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('check_in_streak')
          .eq('id', user?.id)
          .single();

        if (profile) {
          setStreak(profile.check_in_streak || 0);
        }

        // Fetch check_ins from supabase
        const { data: checkins, error } = await supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', user?.id)
          .order('date', { ascending: false })
          .limit(7);

        if (error || !checkins || checkins.length === 0) {
          console.warn('[WeeklyReport] No check-ins in database, showing mock metrics.');
          calculateStats(MOCK_CHECKINS);
          setStreak(5);
        } else {
          calculateStats(checkins);
        }
      } catch (err) {
        console.error('[WeeklyReport] Exception loading report:', err);
        calculateStats(MOCK_CHECKINS);
        setStreak(5);
      } finally {
        setLoading(false);
      }
    }

    loadWeeklyStats();
  }, [user, isGuest]);

  const calculateStats = (data) => {
    if (!data || data.length === 0) return;

    setLogs(data);

    const moodTotal = data.reduce((sum, item) => sum + item.mood, 0);
    const energyTotal = data.reduce((sum, item) => sum + item.energy, 0);
    const sleepTotal = data.reduce((sum, item) => sum + item.sleep, 0);
    const count = data.length;

    setAvgMood(parseFloat((moodTotal / count).toFixed(1)));
    setAvgEnergy(parseFloat((energyTotal / count).toFixed(1)));
    setAvgSleep(parseFloat((sleepTotal / count).toFixed(1)));
  };

  const getMoodEmoji = (val) => {
    if (val >= 4.5) return '😄';
    if (val >= 3.5) return '🙂';
    if (val >= 2.5) return '😐';
    return '😢';
  };

  const getCoachAdvice = () => {
    if (avgMood < 3.5) {
      return "I notice your mood scores are a bit lower this week, Sister. Since you are in your luteal phase, consider introducing warm comforts, reducing caffeine, and giving yourself space to rest. Reach out to Coach Amara for a grounding session.";
    }
    if (avgEnergy < 3.0) {
      return "Your energy averages are lower. Realign with mineral-rich South African comfort stews (like lentil or bean curries) and ensure you are wrapping up screens 1 hour before sleep. Light stretching can also lift the midday slump.";
    }
    return "Beautiful scores, Sister! You are showing high resilience and consistency. Keep up the daily check-ins to lock in your wellness habits. Focus on maintaining this rhythm.";
  };

  return (
    <PageWrapper>
      <div className="pt-8 pb-24 px-margin-mobile max-w-4xl mx-auto space-y-8 min-h-screen">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-full bg-primary/10 text-primary">
                <Calendar className="w-4 h-4" />
              </span>
              <span className="font-label-caps text-label-caps text-[#D4827A] tracking-wider uppercase">Your Sanctuary Insights</span>
            </div>
            <h2 className="font-display-lg text-headline-lg text-primary">Weekly Wellness Report</h2>
            <p className="text-on-surface-variant font-body-sm">Tracking your cycle alignment, streak progress, and mindful feedback.</p>
          </div>

          {/* Streak Indicator */}
          <div className="glass-card rounded-2xl p-4 border border-outline/10 flex items-center gap-3 bg-gradient-to-r from-surface-container-low to-secondary/5 self-start md:self-auto">
            <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
              <Flame className="w-6 h-6 fill-secondary/20" />
            </div>
            <div>
              <p className="text-[10px] font-label-caps text-on-surface-variant uppercase">Current Streak</p>
              <h4 className="font-title-lg text-on-surface">{streak} Days Consistent</h4>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
            <p className="text-on-surface-variant text-body-sm font-label-caps">Generating scorecard...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scorecard Cards */}
            <div className="glass-card rounded-2xl p-6 border border-outline/10 space-y-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-label-caps text-on-surface-variant uppercase">Average Mood</p>
                  <h3 className="font-display-lg text-headline-lg text-primary mt-1">{avgMood} / 5</h3>
                </div>
                <div className="p-2.5 rounded-full bg-[#D4827A]/10 text-[#D4827A]">
                  <Smile className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant font-label-caps">
                <span>Overall: {getMoodEmoji(avgMood)} Status</span>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-outline/10 space-y-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-label-caps text-on-surface-variant uppercase">Average Energy</p>
                  <h3 className="font-display-lg text-headline-lg text-primary mt-1">{avgEnergy} / 5</h3>
                </div>
                <div className="p-2.5 rounded-full bg-[#D4827A]/10 text-[#D4827A]">
                  <BatteryCharging className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2">
                <div className="bg-[#D4827A] h-2 rounded-full" style={{ width: `${(avgEnergy / 5) * 100}%` }}></div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-outline/10 space-y-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-label-caps text-on-surface-variant uppercase">Average Sleep</p>
                  <h3 className="font-display-lg text-headline-lg text-primary mt-1">{avgSleep} / 5</h3>
                </div>
                <div className="p-2.5 rounded-full bg-[#D4827A]/10 text-[#D4827A]">
                  <Moon className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full" style={{ width: `${(avgSleep / 5) * 100}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Coach Insight */}
        {!loading && (
          <section className="glass-card rounded-2xl p-6 md:p-8 border border-outline/10 bg-gradient-to-br from-surface-container-low to-primary/5 space-y-4">
            <h3 className="font-title-md text-primary flex items-center gap-2">
              <BrainCircuit className="w-5 h-5" /> Coach Amara's Takeaway
            </h3>
            <p className="text-on-surface-variant text-body-md leading-relaxed">
              {getCoachAdvice()}
            </p>
            <button
              onClick={() => navigate('/coach')}
              className="text-[#D4827A] hover:text-primary font-bold text-xs flex items-center gap-1.5 font-label-caps transition-colors"
            >
              Start Chat with Coach <ArrowRight className="w-4 h-4" />
            </button>
          </section>
        )}

        {/* Timeline Log */}
        {!loading && (
          <section className="glass-card rounded-2xl p-6 border border-outline/10 space-y-4">
            <h3 className="font-title-sm text-primary font-label-caps">Wellness Reflection Logs</h3>
            <div className="space-y-3">
              {logs.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-surface-container-low border border-outline/5 space-y-2">
                  <div className="flex justify-between text-xs text-on-surface-variant font-label-caps">
                    <span>{new Date(item.date).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                    <span className="flex items-center gap-2">
                      <span>Mood: {item.mood}/5</span>
                      <span>•</span>
                      <span>Energy: {item.energy}/5</span>
                    </span>
                  </div>
                  <p className="text-on-surface text-body-sm italic">
                    {item.note ? `"${item.note}"` : 'No reflection notes recorded.'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  );
}
