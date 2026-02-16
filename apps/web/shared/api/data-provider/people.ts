import { getPeople, transformToLegacyPerson, type LegacyPerson } from '../people';

import { assertStrapiConfigured } from './env';

export interface PeopleData {
  people: LegacyPerson[];
  teamPeopleIds: string[];
  expertPeopleIds: string[];
}

export async function fetchPeopleData(): Promise<PeopleData> {
  assertStrapiConfigured();

  const people = await getPeople();
  const legacyPeople = people.map(transformToLegacyPerson);

  return {
    people: legacyPeople,
    teamPeopleIds: legacyPeople.filter((p) => p.isTeam).map((p) => p.id),
    expertPeopleIds: legacyPeople.filter((p) => p.isExpert).map((p) => p.id),
  };
}
