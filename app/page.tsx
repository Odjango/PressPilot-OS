import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getUserAuthContext } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'PressPilot',
  description: 'PressPilot Studio dashboard',
};

export default async function HomePage() {
  const { user, session } = await getUserAuthContext();

  // If not logged in, redirect to auth
  if (!user?.email || !session) {
    redirect('/auth');
  }

  // If logged in, redirect to projects
  redirect('/projects');
}
