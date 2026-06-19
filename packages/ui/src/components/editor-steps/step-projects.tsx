'use client';

import { Plus, Trash2 } from 'lucide-react';

import { Button } from '../button';
import { Input } from '../input';
import {
  EditorField,
  EditorFormCell,
  EditorFormPanel,
  editorFormRow2Md,
  editorRepeatBodyClass,
} from '../editor-form-ui';
import type { EditorStepContext } from '../editor-step-context';

export function EditorStepProjects(ctx: EditorStepContext) {
  const { updateContent, monoInput, monoTextarea, editorRepeatItemClass } = ctx;
  const content = ctx.state.content;

  return (
    <div className="space-y-6">
      <EditorFormPanel
        title="Projects"
        actions={
          <Button
            size="sm"
            variant="outline"
            className="font-mono text-xs uppercase"
            onClick={() =>
              updateContent((c) => ({
                ...c,
                projects: [...c.projects, { name: '', description: '', url: '', technologies: [], bullets: [] }],
              }))
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            Add project
          </Button>
        }
      >
        {content && content.projects.length > 0 ? (
          <div className="space-y-8">
            {content.projects.map((project, idx) => (
              <div key={`editor-proj-${idx}`} className={editorRepeatItemClass}>
                <div className="mb-5 flex items-center justify-between gap-2 border-b border-border/60 pb-4 dark:border-white/10">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Project {idx + 1}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0"
                    onClick={() =>
                      updateContent((c) => ({
                        ...c,
                        projects: c.projects.filter((_, i) => i !== idx),
                      }))
                    }
                    aria-label="Remove this project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className={editorRepeatBodyClass}>
                  <div className={editorFormRow2Md}>
                    <EditorFormCell bp="md">
                      <EditorField uniformLabelStack id={`editor-proj-${idx}-name`} label="Project name">
                        <Input
                          id={`editor-proj-${idx}-name`}
                          value={project.name}
                          onChange={(e) =>
                            updateContent((c) => ({
                              ...c,
                              projects: c.projects.map((it, i) =>
                                i === idx ? { ...it, name: e.target.value } : it,
                              ),
                            }))
                          }
                          className={monoInput()}
                        />
                      </EditorField>
                    </EditorFormCell>
                    <EditorFormCell bp="md">
                      <EditorField
                        uniformLabelStack
                        id={`editor-proj-${idx}-url`}
                        label="Link"
                        hint="Repo, demo, or case study URL. You can paste `github.com/org/repo` — https is added automatically."
                      >
                        <Input
                          id={`editor-proj-${idx}-url`}
                          value={project.url ?? ''}
                          onChange={(e) =>
                            updateContent((c) => ({
                              ...c,
                              projects: c.projects.map((it, i) =>
                                i === idx ? { ...it, url: e.target.value || undefined } : it,
                              ),
                            }))
                          }
                          className={monoInput()}
                        />
                      </EditorField>
                    </EditorFormCell>
                  </div>
                  <EditorField id={`editor-proj-${idx}-desc`} label="Summary" hint="One or two sentences.">
                    <textarea
                      id={`editor-proj-${idx}-desc`}
                      className={monoTextarea('min-h-[88px]')}
                      value={project.description ?? ''}
                      onChange={(e) =>
                        updateContent((c) => ({
                          ...c,
                          projects: c.projects.map((it, i) =>
                            i === idx ? { ...it, description: e.target.value || undefined } : it,
                          ),
                        }))
                      }
                    />
                  </EditorField>
                  <EditorField
                    id={`editor-proj-${idx}-tech`}
                    label="Technologies"
                    hint="Comma-separated (shown as tags on your portfolio)."
                  >
                    <Input
                      id={`editor-proj-${idx}-tech`}
                      value={(project.technologies ?? []).join(', ')}
                      onChange={(e) =>
                        updateContent((c) => ({
                          ...c,
                          projects: c.projects.map((it, i) =>
                            i === idx
                              ? {
                                  ...it,
                                  technologies: e.target.value
                                    .split(',')
                                    .map((v) => v.trim())
                                    .filter(Boolean),
                                }
                              : it,
                          ),
                        }))
                      }
                      className={monoInput()}
                    />
                  </EditorField>
                  <EditorField
                    id={`editor-proj-${idx}-bullets`}
                    label="Details"
                    hint="Extra bullets; one per line."
                  >
                    <textarea
                      id={`editor-proj-${idx}-bullets`}
                      className={monoTextarea('min-h-[120px]')}
                      value={(project.bullets ?? []).join('\n')}
                      onChange={(e) =>
                        updateContent((c) => ({
                          ...c,
                          projects: c.projects.map((it, i) =>
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
          <p className="font-mono text-sm text-muted-foreground">No projects yet. Add one or re-parse your resume.</p>
        )}
      </EditorFormPanel>
    </div>
  );
}
