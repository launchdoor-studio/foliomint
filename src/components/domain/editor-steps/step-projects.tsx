'use client';

import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  EditorField,
  EditorFormCell,
  EditorFormPanel,
  editorFormRow2Md,
  editorRepeatBodyClass,
} from '@/components/domain/editor-form-ui';
import type { EditorStepContext } from '@/components/domain/editor-step-context';
import { bulletsFromTextareaValue } from '@/lib/bullet-textarea';
import { inferProjectLinkLabel, PROJECT_LINK_LABELS } from '@/lib/project-links';
import type { ProjectLink } from '@/types';

function ensureLinks(links: ProjectLink[] | undefined, legacyUrl?: string | null): ProjectLink[] {
  if (links?.length) return links;
  if (legacyUrl?.trim()) {
    return [{ label: inferProjectLinkLabel(legacyUrl), url: legacyUrl.trim() }];
  }
  return [];
}

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
                projects: [
                  ...c.projects,
                  { name: '', description: '', technologies: [], bullets: [], links: [] },
                ],
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
            {content.projects.map((project, idx) => {
              const links = ensureLinks(project.links, project.url);

              return (
                <div key={`editor-proj-${idx}`} className={editorRepeatItemClass}>
                  <div className="mb-5 flex items-center justify-between gap-2 border-b border-border/60 pb-4">
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

                    <EditorField
                      id={`editor-proj-${idx}-links`}
                      label="Links"
                      hint="Add GitHub, demo site, App Store, Play Store, GitLab, etc. Labels auto-detect from the URL."
                    >
                      <div className="space-y-3">
                        {links.map((link, linkIdx) => (
                          <div key={`editor-proj-${idx}-link-${linkIdx}`} className={editorFormRow2Md}>
                            <EditorFormCell bp="md">
                              <Input
                                aria-label={`Project ${idx + 1} link ${linkIdx + 1} label`}
                                value={link.label}
                                list={`editor-proj-link-labels-${idx}`}
                                onChange={(e) =>
                                  updateContent((c) => ({
                                    ...c,
                                    projects: c.projects.map((it, i) => {
                                      if (i !== idx) return it;
                                      const nextLinks = ensureLinks(it.links, it.url);
                                      nextLinks[linkIdx] = { ...nextLinks[linkIdx], label: e.target.value };
                                      return { ...it, links: nextLinks, url: undefined };
                                    }),
                                  }))
                                }
                                className={monoInput()}
                                placeholder="GitHub"
                              />
                            </EditorFormCell>
                            <EditorFormCell bp="md">
                              <div className="flex gap-2">
                                <Input
                                  aria-label={`Project ${idx + 1} link ${linkIdx + 1} URL`}
                                  value={link.url}
                                  onChange={(e) =>
                                    updateContent((c) => ({
                                      ...c,
                                      projects: c.projects.map((it, i) => {
                                        if (i !== idx) return it;
                                        const nextLinks = ensureLinks(it.links, it.url);
                                        const url = e.target.value;
                                        nextLinks[linkIdx] = {
                                          label:
                                            nextLinks[linkIdx].label === inferProjectLinkLabel(nextLinks[linkIdx].url)
                                              ? inferProjectLinkLabel(url)
                                              : nextLinks[linkIdx].label,
                                          url,
                                        };
                                        return { ...it, links: nextLinks, url: undefined };
                                      }),
                                    }))
                                  }
                                  className={monoInput()}
                                  placeholder="https://github.com/you/repo"
                                />
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  aria-label={`Remove link ${linkIdx + 1}`}
                                  onClick={() =>
                                    updateContent((c) => ({
                                      ...c,
                                      projects: c.projects.map((it, i) => {
                                        if (i !== idx) return it;
                                        const nextLinks = ensureLinks(it.links, it.url).filter(
                                          (_, j) => j !== linkIdx,
                                        );
                                        return { ...it, links: nextLinks, url: undefined };
                                      }),
                                    }))
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </EditorFormCell>
                          </div>
                        ))}
                        <datalist id={`editor-proj-link-labels-${idx}`}>
                          {PROJECT_LINK_LABELS.map((label) => (
                            <option key={label} value={label} />
                          ))}
                        </datalist>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="font-mono text-xs uppercase"
                          onClick={() =>
                            updateContent((c) => ({
                              ...c,
                              projects: c.projects.map((it, i) =>
                                i === idx
                                  ? {
                                      ...it,
                                      links: [...ensureLinks(it.links, it.url), { label: 'Link', url: '' }],
                                      url: undefined,
                                    }
                                  : it,
                              ),
                            }))
                          }
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add link
                        </Button>
                      </div>
                    </EditorField>

                    <EditorField id={`editor-proj-${idx}-desc`} label="Tagline" hint="Optional one-liner. Put details in bullets below.">
                      <textarea
                        id={`editor-proj-${idx}-desc`}
                        className={monoTextarea('min-h-[72px]')}
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
                      label="Highlights"
                      hint="Impact bullets — one per line (what you built, who it helped, stack, metrics)."
                    >
                      <textarea
                        id={`editor-proj-${idx}-bullets`}
                        className={monoTextarea('min-h-[140px]')}
                        value={(project.bullets ?? []).join('\n')}
                        onChange={(e) =>
                          updateContent((c) => ({
                            ...c,
                            projects: c.projects.map((it, i) =>
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
              );
            })}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted-foreground">No projects yet. Add one or use Re-import resume in the toolbar.</p>
        )}
      </EditorFormPanel>
    </div>
  );
}
