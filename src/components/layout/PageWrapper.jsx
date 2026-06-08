/**
 * src/components/layout/PageWrapper.jsx
 * Wraps all authenticated pages — includes Navbar, BottomNav, and safe padding.
 */

import Navbar    from './Navbar.jsx';
import BottomNav from './BottomNav.jsx';

export default function PageWrapper({ children, className = '' }) {
  return (
    <>
      <Navbar />
      <main className={['page-wrapper', className].filter(Boolean).join(' ')}>
        <div className="container-app py-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
