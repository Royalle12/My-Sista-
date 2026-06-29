import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { Search, ChevronRight, Award, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LocalDirectory() {
  const isGuest = useAuthStore((state) => state.isGuest);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        setLoading(true);
        if (isGuest) {
          setBusinesses([]);
          return;
        }
        
        const { data, error } = await supabase
          .from('businesses')
          .select('*');

        if (error) throw error;
        setBusinesses(data || []);
      } catch (err) {
        console.error('[LocalDirectory] Error loading businesses:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBusinesses();
  }, [isGuest]);

  return (
    <PageWrapper>
      <div className="pt-8 pb-24 md:pb-8">
        {/* Hero Section */}
        <section className="relative w-full h-[500px] md:h-[600px] flex flex-col justify-center px-margin-mobile md:px-margin-desktop overflow-hidden">
          <div className="relative z-10 max-w-2xl mt-8">
            <h2 className="font-display-lg text-display-lg text-primary mb-4 leading-tight">Empowering Sistas, <br/><span className="text-secondary">Elevating Community.</span></h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-lg">Discover curated local businesses founded by incredible women. Support local, shop local, and grow together.</p>

            <div className="glass-card rounded-xl p-2 flex items-center gap-2 mb-8 shadow-lg max-w-xl group focus-within:border-primary/30 transition-all">
              <Search className="text-outline-variant ml-3 w-5 h-5" />
              <input className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline-variant font-body-lg outline-none" placeholder="Find Beauty, Wellness, Artisans..." type="text"/>
              <button className="bg-secondary text-on-secondary px-6 py-3 rounded-lg font-title-md hover:brightness-110 active:scale-95 transition-all">
                Search
              </button>
            </div>

            <div className="flex flex-wrap gap-3 overflow-x-auto scrollbar-none pb-2">
              <button className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full font-label-caps text-label-caps flex items-center gap-2 border border-secondary/20">
                <Sparkles className="w-[18px] h-[18px]"/> Beauty
              </button>
              <button className="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-full font-label-caps text-label-caps border border-white/5 hover:border-primary/30 transition-all">
                Wellness
              </button>
              <button className="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-full font-label-caps text-label-caps border border-white/5 hover:border-primary/30 transition-all">
                Handmade
              </button>
              <button className="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-full font-label-caps text-label-caps border border-white/5 hover:border-primary/30 transition-all">
                Creative
              </button>
              <button className="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-full font-label-caps text-label-caps border border-white/5 hover:border-primary/30 transition-all">
                Events
              </button>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent"></div>
        </section>

        {/* Dynamic Business Listing */}
        {businesses.length > 0 && (
          <section className="mt-stack-lg px-margin-mobile md:px-margin-desktop">
            <div className="flex items-end justify-between mb-stack-md">
              <div>
                <span className="font-label-caps text-label-caps text-secondary tracking-widest uppercase">Latest Arrivals</span>
                <h3 className="font-headline-lg text-headline-lg text-on-surface">New to the Circle</h3>
              </div>
              <button className="text-primary font-title-md flex items-center gap-1 hover:underline">
                View All <ChevronRight className="w-5 h-5"/>
              </button>
            </div>
            <div className="flex gap-6 overflow-x-auto scrollbar-none pb-6 -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0">
              {businesses.map((biz) => (
                <div key={biz.id} className="min-w-[280px] group cursor-pointer">
                  <div className="h-40 w-full rounded-xl overflow-hidden mb-3 relative">
                    {biz.image_url ? (
                      <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url('${biz.image_url}')` }}></div>
                    ) : (
                      <div className="absolute inset-0 bg-surface-variant group-hover:scale-105 transition-transform duration-500"></div>
                    )}
                    {biz.is_new && <div className="absolute top-3 left-3 bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-label-caps font-bold">NEW</div>}
                  </div>
                  <h4 className="font-title-md text-on-surface">{biz.name}</h4>
                  <p className="text-body-sm text-on-surface-variant">{biz.category} • {biz.location}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Static Featured Businesses Section (Fallback/Demo) */}
        {businesses.length === 0 && (
          <>
            <section className="mt-stack-lg px-margin-mobile md:px-margin-desktop">
              <div className="flex items-end justify-between mb-stack-md">
                <div>
                  <span className="font-label-caps text-label-caps text-secondary tracking-widest uppercase">Latest Arrivals</span>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface">New to the Circle</h3>
                </div>
                <button className="text-primary font-title-md flex items-center gap-1 hover:underline">
                  View All <ChevronRight className="w-5 h-5"/>
                </button>
              </div>
              <div className="flex gap-6 overflow-x-auto scrollbar-none pb-6 -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0">
                <div className="min-w-[280px] group cursor-pointer">
                  <div className="h-40 w-full rounded-xl overflow-hidden mb-3 relative">
                    <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAx390u7ebZoukLKuglkrpWR_IC_mSXSha5CiVs1lFWSfbLmR6rhn5PpuqmYAodoksLkjGPejhpR62UljlZlcdeH6lx60GNT3p48ubsHs-gF10quhw1GHC2_rHgHw5Opwr2FGXdoh7DyD4CmD-WeXwNerZgX0rdjYdI_ygd2oAPdwTFXhIVE3qMvifqvAzIO52f1CjNbqC9s1D7Eua_OtpkMoYyDQa7gxgYOsImMscfP6qtQ0qsq0Tz1tFvnwpXyMoR-E9LX_bed2k')" }}></div>
                    <div className="absolute top-3 left-3 bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-label-caps font-bold">NEW</div>
                  </div>
                  <h4 className="font-title-md text-on-surface">Flora &amp; Bloom</h4>
                  <p className="text-body-sm text-on-surface-variant">Organic Skincare • Cape Town</p>
                </div>

                <div className="min-w-[280px] group cursor-pointer">
                  <div className="h-40 w-full rounded-xl overflow-hidden mb-3 relative">
                    <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB2S14C2PQyAN3eb2fOq2Pr-oMZU8fDYYY6TywEBTJbcw55CmdSyODV9zSWJ1DiSTZ2-b2K5k6mAUhGwxybae7B6dGW3eB8y_D9yLXriPlrTi3umm3-cNFGUS6Y7obQOjkouOJ6ncmQGZYvh1eGoJY5soXAdYZE9EiY_PZUohrR8HizDaTRxJjBZxBXyHCh_9GNFnYu2M4uPz34l196uTJJljnc1BP-960B9jBOoVHB4bACVti9MyyevB6RS7Z_QgWDOK8yd3eQj-k')" }}></div>
                  </div>
                  <h4 className="font-title-md text-on-surface">Sista Stitches</h4>
                  <p className="text-body-sm text-on-surface-variant">Artisanal Decor • Johannesburg</p>
                </div>
              </div>
            </section>

            <section className="mt-stack-lg px-margin-mobile md:px-margin-desktop mb-12">
              <div className="mb-stack-md text-center max-w-xl mx-auto">
                <span className="font-label-caps text-label-caps text-secondary tracking-widest uppercase">The Gold Standard</span>
                <h3 className="font-headline-lg text-headline-lg text-on-surface">Featured Sista Businesses</h3>
                <p className="text-body-sm text-on-surface-variant mt-2">Celebrating women-led businesses that define excellence and community spirit.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                
                <div className="h-64 glass-card rounded-2xl overflow-hidden group relative">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuANP_Car1sZABnHPQtyOG_3mEeBISeC-m8M6v5KT6aj_F0q3Pru6WiGwg3kV8tAELbXXF3QQsGEYpekDmP3QTIQlx41IkGwdePdY9VhUkLgSGbW-g-KrLkqhXslJvKai2wXN555qgT3IU3QyNclOLT3M4C7ocLYSJFMXlKXKE75XjjhUtUOQEesWyiGzrKt4sd5TdLEMzRP_02p_HjQFIkWrypimiLtgGKo-9QzLJ6oQgEKW8RyAhInHrzinzU94H34T8ZD7_kr7BA')" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent opacity-90"></div>
                  <div className="absolute bottom-0 left-0 p-4 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="text-secondary w-4 h-4" />
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Gold Tier</span>
                    </div>
                    <h4 className="font-title-md text-white leading-tight">Neo-Traditional Couture</h4>
                    <p className="text-on-surface-variant text-[12px]">Bespoke Fashion</p>
                  </div>
                </div>

                <div className="h-64 glass-card rounded-2xl overflow-hidden group relative">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDGK99mgy1sMqhhWiCobne-gthoiIRymwEbCJZvF-Feyo31JCZLc-l0Ka2u1_Uira8-z3kXjw0HeVTLe3CMdMIZMBytrok9yuS1b5R61M3YdQjZuUyAI09ToLbrAnKb3guucWw2QD3q45YVeRfnpuY0px4vMBylBdDqao_Nji__XZyrU1wXgYIMHt65K8OOwIr4fHIR7j6NNTpKQbDvKjD3KXbuX-Etac6QYOEdIGyynSg_o3alciRLbP5X9jvnSiYBMI8pHNBpAHA')" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-0 left-0 p-4 w-full">
                    <h4 className="font-title-md text-white leading-tight">Earth Mother Apothecary</h4>
                    <p className="text-on-surface-variant text-[12px]">Clean Beauty</p>
                  </div>
                </div>

                <div className="h-64 glass-card rounded-2xl overflow-hidden group relative">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAVHrg0xhhhlljEzs0Sq4Die1Koyc2PE9ymsosaTPHjWZmXl1UgKDENmwh9_n3ajJpOugx9cDd8FnMtqskRsb70P2CbQT6_Ou7EIQGw3cH1X4nRY9hpOt6mQOIGycOCDsC5vY5nO9sU2ayLdGdSpkrlLeaAnVyjqRha7Da_0CfrEXSNV6iWgZtaHEhpHY0jLPsfPGFtFRWE1ZwTXyciWWh65Ki45ai25eEMB--iReKn1Yeu_C-Zaadksn0ej_d8cCT6YMcINQd1AIE')" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-0 left-0 p-4 w-full">
                    <h4 className="font-title-md text-white leading-tight">Clay &amp; Soul</h4>
                    <p className="text-on-surface-variant text-[12px]">Handmade Pottery</p>
                  </div>
                </div>

              </div>
            </section>
          </>
        )}

        {/* Premium CTA */}
        <section className="px-margin-mobile md:px-margin-desktop mb-20 mt-12">
          <div className="relative w-full rounded-2xl overflow-hidden p-8 md:p-12 border-2 border-transparent" style={{ background: "linear-gradient(#121410, #121410) padding-box, linear-gradient(to right, #9a006f, #D4827A) border-box" }}>
            <div className="grid md:grid-cols-2 items-center gap-8">
              <div>
                <span className="font-label-caps text-label-caps text-tertiary uppercase tracking-widest">Premium Feature</span>
                <h3 className="font-headline-lg text-headline-lg text-white mt-2">Grow with your personal AI Coach</h3>
                <p className="font-body-lg text-on-surface-variant mt-4">Unlock advanced analytics, market trends, and personalized business coaching designed specifically for the Sista Circle ecosystem.</p>
                <button className="mt-8 bg-white text-surface-dim px-8 py-3 rounded-full font-title-md hover:bg-secondary-fixed transition-all flex items-center gap-2">
                  Explore Premium <Sparkles className="w-5 h-5"/>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
