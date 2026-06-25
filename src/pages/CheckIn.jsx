/**
 * src/pages/CheckIn.jsx
 * Daily wellness check-in screen tracking mood, energy, sleep, and streaks.
 * Supports offline guest modes and database synchronization.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { Flame, CheckCircle, HelpCircle, Heart, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const MOODS = [
  { val: 1, label: '😢 Very Low', bg: 'hover:bg-red-50 active:bg-red-100 border-red-200 text-red-700 bg-red-50/20' },
  { val: 2, label: '😕 Low', bg: 'hover:bg-orange-50 active:bg-orange-100 border-orange-200 text-orange-700 bg-orange-50/20' },
  { val: 3, label: '😐 Balanced', bg: 'hover:bg-yellow-50 active:bg-yellow-100 border-yellow-200 text-yellow-700 bg-yellow-50/20' },
  { val: 4, label: '🙂 High', bg: 'hover:bg-green-50 active:bg-green-100 border-green-200 text-green-700 bg-green-50/20' },
  { val: 5, label: '😄 Radiant', bg: 'hover:bg-teal-50 active:bg-teal-100 border-teal-200 text-teal-700 bg-teal-50/20' },
];

const ENERGIES = [
  { val: 1, label: '🥱 Exhausted' },
  { val: 2, label: '💤 Muted' },
  { val: 3, label: '🔋 Stable' },
  { val: 4, label: '⚡ Active' },
  { val: 5, label: '🌟 Vibrant' },
];

const SLEEPS = [
  { val: 1, label: '😩 Poor' },
  { val: 2, label: '🤕 Restless' },
  { val: 3, label: '😴 Restful' },
  { val: 4, label: '💤 Deep' },
  { val: 5, label: '👑 Perfect' },
];

export default function CheckIn() {
  const { user, profile, isGuest, refreshProfile } = useAuth();
  const setProfile = useAuthStore((s) => s.setProfile);

  // Ratings states
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [streakCount, setStreakCount] = useState(0);

  // Date helper (local YYYY-MM-DD)
  const getLocalDateString = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; // offset in milliseconds
    return (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
  };

  const getYesterdayDateString = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - 86400000 - tzoffset)).toISOString().split('T')[0];
  };

  const todayStr = getLocalDateString();
  const yesterdayStr = getYesterdayDateString();

  // Load check-in records and check today's status
  useEffect(() => {
    async function loadCheckIns() {
      try {
        let checkInsList = [];
        
        if (isGuest) {
          // Guest local storage reading
          const localData = localStorage.getItem('mysista-guest-checkins');
          if (localData) {
            checkInsList = JSON.parse(localData);
          }
          setStreakCount(profile?.check_in_streak ?? 0);
        } else {
          // DB query for past 7 days check-ins
          const { data, error } = await supabase
            .from('check_ins')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(7);

          if (error) throw error;
          checkInsList = data || [];
          setStreakCount(profile?.check_in_streak ?? 0);
        }

        setHistory(checkInsList);

        // Check if user already submitted a check-in today
        const checkedToday = checkInsList.some((c) => c.date === todayStr);
        setHasCheckedInToday(checkedToday);
        
        if (checkedToday) {
          const todayRecord = checkInsList.find((c) => c.date === todayStr);
          if (todayRecord) {
            setMood(todayRecord.mood);
            setEnergy(todayRecord.energy);
            setSleep(todayRecord.sleep);
            setNote(todayRecord.note || '');
          }
        }
      } catch (err) {
        console.error('[CheckIn] Load failure:', err);
      }
    }

    if (user) {
      loadCheckIns();
    }
  }, [user, isGuest, profile?.check_in_streak, todayStr]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Calculate check-in streak progression
      let currentStreak = profile?.check_in_streak ?? 0;
      let lastCheckIn = profile?.last_check_in || null;
      let newStreak = currentStreak;

      if (lastCheckIn === todayStr) {
        // Already checked in today: streak count remains same
        newStreak = currentStreak;
      } else if (lastCheckIn === yesterdayStr) {
        // Last check-in was yesterday: increment streak
        newStreak = currentStreak + 1;
      } else {
        // Last check-in was before yesterday (or is first time): restart/set to 1
        newStreak = 1;
      }

      // 2. Perform write / upsert
      if (isGuest) {
        // Save mock data for guest mode
        const record = {
          id: `ci-${Date.now()}`,
          user_id: user.id,
          date: todayStr,
          mood,
          energy,
          sleep,
          note,
          created_at: new Date().toISOString()
        };

        const existing = localStorage.getItem('mysista-guest-checkins');
        let parsed = existing ? JSON.parse(existing) : [];
        
        // Remove old entry for today if exists (upsert behaviour)
        parsed = parsed.filter((r) => r.date !== todayStr);
        parsed.unshift(record);
        
        localStorage.setItem('mysista-guest-checkins', JSON.stringify(parsed));

        // Update profile in state store
        const updatedProfile = {
          ...profile,
          check_in_streak: newStreak,
          last_check_in: todayStr
        };
        setProfile(updatedProfile);
        setStreakCount(newStreak);
        setHistory(parsed);
      } else {
        // Save database check-in
        const { error: upsertError } = await supabase
          .from('check_ins')
          .upsert({
            user_id: user.id,
            date: todayStr,
            mood,
            energy,
            sleep,
            note
          }, { onConflict: 'user_id,date' });

        if (upsertError) throw upsertError;

        // Save updated profile streak fields
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            check_in_streak: newStreak,
            last_check_in: todayStr
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        await refreshProfile();
        setStreakCount(newStreak);
      }

      setHasCheckedInToday(true);
      setShowSuccess(true);
      toast.success('Reflection logged! Thank you, Sista 🌸');
    } catch (err) {
      console.error('[CheckIn] Submit failure:', err);
      toast.error(err.message || 'Failed to save daily check-in');
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (val) => {
    switch (val) {
      case 1: return '😢';
      case 2: return '😕';
      case 3: return '😐';
      case 4: return '🙂';
      case 5: return '😄';
      default: return '😐';
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-12">
        
        {/* Header Title block */}
        <div>
          <h1 className="section-title text-gradient">Daily Reflection</h1>
          <p className="section-subtitle">Pause, listen, and sync with your rhythm today.</p>
        </div>

        {showSuccess ? (
          /* Check-In Success State Card */
          <div className="card p-8 bg-gradient-brand/5 border border-secondary text-center space-y-6 shadow-glow animate-scale-in">
            <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <CheckCircle size={32} className="text-white" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-display font-bold text-2xl text-dark">Check-in Complete</h2>
              <p className="text-sm text-mid max-w-sm mx-auto">
                Your daily vitals are logged. Honoring your emotional state is key to cycle strength.
              </p>
            </div>

            {/* Streak Counter details */}
            <div className="bg-white/80 border border-primary/5 rounded-2xl p-4 inline-flex items-center gap-3 shadow-soft max-w-xs mx-auto">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                <Flame size={20} className="fill-orange-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-dark">{streakCount}-Day Streak!</p>
                <p className="text-3xs font-semibold text-mid">Keep building the connection.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-primary/5">
              <button onClick={() => setShowSuccess(false)} className="btn-primary">
                Review / Update Log
              </button>
            </div>
          </div>
        ) : (
          /* Form Entry fields */
          <form onSubmit={handleSubmit} className="card p-6 md:p-8 bg-white border border-primary/5 shadow-card space-y-6">
            
            {/* Streak header badge overlay */}
            <div className="flex items-center justify-between border-b border-primary/5 pb-4">
              <div className="flex items-center gap-1.5">
                <Heart size={16} className="text-primary" />
                <span className="text-xs font-semibold text-dark">
                  {hasCheckedInToday ? "Updating today's entry" : "How is your body feeling?"}
                </span>
              </div>
              
              {streakCount > 0 && (
                <div className="flex items-center gap-1 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full">
                  <Flame size={12} className="text-orange-500 fill-orange-500" />
                  <span className="text-2xs font-bold text-orange-700">{streakCount} Days</span>
                </div>
              )}
            </div>

            {/* MOOD Selector */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-dark block">
                Mood Status
              </label>
              <div className="grid grid-cols-5 gap-2">
                {MOODS.map((m) => {
                  const isActive = mood === m.val;
                  return (
                    <button
                      key={m.val}
                      type="button"
                      onClick={() => setMood(m.val)}
                      className={[
                        'flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all',
                        isActive
                          ? 'border-primary bg-primary text-white shadow-soft font-semibold'
                          : 'border-primary/10 bg-white text-dark/75 hover:bg-soft/40',
                      ].join(' ')}
                    >
                      <span className="text-xl mb-1 select-none">
                        {m.label.split(' ')[0]}
                      </span>
                      <span className={[
                        'text-3xs leading-none uppercase tracking-wider',
                        isActive ? 'text-white' : 'text-mid'
                      ].join(' ')}>
                        {m.label.split(' ')[1]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ENERGY Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-dark">Energy Level</label>
                <span className="text-xs font-semibold text-primary">
                  {ENERGIES.find((e) => e.val === energy)?.label}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full accent-primary h-1.5 bg-soft rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* SLEEP Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-dark">Sleep Quality</label>
                <span className="text-xs font-semibold text-primary">
                  {SLEEPS.find((s) => s.val === sleep)?.label}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={sleep}
                onChange={(e) => setSleep(parseInt(e.target.value))}
                className="w-full accent-primary h-1.5 bg-soft rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Reflection Note */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-dark block">
                Reflections & Notes <span className="text-mid font-normal">(Optional)</span>
              </label>
              <textarea
                rows="3"
                placeholder="Write down any physical signs, emotional shifts, or thoughts you have..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input text-sm resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3"
              >
                {loading ? 'Saving Reflection...' : hasCheckedInToday ? 'Update Reflection' : 'Save Reflection'}
              </button>
            </div>
          </form>
        )}

        {/* Reflection History list */}
        {history.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-lg text-dark flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Past Reflections
            </h2>
            
            <div className="space-y-3">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="card bg-white p-4 flex flex-col sm:flex-row justify-between gap-4 border border-primary/5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-dark">
                        {record.date === todayStr ? 'Today' : record.date}
                      </span>
                      <div className="flex items-center gap-1 bg-soft px-2 py-0.5 rounded-full text-3xs text-dark font-medium">
                        <span>{getMoodEmoji(record.mood)} Mood {record.mood}/5</span>
                      </div>
                    </div>
                    {record.note && (
                      <p className="text-xs text-dark/80 italic pl-3 border-l-2 border-primary/20">
                        "{record.note}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-3xs font-semibold text-mid shrink-0">
                    <div className="text-center sm:text-right">
                      <p>Energy: {record.energy}/5</p>
                      <p>Sleep: {record.sleep}/5</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
