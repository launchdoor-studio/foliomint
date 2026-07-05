import { z } from 'zod';

const nullableOptionalString = () =>
  z.preprocess((value) => (value === null ? undefined : value), z.string().optional());

const nullableOptionalEmail = () =>
  z.preprocess(
    (value) => (value === null ? undefined : value),
    z.string().email().optional(),
  );

const nullableOptionalStringArray = () =>
  z.preprocess((value) => (value === null ? undefined : value), z.array(z.string()).optional());

export const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: nullableOptionalString(),
  bullets: z.array(z.string()),
  location: nullableOptionalString(),
});

export const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: nullableOptionalString(),
  startDate: z.string(),
  endDate: nullableOptionalString(),
  gpa: nullableOptionalString(),
});

export const projectLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

export const projectSchema = z.object({
  name: z.string(),
  /** One short line (optional). Do not put bullet lists here — use bullets[]. */
  description: nullableOptionalString(),
  /** @deprecated Prefer links[] — kept for older portfolios. */
  url: nullableOptionalString(),
  links: z
    .preprocess((value) => (value === null || value === undefined ? [] : value), z.array(projectLinkSchema))
    .optional(),
  technologies: nullableOptionalStringArray(),
  bullets: z.preprocess(
    (value) => (value === null || value === undefined ? [] : value),
    z.array(z.string()),
  ),
});

const titledBulletSectionSchema = z.object({
  title: z.string(),
  bullets: z.preprocess(
    (value) => (value === null || value === undefined ? [] : value),
    z.array(z.string()),
  ),
});

export const resumeDataSchema = z.object({
  name: z.string(),
  headline: nullableOptionalString(),
  profileImageUrl: nullableOptionalString(),
  email: nullableOptionalEmail(),
  phone: nullableOptionalString(),
  location: nullableOptionalString(),
  website: nullableOptionalString(),
  linkedin: nullableOptionalString(),
  github: nullableOptionalString(),
  bio: nullableOptionalString(),
  skills: z.array(z.string()),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  projects: z.array(projectSchema),
  certifications: nullableOptionalStringArray(),
  languages: nullableOptionalStringArray(),
  /** Honors, prizes, recognitions (flat list). */
  awards: nullableOptionalStringArray(),
  /** Subsections with a heading and bullets (e.g. Extracurricular). */
  extracurricular: z
    .preprocess((value) => (value === null ? undefined : value), z.array(titledBulletSectionSchema).optional()),
  /**
   * Any resume section that does not fit the fields above (Publications, Volunteer, etc.).
   * Prefer mapping known sections to first-class fields when possible.
   */
  otherSections: z
    .preprocess((value) => (value === null ? undefined : value), z.array(titledBulletSectionSchema).optional()),
  portfolioSuggestions: z
    .object({
      heroTagline: nullableOptionalString(),
      bioVariants: z.array(z.string()).optional(),
      missingFields: z.array(z.string()).optional(),
      recommendedSectionOrder: z.array(z.string()).optional(),
    })
    .optional(),
});

export type ResumeData = z.infer<typeof resumeDataSchema>;

export const portfolioContentSchema = resumeDataSchema.extend({
  customSections: z
    .array(
      z.object({
        title: z.string(),
        content: z.string(),
      }),
    )
    .optional(),
});

export type PortfolioContent = z.infer<typeof portfolioContentSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type ProjectLink = z.infer<typeof projectLinkSchema>;
export type Project = z.infer<typeof projectSchema>;

export type SubscriptionStatus = 'free' | 'active' | 'trialing' | 'cancelled' | 'past_due' | 'expired';

export type ThemePreference = 'light' | 'dark' | 'system';

export type PortfolioTheme = 'classic' | 'neubrutalism' | 'editorial' | 'minimal' | 'terminal';

export interface UserPreferences {
  theme: ThemePreference;
}

