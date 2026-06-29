import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Recipes() {
  const isGuest = useAuthStore((state) => state.isGuest);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        if (isGuest) {
          setRecipes([]);
          return;
        }
        
        const { data, error } = await supabase
          .from('recipes')
          .select('*');

        if (error) throw error;
        setRecipes(data || []);
      } catch (err) {
        console.error('[Recipes] Error loading recipes:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [isGuest]);

  return (
    <PageWrapper>
      <div className="pt-8 pb-32 px-margin-mobile max-w-7xl mx-auto min-h-screen">
        <section className="mb-stack-lg">
          <div className="mb-2">
            <span className="font-label-caps text-label-caps text-[#D4827A] tracking-widest uppercase">Rainbow Nation Nourishment</span>
          </div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">Comfort Food Hub</h2>
          <p className="text-on-surface-variant font-body-sm max-w-md">Celebrating the diverse flavours of our sisterhood. Healing recipes from across South Africa, tailored for your cycle and your soul.</p>
        </section>

        <nav className="sticky top-16 z-40 bg-background/95 py-4 -mx-margin-mobile px-margin-mobile overflow-x-auto scrollbar-none">
          <div className="flex gap-6 whitespace-nowrap items-center">
            <div className="flex flex-col gap-1 items-center">
              <span className="font-label-caps text-label-caps text-on-surface transition-colors cursor-pointer">Heritage Flavours</span>
              <div className="w-full h-1 bg-primary rounded-full"></div>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Cape Malay</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Durban Spice</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Farmhouse Classics</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Cycle-Syncing</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Banting Friendly</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Wellness Treats</span>
          </div>
        </nav>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter mt-stack-md">
          {recipes.length > 0 ? (
            recipes.map(recipe => (
              <div key={recipe.id} className="glass-card rounded-xl overflow-hidden group cursor-pointer transition-transform active:scale-95 duration-200">
                <div className="relative aspect-square">
                  {recipe.image_url ? (
                    <img alt={recipe.title} className="w-full h-full object-cover" src={recipe.image_url}/>
                  ) : (
                    <div className="w-full h-full bg-surface-variant" />
                  )}
                  <div className="absolute top-2 right-2 bg-background/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                    <span className="text-[10px] font-bold text-white uppercase">{recipe.difficulty || 'Easy'}</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-title-md text-on-surface line-clamp-1 mb-1">
                    <Link to={`/recipes/${recipe.id}`}>{recipe.title}</Link>
                  </h3>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
                    <span className="font-label-caps text-[10px] text-on-surface-variant">{recipe.prep_time || '30 MINS'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              {/* Fallback Static Items */}
              <div className="glass-card rounded-xl overflow-hidden group cursor-pointer transition-transform active:scale-95 duration-200">
                <div className="relative aspect-square">
                  <img alt="Heritage Pea Stew" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK37b_jUJ4QIFrIOFygJj3KnX7E-j88AhomyGQoNIkamClYRdrToZUpToPYmfC6xbRwRu95fyauijVea5qighg_g1N7ZxbovgcDKiZ4vYj0T9TD1QMlTAdAOCw3AW3yyTar_Ev3KgdtqU8O1xXqnl9Ep3G8LTHWjfH-xQF0tMfWuX9H3t5rgf0ionB8UfzXdlVMDOpJMyQwuacnCkc8nSXOtxVNRusiZzy5yJCfETfhTgc6eeXmu08mvuuY3GAnzGn5fIR5qRPr0c"/>
                  <div className="absolute top-2 right-2 bg-background/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                    <span className="text-[10px] font-bold text-white uppercase">Easy</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-title-md text-on-surface line-clamp-1 mb-1">Heritage Pea Stew</h3>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
                    <span className="font-label-caps text-[10px] text-on-surface-variant">45 MINS</span>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl overflow-hidden group cursor-pointer transition-transform active:scale-95 duration-200">
                <div className="relative aspect-square">
                  <img alt="Cape Malay Vegetable Curry" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnOVVhw3UQ9UeolZSn_RADOCi6G6ZpnHXMUqFfRPTCqMx4FSSFBydqTe7Hj0iLB5DYa9gfRIwyBtzDPh_08jzdjELW_wb-WkG2ycfLMqSrGPL6dv-bBSTeAxJrLqAUcxh-PgYwjr4UuIVpYd_EbfCKS4YECgQgYsLl_HdaIm0hhwOCDUT0EpI8DmpFQutuwpDaV6LX3cSI3HyhrUVKtpuKipvEDXEMvRWwWF3v6leNOVGgIleKdDEZzZPycuWMjkBj-nL8CcFlnFA"/>
                  <div className="absolute top-2 right-2 bg-background/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span className="text-[10px] font-bold text-white uppercase">Med</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-title-md text-on-surface line-clamp-1 mb-1">Cape Malay Veg Curry</h3>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
                    <span className="font-label-caps text-[10px] text-on-surface-variant">35 MINS</span>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl overflow-hidden group cursor-pointer transition-transform active:scale-95 duration-200">
                <div className="relative aspect-square">
                  <img alt="Protein-Rich Biltong Salad" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyqnkJdJ0DXjT3mBjp-PNHJCobS4Tnk8qV9Wk8YIGXUc5P43xP5OAK160OMHrCy59ehi4ZCU0f31SDWhQBTTcgkQqyhjY1jiX-VdksMpjQkeEPY5aaOXKeEQwN7Orwk0Px8hEVlUHN_JiuKs2dFoCoQ2pBOL3e3XiQ3OjJxi1kc9q5fPSwT45xT7hjZQMjQyoM4FDXtdr1Pxb8f1Yq5tcS-emAWOSUoKKKYIYZ0cbPP2mQJgmSoPjC6VLd7ew2FdMQAG_qkzVGhB8"/>
                  <div className="absolute top-2 right-2 bg-background/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                    <span className="text-[10px] font-bold text-white uppercase">Quick</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-title-md text-on-surface line-clamp-1 mb-1">Iron-Boost Biltong Salad</h3>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
                    <span className="font-label-caps text-[10px] text-on-surface-variant">10 MINS</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-stack-lg p-[1px] rounded-2xl bg-gradient-to-r from-purple-500 to-[#D4827A]">
          <div className="bg-surface-container-low rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h4 className="font-title-md text-on-surface mb-2">Can't decide? Ask your Coach.</h4>
              <p className="text-on-surface-variant font-body-sm">Our AI Coach understands your cultural preferences and cycle phase. Find your perfect South African comfort dish today.</p>
            </div>
            <Link to="/coach" className="bg-[#D4827A] text-white px-8 py-3 rounded-full font-label-caps text-label-caps hover:brightness-110 transition-all active:scale-95">
              START CHAT
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
