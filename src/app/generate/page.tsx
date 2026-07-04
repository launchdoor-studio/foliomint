import { getCurrentUser } from '@/lib/auth';
import { isDevAuthBypassed } from '@/lib/dev-mode';

import { GenerateForm } from './generate-form';

export default async function GeneratePage() {
  const user = await getCurrentUser();
  const isAuthed = Boolean(user) || isDevAuthBypassed();

  return <GenerateForm isAuthed={isAuthed} />;
}

