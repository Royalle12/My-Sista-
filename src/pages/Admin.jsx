/**
 * src/pages/Admin.jsx
 * Admin CMS — admin-role guarded — placeholder for TASK 001.
 * Full implementation in TASK 007.
 */

import PageWrapper from '../components/layout/PageWrapper.jsx';
import { Settings } from 'lucide-react';

export default function Admin() {
  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-soft flex items-center justify-center mx-auto mb-6">
          <Settings size={28} className="text-primary" />
        </div>
        <h1 className="section-title mb-2">Admin CMS</h1>
        <p className="section-subtitle mb-6">
          Article publishing, product management, and content linking — TASK 007.
        </p>
        <div className="badge-primary px-4 py-2 text-sm inline-flex">
          TASK 007 — Admin CMS — WAITING
        </div>
      </div>
    </PageWrapper>
  );
}
