import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { Moon, Sparkles, ThumbsUp, ThumbsDown, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ConditionDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isGuest = useAuthStore((state) => state.isGuest);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        if (isGuest) {
          // If guest, maybe we mock or just show static UI if null
          setContent(null);
          return;
        }

        const { data, error } = await supabase
          .from('wellness_content')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('[ConditionDetail] Error loading content:', error);
          toast.error('Could not load live content');
        }
        setContent(data || null);
      } catch (err) {
        console.error('[ConditionDetail] Exception:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchDetail();
  }, [slug, isGuest]);

  return (
    <PageWrapper>
      <div className="mt-8 px-margin-mobile pb-32 max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-surface-variant rounded-xl w-full"></div>
            <div className="h-8 bg-surface-variant rounded w-1/3"></div>
            <div className="h-32 bg-surface-variant rounded w-full"></div>
          </div>
        ) : (
          <>
            <section className="mb-stack-lg animate-fade-in">
              <div className="flex items-center gap-stack-sm mb-base text-tertiary">
                <Moon className="w-5 h-5 text-tertiary" />
                <span className="font-label-caps text-label-caps uppercase tracking-widest">
                  {content?.category || 'Sleep Sanctuary'}
                </span>
              </div>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile mb-stack-md leading-tight">
                {content?.title || 'The Magnesium Hack'}
              </h2>
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-stack-md shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10"></div>
                {content?.image_url ? (
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${content.image_url}')` }}></div>
                ) : (
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCLCnelMj17rieDIvcNVHVnbsoLQt6nf0mUJHyEwP2YBDxzyG6_N-wrf2Gs6BadutzuyJg_LwLeEK5doe0dawv1SFy3R4GhpYaRA2nxYlJaKU9ZnvglpWx-_V1akhgamfpT7jFMltvwoU9HWWBWhT6m3EDBnZ4yw5uxQl3MZZdrmAXmEkUJ1fjieZtJKUSNEPZp05kVVBCo30-4p2uELeif5eSzIZDIms-VY7r2rN2RqTbAEo-kSSbV095LXGqvS42NPQVgQRGc_4c')" }}></div>
                )}
              </div>
            </section>

            <section className="mb-stack-lg glass-card p-stack-md rounded-xl">
              <h3 className="font-title-md text-title-md text-primary mb-stack-sm flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Why it works
              </h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {content?.description || "Magnesium is nature's ultimate chill pill. It regulates neurotransmitters that quiet the nervous system and bind to GABA receptors—the same ones targeted by sleep medications. For the modern Sista, it’s the bridge between a high-energy day and a deep, regenerative night."}
              </p>
            </section>

            <section className="mb-stack-lg space-y-stack-md">
              <h3 className="font-title-md text-title-md text-primary px-base">How to try it</h3>
              
              {content?.steps ? (
                content.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-stack-md items-start">
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                      <span className="font-label-caps text-label-caps text-on-primary-container">0{idx + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-title-md text-body-lg font-bold mb-1">{step.title}</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{step.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex gap-stack-md items-start">
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                      <span className="font-label-caps text-label-caps text-on-primary-container">01</span>
                    </div>
                    <div>
                      <h4 className="font-title-md text-body-lg font-bold mb-1">Choose your vessel</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Opt for Magnesium Glycinate for oral intake or a topical Magnesium oil spray for faster absorption through the skin.</p>
                    </div>
                  </div>
                  <div className="flex gap-stack-md items-start">
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                      <span className="font-label-caps text-label-caps text-on-primary-container">02</span>
                    </div>
                    <div>
                      <h4 className="font-title-md text-body-lg font-bold mb-1">Timing is everything</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Take or apply your magnesium roughly 30-45 minutes before you intend to switch off the lights.</p>
                    </div>
                  </div>
                  <div className="flex gap-stack-md items-start">
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                      <span className="font-label-caps text-label-caps text-on-primary-container">03</span>
                    </div>
                    <div>
                      <h4 className="font-title-md text-body-lg font-bold mb-1">The Ritual</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Massage the oil into your calves or the soles of your feet. This physical ritual signals to your brain that 'safety mode' is engaged.</p>
                    </div>
                  </div>
                </>
              )}
            </section>

            <section className="mb-stack-lg glass-card p-stack-md rounded-xl text-center">
              <h3 className="font-title-md text-title-md mb-stack-md">Did this help?</h3>
              <div className="flex gap-stack-md justify-center">
                <button className="bg-tertiary-container text-on-tertiary-container px-8 py-3 rounded-full font-title-md text-title-md active:scale-90 transition-all duration-300 flex items-center gap-2 shadow-lg">
                  <ThumbsUp className="w-5 h-5 fill-current" />
                  Yes
                </button>
                <button className="bg-surface-variant text-on-surface-variant px-8 py-3 rounded-full font-title-md text-title-md active:scale-90 transition-all duration-300 flex items-center gap-2 border border-white/5">
                  <ThumbsDown className="w-5 h-5" />
                  No
                </button>
              </div>
            </section>

            {/* Related Hacks */}
            <section className="mb-stack-lg">
              <div className="flex justify-between items-end mb-stack-sm px-base">
                <h3 className="font-title-md text-title-md text-primary">Related Hacks</h3>
                <span className="font-label-caps text-label-caps text-tertiary cursor-pointer hover:underline">See All</span>
              </div>
              <div className="flex overflow-x-auto scrollbar-none gap-stack-md snap-x pb-4">
                <div className="snap-start shrink-0 w-64 glass-card rounded-xl overflow-hidden hover:opacity-80 transition-opacity cursor-pointer">
                  <div className="w-full h-32 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD6rUSCaADAY0Y7Ef6YuGHDx-VUdAFZHwgf9nt5FZqMu1m8zwGb_tZlbPl8MphylJaJpIfFuWmP5gIX-8YNxGoN8j2QbRlFiojNxoslAnX0Ka-kAX-H7lbAK4tSMOzkvGaDcR3IqOEFAvpPxx1JtXyCHF38am-JMolA-r9T3GnG1AzaF4rOfNGNRXpdHk-P5jYvWQi_k67Dd2aqIA99wQK6M4BfZYL8CJhiVtsDBnRlnlytmZNavngS3wugEG72wU4173HF9MaxtYk')" }}></div>
                  <div className="p-stack-sm">
                    <span className="font-label-caps text-[10px] text-tertiary uppercase">Aromatherapy</span>
                    <h4 className="font-title-md text-body-lg font-bold">Lavender Ritual</h4>
                  </div>
                </div>
                <div className="snap-start shrink-0 w-64 glass-card rounded-xl overflow-hidden hover:opacity-80 transition-opacity cursor-pointer">
                  <div className="w-full h-32 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAWLOlkQZa_JpduS9QzIwFZbm7MEcYf2pSYhY0ZIZXMADoiIRNis7nNJzjSGbsz5Ta2DDZP3M19kN2-9BoZLNl-MNqxr4Gkc4isFLHVZI3dTeTKWbjM05rhCYp-DYHvUdBg1UwSyBlR5L6TCAW8r2hk0VoU1hrMAmSsfg-Krj8YWIkYbaVH4B3ewGxjmUiE1gAtBR-qqk3vtjQR81aJEK7jm-pZMiWgLhxhqB4ySpZfTtKfuNYjBKjukEM0Uz9w_ryIghyfoekS1KU')" }}></div>
                  <div className="p-stack-sm">
                    <span className="font-label-caps text-[10px] text-tertiary uppercase">Habits</span>
                    <h4 className="font-title-md text-body-lg font-bold">Digital Detox</h4>
                  </div>
                </div>
                <div className="snap-start shrink-0 w-64 glass-card rounded-xl overflow-hidden hover:opacity-80 transition-opacity cursor-pointer">
                  <div className="w-full h-32 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAlMQPZHa68oyxPZpi0sAAfNvRULDC7l4Q008VItlxOUE7_PPvc18DTCXBCs-5-UPTvwlp9PxqTXBl1pLkQ2zTgBEOaai9RegKbdaJ9yBIaqd1nlqa5IaaY3MNUbgSNJ4Tkn31ZQi4wFqmtknZfJrFu1M_U8BtyAAjdIH0W0sTQ0Go_cZubxIXpZ0gtztfmJTnPSzTA-mnf27BeLTk-AOKQ2Xso5iDfM3xH7eUFKclsjPLROQhRLGXYpeKIuf_IUlpItz568WOFxDU')" }}></div>
                  <div className="p-stack-sm">
                    <span className="font-label-caps text-[10px] text-tertiary uppercase">Mindset</span>
                    <h4 className="font-title-md text-body-lg font-bold">Night Gratitude</h4>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
