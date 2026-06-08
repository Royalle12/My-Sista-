/**
 * src/hooks/useCheckIn.js
 * Daily check-in hook — submit, fetch, and streak management
 */

import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuthStore } from '../store/authStore.js';

export function useCheckIn() {
  const { user, profile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  /** Get today's date string in YYYY-MM-DD (local time) */
  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  /** Fetch today's check-in for the current user (null if not done yet) */
  const fetchTodayCheckIn = useCallback(async () => {
    if (!user?.id) return null;
    const { data } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today())
      .maybeSingle();
    return data;
  }, [user?.id]);

  /** Fetch last 7 check-ins for wellness score chart */
  const fetchRecentCheckIns = useCallback(async (days = 7) => {
    if (!user?.id) return [];
    const { data } = await supabase
      .from('check_ins')
      .select('date, mood, energy, sleep')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(days);
    return (data ?? []).reverse();
  }, [user?.id]);

  /**
   * Submit today's check-in.
   * @param {{ mood: number, energy: number, sleep: number, note?: string }} values
   */
  const submitCheckIn = useCallback(async ({ mood, energy, sleep, note = '' }) => {
    if (!user?.id) throw new Error('Not authenticated');

    setLoading(true);
    setError(null);

    try {
      // 1. Insert check-in
      const { error: insertErr } = await supabase
        .from('check_ins')
        .upsert(
          { user_id: user.id, date: today(), mood, energy, sleep, note },
          { onConflict: 'user_id,date' }
        );
      if (insertErr) throw insertErr;

      // 2. Calculate new streak
      const newStreak = await calculateStreak(user.id);

      // 3. Update profile streak + last_check_in
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .update({ check_in_streak: newStreak, last_check_in: today() })
        .eq('id', user.id)
        .select()
        .single();

      if (updatedProfile) setProfile(updatedProfile);

      return { streak: newStreak };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, setProfile]);

  /**
   * Calculate streak: count consecutive calendar days including today.
   * Break = any gap → streak resets to 1 (current day).
   */
  async function calculateStreak(userId) {
    const { data } = await supabase
      .from('check_ins')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(365);

    if (!data?.length) return 1;

    let streak  = 1;
    let current = new Date(today());

    for (let i = 0; i < data.length; i++) {
      const checkDate = new Date(data[i].date);
      const diffDays  = Math.round(
        (current.getTime() - checkDate.getTime()) / 86400000
      );

      if (i === 0 && diffDays > 1) return 1; // today's check-in breaks > 1 day gap
      if (i === 0) continue; // today itself

      if (diffDays === 1) {
        streak++;
        current = checkDate;
      } else {
        break;
      }
    }

    return streak;
  }

  // Milestone messages
  const getStreakMessage = (streak) => {
    if (streak >= 30) return "30 days! You're unstoppable, Sista! 🔥🏆";
    if (streak >= 14) return "Two weeks strong — incredible consistency! 🌟";
    if (streak >= 7)  return "One week streak! You're building something beautiful. ✨";
    if (streak >= 3)  return "Three days in — momentum is building! 💪";
    return null;
  };

  return {
    loading,
    error,
    profile,
    fetchTodayCheckIn,
    fetchRecentCheckIns,
    submitCheckIn,
    getStreakMessage,
    currentStreak: profile?.check_in_streak ?? 0,
  };
}
