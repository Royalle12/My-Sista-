/**
 * src/pages/Article.jsx
 * Article detail page — placeholder for TASK 001.
 * Full implementation in TASK 004.
 */

import { useParams } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper.jsx';

export default function Article() {
  const { slug } = useParams();
  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto text-center py-20">
        <h1 className="section-title mb-2">Article: {slug}</h1>
        <p className="section-subtitle mb-6">
          Full article renderer with markdown + Happy Splurge cards — TASK 004.
        </p>
        <div className="badge-secondary px-4 py-2 text-sm inline-flex">
          TASK 004 — Article Detail — WAITING
        </div>
      </div>
    </PageWrapper>
  );
}
