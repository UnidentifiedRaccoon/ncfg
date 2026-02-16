import { getServicesDataLegacy } from '../services';

import { assertStrapiConfigured } from './env';

import type { ServicesData } from '../types/service';

export async function fetchServicesData(): Promise<ServicesData> {
  assertStrapiConfigured();
  return await getServicesDataLegacy();
}
