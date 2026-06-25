/**
 * src/pages/Safety.jsx
 * Screen 1 — Safety & Discreet Mode
 * Tables: safety_signals, trusted_contacts, profiles
 */

import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../lib/supabase.js';
import {
  Shield, Phone, Plus, Trash2, AlertTriangle,
  MapPin, Clock, CheckCircle, X, User, Heart
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Safety() {
  const { user, profile, isGuest } = useAuth();

  const [contacts, setContacts] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [sendingSignal, setSendingSignal] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '', phone: '', email: '', relationship: ''
  });

  // Load trusted contacts and recent safety signals
  useEffect(() => {
    if (!user?.id) return;
    loadContacts();
    loadSignals();
  }, [user?.id]);

  const loadContacts = async () => {
    try {
      setLoadingContacts(true);
      if (isGuest) {
        const stored = localStorage.getItem('mysista-trusted-contacts');
        setContacts(stored ? JSON.parse(stored) : []);
        return;
      }
      const { data, error } = await supabase
        .from('trusted_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error('[Safety] load contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const loadSignals = async () => {
    if (isGuest) return;
    try {
      const { data, error } = await supabase
        .from('safety_signals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      setSignals(data || []);
    } catch (err) {
      console.error('[Safety] load signals:', err);
    }
  };

  // One-tap safety signal with geolocation
  const handleSendSignal = async () => {
    if (sendingSignal) return;
    setSendingSignal(true);

    try {
      let latitude = null;
      let longitude = null;
      let address = null;

      // Request geolocation
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
        address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      } catch {
        address = 'Location unavailable';
      }

      if (isGuest) {
        toast.success('Safety signal sent to your trusted circle 🛡️ (Guest Mode)');
        setSendingSignal(false);
        return;
      }

      const { error } = await supabase.from('safety_signals').insert([{
        user_id: user.id,
        latitude,
        longitude,
        address,
        note: `Safety signal from ${profile?.display_name ?? 'Sista'}`,
      }]);
      if (error) throw error;

      await loadSignals();
      toast.success('Safety signal sent to your trusted circle 🛡️');
    } catch (err) {
      console.error('[Safety] send signal:', err);
      toast.error('Failed to send safety signal. Try again.');
    } finally {
      setSendingSignal(false);
    }
  };

  // Add a trusted contact
  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!contactForm.name) {
      toast.error('Contact name is required.');
      return;
    }
    try {
      if (isGuest) {
        const newContact = {
          id: 'c-' + Date.now(),
          user_id: 'guest-sista',
          ...contactForm,
          created_at: new Date().toISOString()
        };
        const updated = [...contacts, newContact];
        setContacts(updated);
        localStorage.setItem('mysista-trusted-contacts', JSON.stringify(updated));
        toast.success('Contact added (Guest Mode) 🌸');
      } else {
        const { error } = await supabase.from('trusted_contacts').insert([{
          user_id: user.id, ...contactForm
        }]);
        if (error) throw error;
        await loadContacts();
        toast.success('Trusted contact added 🌸');
      }
      setContactForm({ name: '', phone: '', email: '', relationship: '' });
      setShowAddContact(false);
    } catch (err) {
      console.error('[Safety] add contact:', err);
      toast.error('Failed to add contact.');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!confirm('Remove this trusted contact?')) return;
    try {
      if (isGuest) {
        const updated = contacts.filter(c => c.id !== id);
        setContacts(updated);
        localStorage.setItem('mysista-trusted-contacts', JSON.stringify(updated));
        toast.success('Contact removed (Guest Mode)');
        return;
      }
      const { error } = await supabase.from('trusted_contacts').delete().eq('id', id);
      if (error) throw error;
      await loadContacts();
      toast.success('Contact removed.');
    } catch (err) {
      console.error('[Safety] delete contact:', err);
      toast.error('Failed to remove contact.');
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">

        {/* Header */}
        <div className="text-center pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4A5342] to-[#2C3228] flex items-center justify-center mx-auto mb-4 shadow-soft">
            <Shield size={26} className="text-white" />
          </div>
          <h1 className="section-title">Sanctuary Safety</h1>
          <p className="section-subtitle text-sm">
            Your discreet safety network. One tap sends your location to your trusted circle.
          </p>
        </div>

        {/* One-Tap Signal Button */}
        <div className="card p-6 text-center space-y-4 bg-gradient-to-br from-[#F8E0DD]/30 to-white border border-[#F8E0DD]">
          <div className="space-y-1">
            <h2 className="font-display font-bold text-dark text-lg">
              {profile?.display_name ?? 'Sista'}, are you safe?
            </h2>
            <p className="text-xs text-mid">
              Press the button below to silently alert your trusted circle with your location.
            </p>
          </div>

          <button
            onClick={handleSendSignal}
            disabled={sendingSignal}
            className="w-full py-5 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white font-display font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {sendingSignal ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending Signal...
              </>
            ) : (
              <>
                <AlertTriangle size={22} />
                Send Safety Signal
              </>
            )}
          </button>

          <p className="text-3xs text-mid flex items-center justify-center gap-1">
            <MapPin size={10} />
            Location is shared only when you tap this button
          </p>
        </div>

        {/* Recent signals */}
        {signals.length > 0 && (
          <div className="card p-5 space-y-3">
            <h3 className="font-display font-semibold text-sm text-dark flex items-center gap-2">
              <Clock size={14} className="text-primary" />
              Recent Signals
            </h3>
            <div className="space-y-2">
              {signals.map(sig => (
                <div key={sig.id} className="flex items-start gap-3 text-xs bg-soft/30 rounded-xl p-3 border border-primary/5">
                  <CheckCircle size={14} className={`mt-0.5 shrink-0 ${sig.resolved ? 'text-green-500' : 'text-orange-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-dark font-semibold">{sig.address || 'Location unavailable'}</div>
                    <div className="text-mid text-3xs">{new Date(sig.created_at).toLocaleString()}</div>
                  </div>
                  <span className={`badge text-3xs font-bold ${sig.resolved ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                    {sig.resolved ? 'Resolved' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trusted Circle */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-base text-dark flex items-center gap-2">
              <Heart size={16} className="text-primary" />
              Trusted Circle ({contacts.length})
            </h3>
            <button
              onClick={() => setShowAddContact(true)}
              className="btn-primary btn-sm flex items-center gap-1"
            >
              <Plus size={13} /> Add
            </button>
          </div>

          {loadingContacts ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2].map(n => <div key={n} className="h-14 bg-soft rounded-xl" />)}
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-primary/10 rounded-xl text-xs text-mid">
              No trusted contacts yet. Add someone you trust to receive your safety signals.
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map(contact => (
                <div key={contact.id} className="flex items-center gap-3 p-3 bg-soft/20 rounded-xl border border-primary/5">
                  <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{contact.name[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-dark">{contact.name}</div>
                    <div className="text-3xs text-mid">{contact.phone || contact.email} • {contact.relationship}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-1.5 text-mid hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Contact Modal */}
        {showAddContact && (
          <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="card bg-white w-full max-w-sm p-6 space-y-4 shadow-glow animate-scale-in">
              <div className="flex justify-between items-center">
                <h4 className="font-display font-bold text-base text-dark flex items-center gap-2">
                  <User size={16} className="text-primary" /> Add Trusted Contact
                </h4>
                <button onClick={() => setShowAddContact(false)} className="text-mid hover:text-dark">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleAddContact} className="space-y-3 text-xs">
                <div>
                  <label className="label">Full Name *</label>
                  <input required value={contactForm.name}
                    onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Nomsa Dlamini" className="input py-2 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Phone</label>
                    <input value={contactForm.phone}
                      onChange={e => setContactForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+27 82 000 0000" className="input py-2 text-xs" />
                  </div>
                  <div>
                    <label className="label">Relationship</label>
                    <input value={contactForm.relationship}
                      onChange={e => setContactForm(p => ({ ...p, relationship: e.target.value }))}
                      placeholder="Sister, Partner..." className="input py-2 text-xs" />
                  </div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={contactForm.email}
                    onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="nomsa@email.com" className="input py-2 text-xs" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddContact(false)} className="btn-ghost btn-sm flex-1 justify-center">Cancel</button>
                  <button type="submit" className="btn-primary btn-sm flex-1 justify-center">Save Contact</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
