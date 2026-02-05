/**
 * People API Functions
 *
 * Fetch functions for team members and experts from Strapi CMS.
 */

import { fetchAPI, buildQueryString, StrapiResponse, getStrapiMediaUrl } from '../lib/strapi';
import type { StrapiPerson } from './types/strapi';

// ==================
// People
// ==================

export async function getPeople(): Promise<StrapiPerson[]> {
  const query = buildQueryString({
    populate: ['photo', 'team', 'expertGroup'],
    sort: 'order:asc',
    pagination: { limit: 100 },
  });

  const response = await fetchAPI<StrapiResponse<StrapiPerson[]>>(
    `/people${query}`,
    { tags: ['people'] }
  );

  return response.data;
}

export async function getPerson(documentId: string): Promise<StrapiPerson | null> {
  const query = buildQueryString({
    populate: ['photo', 'team', 'expertGroup'],
    filters: {
      documentId: { $eq: documentId },
    },
  });

  const response = await fetchAPI<StrapiResponse<StrapiPerson[]>>(
    `/people${query}`,
    { tags: ['people', `person-${documentId}`] }
  );

  return response.data[0] || null;
}

// ==================
// Team Members
// ==================

export async function getTeamMembers(): Promise<StrapiPerson[]> {
  const query = buildQueryString({
    populate: ['photo', 'team', 'expertGroup'],
    filters: {
      team: { id: { $notNull: true } },
    },
    sort: 'order:asc',
    pagination: { limit: 100 },
  });

  const response = await fetchAPI<StrapiResponse<StrapiPerson[]>>(
    `/people${query}`,
    { tags: ['people', 'team'] }
  );

  return response.data;
}

// ==================
// Experts
// ==================

export async function getExperts(): Promise<StrapiPerson[]> {
  const query = buildQueryString({
    populate: ['photo', 'team', 'expertGroup'],
    filters: {
      expertGroup: { id: { $notNull: true } },
    },
    sort: 'order:asc',
    pagination: { limit: 100 },
  });

  const response = await fetchAPI<StrapiResponse<StrapiPerson[]>>(
    `/people${query}`,
    { tags: ['people', 'experts'] }
  );

  return response.data;
}

// ==================
// Helper: Transform to legacy format
// ==================

export interface LegacyPerson {
  id: string;
  fullName: string;
  photoUrl: string | null;
  position: string | null;
  headline: string | null;
  experienceYears: number | null;
  isTeam: boolean;
  isExpert: boolean;
}

export function transformToLegacyPerson(person: StrapiPerson): LegacyPerson {
  return {
    id: String(person.id),
    fullName: person.fullName,
    photoUrl: getStrapiMediaUrl(person.photo?.url),
    position: person.position,
    headline: person.headline,
    experienceYears: person.experienceYears,
    isTeam: person.team !== null,
    isExpert: person.expertGroup !== null,
  };
}

export async function getPeopleDataLegacy(): Promise<{
  people: LegacyPerson[];
  teamPeopleIds: string[];
  expertPeopleIds: string[];
}> {
  const people = await getPeople();
  const legacyPeople = people.map(transformToLegacyPerson);

  return {
    people: legacyPeople,
    teamPeopleIds: legacyPeople.filter(p => p.isTeam).map(p => p.id),
    expertPeopleIds: legacyPeople.filter(p => p.isExpert).map(p => p.id),
  };
}
