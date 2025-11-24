import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getUserAuthContext } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'PressPilot',
  description: 'PressPilot Studio dashboard',
};

export default async function HomePage() {
  const { user } = await getUserAuthContext();

  if (!user?.email) {
    redirect('/auth');
  }

  redirect('/projects');
}
