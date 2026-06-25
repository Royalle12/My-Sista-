/**
 * src/pages/AdminCoachConfig.jsx
 * Screen 8 — Admin Coach Configuration
 * Manage Coach Amara's AI system prompt, tone, safety boundaries, and model settings.
 */

import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../lib/supabase.js';
import {
  Sparkles,
  Save,
  RotateCcw,
  AlertTriangle,
  Sliders,
  MessageSquare,
  Shield,
  ToggleLeft,
  ToggleRight,
  Clock,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Default configuration values ──────────────────────────────────────────────
const DEFAULTS = {
  system_prompt: `You are Coach Amara — a warm, knowledgeable wellness guide for women of colour. You draw from holistic health, evidence-based nutrition, mental-health counselling, and culturally grounded wisdom.

Your voice is encouraging yet honest. You celebrate small victories, acknowledge systemic barriers, and gently hold space for difficult conversations about body image, hormonal changes, and emotional wellbeing.

Guidelines:
• Always validate feelings before offering advice
• Use inclusive, affirming language
• Reference culturally relevant foods, practices, and traditions when appropriate
• Encourage professional medical consultation for clinical concerns
• Keep responses concise, actionable, and warm`,
  tone: 'Warm & Empathetic',
  restricted_topics: `Medical diagnoses or prescriptions
Specific drug dosage recommendations
Mental health crisis intervention (direct to emergency services instead)
Legal or financial advice
Eating disorder meal plans (refer to specialists)
Self-harm or suicide methods`,
  second_spring_enabled: 'false',
  second_spring_preamble: `The user may be navigating perimenopause or menopause — known in this space as the "Second Spring." Approach hormonal changes with normalcy, empowerment, and practical wisdom. Frame this life stage as a powerful transition, not a decline. Reference common experiences like hot flashes, mood shifts, sleep changes, and libido fluctuations with empathy and evidence-based guidance.`,
  model: 'claude-sonnet-4-20250514',
  max_response_words: '200',
};

const TONE_PRESETS = [
  'Warm & Empathetic',
  'Clinical & Direct',
  'Playful & Casual',
  'Spiritual & Holistic',
];

const MODEL_OPTIONS = [
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Latest)' },
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fast)' },
];

const STORAGE_KEY = 'mysista-coach-config';

export default function AdminCoachConfig() {
  const { user, isGuest } = useAuth();

  // ─── State ─────────────────────────────────────────────────────────────────
  const [config, setConfig] = useState({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [lastUpdatedBy, setLastUpdatedBy] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalConfig, setOriginalConfig] = useState({ ...DEFAULTS });

  // ─── Load configuration ────────────────────────────────────────────────────
  useEffect(() => {
    loadConfig();
  }, [isGuest]);

  const loadConfig = async () => {
    try {
      setLoading(true);

      if (isGuest) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setConfig(parsed.values || { ...DEFAULTS });
          setOriginalConfig(parsed.values || { ...DEFAULTS });
          setLastUpdated(parsed.updated_at || null);
          setLastUpdatedBy(parsed.updated_by || 'Guest');
        } else {
          setConfig({ ...DEFAULTS });
          setOriginalConfig({ ...DEFAULTS });
        }
        return;
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('coach_config')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const configMap = {};
        let latestUpdate = null;
        let updater = null;

        data.forEach((row) => {
          configMap[row.config_key] = row.config_value;
          if (!latestUpdate || new Date(row.updated_at) > new Date(latestUpdate)) {
            latestUpdate = row.updated_at;
            updater = row.updated_by;
          }
        });

        const merged = { ...DEFAULTS, ...configMap };
        setConfig(merged);
        setOriginalConfig(merged);
        setLastUpdated(latestUpdate);
        setLastUpdatedBy(updater);
      } else {
        setConfig({ ...DEFAULTS });
        setOriginalConfig({ ...DEFAULTS });
      }
    } catch (err) {
      console.error('[AdminCoachConfig] Load error:', err);
      toast.error('Failed to load coach configuration');
      setConfig({ ...DEFAULTS });
      setOriginalConfig({ ...DEFAULTS });
    } finally {
      setLoading(false);
    }
  };

  // ─── Track changes ─────────────────────────────────────────────────────────
  useEffect(() => {
    const changed = Object.keys(config).some(
      (key) => config[key] !== originalConfig[key]
    );
    setHasChanges(changed);
  }, [config, originalConfig]);

  // ─── Update a config field ─────────────────────────────────────────────────
  const updateField = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // ─── Save configuration ────────────────────────────────────────────────────
  const saveConfig = async () => {
    try {
      setSaving(true);
      const now = new Date().toISOString();

      if (isGuest) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            values: config,
            updated_at: now,
            updated_by: 'Guest',
          })
        );
        setLastUpdated(now);
        setLastUpdatedBy('Guest');
        setOriginalConfig({ ...config });
        toast.success('Configuration saved (Guest Mode) 🌸');
        return;
      }

      // Upsert each config key to Supabase
      const rows = Object.entries(config).map(([key, value]) => ({
        config_key: key,
        config_value: String(value),
        updated_by: user?.id || null,
        updated_at: now,
      }));

      const { error } = await supabase.from('coach_config').upsert(rows, {
        onConflict: 'config_key',
      });

      if (error) throw error;

      setLastUpdated(now);
      setLastUpdatedBy(user?.id || 'Unknown');
      setOriginalConfig({ ...config });
      toast.success('Coach configuration saved successfully ✨');
    } catch (err) {
      console.error('[AdminCoachConfig] Save error:', err);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // ─── Reset to defaults ─────────────────────────────────────────────────────
  const resetToDefaults = () => {
    if (!confirm('Reset all configuration to defaults? This will discard any unsaved changes.')) {
      return;
    }
    setConfig({ ...DEFAULTS });
    toast('Configuration reset to defaults', { icon: '🔄' });
  };

  // ─── Format date helper ────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <Sparkles size={32} className="mx-auto text-primary animate-pulse-soft" />
            <p className="text-sm text-mid font-medium">Loading coach configuration…</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6 pb-12 animate-fade-in">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="border-b border-primary/10 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-soft">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="section-title text-gradient">Coach Amara Configuration</h1>
              <p className="section-subtitle mt-0">
                Control the AI coach's personality, boundaries, and behaviour
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="badge-primary px-2.5 py-0.5 text-3xs font-semibold uppercase">
              {isGuest ? 'Guest Simulation' : 'Production'}
            </span>

            {lastUpdated && (
              <span className="flex items-center gap-1.5 text-3xs text-mid">
                <Clock size={12} />
                Last updated: {formatDate(lastUpdated)}
                {lastUpdatedBy && ` by ${lastUpdatedBy === user?.id ? 'you' : lastUpdatedBy}`}
              </span>
            )}

            {hasChanges && (
              <span className="badge bg-amber-50 text-amber-700 border border-amber-200 text-3xs font-semibold px-2 py-0.5 animate-pulse-soft">
                Unsaved changes
              </span>
            )}
          </div>
        </div>

        {/* ── Guest Mode Alert ───────────────────────────────────────────── */}
        {isGuest && (
          <div className="card bg-orange-50 border border-orange-200/50 p-4 flex gap-3 text-orange-800 text-xs">
            <AlertTriangle size={18} className="shrink-0 text-orange-600" />
            <div>
              <span className="font-bold">Guest Mode:</span> Changes are saved to your browser's
              local storage only. Sign in as an administrator to persist to the database.
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            Section A — System Prompt Editor
           ══════════════════════════════════════════════════════════════════ */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between bg-soft px-5 py-4 border-b border-primary/10">
            <div className="flex items-center gap-2.5">
              <MessageSquare size={18} className="text-primary" />
              <div>
                <h2 className="font-display text-base font-semibold text-dark">System Prompt</h2>
                <p className="text-3xs text-mid mt-0.5">
                  The foundational instructions that shape Coach Amara's responses
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-ghost btn-sm flex items-center gap-1.5 text-xs"
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>

          <div className="p-5">
            {showPreview ? (
              <div className="bg-cream rounded-xl p-5 text-sm text-dark leading-relaxed whitespace-pre-wrap font-body border border-primary/5">
                {config.system_prompt || 'No system prompt configured.'}
              </div>
            ) : (
              <textarea
                value={config.system_prompt}
                onChange={(e) => updateField('system_prompt', e.target.value)}
                rows={12}
                className="input w-full font-mono text-xs leading-relaxed resize-y min-h-[200px]"
                placeholder="Enter the system prompt for Coach Amara..."
              />
            )}

            <div className="flex items-center justify-between mt-3">
              <span className="text-3xs text-mid">
                {config.system_prompt.length.toLocaleString()} characters
              </span>
              <span
                className={`text-3xs font-medium ${
                  config.system_prompt.length > 4000
                    ? 'text-red-500'
                    : config.system_prompt.length > 3000
                    ? 'text-amber-500'
                    : 'text-green-600'
                }`}
              >
                {config.system_prompt.length > 4000
                  ? '⚠ Prompt is very long'
                  : config.system_prompt.length > 3000
                  ? '⚡ Consider shortening'
                  : '✓ Good length'}
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            Section B — Tone Selector
           ══════════════════════════════════════════════════════════════════ */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center gap-2.5 bg-soft px-5 py-4 border-b border-primary/10">
            <Sliders size={18} className="text-primary" />
            <div>
              <h2 className="font-display text-base font-semibold text-dark">Tone & Voice</h2>
              <p className="text-3xs text-mid mt-0.5">
                Comma-separated keywords that guide the coach's conversational style
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <input
              type="text"
              value={config.tone}
              onChange={(e) => updateField('tone', e.target.value)}
              className="input w-full text-sm"
              placeholder="e.g. warm, empathetic, encouraging, culturally-aware"
            />

            <div>
              <label className="label text-3xs mb-2 block">Quick Presets</label>
              <div className="flex flex-wrap gap-2">
                {TONE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => updateField('tone', preset)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      config.tone === preset
                        ? 'bg-primary text-white shadow-soft'
                        : 'bg-soft text-dark hover:bg-primary/10 border border-primary/10'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            Section C — Restricted Topics
           ══════════════════════════════════════════════════════════════════ */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center gap-2.5 bg-soft px-5 py-4 border-b border-primary/10">
            <Shield size={18} className="text-red-500" />
            <div>
              <h2 className="font-display text-base font-semibold text-dark">Restricted Topics</h2>
              <p className="text-3xs text-mid mt-0.5">
                Topics the coach must refuse to discuss — one per line
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Safety Warning */}
            <div className="flex gap-3 bg-red-50 border border-red-200/60 rounded-xl p-4">
              <AlertTriangle size={18} className="shrink-0 text-red-500 mt-0.5" />
              <div className="text-xs text-red-800">
                <p className="font-bold mb-1">Hard Safety Boundaries</p>
                <p className="leading-relaxed">
                  These restrictions are enforced at the system level. The coach will acknowledge
                  the topic but redirect the user to appropriate professional resources instead
                  of engaging directly. Changes here take effect immediately upon save.
                </p>
              </div>
            </div>

            <textarea
              value={config.restricted_topics}
              onChange={(e) => updateField('restricted_topics', e.target.value)}
              rows={6}
              className="input w-full text-xs leading-relaxed resize-y"
              placeholder="Enter restricted topics, one per line..."
            />

            <div className="text-3xs text-mid">
              {config.restricted_topics
                ? config.restricted_topics.split('\n').filter((l) => l.trim()).length
                : 0}{' '}
              restricted topic(s) configured
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            Section D — Second Spring Mode
           ══════════════════════════════════════════════════════════════════ */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between bg-soft px-5 py-4 border-b border-primary/10">
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} className="text-pink-500" />
              <div>
                <h2 className="font-display text-base font-semibold text-dark">
                  Second Spring Mode
                </h2>
                <p className="text-3xs text-mid mt-0.5">
                  Perimenopause &amp; menopause–aware coaching context
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() =>
                updateField(
                  'second_spring_enabled',
                  config.second_spring_enabled === 'true' ? 'false' : 'true'
                )
              }
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                config.second_spring_enabled === 'true'
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-cream text-mid border border-primary/10'
              }`}
            >
              {config.second_spring_enabled === 'true' ? (
                <>
                  <ToggleRight size={18} />
                  Enabled
                </>
              ) : (
                <>
                  <ToggleLeft size={18} />
                  Disabled
                </>
              )}
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div
              className={`transition-opacity duration-300 ${
                config.second_spring_enabled === 'true' ? 'opacity-100' : 'opacity-40 pointer-events-none'
              }`}
            >
              <label className="label text-xs mb-2 block">Second Spring Preamble</label>
              <textarea
                value={config.second_spring_preamble}
                onChange={(e) => updateField('second_spring_preamble', e.target.value)}
                rows={5}
                className="input w-full text-xs leading-relaxed resize-y"
                placeholder="Additional context injected when Second Spring mode is active..."
                disabled={config.second_spring_enabled !== 'true'}
              />
              <p className="text-3xs text-mid mt-2">
                This preamble is appended to the system prompt when Second Spring mode is active,
                providing menopause-specific context to Coach Amara's responses.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            Section E — Model Settings
           ══════════════════════════════════════════════════════════════════ */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center gap-2.5 bg-soft px-5 py-4 border-b border-primary/10">
            <Sliders size={18} className="text-primary" />
            <div>
              <h2 className="font-display text-base font-semibold text-dark">Model Settings</h2>
              <p className="text-3xs text-mid mt-0.5">
                Configure the underlying AI model and response parameters
              </p>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Model Selector */}
            <div>
              <label className="label text-xs mb-2 block">Claude Model</label>
              <div className="relative">
                <select
                  value={config.model}
                  onChange={(e) => updateField('model', e.target.value)}
                  className="input w-full text-sm appearance-none pr-10"
                >
                  {MODEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mid pointer-events-none"
                />
              </div>
              <p className="text-3xs text-mid mt-1.5">
                Sonnet 4 offers the best quality; Haiku is faster and more cost-effective.
              </p>
            </div>

            {/* Max Response Length Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label text-xs">Max Response Length</label>
                <span className="text-sm font-bold text-primary">
                  {config.max_response_words} words
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={10}
                value={config.max_response_words}
                onChange={(e) => updateField('max_response_words', e.target.value)}
                className="w-full h-2 bg-cream rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-3xs text-mid mt-1">
                <span>50 words</span>
                <span>Concise</span>
                <span>Balanced</span>
                <span>Detailed</span>
                <span>500 words</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            Action Buttons
           ══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            onClick={saveConfig}
            disabled={saving || !hasChanges}
            className={`btn-primary flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold transition-all ${
              !hasChanges ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save size={16} />
                Save Configuration
              </>
            )}
          </button>

          <button
            onClick={resetToDefaults}
            className="btn-ghost flex items-center justify-center gap-2 py-3 px-6 text-sm font-medium text-mid hover:text-red-600 transition-colors"
          >
            <RotateCcw size={16} />
            Reset to Defaults
          </button>
        </div>

        {/* ── Config Summary Footer ──────────────────────────────────────── */}
        <div className="card bg-soft/50 p-4">
          <h3 className="text-xs font-semibold text-dark mb-3 flex items-center gap-2">
            <Sliders size={14} />
            Configuration Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-3xs">
            <div className="bg-white rounded-lg p-3 border border-primary/5">
              <div className="text-mid mb-1">Model</div>
              <div className="font-semibold text-dark truncate">
                {MODEL_OPTIONS.find((m) => m.value === config.model)?.label || config.model}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-primary/5">
              <div className="text-mid mb-1">Tone</div>
              <div className="font-semibold text-dark truncate">{config.tone || 'Not set'}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-primary/5">
              <div className="text-mid mb-1">Max Words</div>
              <div className="font-semibold text-dark">{config.max_response_words}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-primary/5">
              <div className="text-mid mb-1">Prompt Length</div>
              <div className="font-semibold text-dark">
                {config.system_prompt.length.toLocaleString()} chars
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-primary/5">
              <div className="text-mid mb-1">Restricted Topics</div>
              <div className="font-semibold text-dark">
                {config.restricted_topics
                  ? config.restricted_topics.split('\n').filter((l) => l.trim()).length
                  : 0}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-primary/5">
              <div className="text-mid mb-1">Second Spring</div>
              <div
                className={`font-semibold ${
                  config.second_spring_enabled === 'true' ? 'text-green-600' : 'text-mid'
                }`}
              >
                {config.second_spring_enabled === 'true' ? '● Active' : '○ Inactive'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
