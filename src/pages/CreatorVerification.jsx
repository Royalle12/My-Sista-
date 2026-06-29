import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { ShieldCheck, UploadCloud, AlertCircle, CheckCircle, FileText, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreatorVerification() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState(null);

  // Form Fields
  const [certifyingBody, setCertifyingBody] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    async function loadCreatorProfile() {
      if (isGuest) {
        setCreatorProfile({ verified: false, verification_status: 'unverified' });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('creator_profiles')
          .select('*')
          .eq('user_id', user?.id)
          .single();

        if (data) {
          setCreatorProfile(data);
        } else {
          // If no creator profile yet, prompt them to create one
          setCreatorProfile({ verified: false, verification_status: 'unverified' });
        }
      } catch (err) {
        console.error('[CreatorVerification] Error loading creator profile:', err);
      }
    }

    loadCreatorProfile();
  }, [user, isGuest]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Simulate file upload progress
      setUploading(true);
      setUploadProgress(10);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploading(false);
            toast.success('Certificate uploaded to staging.');
            return 100;
          }
          return prev + 30;
        });
      }, 300);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!certifyingBody || !regNumber || !file) {
      toast.error('Please complete all form fields and upload your credential document.');
      return;
    }

    setLoading(true);

    try {
      if (isGuest) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setCreatorProfile((prev) => ({ ...prev, verification_status: 'pending' }));
        toast.success('Verification application submitted successfully!');
        setFile(null);
        setCertifyingBody('');
        setRegNumber('');
        return;
      }

      // Update creator profile verification fields
      const { error } = await supabase
        .from('creator_profiles')
        .update({
          verification_status: 'pending',
          certifying_body: certifyingBody,
          registration_number: regNumber,
          document_url: 'https://supabase.storage/v1/object/public/credentials/mock-cert.pdf'
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      setCreatorProfile((prev) => ({ ...prev, verification_status: 'pending' }));
      toast.success('Your verification files have been sent for moderator review.');
      setFile(null);
      setCertifyingBody('');
      setRegNumber('');
    } catch (err) {
      console.error('[CreatorVerification] Submit error:', err);
      toast.error('Could not submit verification details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="pt-8 pb-24 px-margin-mobile max-w-2xl mx-auto space-y-8 min-h-screen">
        {/* Intro */}
        <section className="text-center space-y-3">
          <div className="flex justify-center">
            <span className="p-3 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </span>
          </div>
          <h2 className="font-display-lg text-headline-lg text-primary">Sista Creator Verification</h2>
          <p className="text-on-surface-variant font-body-sm max-w-md mx-auto">
            Get your verification badge to build trust, write certified articles, and consult directly in the Sista Circle ecosystem.
          </p>
        </section>

        {/* Verification Status Banner */}
        {creatorProfile && (
          <div className="glass-card rounded-2xl p-6 border border-outline/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-label-caps text-on-surface-variant uppercase">Current Status</p>
              <h4 className="font-title-md text-on-surface capitalize mt-1">
                {creatorProfile.verification_status || 'Unverified'}
              </h4>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-label-caps uppercase ${
                creatorProfile.verification_status === 'pending'
                  ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                  : creatorProfile.verification_status === 'verified' || creatorProfile.verified
                  ? 'bg-secondary/10 text-secondary border border-secondary/20'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {creatorProfile.verification_status === 'pending' ? 'Under Review' : creatorProfile.verified ? 'Verified' : 'Action Required'}
            </span>
          </div>
        )}

        {/* Form Form */}
        {creatorProfile?.verification_status !== 'pending' && !creatorProfile?.verified && (
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 border border-outline/10 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant mb-1 uppercase">Certifying Body / Institution *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Health Professions Council of South Africa (HPCSA)"
                  className="w-full bg-surface-container border border-outline/10 rounded-xl px-3 py-2 text-on-surface text-body-md focus:border-primary focus:ring-0"
                  value={certifyingBody}
                  onChange={(e) => setCertifyingBody(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant mb-1 uppercase">Registration / License Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PS 1234567"
                  className="w-full bg-surface-container border border-outline/10 rounded-xl px-3 py-2 text-on-surface text-body-md focus:border-primary focus:ring-0"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                />
              </div>

              {/* Upload document */}
              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant mb-1 uppercase">Proof of Qualifications *</label>
                {!file ? (
                  <div className="relative border-2 border-dashed border-outline/20 rounded-2xl p-8 text-center hover:border-primary/40 transition-colors flex flex-col items-center justify-center cursor-pointer group">
                    <input
                      type="file"
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                    <UploadCloud className="w-10 h-10 text-outline-variant group-hover:text-primary mb-3 transition-colors" />
                    <p className="text-body-sm font-semibold text-on-surface mb-1">Click to upload your file</p>
                    <p className="text-on-surface-variant text-[11px]">PDF, PNG, or JPG (max. 10MB)</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-surface-container border border-outline/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-body-sm font-semibold text-on-surface max-w-[200px] md:max-w-[350px] truncate">{file.name}</p>
                        {uploading ? (
                          <div className="w-32 bg-surface-container-high rounded-full h-1.5 mt-1 overflow-hidden">
                            <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                        ) : (
                          <p className="text-on-surface-variant text-[10px] font-label-caps">Ready to submit</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-on-surface-variant hover:text-red-500 p-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-primary hover:bg-primary-hover text-on-primary py-3 rounded-xl font-label-caps text-label-caps transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-on-primary"></div>
                  <span>Submitting request...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit for Review</span>
                </>
              )}
            </button>
          </form>
        )}

        {creatorProfile?.verification_status === 'pending' && (
          <div className="glass-card rounded-2xl p-8 border border-outline/10 space-y-4 text-center max-w-md mx-auto">
            <CheckCircle className="w-12 h-12 text-yellow-500 mx-auto" />
            <h3 className="font-title-md text-on-surface">Application Pending Review</h3>
            <p className="text-on-surface-variant text-body-sm leading-relaxed">
              We have received your credential submission. Our moderators audit and check all licensing documents manually. You will receive an alert once your page badge is activated!
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
