import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { Search, CheckCircle, Sparkles, Filter, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Hormonal Health', 'Doula & Birth', 'Mental Health', 'Nutrition & Diet'];

const MOCK_CREATORS = [
  {
    id: '1',
    user_id: 'mock-1',
    name: 'Dr. Amara Somal',
    page_name: 'dr-amara',
    category: 'Hormonal Health',
    specialty: 'Endocrinology & Perimenopause Specialist',
    bio: 'Dedicated to helping sisters navigate their hormonal journeys and the Second Spring phase with grace, scientific evidence, and natural alignment.',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATHaePK1_3UErBcvgZsTzLyCBywZc9MH_x2nKa6vy8ie8sBSu3mfWFgKVJn-B7Q8xPdi-MecJOzvvkVTFvbOeWdxthnh4zDFpadLmvEcIwcTIF-6nXl0nf6hkvAmxEcJ__FdhzcA2-w19U0l1-1lTRAAa3XYbSGczlV9q_DpBtMdbTcEXSLs5_pUZaKzpI_uasnfGq7x7_Qap7l9MZjan3ELuOqzEQAaQ5rCYPB8BiTD9mkczt9V498LUn2KIaZIiK_4yHP9H22LQ',
    verified: true,
    rating: 4.9,
    location: 'Cape Town, WC'
  },
  {
    id: '2',
    user_id: 'mock-2',
    name: 'Doula Zola Ncube',
    page_name: 'doula-zola',
    category: 'Doula & Birth',
    specialty: 'Holistic Birth Doula & Lactation Consultant',
    bio: 'Providing warm physical, emotional, and informational support to mothers before, during, and shortly after childbirth in the indigenous Zulu tradition.',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKElaPjUVKx2P99LiCyzkkcqlYZ8JCAYdXiV20LQpEOe_joGfpZHo8YZejZBQW--CRIBbYCsKoVGlhra7zSRpNgspgG9pWByLgoP9BekPNbrActzbLMNZyWpJSZnrvKuWc3jOdVAC6x1Jknm_oEFYg9dR3aHykphU3J8bndoDCQOwInD50CBxlQSOtSenX_17RnXDnL2rwbXwaNbuVS9n7kvA7gx_ukI3IstmQjPlmQbVy5OgBiCPVfurKeIQRCiMePl9pEkktHtc',
    verified: true,
    rating: 4.8,
    location: 'Johannesburg, GP'
  },
  {
    id: '3',
    user_id: 'mock-3',
    name: 'Lerato Malebo',
    page_name: 'lerato-nutrition',
    category: 'Nutrition & Diet',
    specialty: 'Clinical Nutritionist & Cycle Sync Expert',
    bio: 'Helping women realign their energy and mood through tailored, nutrient-dense local South African comfort ingredients.',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCevMV_xx0Ogcy3mcJWghVUH6EOC3RTPI_AkRkJFEOddHF5exq0eD77Li0fVAFjAFdpCzv9QiY6ppDeXgRsIDdTsEJmd3aHRmR6g5s54YWwFag5FqSonXPkpJ3-armFHb6hN9oi__5JPU0tYSFRkk8Nz37syQuDWKb9UlVFcUNRq_6-AAYpE-E0qqoOlgf4eOVh8IudaAoxFX4jQMWGh2zEv5htFeNa38NUR7YEWh1sosXIf8t8tiTX8me7MSnZmSUOHMfk3BXlGIM',
    verified: true,
    rating: 4.7,
    location: 'Durban, KZN'
  }
];

export default function Discover() {
  const isGuest = useAuthStore((state) => state.isGuest);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function fetchCreators() {
      try {
        setLoading(true);
        if (isGuest) {
          setCreators(MOCK_CREATORS);
          return;
        }

        const { data, error } = await supabase
          .from('creator_profiles')
          .select('*')
          .eq('verified', true);

        if (error) {
          // If table doesn't exist yet, fall back gracefully
          console.warn('[Discover] Table creator_profiles not ready, falling back to mock data.');
          setCreators(MOCK_CREATORS);
        } else {
          setCreators(data && data.length > 0 ? data : MOCK_CREATORS);
        }
      } catch (err) {
        console.error('[Discover] Fetch exception:', err);
        setCreators(MOCK_CREATORS);
      } finally {
        setLoading(false);
      }
    }

    fetchCreators();
  }, [isGuest]);

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch =
      creator.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.bio?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || creator.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <PageWrapper>
      <div className="pt-8 pb-24 px-margin-mobile max-w-7xl mx-auto min-h-screen space-y-8">
        {/* Header */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-full bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </span>
            <span className="font-label-caps text-label-caps text-[#D4827A] tracking-wider uppercase">Sista Circle Experts</span>
          </div>
          <h2 className="font-display-lg text-headline-lg text-primary">Discover Verified Creators</h2>
          <p className="text-on-surface-variant font-body-lg max-w-2xl">
            Connect with verified practitioners, wellness coaches, doulas, and experts dedicated to supporting your unique journey.
          </p>
        </section>

        {/* Search and Filters */}
        <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md glass-card rounded-xl border border-outline/10 flex items-center px-3 py-2">
            <Search className="w-5 h-5 text-outline-variant mr-2" />
            <input
              type="text"
              placeholder="Search experts, specialties, bios..."
              className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline-variant text-body-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto py-1">
            <Filter className="w-4 h-4 text-outline-variant flex-shrink-0" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-label-caps text-label-caps transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Creators Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
            <p className="text-on-surface-variant text-body-sm font-label-caps">Loading Sista experts...</p>
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center max-w-md mx-auto space-y-4">
            <p className="text-on-surface-variant text-body-lg">No experts found matching your filter criteria.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-caps text-label-caps"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className="glass-card rounded-2xl border border-outline/10 overflow-hidden flex flex-col justify-between hover:border-primary/40 transition-all duration-300 group"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 bg-surface-container-high flex-shrink-0">
                      <img
                        src={creator.image_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'}
                        alt={creator.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-title-md text-on-surface group-hover:text-primary transition-colors">{creator.name}</h3>
                        {creator.verified && (
                          <CheckCircle className="w-4 h-4 text-secondary fill-secondary/10 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[#D4827A] font-semibold text-xs mt-0.5">{creator.specialty}</p>
                      <p className="text-on-surface-variant text-[11px] font-label-caps uppercase mt-1">{creator.category}</p>
                    </div>
                  </div>

                  <p className="text-on-surface-variant text-body-sm line-clamp-3 leading-relaxed">
                    {creator.bio}
                  </p>
                </div>

                <div className="px-6 py-4 bg-surface-container-low border-t border-outline/5 flex items-center justify-between">
                  <span className="text-on-surface-variant text-xs flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-secondary fill-secondary/10" />
                    Rating: {creator.rating || 'New'}
                  </span>

                  <Link
                    to={`/c/${creator.page_name}`}
                    className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary px-4 py-2 rounded-xl text-xs font-label-caps text-label-caps transition-all"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
