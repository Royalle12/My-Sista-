import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { Bell, Shield, Mail, Phone, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationSettings() {
  const { user, isGuest } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    email_updates: true,
    push_reminders: false,
    cycle_reminders: true,
    anon_replies: true
  });

  useEffect(() => {
    async function loadPreferences() {
      try {
        setLoading(true);
        if (isGuest) {
          const cached = localStorage.getItem('mysista-notif-prefs');
          if (cached) {
            setPreferences(JSON.parse(cached));
          }
          return;
        }

        // Fetch profile notification preferences column
        const { data, error } = await supabase
          .from('profiles')
          .select('notification_preferences')
          .eq('id', user?.id)
          .single();

        if (error) {
          console.warn('[NotificationSettings] Fetch preferences failed. Using local defaults.');
        } else if (data && data.notification_preferences) {
          setPreferences(data.notification_preferences);
        }
      } catch (err) {
        console.error('[NotificationSettings] Load exception:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [user, isGuest]);

  const handleToggle = async (key) => {
    const updated = {
      ...preferences,
      [key]: !preferences[key]
    };

    setPreferences(updated);

    try {
      if (isGuest) {
        localStorage.setItem('mysista-notif-prefs', JSON.stringify(updated));
        toast.success('Preferences updated locally!');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: updated })
        .eq('id', user?.id);

      if (error) throw error;
      toast.success('Preferences saved successfully.');
    } catch (err) {
      console.error('[NotificationSettings] Save exception:', err);
      toast.error('Could not save notification preferences.');
    }
  };

  return (
    <PageWrapper>
      <div className="pt-8 pb-24 px-margin-mobile max-w-2xl mx-auto space-y-8 min-h-screen">
        {/* Header */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-primary/10 text-primary">
              <Settings className="w-4 h-4" />
            </span>
            <span className="font-label-caps text-label-caps text-[#D4827A] tracking-wider uppercase">Settings</span>
          </div>
          <h2 className="font-display-lg text-headline-lg text-primary">Notification Preferences</h2>
          <p className="text-on-surface-variant font-body-sm">Control how and when you receive updates from the Sista Circle sanctuary.</p>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
            <p className="text-on-surface-variant text-body-sm font-label-caps">Loading settings...</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 md:p-8 border border-outline/10 space-y-6">
            {/* Setting Items */}
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-outline/5 pb-4">
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-title-sm text-on-surface">Email Newsletters</h4>
                    <p className="text-on-surface-variant text-xs leading-relaxed mt-0.5">
                      Receive weekly curated reads, health guides, and top community questions.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('email_updates')}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    preferences.email_updates ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform transform shadow ${
                      preferences.email_updates ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-start justify-between gap-4 border-b border-outline/5 pb-4">
                <div className="flex gap-3">
                  <Bell className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-title-sm text-on-surface">Push Notifications</h4>
                    <p className="text-on-surface-variant text-xs leading-relaxed mt-0.5">
                      Receive instant wellness alerts and quick reflection triggers on your device.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('push_reminders')}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    preferences.push_reminders ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform transform shadow ${
                      preferences.push_reminders ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-start justify-between gap-4 border-b border-outline/5 pb-4">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-title-sm text-on-surface">Cycle Phase Reminders</h4>
                    <p className="text-on-surface-variant text-xs leading-relaxed mt-0.5">
                      Get alert warnings when your cycle transitions and view matching Curated Phase slogans.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('cycle_reminders')}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    preferences.cycle_reminders ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform transform shadow ${
                      preferences.cycle_reminders ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-title-sm text-on-surface">Community Answers</h4>
                    <p className="text-on-surface-variant text-xs leading-relaxed mt-0.5">
                      Get notified when someone replies to your anonymous questions.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('anon_replies')}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    preferences.anon_replies ? 'bg-primary' : 'bg-surface-container-high'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform transform shadow ${
                      preferences.anon_replies ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
