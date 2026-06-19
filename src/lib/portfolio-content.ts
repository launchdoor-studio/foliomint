import type { PortfolioContent } from '@/types';

export function createBlankPortfolioContent(name?: string | null): PortfolioContent {
  return {
    name: name?.trim() || 'Your Name',
    headline: '',
    profileImageUrl: undefined,
    email: undefined,
    phone: undefined,
    location: undefined,
    website: undefined,
    linkedin: undefined,
    github: undefined,
    bio: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    extracurricular: [],
    otherSections: [],
    portfolioSuggestions: {
      heroTagline: '',
      bioVariants: [],
      missingFields: ['Add a headline', 'Add at least one project', 'Add social links'],
      recommendedSectionOrder: ['profile', 'projects', 'experience', 'skills', 'education'],
    },
    customSections: [],
  };
}
