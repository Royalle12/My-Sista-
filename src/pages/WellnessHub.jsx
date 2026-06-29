import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { Quote, HelpCircle, Pointer, Grid } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WellnessHub() {
  const isGuest = useAuthStore((state) => state.isGuest);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        if (isGuest) {
          setContent([]);
          return;
        }
        
        const { data, error } = await supabase
          .from('wellness_content')
          .select('*');

        if (error) throw error;
        setContent(data || []);
      } catch (err) {
        console.error('[WellnessHub] Error loading wellness content:', err);
        toast.error('Could not load live content');
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [isGuest]);

  return (
    <PageWrapper>
      <div className="pt-8 px-margin-mobile max-w-screen-md mx-auto space-y-stack-lg">
        {/* Welcome Header */}
        <section className="space-y-base">
          <h2 className="font-display-lg text-headline-lg text-primary">Sanctuary of Learning</h2>
          <p className="text-on-surface-variant font-body-lg">Welcome home, Sister. Enrich your spirit and sharpen your mind.</p>
        </section>

        {/* Hero: Knowledge Quest */}
        <section className="relative overflow-hidden rounded-xl h-80 glass-card flex flex-col justify-end p-6 group cursor-pointer transition-transform duration-500 hover:scale-[1.01]">
          <div className="absolute inset-0 z-0">
            <img className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Ancestral knowledge tree" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQm_pTF10fJVwnd5Rv1x5ZgEID78a--KcPC-vR-2GkDBZGRff13JdKMoyUht_eXWsYa8LTrxAEr0DTmrcUExsezF_GgykV15uH_MmxU1-rwIAbjDnPefLEpB6-o1kkifRvUWbxDR8V6qgA6lmiib7j0XcZcsQsKKSRF-6XHPZFUG2AZC24Xrmv_ouAV71vNqh3NRL28P4_TsHC-SQWeX0nlzmXKZHDnQcfjEaP5WLKB4OCt6RrH0hw5_Huv5sb88MoXy-TRWr555o"/>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
          </div>
          <div className="relative z-10 space-y-stack-md">
            <div className="flex items-center gap-2">
              <span className="bg-secondary-container text-on-secondary-container text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">Featured Game</span>
            </div>
            <h3 className="font-headline-lg text-on-surface">Knowledge Quest</h3>
            <p className="text-on-surface-variant font-body-sm line-clamp-2">Test your wisdom on heritage, wellness, and the sisterhood journey in our weekly trivia challenge.</p>
            <button className="bg-[#D4827A] text-white px-8 py-3 rounded-full font-title-md hover:brightness-110 active:scale-95 transition-all w-fit shadow-lg shadow-rose/20">
              Play Now
            </button>
          </div>
        </section>

        {/* Daily Wisdom Nugget */}
        <section className="p-6 rounded-xl bg-primary-container/30 border border-primary/20 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 opacity-10">
            <Quote size={120} />
          </div>
          <div className="flex flex-col gap-stack-sm relative z-10">
            <span className="font-label-caps text-primary uppercase tracking-[0.2em]">Daily Wisdom Nugget</span>
            <p className="font-headline-lg-mobile italic text-on-primary-container">"The strength of the circle is determined by the truth shared within it."</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-4 h-[1px] bg-primary"></div>
              <span className="text-body-sm text-on-surface-variant">Mama Thandi</span>
            </div>
          </div>
        </section>

        {/* Dynamic Content from Supabase */}
        {content.length > 0 && (
          <section className="space-y-stack-md">
            <h3 className="font-title-md text-primary">Latest Wellness Insights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
              {content.map((item) => (
                <div key={item.id} className="p-5 rounded-xl border border-primary/20 glass-card">
                  <h4 className="font-title-md">{item.title}</h4>
                  <p className="text-body-sm text-on-surface-variant mt-2 line-clamp-3">{item.description || item.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Wellness Myths vs Facts */}
        <section className="space-y-stack-md">
          <div className="flex justify-between items-end">
            <h3 className="font-title-md text-primary">Wellness Myths vs. Facts</h3>
            <span className="text-body-sm text-secondary cursor-pointer hover:underline">View All</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
            
            {/* Card 1 */}
            <div className="group cursor-pointer h-48">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 glass-card p-5 rounded-xl flex flex-col justify-between">
                  <HelpCircle className="text-secondary" />
                  <p className="font-title-md leading-snug">Drinking hot water with lemon "melts" fat away.</p>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">Tap to reveal truth <Pointer className="w-3 h-3"/></span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group cursor-pointer h-48">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 glass-card p-5 rounded-xl flex flex-col justify-between">
                  <HelpCircle className="text-secondary" />
                  <p className="font-title-md leading-snug">Traditional herbs should never be mixed with modern meds.</p>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">Tap to reveal truth <Pointer className="w-3 h-3"/></span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Heritage Crosswords */}
        <section className="space-y-stack-md pb-12">
          <h3 className="font-title-md text-primary">Heritage Crosswords</h3>
          <div className="relative rounded-xl overflow-hidden glass-card p-8 border border-white/5 group">
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="grid grid-cols-10 gap-1 h-full w-full">
                {/* Visual grid background */}
                {[...Array(100)].map((_, i) => (
                  <div key={i} className="border border-white/20 aspect-square"></div>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-stack-sm relative z-10">
              <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-2">
                <Grid className="text-3xl text-outline" />
              </div>
              <h4 className="font-headline-lg-mobile text-on-surface-variant">Unlocking Soon</h4>
              <p className="text-body-sm text-outline max-w-xs">New crossword puzzles celebrating Zulu, Sotho, and Xhosa linguistic heritage are in the works.</p>
              <button className="mt-4 px-6 py-2 border border-outline/50 rounded-full text-label-caps text-outline hover:bg-white/5 transition-colors">Notify Me</button>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
