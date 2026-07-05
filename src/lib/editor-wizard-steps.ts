export const EDITOR_WIZARD_STEPS = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Portfolio title, contact details, headline, and your introduction.',
  },
  {
    id: 'appearance',
    title: 'Look & colors',
    description: 'Portfolio style (Classic or Neubrutalism), accent, and canvas colors for light and dark mode.',
  },
  {
    id: 'skills',
    title: 'Skills',
    description: 'Add strengths and tools—visitors see these as tags on your site.',
  },
  {
    id: 'experience',
    title: 'Experience',
    description: 'Roles, dates, locations, and bullet highlights.',
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Schools, degrees, and dates.',
  },
  {
    id: 'projects',
    title: 'Projects',
    description: 'Links, summaries, tech stacks, and extra bullets.',
  },
  {
    id: 'more',
    title: 'Awards & more',
    description: 'Honors, extracurricular blocks, and custom sections.',
  },
] as const;

export type EditorWizardStepId = (typeof EDITOR_WIZARD_STEPS)[number]['id'];

export const EDITOR_WIZARD_STEP_COUNT = EDITOR_WIZARD_STEPS.length;

export function getEditorWizardStep(id: string | undefined) {
  if (!id) return null;
  return EDITOR_WIZARD_STEPS.find((step) => step.id === id) ?? null;
}
