import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { ChevronLeft, CheckCircle, Star, Calendar, MessageSquare, Award, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_CREATORS = [
  {
    id: '1',
    user_id: 'mock-1',
    name: 'Dr. Amara Somal',
    page_name: 'dr-amara',
    category: 'Hormonal Health',
    specialty: 'Endocrinology & Perimenopause Specialist',
    bio: 'Dedicated to helping sisters navigate their hormonal journeys and the Second Spring phase with grace, scientific evidence, and natural alignment. Over 15 years of clinical practice in women endocrinology.',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATHaePK1_3UErBcvgZsTzLyCBywZc9MH_x2nKa6vy8ie8sBSu3mfWFgKVJn-B7Q8xPdi-MecJOzvvkVTFvbOeWdxthnh4zDFpadLmvEcIwcTIF-6nXl0nf6hkvAmxEcJ__FdhzcA2-w19U0l1-1lTRAAa3XYbSGczlV9q_DpBtMdbTcEXSLs5_pUZaKzpI_uasnfGq7x7_Qap7l9MZjan3ELuOqzEQAaQ5rCYPB8BiTD9mkczt9V498LUn2KIaZIiK_4yHP9H22LQ',
    verified: true,
    rating: 4.9,
    location: 'Cape Town, WC',
    certifications: ['MBChB (UCT)', 'FCP(SA) Endocrinology', 'Member of North American Menopause Society (NAMS)'],
    articles: [
      { title: 'Navigating the Second Spring: A Practical Guide to Perimenopause', slug: 'navigating-the-second-spring' },
      { title: 'Estrogen, Progesterone and Your Mood', slug: 'estrogen-progesterone-mood' }
    ]
  },
  {
    id: '2',
    user_id: 'mock-2',
    name: 'Doula Zola Ncube',
    page_name: 'doula-zola',
    category: 'Doula & Birth',
    specialty: 'Holistic Birth Doula & Lactation Consultant',
    bio: 'Providing warm physical, emotional, and informational support to mothers before, during, and shortly after childbirth in the indigenous Zulu tradition. Believer in collective care and traditional womb healing.',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKElaPjUVKx2P99LiCyzkkcqlYZ8JCAYdXiV20LQpEOe_joGfpZHo8YZejZBQW--CRIBbYCsKoVGlhra7zSRpNgspgG9pWByLgoP9BekPNbrActzbLMNZyWpJSZnrvKuWc3jOdVAC6x1Jknm_oEFYg9dR3aHykphU3J8bndoDCQOwInD50CBxlQSOtSenX_17RnXDnL2rwbXwaNbuVS9n7kvA7gx_ukI3IstmQjPlmQbVy5OgBiCPVfurKeIQRCiMePl9pEkktHtc',
    verified: true,
    rating: 4.8,
    location: 'Johannesburg, GP',
    certifications: ['DONA Certified Birth Doula', 'Certified Womb Healing Practitioner', 'IBCLC Lactation Consultant'],
    articles: [
      { title: 'The Village Mentality: Postpartum Care for Our Sisters', slug: 'postpartum-village-care' },
      { title: 'Traditional Zulu Herbs for Pregnancy Support', slug: 'traditional-pregnancy-herbs' }
    ]
  },
  {
    id: '3',
    user_id: 'mock-3',
    name: 'Lerato Malebo',
    page_name: 'lerato-nutrition',
    category: 'Nutrition & Diet',
    specialty: 'Clinical Nutritionist & Cycle Sync Expert',
    bio: 'Helping women realign their energy and mood through tailored, nutrient-dense local South African comfort ingredients. Focus on anti-inflammatory gut health and hormone syncing.',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCevMV_xx0Ogcy3mcJWghVUH6EOC3RTPI_AkRkJFEOddHF5exq0eD77Li0fVAFjAFdpCzv9QiY6ppDeXgRsIDdTsEJmd3aHRmR6g5s54YWwFag5FqSonXPkpJ3-armFHb6hN9oi__5JPU0tYSFRkk8Nz37syQuDWKb9UlVFcUNRq_6-AAYpE-E0qqoOlgf4eOVh8IudaAoxFX4jQMWGh2zEv5htFeNa38NUR7YEWh1sosXIf8t8tiTX8me7MSnZmSUOHMfk3BXlGIM',
    verified: true,
    rating: 4.7,
    location: 'Durban, KZN',
    certifications: ['BSc Dietetics (UKZN)', 'Functional Nutrition Certification', 'Cycle Syncing Specialist Course'],
    articles: [
      { title: 'Healing Comfort Foods: Adapting Heritage Dishes for Cycle Syncing', slug: 'healing-comfort-foods-syncing' },
      { title: 'Stabilizing Your Blood Sugar During the Luteal Phase', slug: 'stabilizing-blood-sugar' }
    ]
  }
];

export default function CreatorPage() {
  const { page_name } = useParams();
  const navigate = useNavigate();
  const isGuest = useAuthStore((state) => state.isGuest);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  useEffect(() => {
    async function fetchCreator() {
      try {
        setLoading(true);
        if (isGuest) {
          const matched = MOCK_CREATORS.find((c) => c.page_name === page_name);
          setCreator(matched || null);
          return;
        }

        const { data, error } = await supabase
          .from('creator_profiles')
          .select('*')
          .eq('page_name', page_name)
          .single();

        if (error) {
          console.warn('[CreatorPage] Supabase single query failed, trying mock matching.');
          const matched = MOCK_CREATORS.find((c) => c.page_name === page_name);
          setCreator(matched || null);
        } else {
          // If live creator found but no mock articles/certifications, populate standard defaults
          const matchedMock = MOCK_CREATORS.find((c) => c.page_name === page_name);
          setCreator({
            ...data,
            certifications: data.certifications || matchedMock?.certifications || ['Certified Wellness Practitioner'],
            articles: matchedMock?.articles || [
              { title: 'Wellness and Hormone Syncing 101', slug: 'wellness-syncing-101' }
            ]
          });
        }
      } catch (err) {
        console.error('[CreatorPage] Exception loading creator:', err);
        const matched = MOCK_CREATORS.find((c) => c.page_name === page_name);
        setCreator(matched || null);
      } finally {
        setLoading(false);
      }
    }

    if (page_name) {
      fetchCreator();
    }
  }, [page_name, isGuest]);

  const handleBookConsultation = (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime) {
      toast.error('Please select both date and time.');
      return;
    }
    toast.success(`Consultation request sent to ${creator.name} for ${bookingDate} at ${bookingTime}!`);
    setBookingDate('');
    setBookingTime('');
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
          <p className="text-on-surface-variant text-body-sm font-label-caps">Loading profile...</p>
        </div>
      </PageWrapper>
    );
  }

  if (!creator) {
    return (
      <PageWrapper>
        <div className="max-w-md mx-auto py-20 text-center space-y-6">
          <h2 className="font-display-lg text-headline-lg text-primary">Creator Not Found</h2>
          <p className="text-on-surface-variant">We couldn't locate a creator page matching "{page_name}".</p>
          <button
            onClick={() => navigate('/discover')}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-caps text-label-caps"
          >
            Back to Discover
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-margin-mobile pt-4 pb-24 space-y-8">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/discover')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-label-caps"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Discover
        </button>

        {/* Creator Hero Header */}
        <section className="glass-card rounded-2xl p-6 md:p-8 border border-outline/10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-surface-container-high flex-shrink-0">
            <img
              src={creator.image_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'}
              alt={creator.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center md:text-left space-y-3 flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
              <h2 className="font-display-lg text-headline-lg text-primary">{creator.name}</h2>
              {creator.verified && (
                <div className="flex items-center justify-center gap-1 bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-full text-xs font-label-caps border border-secondary/20 w-fit mx-auto md:mx-0">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified Expert
                </div>
              )}
            </div>
            <p className="text-[#D4827A] font-semibold text-sm">{creator.specialty}</p>
            <p className="text-on-surface-variant text-body-sm leading-relaxed max-w-2xl">{creator.bio}</p>

            <div className="flex flex-wrap gap-4 pt-2 justify-center md:justify-start text-xs text-on-surface-variant font-label-caps">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {creator.rating || 'New'} Rating
              </span>
              <span>•</span>
              <span>{creator.location || 'South Africa'}</span>
              <span>•</span>
              <span>{creator.category}</span>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main info panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Certifications */}
            <section className="glass-card rounded-2xl p-6 border border-outline/10 space-y-4">
              <h3 className="font-title-md text-primary flex items-center gap-2">
                <Award className="w-5 h-5" /> Certifications & Credentials
              </h3>
              <ul className="space-y-3">
                {creator.certifications?.map((cert, index) => (
                  <li key={index} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                    <ShieldCheck className="w-4 h-4 text-[#D4827A] mt-0.5 flex-shrink-0" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Authored Articles */}
            <section className="glass-card rounded-2xl p-6 border border-outline/10 space-y-4">
              <h3 className="font-title-md text-primary flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Articles & Contributions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {creator.articles?.map((article, index) => (
                  <Link
                    key={index}
                    to={`/article/${article.slug}`}
                    className="p-4 rounded-xl bg-surface-container-low hover:border-primary/30 border border-transparent transition-all space-y-2 flex flex-col justify-between"
                  >
                    <h4 className="font-title-sm text-on-surface line-clamp-2">{article.title}</h4>
                    <span className="text-[#D4827A] text-xs flex items-center gap-1 font-label-caps mt-2">
                      Read Article <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Action Consultation Widget */}
          <div className="space-y-6">
            <section className="glass-card rounded-2xl p-6 border border-outline/10 space-y-4 bg-gradient-to-br from-surface-container-low to-primary/5">
              <h3 className="font-title-md text-primary flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Book Consultation
              </h3>
              <p className="text-on-surface-variant text-body-sm leading-relaxed">
                Connect directly for a personalized wellness coaching session tailored for your cycle and needs.
              </p>

              <form onSubmit={handleBookConsultation} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-label-caps text-on-surface-variant mb-1 uppercase">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-surface-container-high border border-outline/10 rounded-xl px-3 py-2 text-on-surface text-body-sm focus:border-primary focus:ring-0"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-label-caps text-on-surface-variant mb-1 uppercase">Time</label>
                  <input
                    type="time"
                    required
                    className="w-full bg-surface-container-high border border-outline/10 rounded-xl px-3 py-2 text-on-surface text-body-sm focus:border-primary focus:ring-0"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover text-on-primary py-2.5 rounded-xl font-label-caps text-label-caps transition-all"
                >
                  Request Consultation
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
