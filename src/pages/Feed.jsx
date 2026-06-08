/**
 * src/pages/Feed.jsx
 * Personalised content feed — placeholder for TASK 001.
 * Full implementation in TASK 004.
 */

import PageWrapper from '../components/layout/PageWrapper.jsx';
import { Newspaper } from 'lucide-react';

export default function Feed() {
  return (
    <PageWrapper>
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-soft flex items-center justify-center mx-auto mb-6">
          <Newspaper size={28} className="text-primary" />
        </div>
        <h1 className="section-title mb-2">Your Wellness Feed</h1>
        <p className="section-subtitle mb-6">
          Personalised content feed — TASK 004 implementation coming next.
        </p>
        <div className="badge-primary px-4 py-2 text-sm inline-flex">
          TASK 004 — Content Feed — WAITING
        </div>
      </div>
    </PageWrapper>
  );
}
