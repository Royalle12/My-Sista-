/**
 * src/pages/Onboarding.jsx
 * Sacred Onboarding Wizard — 2-step profile setup.
 * Step 1: Nickname, Age, Pronouns, Province, Profile Image.
 * Step 2: Cycle Phase / Second Spring selection.
 * Persists draft to LocalStorage and finalizes to Supabase.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { supabase, upsertProfile } from '../lib/supabase.js';
import { Camera, Calendar, Check, Compass, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape',
];

const CYCLE_PHASES = [
  {
    id: 'menstruation',
    name: 'Menstruation',
    meta: 'Inner Winter · Days 1-5',
    emoji: '🩸',
    slogan: "A time of rest, reflection, and inner wisdom. Listen to your body's whisper.",
  },
  {
    id: 'follicular',
    name: 'Follicular Phase',
    meta: 'Inner Spring · Days 6-11',
    emoji: '🌿',
    slogan: "New beginnings, high energy, and planning. Step into your power.",
  },
  {
    id: 'ovulatory',
    name: 'Ovulatory Phase',
    meta: 'Inner Summer · Days 12-19',
    emoji: '✨',
    slogan: "Radiant communication, confidence, and connection. Share your light.",
  },
  {
    id: 'luteal',
    name: 'Luteal Phase',
    meta: 'Inner Autumn · Days 20-28',
    emoji: '🍂',
    slogan: "Nesting, boundary-setting, and detail-focus. Trust your intuition.",
  },
  {
    id: 'second_spring',
    name: 'Second Spring',
    meta: 'Menopause & Beyond',
    emoji: '🌸',
    slogan: "Your sacred autumn. A powerful transition into self-sovereignty and elder wisdom.",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, isGuest, refreshProfile, routeAfterAuth } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 State
  const [nickname, setNickname] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [province, setProvince] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Step 2 State
  const [selectedPhase, setSelectedPhase] = useState('');
  const [cycleDay, setCycleDay] = useState('1');

  const fileInputRef = useRef(null);

  // Load Draft from LocalStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('mysista-onboarding-draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.nickname) setNickname(parsed.nickname);
        if (parsed.ageRange) setAgeRange(parsed.ageRange);
        if (parsed.pronouns) setPronouns(parsed.pronouns);
        if (parsed.province) setProvince(parsed.province);
        if (parsed.avatarUrl) setAvatarUrl(parsed.avatarUrl);
        if (parsed.selectedPhase) setSelectedPhase(parsed.selectedPhase);
        if (parsed.cycleDay) setCycleDay(parsed.cycleDay);
        if (parsed.step) setStep(parsed.step);
      } catch (err) {
        console.warn('Failed to parse onboarding draft:', err);
      }
    } else if (user?.user_metadata?.display_name) {
      setNickname(user.user_metadata.display_name);
    }
  }, [user]);

  // Sync Draft to LocalStorage whenever state changes
  useEffect(() => {
    const draftState = {
      nickname,
      ageRange,
      pronouns,
      province,
      avatarUrl,
      selectedPhase,
      cycleDay,
      step,
    };
    localStorage.setItem('mysista-onboarding-draft', JSON.stringify(draftState));
  }, [nickname, ageRange, pronouns, province, avatarUrl, selectedPhase, cycleDay, step]);

  // Handle Image Upload
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    try {
      setUploadingImage(true);
      
      // If guest session, simulate upload only
      if (isGuest) {
        await new Promise((r) => setTimeout(r, 1000));
        // Use a base64 reader to preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarUrl(reader.result);
          toast.success('Profile photo uploaded (Guest Mode) 🌸');
        };
        reader.readAsDataURL(file);
        return;
      }

      // Supabase storage upload
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success('Profile photo uploaded successfully! 🌸');
    } catch (err) {
      console.error('Image upload failed:', err);
      // Fallback to base64 preview on error
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        toast.success('Photo preview set successfully 🌸');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  // Step 1 Validation & Next
  const handleNextStep = (e) => {
    e.preventDefault();
    if (!nickname) {
      toast.error('Please enter a nickname');
      return;
    }
    if (!ageRange) {
      toast.error('Please select your age range');
      return;
    }
    if (!province) {
      toast.error('Please select your SA province');
      return;
    }
    setStep(2);
  };

  // Step 2 Submission & Save
  const handleOnboardingSubmit = async () => {
    if (!selectedPhase) {
      toast.error('Please select your cycle phase or Second Spring');
      return;
    }

    try {
      setLoading(true);

      const updates = {
        display_name: nickname,
        age_range: ageRange,
        pronouns: pronouns || null,
        province: province,
        avatar_url: avatarUrl || null,
        onboarding_complete: true,
      };

      if (!isGuest) {
        // Upsert to profiles table in Supabase
        await upsertProfile(user.id, updates);
      }

      // Sync cycle phase and day to LocalStorage for dashboard/tracker view
      localStorage.setItem('mysista-cycle-phase', selectedPhase);
      localStorage.setItem('mysista-cycle-day', selectedPhase === 'second_spring' ? '0' : cycleDay);

      toast.success('Welcome to the Circle, Sista! 🌸');
      
      // Clear draft
      localStorage.removeItem('mysista-onboarding-draft');

      if (!isGuest) {
        const profileData = await refreshProfile();
        routeAfterAuth(profileData);
      } else {
        navigate('/feed', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save onboarding data');
    } finally {
      setLoading(false);
    }
  };

  const activePhaseInfo = CYCLE_PHASES.find((p) => p.id === selectedPhase);

  return (
    <div className="min-h-screen bg-[#F0F0E8] py-12 px-4 relative flex items-center justify-center overflow-hidden">
      
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[45rem] h-[45rem] bg-secondary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-primary/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl z-10 animate-scale-in">
        
        {/* Progress Bar & Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-dark mb-2">Build Your Sanctuary</h1>
          <p className="text-mid text-sm mb-6">Let's align My Sista with your unique rhythm.</p>
          
          <div className="flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${step === 1 ? 'bg-primary text-white' : 'bg-soft text-primary'}`}>
              1. Bio & Location
            </span>
            <div className="w-8 h-0.5 bg-primary/20" />
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${step === 2 ? 'bg-primary text-white' : 'bg-soft text-primary'}`}>
              2. Cycle Alignment
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="card p-8 md:p-10 bg-white border border-primary/5 shadow-card">
          
          {step === 1 ? (
            /* ── STEP 1: BIO & LOCATION ── */
            <form onSubmit={handleNextStep} className="space-y-6 animate-fade-in">
              
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-3 border-b border-primary/5 pb-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-soft border-2 border-dashed border-primary/20 hover:border-primary/50 relative cursor-pointer group overflow-hidden flex items-center justify-center shadow-soft transition-all"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Camera size={24} className="text-mid mx-auto mb-1 group-hover:text-primary transition-colors" />
                      <span className="text-3xs font-medium text-mid block">Upload</span>
                    </div>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-primary hover:text-secondary transition-colors"
                >
                  Change Photo
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                
                {/* Nickname */}
                <div>
                  <label className="label">Nickname</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Thandi" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="input"
                  />
                </div>

                {/* Age range */}
                <div>
                  <label className="label">Age Range</label>
                  <select 
                    required
                    value={ageRange} 
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="input"
                  >
                    <option value="" disabled>Select Age Range</option>
                    <option value="25-30">25 to 30</option>
                    <option value="31-35">31 to 35</option>
                    <option value="36-40">36 to 40</option>
                    <option value="41-45">41 to 45</option>
                  </select>
                </div>

                {/* Pronouns */}
                <div>
                  <label className="label">Pronouns <span className="text-mid font-normal">(Optional)</span></label>
                  <select 
                    value={pronouns} 
                    onChange={(e) => setPronouns(e.target.value)}
                    className="input"
                  >
                    <option value="">Select Pronouns</option>
                    <option value="She/Her">She / Her</option>
                    <option value="They/Them">They / Them</option>
                    <option value="She/They">She / They</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Province */}
                <div>
                  <label className="label">SA Province</label>
                  <select 
                    required
                    value={province} 
                    onChange={(e) => setProvince(e.target.value)}
                    className="input"
                  >
                    <option value="" disabled>Select Province</option>
                    {PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="pt-4 flex justify-end border-t border-primary/5">
                <button type="submit" className="btn-primary gap-2 bg-gradient-brand text-white py-3 px-6">
                  Continue to Cycle
                  <ArrowRight size={16} />
                </button>
              </div>

            </form>
          ) : (
            /* ── STEP 2: CYCLE ALIGNMENT ── */
            <div className="space-y-6 animate-fade-in">
              
              <div className="text-left mb-4">
                <h3 className="text-sm font-semibold text-dark mb-1.5 flex items-center gap-1.5">
                  <Compass size={16} className="text-primary" />
                  Select your current phase or life stage:
                </h3>
                <p className="text-mid text-xs">
                  We use this selection to align your articles, comfort food recommendations, and health trackers daily.
                </p>
              </div>

              {/* Cycle Phases Grid */}
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {CYCLE_PHASES.map((phase) => {
                  const active = selectedPhase === phase.id;
                  return (
                    <button
                      key={phase.id}
                      type="button"
                      onClick={() => {
                        setSelectedPhase(phase.id);
                        if (phase.id === 'second_spring') {
                          setCycleDay('0');
                        }
                      }}
                      className={[
                        'flex flex-col text-left p-4 rounded-xl border transition-all duration-300 relative group',
                        active 
                          ? 'border-primary bg-blush shadow-soft ring-1 ring-primary' 
                          : 'border-primary/10 bg-white hover:border-primary/30 hover:bg-soft/45'
                      ].join(' ')}
                    >
                      {active && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                      <span className="text-2xl mb-2">{phase.emoji}</span>
                      <span className="font-display font-semibold text-dark text-sm leading-tight mb-1">{phase.name}</span>
                      <span className="text-mid text-3xs leading-none">{phase.meta}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Phase Details Box */}
              {selectedPhase && activePhaseInfo && (
                <div className="bg-soft/50 border border-primary/10 rounded-xl p-5 text-left animate-slide-up">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{activePhaseInfo.emoji}</span>
                    <h4 className="font-display font-bold text-dark text-sm">{activePhaseInfo.name} alignment</h4>
                  </div>
                  <p className="text-dark/85 text-xs italic leading-relaxed">
                    "{activePhaseInfo.slogan}"
                  </p>

                  {/* Sub-inputs if menstrual phase is active */}
                  {selectedPhase !== 'second_spring' && (
                    <div className="mt-4 pt-4 border-t border-primary/10 animate-fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <label className="text-xs font-semibold text-dark mb-0.5 block">Estimated cycle day</label>
                          <p className="text-mid text-3xs">Day 1 is the first day of your last period.</p>
                        </div>
                        <input 
                          type="number" 
                          min={1} 
                          max={35}
                          value={cycleDay}
                          onChange={(e) => setCycleDay(e.target.value)}
                          className="input w-24 px-3 py-1.5 text-center text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 flex justify-between border-t border-primary/5">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="btn-outline gap-2 py-3 px-5"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <button 
                  type="button" 
                  disabled={loading}
                  onClick={handleOnboardingSubmit}
                  className="btn-primary gap-2 bg-gradient-brand text-white py-3 px-6 shadow-glow"
                >
                  {loading ? "Aligning..." : "Begin Journey"}
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
