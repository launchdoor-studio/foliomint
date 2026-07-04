'use client';

import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  EditorField,
  EditorFormCell,
  EditorFormPanel,
  editorFormRow2,
  editorFormRow3,
  editorRepeatBodyClass,
} from '@/components/domain/editor-form-ui';
import type { EditorStepContext } from '@/components/domain/editor-step-context';

export function EditorStepExperience(ctx: EditorStepContext) {
  const { updateContent, monoInput, monoTextarea, editorRepeatItemClass } = ctx;
  const content = ctx.state.content;

  return (
    <div className="space-y-6">
      <EditorFormPanel
        title="Experience"
        actions={
          <Button
            size="sm"
            variant="outline"
            className="font-mono text-xs uppercase"
            onClick={() =>
              updateContent((c) => ({
                ...c,
                experience: [
                  ...c.experience,
                  { company: '', role: '', startDate: '', bullets: [], endDate: '', location: '' },
                ],
              }))
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            Add role
          </Button>
        }
      >
        {content && content.experience.length > 0 ? (
          <div className="space-y-8">
            {content.experience.map((exp, idx) => (
              <div key={`editor-exp-${idx}`} className={editorRepeatItemClass}>
                <div className="mb-5 flex items-center justify-between gap-2 border-b border-border/60 pb-4 dark:border-white/10">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Role {idx + 1}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0"
                    onClick={() =>
                      updateContent((c) => ({
                        ...c,
                        experience: c.experience.filter((_, i) => i !== idx),
                      }))
                    }
                    aria-label="Remove this role"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className={editorRepeatBodyClass}>
                  <div className={editorFormRow2}>
                    <EditorFormCell>
                      <EditorField id={`editor-exp-${idx}-company`} label="Company / organization">
                        <Input
                          id={`editor-exp-${idx}-company`}
                          value={exp.company}
                          onChange={(e) =>
                            updateContent((c) => ({
                              ...c,
                              experience: c.experience.map((it, i) =>
                                i === idx ? { ...it, company: e.target.value } : it,
                              ),
                            }))
                          }
                          className={monoInput()}
                        />
                      </EditorField>
                    </EditorFormCell>
                    <EditorFormCell>
                      <EditorField id={`editor-exp-${idx}-role`} label="Job title">
                        <Input
                          id={`editor-exp-${idx}-role`}
                          value={exp.role}
                          onChange={(e) =>
                            updateContent((c) => ({
                              ...c,
                              experience: c.experience.map((it, i) =>
                                i === idx ? { ...it, role: e.target.value } : it,
                              ),
                            }))
                          }
                          className={monoInput()}
                        />
                      </EditorField>
                    </EditorFormCell>
                  </div>
                  <div className={editorFormRow3}>
                    <EditorFormCell>
                      <EditorField
                        uniformLabelStack
                        id={`editor-exp-${idx}-start`}
                        label="Start date"
                        hint="e.g. Jan 2022"
                      >
                        <Input
                          id={`editor-exp-${idx}-start`}
                          value={exp.startDate}
                          onChange={(e) =>
                            updateContent((c) => ({
                              ...c,
                              experience: c.experience.map((it, i) =>
                                i === idx ? { ...it, startDate: e.target.value } : it,
                              ),
                            }))
                          }
                          className={monoInput()}
                        />
                      </EditorField>
                    </EditorFormCell>
                    <EditorFormCell>
                      <EditorField
                        uniformLabelStack
                        id={`editor-exp-${idx}-end`}
                        label="End date"
                        hint="Leave blank if current"
                      >
                        <Input
                          id={`editor-exp-${idx}-end`}
                          value={exp.endDate ?? ''}
                          onChange={(e) =>
                            updateContent((c) => ({
                              ...c,
                              experience: c.experience.map((it, i) =>
                                i === idx ? { ...it, endDate: e.target.value || undefined } : it,
                              ),
                            }))
                          }
                          className={monoInput()}
                        />
                      </EditorField>
                    </EditorFormCell>
                    <EditorFormCell>
                      <EditorField
                        uniformLabelStack
                        id={`editor-exp-${idx}-loc`}
                        label="Location"
                        hint="City, remote, etc."
                      >
                        <Input
                          id={`editor-exp-${idx}-loc`}
                          value={exp.location ?? ''}
                          onChange={(e) =>
                            updateContent((c) => ({
                              ...c,
                              experience: c.experience.map((it, i) =>
                                i === idx ? { ...it, location: e.target.value || undefined } : it,
                              ),
                            }))
                          }
                          className={monoInput()}
                        />
                      </EditorField>
                    </EditorFormCell>
                  </div>
                  <EditorField
                    id={`editor-exp-${idx}-bullets`}
                    label="Highlights"
                    hint="One achievement or responsibility per line."
                  >
                    <textarea
                      id={`editor-exp-${idx}-bullets`}
                      className={monoTextarea('min-h-[120px]')}
                      value={(exp.bullets ?? []).join('\n')}
                      onChange={(e) =>
                        updateContent((c) => ({
                          ...c,
                          experience: c.experience.map((it, i) =>
                            i === idx
                              ? {
                                  ...it,
                                  bullets: e.target.value
                                    .split('\n')
                                    .map((v) => v.trim())
                                    .filter(Boolean),
                                }
                              : it,
                          ),
                        }))
                      }
                    />
                  </EditorField>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted-foreground">No roles yet. Add one or use Re-import resume in the toolbar.</p>
        )}
      </EditorFormPanel>
    </div>
  );
}
