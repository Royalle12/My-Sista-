import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { Sparkles, Award, User, Link as LinkIcon, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateYourPage() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [pageName, setPageName] = useState('');
  const [category, setCategory] = useState('Hormonal Health');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [certificationsText, setCertificationsText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!name || !pageName || !specialty || !bio || !location) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const cleanPageName = pageName.toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleanPageName) {
      toast.error('Please provide a valid custom URL path.');
      return;
    }

    setLoading(true);

    try {
      const certifications = certificationsText
        .split('\n')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const profileData = {
        user_id: user?.id || 'guest-user',
        name,
        page_name: cleanPageName,
        category,
        specialty,
        bio,
        location,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        certifications,
        verified: false,
        rating: 5.0,
      };

      if (isGuest) {
        // Simulate writing delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success('Onboarding complete (Simulated Guest Mode)!');
        navigate(`/c/${cleanPageName}`);
        return;
      }

      // Write to Supabase table
      const { error } = await supabase
        .from('creator_profiles')
        .insert([profileData]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('This page custom URL path is already taken.');
        }
        throw error;
      }

      toast.success('Your Sista expert page has been successfully created!');
      navigate(`/c/${cleanPageName}`);
    } catch (err) {
      console.error('[CreateYourPage] Submission error:', err);
      toast.error(err.message || 'Could not complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="pt-8 pb-24 px-margin-mobile max-w-2xl mx-auto space-y-8 min-h-screen">
        {/* Intro Header */}
        <section className="text-center space-y-3">
          <div className="flex justify-center">
            <span className="p-3 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </span>
          </div>
          <h2 className="font-display-lg text-headline-lg text-primary">Create Your Creator Profile</h2>
          <p className="text-on-surface-variant font-body-sm max-w-md mx-auto">
            Share your wisdom, consult with sisters, and build your digital sanctuary on the My Sista network.
          </p>
        </section>

        {isGuest && (
          <div className="flex gap-3 bg-secondary/10 border border-secondary/20 p-4 rounded-xl text-on-surface-variant text-xs leading-relaxed">
            <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0" />
            <p>
              <strong>Guest Session Warning:</strong> Since you are logged in as a guest, your creator profile will be simulated locally. Submitting will show a preview but won't write to the live databases.
            </p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 border border-outline/10 space-y-6">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="font-title-sm text-primary flex items-center gap-2 border-b border-outline/5 pb-2">
              <User className="w-4 h-4" /> Personal & Public Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant mb-1 uppercase">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full bg-surface-container border border-outline/10 rounded-xl px-3 py-2 text-on-surface text-body-md focus:border-primary focus:ring-0"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant mb-1 uppercase">Custom URL Path *</label>
                <div className="flex items-center bg-surface-container border border-outline/10 rounded-xl px-3 group focus-within:border-primary">
                  <span className="text-on-surface-variant text-xs font-label-caps pr-1 select-none">/c/</span>
                  <input
                    type="text"
                    required
                    placeholder="dr-jane"
                    className="w-full bg-transparent border-none focus:ring-0 py-2 text-on-surface text-body-md pl-0"
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant mb-1 uppercase">Category *</label>
                <select
                  className="w-full bg-surface-container border border-outline/10 rounded-xl px-3 py-2 text-on-surface text-body-md focus:border-primary focus:ring-0"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Hormonal Health">Hormonal Health</option>
                  <option value="Doula & Birth">Doula & Birth</option>
                  <option value="Mental Health">Mental Health</option>
                  <option value="Nutrition & Diet">Nutrition & Diet</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant mb-1 uppercase">Location (City, Province) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cape Town, WC"
                  className="w-full bg-surface-container border border-outline/10 rounded-xl px-3 py-2 text-on-surface text-body-md focus:border-primary focus:ring-0"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-label-caps text-on-surface-variant mb-1 uppercase">Professional Specialty Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Clinical Endocrinology Specialist"
                className="w-full bg-surface-container border border-outline/10 rounded-xl px-3 py-2 text-on-surface text-body-md focus:border-primary focus:ring-0"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-label-caps text-on-surface-variant mb-1 uppercase">Expert Bio Summary *</label>
              <textarea
                rows="4"
                required
                placeholder="Tell our sisterhood about yourself, your approach, and your passion."
                className="w-full bg-surface-container border border-outline/10 rounded-xl px-3 py-2 text-on-surface text-body-md focus:border-primary focus:ring-0"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Certifications and Links */}
          <div className="space-y-4 pt-2">
            <h3 className="font-title-sm text-primary flex items-center gap-2 border-b border-outline/5 pb-2">
              <Award className="w-4 h-4" /> Credentials & Media
            </h3>

            <div>
              <label className="block text-[11px] font-label-caps text-on-surface-variant mb-1 uppercase">Avatar Image URL</label>
              <div className="flex items-center bg-surface-container border border-outline/10 rounded-xl px-3 group focus-within:border-primary">
                <LinkIcon className="w-4 h-4 text-outline-variant mr-2 flex-shrink-0" />
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-transparent border-none focus:ring-0 py-2 text-on-surface text-body-md"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-label-caps text-on-surface-variant mb-1 uppercase">Certifications & Qualifications (One per line)</label>
              <textarea
                rows="3"
                placeholder="e.g. BSc Dietetics (UCT)&#10;Registered Dietician HPCSA"
                className="w-full bg-surface-container border border-outline/10 rounded-xl px-3 py-2 text-on-surface text-body-md focus:border-primary focus:ring-0"
                value={certificationsText}
                onChange={(e) => setCertificationsText(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-on-primary py-3 rounded-xl font-label-caps text-label-caps transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-on-primary"></div>
                <span>Creating Profile...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Create Public Profile</span>
              </>
            )}
          </button>
        </form>
      </div>
    </PageWrapper>
  );
}
