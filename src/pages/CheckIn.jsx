/**
 * src/pages/CheckIn.jsx
 * Daily wellness check-in — placeholder for TASK 001.
 * Full implementation in TASK 005.
 */

import PageWrapper from '../components/layout/PageWrapper.jsx';
import { Flame } from 'lucide-react';

export default function CheckIn() {
  return (
    <PageWrapper>
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-soft flex items-center justify-center mx-auto mb-6">
          <Flame size={28} className="text-orange-500" />
        </div>
        <h1 className="section-title mb-2">Daily Check-In</h1>
        <p className="section-subtitle mb-6">
          Mood, energy, and sleep tracker with streak management — TASK 005.
        </p>
        <div className="badge-primary px-4 py-2 text-sm inline-flex">
          TASK 005 — Daily Check-In — WAITING
        </div>
      </div>
    </PageWrapper>
  );
}
