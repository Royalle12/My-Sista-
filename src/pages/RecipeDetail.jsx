import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { Timer, Activity, Lightbulb, ShoppingBasket, Check, Utensils, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isGuest = useAuthStore((state) => state.isGuest);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        setLoading(true);
        if (isGuest) {
          setRecipe(null);
          return;
        }

        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('[RecipeDetail] Error loading recipe:', error);
          toast.error('Could not load recipe');
        }
        setRecipe(data || null);
      } catch (err) {
        console.error('[RecipeDetail] Exception:', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchRecipe();
  }, [id, isGuest]);

  // Fallback for ingredients and methods if not loaded/offline
  const ingredients = recipe?.ingredients || [
    "500g Fresh garden peas",
    "2 medium onions, finely diced",
    "3 cloves Garlic, minced",
    "1L Vegetable broth",
    "Handful of fresh mint leaves",
    "Olive oil and sea salt"
  ];
  const instructions = recipe?.instructions || [
    "Sauté the finely diced onions and minced garlic in a large heavy-bottomed pot over medium heat with a splash of olive oil until translucent and fragrant.",
    "Add the garden peas and stir well to coat them in the aromatic base. Pour in the vegetable broth and bring the mixture to a gentle simmer.",
    "Lower the heat and let it cook for 15-20 minutes. If you prefer a smoother texture, use an immersion blender to partially blend the stew until the desired consistency is reached.",
    "Stir in chopped fresh mint, season with sea salt, and finish with the Sista Tip: a bright squeeze of lemon juice just before serving."
  ];

  return (
    <PageWrapper>
      <div className="mt-8 relative pb-32">
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
            <div className="h-[353px] md:h-[442px] bg-surface-variant w-full rounded-xl"></div>
            <div className="h-8 bg-surface-variant rounded w-1/3 mt-8"></div>
            <div className="h-64 bg-surface-variant rounded w-full mt-4"></div>
          </div>
        ) : (
          <>
            <div className="relative w-full h-[353px] md:h-[442px] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
              {recipe?.image_url ? (
                <img className="w-full h-full object-cover" alt={recipe.title} src={recipe.image_url}/>
              ) : (
                <img className="w-full h-full object-cover" alt="Heritage Pea Stew" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBADwIMsbos0maAFq5n0HJBrV6uqeLB0_Iqeoa7yZoNvWCc3fiXwlhC1q5VPVoFoBEWqGM_WtdD9g-Y3pdWrjreyOXefBvecPPECV3dDFS8s5oDJrQ3AFFDWVh24e4pYou523zbS6OquB8KVxsM3oiQMklNijMKcViZFXYK4bo02DItbbweikMaDvC0MMS6k3jEvclGQhUZismSOe5bMh8H1oqaKEsYTOzDDT0r_raP1mjiM8ll28RA2VIAPdRjk671eqteuRkMjHg"/>
              )}
              
              <div className="absolute bottom-margin-mobile left-margin-mobile z-20">
                <div className="flex flex-wrap gap-stack-sm mb-stack-sm">
                  <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps flex items-center gap-1">
                    <Timer className="w-[14px] h-[14px]" /> {recipe?.prep_time || '45 mins'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container font-label-caps text-label-caps flex items-center gap-1">
                    <Activity className="w-[14px] h-[14px]" /> {recipe?.difficulty || 'Easy'}
                  </span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">{recipe?.title || 'Heritage Pea Stew'}</h2>
                <div className="mt-base">
                  <span className="text-secondary font-label-caps text-label-caps tracking-wider flex items-center gap-1">
                    🩸 Period Care
                  </span>
                </div>
              </div>
            </div>

            <div className="px-margin-mobile max-w-[1200px] mx-auto space-y-stack-lg mt-stack-lg animate-fade-in">
              <div className="sista-tip-box p-stack-md rounded-xl flex gap-stack-md items-start">
                <Lightbulb className="text-secondary shrink-0" />
                <div>
                  <p className="font-title-md text-title-md text-on-surface mb-base">Sista Tip</p>
                  <p className="text-on-surface-variant font-body-sm text-body-sm">
                    {recipe?.sista_tip || 'Add a squeeze of lemon just before serving to brighten the earthy flavors.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-stack-lg">
                <section className="md:col-span-5 glass-card p-stack-lg rounded-xl">
                  <h3 className="font-title-md text-title-md text-primary mb-stack-md flex items-center gap-stack-sm">
                    <ShoppingBasket className="w-5 h-5" /> Ingredients
                  </h3>
                  <ul className="space-y-stack-md">
                    {ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-center gap-stack-md group cursor-pointer">
                        <div className="w-6 h-6 rounded-md border-2 border-outline flex items-center justify-center group-hover:border-primary transition-colors">
                          <Check className="text-primary w-4 h-4 scale-0 group-active:scale-100 transition-transform" />
                        </div>
                        <span className="text-on-surface-variant font-body-lg text-body-lg">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="md:col-span-7 space-y-stack-md">
                  <h3 className="font-title-md text-title-md text-primary flex items-center gap-stack-sm">
                    <Utensils className="w-5 h-5" /> The Method
                  </h3>
                  <div className="space-y-stack-lg">
                    {instructions.map((step, idx) => (
                      <div key={idx} className="flex gap-stack-lg">
                        <span className="font-display-lg text-display-lg text-secondary/30 shrink-0 select-none">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="pt-2">
                          <p className="text-on-surface-variant font-body-lg text-body-lg">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* More like this */}
              <section className="py-stack-lg border-t border-white/10">
                <div className="flex items-center justify-between mb-stack-md">
                  <h4 className="font-title-md text-title-md text-on-surface">More like this</h4>
                  <Link to="/recipes" className="text-primary font-label-caps text-label-caps hover:underline transition-all">VIEW ALL</Link>
                </div>
                <div className="flex gap-stack-md overflow-x-auto pb-4 -mx-margin-mobile px-margin-mobile scrollbar-none">
                  <div className="min-w-[200px] glass-card rounded-xl overflow-hidden active:scale-95 transition-transform duration-300">
                    <div className="h-32 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD9_OcQfB_obGQtiYQ8ZjyWq_FW1ccM6m47YKK9MSWmKbLz94txMmQCWZPvmApex8HpcLspQgotsY0wAb5do3jP5vVoBDjur_CyzZiFiA6OFhCE7SJLww1FVHa7INindENdHnIK1UdmPLGnUCHm0Cf2U4W5T2T9cIfEaT75tzkYi7YPrLHRfpgJrKWEmeUkvq9Mk3aH2t4jm4Bjok_eWX22N0QkFE01OwKkL_kb0QbTSwmdp_4gFlKAi7gaH00GZe9iCjXDgj-Atdo')" }}></div>
                    <div className="p-3">
                      <p className="font-label-caps text-label-caps text-primary">NUTRITION</p>
                      <p className="font-title-md text-title-md text-sm mt-1">Root Veggie Roast</p>
                    </div>
                  </div>
                  <div className="min-w-[200px] glass-card rounded-xl overflow-hidden active:scale-95 transition-transform duration-300">
                    <div className="h-32 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAD18nkmJ0ECHtgT1EU1OPimMlH62wx8SQBpRxoPsuWISTMKE8qb52oCOuAa7nrfqWSivNOFo5YbpxiPBSz8pxs1joClcPpIl5h98mTS_r1Xy55B24rn6g70bE3yvOTT8FMbW94NwSmQugEH5ppGZgU-w9W4iEURZBRJEYIfYfHHBVVox52VPabODYNlmQ7kDA6uKSoHegH_kE6yT-9nZVdvHdjuhem2U_T5ZuPuIIX1FtmuV3zkkv-Wx8w6cPh3tb9fkqA7mTsvuI')" }}></div>
                    <div className="p-3">
                      <p className="font-label-caps text-label-caps text-primary">VITALITY</p>
                      <p className="font-title-md text-title-md text-sm mt-1">Ancient Grain Bowl</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
