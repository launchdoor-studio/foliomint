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

export function EditorStepEducation(ctx: EditorStepContext) {
  const { updateContent, monoInput, editorRepeatItemClass } = ctx;
  const content = ctx.state.content;

  return (
    <div className="space-y-6">
      <EditorFormPanel
        title="Education"
        actions={
          <Button
            size="sm"
            variant="outline"
            className="font-mono text-xs uppercase"
            onClick={() =>
              updateContent((c) => ({
                ...c,
                education: [
                  ...c.education,
                  { institution: '', degree: '', startDate: '', endDate: '', field: '', gpa: '' },
                ],
              }))
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            Add school
          </Button>
        }
      >
        {content && content.education.length > 0 ? (
          <div className="space-y-8">
            {content.education.map((edu, idx) => (
              <div key={`editor-edu-${idx}`} className={editorRepeatItemClass}>
                <div className="mb-5 flex items-center justify-between gap-2 border-b border-border/60 pb-4 dark:border-white/10">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    School {idx + 1}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0"
                    onClick={() =>
                      updateContent((c) => ({
                        ...c,
                        education: c.education.filter((_, i) => i !== idx),
                      }))
                    }
                    aria-label="Remove this school"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className={editorRepeatBodyClass}>
                  <div className={editorFormRow2}>
                    <EditorFormCell>
                      <EditorField uniformLabelStack id={`editor-edu-${idx}-inst`} label="School / university">
                        <Input
                          id={`editor-edu-${idx}-inst`}
                          value={edu.institution}
                          onChange={(e) =>
                            updateContent((c) => ({
                              ...c,
                              education: c.education.map((it, i) =>
                                i === idx ? { ...it, institution: e.target.value } : it,
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
                        id={`editor-edu-${idx}-degree`}
                        label="Degree"
                        hint="e.g. B.S., M.Eng."
                      >
                        <Input
                          id={`editor-edu-${idx}-degree`}
                          value={edu.degree}
                          onChange={(e) =>
                            updateContent((c) => ({
                              ...c,
                              education: c.education.map((it, i) =>
                                i === idx ? { ...it, degree: e.target.value } : it,
                              ),
                            }))
                          }
                          className={monoInput()}
                        />
                      </EditorField>
                    </EditorFormCell>
                  </div>
                  <EditorField
                    id={`editor-edu-${idx}-field`}
                    label="Field of study"
                    hint="Major, concentration, or program (optional)."
                  >
                    <Input
                      id={`editor-edu-${idx}-field`}
                      value={edu.field ?? ''}
                      onChange={(e) =>
                        updateContent((c) => ({
                          ...c,
                          education: c.education.map((it, i) =>
                            i === idx ? { ...it, field: e.target.value || undefined } : it,
                          ),
                        }))
                      }
                      className={monoInput()}
                    />
                  </EditorField>
                  <div className={editorFormRow3}>
                    <EditorFormCell>
                      <EditorField uniformLabelStack id={`editor-edu-${idx}-start`} label="Start">
                        <Input
                          id={`editor-edu-${idx}-start`}
                          value={edu.startDate}
                          onChange={(e) =>
                            updateContent((c) => ({
                              ...c,
                              education: c.education.map((it, i) =>
                                i === idx ? { ...it, startDate: e.target.value } : it,
                              ),
                            }))
                          }
                          className={monoInput()}
                        />
                      </EditorField>
                    </EditorFormCell>
                    <EditorFormCell>
                      <EditorField uniformLabelStack id={`editor-edu-${idx}-end`} label="End">
                        <Input
                          id={`editor-edu-${idx}-end`}
                          value={edu.endDate ?? ''}
                          onChange={(e) =>
                            updateContent((c) => ({
                              ...c,
                              education: c.education.map((it, i) =>
                                i === idx ? { ...it, endDate: e.target.value || undefined } : it,
                              ),
                            }))
                          }
                          className={monoInput()}
                        />
                      </EditorField>
                    </EditorFormCell>
                    <EditorFormCell>
                      <EditorField uniformLabelStack id={`editor-edu-${idx}-gpa`} label="GPA" hint="Optional">
                        <Input
                          id={`editor-edu-${idx}-gpa`}
                          value={edu.gpa ?? ''}
                          onChange={(e) =>
                            updateContent((c) => ({
                              ...c,
                              education: c.education.map((it, i) =>
                                i === idx ? { ...it, gpa: e.target.value || undefined } : it,
                              ),
                            }))
                          }
                          className={monoInput()}
                        />
                      </EditorField>
                    </EditorFormCell>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted-foreground">No schools yet. Add one or use Re-import resume in the toolbar.</p>
        )}
      </EditorFormPanel>
    </div>
  );
}
