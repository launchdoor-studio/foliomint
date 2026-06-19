'use client';

import { EditorFormPanel, EditorSkillsField } from '../editor-form-ui';
import type { EditorStepContext } from '../editor-step-context';

export function EditorStepSkills(ctx: EditorStepContext) {
  const { setState } = ctx;
  const content = ctx.state.content;

  return (
    <div className="space-y-6">
      <EditorFormPanel title="Skills">
        {content ? (
          <EditorSkillsField
            skills={content.skills}
            onChange={(skills) =>
              setState((prev) => (prev && prev.content ? { ...prev, content: { ...prev.content, skills } } : prev))
            }
          />
        ) : (
          <p className="font-mono text-sm text-muted-foreground">
            Skills will appear here after your resume is parsed.
          </p>
        )}
      </EditorFormPanel>
    </div>
  );
}
