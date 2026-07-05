'use client';

import { EDITOR_WIZARD_STEP_COUNT } from '@/components/domain/editor-wizard-workspace';
import type { EditorStepContext } from '@/components/domain/editor-step-context';
import { EditorStepAppearance } from '@/components/domain/editor-steps/step-appearance';
import { EditorStepEducation } from '@/components/domain/editor-steps/step-education';
import { EditorStepExperience } from '@/components/domain/editor-steps/step-experience';
import { EditorStepMore } from '@/components/domain/editor-steps/step-more';
import { EditorStepProfile } from '@/components/domain/editor-steps/step-profile';
import { EditorStepProjects } from '@/components/domain/editor-steps/step-projects';
import { EditorStepSkills } from '@/components/domain/editor-steps/step-skills';

export function EditorStepPanels({ stepIndex, ctx }: { stepIndex: number; ctx: EditorStepContext }) {
  const i = Math.min(Math.max(0, stepIndex), EDITOR_WIZARD_STEP_COUNT - 1);
  switch (i) {
    case 0:
      return EditorStepProfile(ctx);
    case 1:
      return EditorStepAppearance(ctx);
    case 2:
      return EditorStepSkills(ctx);
    case 3:
      return EditorStepExperience(ctx);
    case 4:
      return EditorStepEducation(ctx);
    case 5:
      return EditorStepProjects(ctx);
    case 6:
      return EditorStepMore(ctx);
    default:
      return EditorStepProfile(ctx);
  }
}
