import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { Moon, Sparkles, ThumbsUp, ThumbsDown, ChevronLeft, Share2, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DIYDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isGuest = useAuthStore((state) => state.isGuest);
  const [hack, setHack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchHack() {
      try {
        setLoading(true);
        if (isGuest) {
          setHack(null);
          return;
        }

        // Try fetching by numeric id or slug
        const isNumeric = /^\d+$/.test(id);
        let query = supabase.from('sista_hacks').select('*');
        query = isNumeric ? query.eq('id', id) : query.eq('slug', id);
        const { data, error } = await query.single();

        if (error && error.code !== 'PGRST116') {
          console.error('[DIYDetail] Fetch error:', error);
          toast.error('Could not load this hack');
        }
        setHack(data || null);
      } catch (err) {
        console.error('[DIYDetail] Exception:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchHack();
  }, [id, isGuest]);

  const steps = hack?.steps || [
    { title: 'Choose your vessel', description: 'Select the right format — topical, oral supplement, or a mindful ritual — depending on your body\'s current needs.' },
    { title: 'Timing is everything', description: 'Apply the hack at the optimal time — morning for energy rituals, evening for restorative ones.' },
    { title: 'The Ritual', description: 'Commit to the full practice. The physical act signals to your nervous system that you are taking intentional care of yourself.' },
  ];

  const relatedHacks = [
    {
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6rUSCaADAY0Y7Ef6YuGHDx-VUdAFZHwgf9nt5FZqMu1m8zwGb_tZlbPl8MphylJaJpIfFuWmP5gIX-8YNxGoN8j2QbRlFiojNxoslAnX0Ka-kAX-H7lbAK4tSMOzkvGaDcR3IqOEFAvpPxx1JtXyCHF38am-JMolA-r9T3GnG1AzaF4rOfNGNRXpdHk-P5jYvWQi_k67Dd2aqIA99wQK6M4BfZYL8CJhiVtsDBnRlnlytmZNavngS3wugEG72wU4173HF9MaxtYk',
      label: 'Aromatherapy',
      title: 'Lavender Ritual',
      slug: 'lavender-ritual',
    },
    {
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWLOlkQZa_JpduS9QzIwFZbm7MEcYf2pSYhY0ZIZXMADoiIRNis7nNJzjSGbsz5Ta2DDZP3M19kN2-9BoZLNl-MNqxr4Gkc4isFLHVZI3dTeTKWbjM05rhCYp-DYHvUdBg1UwSyBlR5L6TCAW8r2hk0VoU1hrMAmSsfg-Krj8YWIkYbaVH4B3ewGxjmUiE1gAtBR-qqk3vtjQR81aJEK7jm-pZMiWgLhxhqB4ySpZfTtKfuNYjBKjukEM0Uz9w_ryIghyfoekS1KU',
      label: 'Habits',
      title: 'Digital Detox',
      slug: 'digital-detox',
    },
    {
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlMQPZHa68oyxPZpi0sAAfNvRULDC7l4Q008VItlxOUE7_PPvc18DTCXBCs-5-UPTvwlp9PxqTXBl1pLkQ2zTgBEOaai9RegKbdaJ9yBIaqd1nlqa5IaaY3MNUbgSNJ4Tkn31ZQi4wFqmtknZfJrFu1M_U8BtyAAjdIH0W0sTQ0Go_cZubxIXpZ0gtztfmJTnPSzTA-mnf27BeLTk-AOKQ2Xso5iDfM3xH7eUFKclsjPLROQhRLGXYpeKIuf_IUlpItz568WOFxDU',
      label: 'Mindset',
      title: 'Night Gratitude',
      slug: 'night-gratitude',
    },
  ];

  return (
    <PageWrapper>
      <div className="mt-8 px-margin-mobile pb-32 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Hacks
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setSaved(!saved)}
              className={`w-9 h-9 rounded-full glass-card flex items-center justify-center transition-all active:scale-90 ${saved ? 'text-secondary' : 'text-on-surface-variant'}`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-secondary' : ''}`} />
            </button>
            <button className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-on-surface-variant transition-all active:scale-90">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-surface-variant rounded-xl w-full"></div>
            <div className="h-8 bg-surface-variant rounded w-2/3"></div>
            <div className="h-32 bg-surface-variant rounded w-full"></div>
          </div>
        ) : (
          <>
            {/* Hero */}
            <section className="mb-stack-lg animate-fade-in">
              <div className="flex items-center gap-stack-sm mb-base text-tertiary">
                <Moon className="w-5 h-5 text-tertiary" />
                <span className="font-label-caps text-label-caps uppercase tracking-widest">
                  {hack?.category || 'Wellness Hack'}
                </span>
              </div>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile mb-stack-md leading-tight">
                {hack?.title || 'The Magnesium Hack'}
              </h2>
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-stack-md shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10"></div>
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${hack?.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLCnelMj17rieDIvcNVHVnbsoLQt6nf0mUJHyEwP2YBDxzyG6_N-wrf2Gs6BadutzuyJg_LwLeEK5doe0dawv1SFy3R4GhpYaRA2nxYlJaKU9ZnvglpWx-_V1akhgamfpT7jFMltvwoU9HWWBWhT6m3EDBnZ4yw5uxQl3MZZdrmAXmEkUJ1fjieZtJKUSNEPZp05kVVBCo30-4p2uELeif5eSzIZDIms-VY7r2rN2RqTbAEo-kSSbV095LXGqvS42NPQVgQRGc_4c'}')`,
                  }}
                ></div>
              </div>
            </section>

            {/* Why it works */}
            <section className="mb-stack-lg glass-card p-stack-md rounded-xl">
              <h3 className="font-title-md text-title-md text-primary mb-stack-sm flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Why it works
              </h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {hack?.description ||
                  "This hack taps into your body's innate wisdom. Backed by centuries of ancestral knowledge and modern science, it creates a tangible shift in how you feel — physically, mentally, and energetically."}
              </p>
            </section>

            {/* Steps */}
            <section className="mb-stack-lg space-y-stack-md">
              <h3 className="font-title-md text-title-md text-primary px-base">How to try it</h3>
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-stack-md items-start">
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                    <span className="font-label-caps text-label-caps text-on-primary-container">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-title-md text-body-lg font-bold mb-1">{step.title}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{step.description}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* Feedback */}
            <section className="mb-stack-lg glass-card p-stack-md rounded-xl text-center">
              <h3 className="font-title-md text-title-md mb-stack-md">Did this help?</h3>
              <div className="flex gap-stack-md justify-center">
                <button className="bg-tertiary-container text-on-tertiary-container px-8 py-3 rounded-full font-title-md active:scale-90 transition-all duration-300 flex items-center gap-2 shadow-lg">
                  <ThumbsUp className="w-5 h-5 fill-current" /> Yes
                </button>
                <button className="bg-surface-variant text-on-surface-variant px-8 py-3 rounded-full font-title-md active:scale-90 transition-all duration-300 flex items-center gap-2 border border-white/5">
                  <ThumbsDown className="w-5 h-5" /> No
                </button>
              </div>
            </section>

            {/* Related Hacks */}
            <section className="mb-stack-lg">
              <div className="flex justify-between items-end mb-stack-sm px-base">
                <h3 className="font-title-md text-title-md text-primary">Related Hacks</h3>
                <Link to="/diy" className="font-label-caps text-label-caps text-tertiary hover:underline">See All</Link>
              </div>
              <div className="flex overflow-x-auto scrollbar-none gap-stack-md snap-x pb-4">
                {relatedHacks.map((r, idx) => (
                  <Link
                    key={idx}
                    to={`/diy/${r.slug}`}
                    className="snap-start shrink-0 w-64 glass-card rounded-xl overflow-hidden hover:opacity-80 transition-opacity"
                  >
                    <div className="w-full h-32 bg-cover bg-center" style={{ backgroundImage: `url('${r.image}')` }}></div>
                    <div className="p-stack-sm">
                      <span className="font-label-caps text-[10px] text-tertiary uppercase">{r.label}</span>
                      <h4 className="font-title-md text-body-lg font-bold">{r.title}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
