import type { Metadata } from 'next';
import MvpDemoPage from './mvp-demo/MvpDemoPage';

export const metadata: Metadata = {
  title: 'PressPilot MVP',
  description: 'PressPilot SaaS playground',
};

export default function HomePage() {
  return <MvpDemoPage />;
}
