import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { CheckCircle, Share2, Heart, Star, Clock, Phone, Mail, Globe, Camera, Globe2, MessageSquare, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isGuest = useAuthStore((state) => state.isGuest);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusiness() {
      try {
        setLoading(true);
        if (isGuest) {
          setBusiness(null);
          return;
        }

        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('[BusinessDetail] Error loading business:', error);
          toast.error('Could not load business details');
        }
        setBusiness(data || null);
      } catch (err) {
        console.error('[BusinessDetail] Exception:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchBusiness();
  }, [id, isGuest]);

  return (
    <PageWrapper>
      <div className="pt-8 relative pb-32">
        <div className="absolute top-4 left-4 z-50">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1 text-white hover:text-primary transition-colors text-sm font-semibold drop-shadow-md bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse px-margin-mobile">
            <div className="h-[353px] bg-surface-variant w-full rounded-xl"></div>
            <div className="h-24 w-24 rounded-2xl bg-surface-variant -mt-10 mb-4 z-20 relative"></div>
            <div className="h-8 bg-surface-variant rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-surface-variant rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-surface-variant rounded w-full"></div>
          </div>
        ) : (
          <>
            <section className="relative h-[353px] w-full overflow-hidden">
              {business?.cover_image_url ? (
                <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${business.cover_image_url}')` }}></div>
              ) : (
                <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZdAIyxAErSsuYpscKGom5_kVxTGNVUcbeINE_HYTjHKn-Ub0FV797h2mJqyX8AnuLKqnolqMpTGNK3F1VeZtAf3_geJ5pvUED0ZwxPtyyVvdd0EtksiwufkfIrdOO_U_2MIS70ll4m4QMZAJBFxupxGkX3vSOlZIcMF_PBsilBeLuVRRKE4g_pERx0de_PVWCux3LLkV752gDqH0G-3kHBIDmfR2VERthc2jnAwbqVuFNvhuuqBitY8ylbr5gzgRtnZU-Kn-dfnY')" }}></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>

              <div className="absolute bottom-margin-mobile left-margin-mobile flex items-center gap-2 bg-primary/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/30">
                <CheckCircle className="text-[18px] text-primary fill-primary/20 w-4 h-4" />
                <span className="font-label-caps text-label-caps text-primary">Verified Sista Business</span>
              </div>
            </section>

            <div className="px-margin-mobile -mt-10 relative z-10 animate-fade-in max-w-3xl mx-auto">
              <div className="flex items-end justify-between mb-stack-md">
                <div className="w-24 h-24 rounded-2xl overflow-hidden glass-card border border-primary/30 p-2 bg-surface">
                  {business?.logo_url ? (
                    <img className="w-full h-full object-cover rounded-xl" alt="Logo" src={business.logo_url}/>
                  ) : (
                    <img className="w-full h-full object-cover rounded-xl" alt="Logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-XF50IezE1YqzOYQQUxYov26XHQydORyd50fAQbycNqNDM5hgh2gaP9_q5EyPKA3WRxZeFI_P8ayAHLtINuWgO2RrzFQd7Iq1vKI_2FyNACELBlmiJFAIr2AcCwuTmiu7enR5uczKVkPC90l-Us24b3wIzB5H1eEaVPxKFFB1q5BwsRHg6kuLuq_aSNyfoyWnthTtEoahzvnZPUXaT7Pi3-niHF9qi8cN5sWeOW_eKi16HafNGe2_X51wnuNmcSBIDDeYi5MG6RE"/>
                  )}
                </div>
                <div className="flex gap-stack-sm mb-2">
                  <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-primary active:scale-90 transition-transform">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-primary active:scale-90 transition-transform">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">{business?.name || 'Zahara Artisans'}</h2>
              <p className="text-primary font-title-md mb-stack-lg">{business?.category || 'Heritage Craft & Curated Home'}</p>

              <div className="grid grid-cols-2 gap-4 mb-stack-lg">
                <div className="glass-card p-4 rounded-xl flex flex-col gap-1">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">RATING</span>
                  <div className="flex items-center gap-1">
                    <span className="text-title-md text-on-surface">{business?.rating || '4.9'}</span>
                    <Star className="text-secondary fill-secondary w-4 h-4" />
                    <span className="text-body-sm text-on-surface-variant">({business?.reviews_count || '128'})</span>
                  </div>
                </div>
                <div className="glass-card p-4 rounded-xl flex flex-col gap-1">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">EXPERIENCE</span>
                  <span className="text-title-md text-on-surface">{business?.experience || '15+ Years'}</span>
                </div>
              </div>

              <div className="space-y-stack-md mb-stack-lg">
                <h3 className="font-title-md text-title-md text-on-surface">Our Heritage</h3>
                <p className="text-on-surface-variant font-body-lg leading-relaxed">
                  {business?.description || 'Founded in the heart of Johannesburg, Zahara Artisans is a sanctuary for traditional South African craftsmanship. We bridge the gap between ancient weaving techniques and modern interior aesthetics, ensuring that every piece tells a story of cultural resilience and maternal grace. Our collective supports over 50 local women artisans, providing a sustainable platform for their heirloom skills.'}
                </p>
                <div className="flex gap-2 overflow-x-auto scrollbar-none py-2">
                  <span className="px-4 py-2 rounded-full border border-outline-variant text-label-caps text-on-surface-variant whitespace-nowrap bg-surface-container-low">Sustainable Wood</span>
                  <span className="px-4 py-2 rounded-full border border-outline-variant text-label-caps text-on-surface-variant whitespace-nowrap bg-surface-container-low">Hand-Woven</span>
                  <span className="px-4 py-2 rounded-full border border-outline-variant text-label-caps text-on-surface-variant whitespace-nowrap bg-surface-container-low">Fair Trade</span>
                </div>
              </div>

              <div className="glass-card p-margin-mobile rounded-2xl mb-stack-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="text-primary w-5 h-5" />
                  <h3 className="font-title-md text-title-md text-on-surface">Operating Hours</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-body-sm">
                    <span className="text-on-surface-variant">Mon - Fri</span>
                    <span className="text-on-surface">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center text-body-sm">
                    <span className="text-on-surface-variant">Saturday</span>
                    <span className="text-on-surface">10:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between items-center text-body-sm">
                    <span className="text-on-surface-variant">Sunday</span>
                    <span className="text-error">Closed</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-stack-lg">
                <h3 className="font-title-md text-title-md text-on-surface px-1">Connect with Us</h3>
                <div className="grid grid-cols-1 gap-3">
                  <a className="flex items-center gap-4 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors" href={business?.phone ? `tel:${business.phone}` : "tel:+27112345678"}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-label-caps text-label-caps text-on-surface-variant">PHONE</p>
                      <p className="text-on-surface">{business?.phone || '+27 11 234 5678'}</p>
                    </div>
                  </a>
                  <a className="flex items-center gap-4 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors" href={business?.email ? `mailto:${business.email}` : "mailto:hello@zahara.co.za"}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-label-caps text-label-caps text-on-surface-variant">EMAIL</p>
                      <p className="text-on-surface">{business?.email || 'hello@zahara.co.za'}</p>
                    </div>
                  </a>
                </div>
                <div className="flex justify-center gap-6 py-4">
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
                    <Globe className="w-6 h-6" />
                  </a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
                    <Camera className="w-6 h-6" />
                  </a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
                    <Globe2 className="w-6 h-6" />
                  </a>
                </div>
              </div>

              <div className="fixed bottom-20 left-0 w-full px-margin-mobile z-40 md:relative md:bottom-0 md:px-0">
                <button className="w-full h-14 bg-secondary text-on-secondary font-title-md rounded-2xl shadow-[0_0_20px_rgba(212,130,122,0.15)] flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <MessageSquare className="w-5 h-5" /> Leave a review
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
