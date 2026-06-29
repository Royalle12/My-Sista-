import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { Copy, Gift, Link2, DollarSign, Award, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_REFERRALS = [
  { id: '1', date: '2026-06-20', email: 'thandi***@gmail.com', status: 'Completed', reward: 50 },
  { id: '2', date: '2026-06-22', email: 'zama***@yahoo.com', status: 'Completed', reward: 50 },
  { id: '3', date: '2026-06-24', email: 'noluth***@gmail.com', status: 'Pending', reward: 0 }
];

export default function AffiliateDashboard() {
  const { user, isGuest } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState(MOCK_REFERRALS);
  const [copied, setCopied] = useState(false);

  const refLink = `https://mysista.co.za/invite?ref=${user?.id || 'guest123'}`;

  useEffect(() => {
    async function loadAffiliateData() {
      try {
        setLoading(true);
        if (isGuest) {
          setReferrals(MOCK_REFERRALS);
          return;
        }

        const { data, error } = await supabase
          .from('affiliate_links')
          .select('*')
          .eq('user_id', user?.id);

        if (error) {
          console.warn('[AffiliateDashboard] Database fetch failed, using mock referrals.');
          setReferrals(MOCK_REFERRALS);
        } else {
          setReferrals(data && data.length > 0 ? data : MOCK_REFERRALS);
        }
      } catch (err) {
        console.error('[AffiliateDashboard] Exception loading data:', err);
        setReferrals(MOCK_REFERRALS);
      } finally {
        setLoading(false);
      }
    }

    loadAffiliateData();
  }, [user, isGuest]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const totalCredits = referrals.reduce((sum, item) => sum + (item.reward || 0), 0);

  return (
    <PageWrapper>
      <div className="pt-8 pb-24 px-margin-mobile max-w-4xl mx-auto space-y-8 min-h-screen">
        {/* Header */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-primary/10 text-primary">
              <Gift className="w-4 h-4" />
            </span>
            <span className="font-label-caps text-label-caps text-[#D4827A] tracking-wider uppercase">Affiliate Circle</span>
          </div>
          <h2 className="font-display-lg text-headline-lg text-primary">Sista Referral Rewards</h2>
          <p className="text-on-surface-variant font-body-sm">Spread the word about My Sista and earn credits when friends join the circle.</p>
        </section>

        {/* Copy Referral Widget */}
        <section className="glass-card rounded-2xl p-6 md:p-8 border border-outline/10 bg-gradient-to-br from-surface-container-low to-primary/5 space-y-4">
          <h3 className="font-title-sm text-on-surface">Share Your Unique Invitation Link</h3>
          <p className="text-on-surface-variant text-body-sm">
            For every sister who completes onboarding using your link, you both receive 50 Sista Credits.
          </p>

          <div className="flex items-center bg-surface-container border border-outline/10 rounded-xl p-2.5 shadow-inner">
            <Link2 className="w-4 h-4 text-outline-variant mr-2.5 flex-shrink-0" />
            <input
              type="text"
              readOnly
              className="bg-transparent border-none focus:ring-0 w-full text-on-surface text-body-sm select-all pr-4 truncate"
              value={refLink}
            />
            <button
              onClick={handleCopyLink}
              className="bg-primary hover:bg-primary-hover text-on-primary px-4 py-2 rounded-lg font-label-caps text-xs flex items-center gap-1.5 transition-all active:scale-95 flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-xl p-5 border border-outline/10 space-y-2">
            <DollarSign className="w-5 h-5 text-secondary" />
            <p className="text-[10px] font-label-caps text-on-surface-variant uppercase">Credits Earned</p>
            <h3 className="font-title-lg text-on-surface">{totalCredits} Credits</h3>
          </div>

          <div className="glass-card rounded-xl p-5 border border-outline/10 space-y-2">
            <Award className="w-5 h-5 text-secondary" />
            <p className="text-[10px] font-label-caps text-on-surface-variant uppercase">Invites Completed</p>
            <h3 className="font-title-lg text-on-surface">
              {referrals.filter((r) => r.status === 'Completed').length} Sisters
            </h3>
          </div>

          <div className="glass-card rounded-xl p-5 border border-outline/10 space-y-2">
            <Link2 className="w-5 h-5 text-secondary" />
            <p className="text-[10px] font-label-caps text-on-surface-variant uppercase">Status</p>
            <h3 className="font-title-lg text-on-surface">Active Member</h3>
          </div>
        </section>

        {/* Referral Log Table */}
        {!loading && (
          <section className="glass-card rounded-2xl p-6 border border-outline/10 space-y-4">
            <h3 className="font-title-sm text-primary font-label-caps">Referral History</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead>
                  <tr className="border-b border-outline/10 text-on-surface-variant text-[11px] font-label-caps">
                    <th className="pb-3 font-semibold">Date Joined</th>
                    <th className="pb-3 font-semibold">Email Account</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Reward Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/5">
                  {referrals.map((item) => (
                    <tr key={item.id} className="text-on-surface">
                      <td className="py-3.5">
                        {new Date(item.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 font-mono">{item.email || 'thandi***@gmail.com'}</td>
                      <td className="py-3.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-label-caps uppercase ${
                            item.status === 'Completed'
                              ? 'bg-secondary/15 text-secondary border border-secondary/20'
                              : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-semibold">
                        {item.reward > 0 ? `+${item.reward} Credits` : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  );
}
