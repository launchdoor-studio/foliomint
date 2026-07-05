'use client';

import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EditorField, EditorFormPanel, editorRepeatBodyClass } from '@/components/domain/editor-form-ui';
import type { EditorStepContext } from '@/components/domain/editor-step-context';
import { bulletsFromTextareaValue } from '@/lib/bullet-textarea';

export function EditorStepMore(ctx: EditorStepContext) {
  const { updateContent, monoInput, monoTextarea, editorRepeatItemClass } = ctx;
  const content = ctx.state.content;

  return (
    <div className="space-y-6">
      <EditorFormPanel
        title="Awards"
        actions={
          <Button
            size="sm"
            variant="outline"
            className="font-mono text-xs uppercase"
            onClick={() =>
              updateContent((c) => ({
                ...c,
                awards: [...(c.awards ?? []), ''],
              }))
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            Add award
          </Button>
        }
      >
        {content && content.awards && content.awards.length > 0 ? (
          <div className="space-y-6">
            {content.awards.map((a, i) => (
              <div key={`editor-award-${i}`} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                <div className="min-w-0 flex-1">
                  <EditorField id={`editor-award-${i}`} label={`Award ${i + 1}`}>
                    <Input
                      id={`editor-award-${i}`}
                      value={a}
                      onChange={(e) =>
                        updateContent((c) => ({
                          ...c,
                          awards: (c.awards ?? []).map((it, idx) => (idx === i ? e.target.value : it)),
                        }))
                      }
                      className={monoInput()}
                    />
                  </EditorField>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0"
                  onClick={() =>
                    updateContent((c) => ({
                      ...c,
                      awards: (c.awards ?? []).filter((_, idx) => idx !== i),
                    }))
                  }
                  aria-label="Remove award"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted-foreground">No awards yet.</p>
        )}
      </EditorFormPanel>

      <EditorFormPanel
        title="Extracurricular"
        actions={
          <Button
            size="sm"
            variant="outline"
            className="font-mono text-xs uppercase"
            onClick={() =>
              updateContent((c) => ({
                ...c,
                extracurricular: [...(c.extracurricular ?? []), { title: '', bullets: [] }],
              }))
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            Add block
          </Button>
        }
      >
        {content && content.extracurricular && content.extracurricular.length > 0 ? (
          <div className="space-y-8">
            {content.extracurricular.map((block, idx) => (
              <div key={`editor-extra-${idx}`} className={editorRepeatItemClass}>
                <div className="mb-5 flex items-center justify-between gap-2 border-b border-border/60 pb-4">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Block {idx + 1}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0"
                    onClick={() =>
                      updateContent((c) => ({
                        ...c,
                        extracurricular: (c.extracurricular ?? []).filter((_, i) => i !== idx),
                      }))
                    }
                    aria-label="Remove block"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className={editorRepeatBodyClass}>
                  <EditorField id={`editor-extra-${idx}-title`} label="Section heading">
                    <Input
                      id={`editor-extra-${idx}-title`}
                      value={block.title}
                      onChange={(e) =>
                        updateContent((c) => ({
                          ...c,
                          extracurricular: (c.extracurricular ?? []).map((it, i) =>
                            i === idx ? { ...it, title: e.target.value } : it,
                          ),
                        }))
                      }
                      className={monoInput()}
                    />
                  </EditorField>
                  <EditorField id={`editor-extra-${idx}-bullets`} label="Bullets" hint="One per line.">
                    <textarea
                      id={`editor-extra-${idx}-bullets`}
                      className={monoTextarea('min-h-[120px]')}
                      value={block.bullets.join('\n')}
                      onChange={(e) =>
                        updateContent((c) => ({
                          ...c,
                          extracurricular: (c.extracurricular ?? []).map((it, i) =>
                            i === idx
                              ? {
                                  ...it,
                                  bullets: bulletsFromTextareaValue(e.target.value),
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
          <p className="font-mono text-sm text-muted-foreground">No extracurricular blocks yet.</p>
        )}
      </EditorFormPanel>

      <EditorFormPanel
        title="Other sections"
        actions={
          <Button
            size="sm"
            variant="outline"
            className="font-mono text-xs uppercase"
            onClick={() =>
              updateContent((c) => ({
                ...c,
                otherSections: [...(c.otherSections ?? []), { title: '', bullets: [] }],
              }))
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            Add section
          </Button>
        }
      >
        {content && content.otherSections && content.otherSections.length > 0 ? (
          <div className="space-y-8">
            {content.otherSections.map((block, idx) => (
              <div key={`editor-other-${idx}`} className={editorRepeatItemClass}>
                <div className="mb-5 flex items-center justify-between gap-2 border-b border-border/60 pb-4">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Custom {idx + 1}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0"
                    onClick={() =>
                      updateContent((c) => ({
                        ...c,
                        otherSections: (c.otherSections ?? []).filter((_, i) => i !== idx),
                      }))
                    }
                    aria-label="Remove section"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className={editorRepeatBodyClass}>
                  <EditorField id={`editor-other-${idx}-title`} label="Section title">
                    <Input
                      id={`editor-other-${idx}-title`}
                      value={block.title}
                      onChange={(e) =>
                        updateContent((c) => ({
                          ...c,
                          otherSections: (c.otherSections ?? []).map((it, i) =>
                            i === idx ? { ...it, title: e.target.value } : it,
                          ),
                        }))
                      }
                      className={monoInput()}
                    />
                  </EditorField>
                  <EditorField id={`editor-other-${idx}-bullets`} label="Content" hint="One bullet per line.">
                    <textarea
                      id={`editor-other-${idx}-bullets`}
                      className={monoTextarea('min-h-[120px]')}
                      value={block.bullets.join('\n')}
                      onChange={(e) =>
                        updateContent((c) => ({
                          ...c,
                          otherSections: (c.otherSections ?? []).map((it, i) =>
                            i === idx
                              ? {
                                  ...it,
                                  bullets: bulletsFromTextareaValue(e.target.value),
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
          <p className="font-mono text-sm text-muted-foreground">No extra sections yet.</p>
        )}
      </EditorFormPanel>
    </div>
  );
}
