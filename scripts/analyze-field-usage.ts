/**
 * Analyze field fill rates for Person and Service entities in Strapi
 *
 * Usage: npx tsx scripts/analyze-field-usage.ts
 *
 * Requires Strapi to be running at localhost:1337
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from apps/web/.env.local
config({ path: resolve(__dirname, '../apps/web/.env.local') });

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

interface FieldStat {
  entity: string;
  field: string;
  type: string;
  filled: number;
  total: number;
  fillRate: number;
}

// Check if a value is considered "filled"
function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return false;
  return true;
}

// Analyze a single record and count filled fields
function analyzeRecord(
  record: Record<string, unknown>,
  entityName: string,
  fieldTypes: Record<string, string>,
  stats: Map<string, FieldStat>
): void {
  for (const [field, type] of Object.entries(fieldTypes)) {
    const key = `${entityName}.${field}`;
    if (!stats.has(key)) {
      stats.set(key, {
        entity: entityName,
        field,
        type,
        filled: 0,
        total: 0,
        fillRate: 0,
      });
    }

    const stat = stats.get(key)!;
    stat.total++;

    const value = record[field];
    if (isFilled(value)) {
      stat.filled++;
    }

    // For components, analyze nested fields
    if (type.startsWith('component:') && value && typeof value === 'object') {
      const componentName = type.replace('component:', '');
      const componentTypes = getComponentFieldTypes(componentName);
      if (componentTypes) {
        analyzeRecord(value as Record<string, unknown>, `${entityName}.${field}`, componentTypes, stats);
      }
    }
  }
}

// Define field types for Person
const personFieldTypes: Record<string, string> = {
  fullName: 'string',
  personId: 'string',
  isTeam: 'boolean',
  isExpert: 'boolean',
  notes: 'text',
  photo: 'media',
  order: 'integer',
  team: 'component:team-info',
  expertProfile: 'component:expert-profile',
};

// Define field types for team-info component
const teamInfoFieldTypes: Record<string, string> = {
  unit: 'string',
  title: 'string',
  department: 'string',
};

// Define field types for expert-profile component
const expertProfileFieldTypes: Record<string, string> = {
  headline: 'string',
  roles: 'json',
  specialization: 'string',
  position: 'string',
  organization: 'string',
  registry: 'string',
  experienceYears: 'integer',
  experienceText: 'text',
  metrics: 'component:expert-metrics',
  activities: 'json',
  education: 'json',
  background: 'json',
  statuses: 'json',
  products: 'json',
  books: 'json',
  mediaMentions: 'json',
  sourcePages: 'json',
  sourceUrl: 'string',
};

// Define field types for expert-metrics component
const expertMetricsFieldTypes: Record<string, string> = {
  courseParticipants: 'string',
  moneySavedRub: 'string',
  returnedTaxesRub: 'string',
  eventsCount: 'string',
  audienceSize: 'string',
};

// Define field types for Service
const serviceFieldTypes: Record<string, string> = {
  title: 'string',
  slug: 'uid',
  serviceId: 'string',
  order: 'integer',
  shortDescription: 'text',
  fullDescription: 'richtext',
  benefits: 'component[]:text-item',
  facts: 'component:service-facts',
  methodology: 'component[]:methodology-item',
  howWeWork: 'component[]:text-item',
  deliveryFormats: 'json',
  topicsExample: 'component[]:text-item',
  recommendedFrequency: 'text',
  configurationNotes: 'text',
  mechanics: 'component[]:text-item',
  rewards: 'component[]:text-item',
  otherFormats: 'component[]:text-item',
  formats: 'json',
  options: 'component[]:text-item',
  includes: 'component[]:text-item',
  products: 'component[]:product-item',
  examples: 'component[]:service-example',
  cta: 'component:call-to-action',
  category: 'relation',
};

// Define field types for service-facts component
const serviceFactsFieldTypes: Record<string, string> = {
  experienceYears: 'integer',
  developedBy: 'string',
  participantsCount: 'string',
  deliveryFormat: 'string',
  dataOutputs: 'component[]:text-item',
};

// Define field types for call-to-action component
const ctaFieldTypes: Record<string, string> = {
  label: 'string',
  type: 'enumeration',
  url: 'string',
};

function getComponentFieldTypes(componentName: string): Record<string, string> | null {
  switch (componentName) {
    case 'team-info':
      return teamInfoFieldTypes;
    case 'expert-profile':
      return expertProfileFieldTypes;
    case 'expert-metrics':
      return expertMetricsFieldTypes;
    case 'service-facts':
      return serviceFactsFieldTypes;
    case 'call-to-action':
      return ctaFieldTypes;
    default:
      return null;
  }
}

async function fetchData<T>(endpoint: string, populateFields: string[] = []): Promise<T[]> {
  // Build populate query - Strapi 5 uses populate[0]=field1&populate[1]=field2 syntax
  let populateQuery = 'populate=*';
  if (populateFields.length > 0) {
    populateQuery = populateFields.map((f, i) => `populate[${i}]=${f}`).join('&');
  }

  const url = `${STRAPI_URL}/api${endpoint}?${populateQuery}&pagination[pageSize]=100`;
  console.log(`Fetching: ${url}`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return json.data || [];
}

async function main() {
  console.log('='.repeat(80));
  console.log('Field Usage Analysis for Person and Service');
  console.log('='.repeat(80));
  console.log();

  const stats = new Map<string, FieldStat>();

  // Fetch and analyze People
  console.log('Fetching People...');
  try {
    const peoplePopulate = ['photo', 'team', 'expertProfile', 'expertProfile.metrics'];
    const people = await fetchData<Record<string, unknown>>('/people', peoplePopulate);
    console.log(`Found ${people.length} Person records`);

    for (const person of people) {
      analyzeRecord(person, 'Person', personFieldTypes, stats);
    }
  } catch (error) {
    console.error('Error fetching people:', error);
  }

  console.log();

  // Fetch and analyze Services
  console.log('Fetching Services...');
  try {
    // Use populate=* to get all fields including components
    const services = await fetchData<Record<string, unknown>>('/services');
    console.log(`Found ${services.length} Service records`);

    for (const service of services) {
      analyzeRecord(service, 'Service', serviceFieldTypes, stats);
    }
  } catch (error) {
    console.error('Error fetching services:', error);
  }

  console.log();

  // Calculate fill rates
  for (const stat of stats.values()) {
    stat.fillRate = stat.total > 0 ? (stat.filled / stat.total) * 100 : 0;
  }

  // Sort by fill rate (ascending)
  const sortedStats = Array.from(stats.values()).sort((a, b) => a.fillRate - b.fillRate);

  // Output results
  console.log('='.repeat(80));
  console.log('RESULTS: Field Fill Rates (sorted by fill rate, lowest first)');
  console.log('='.repeat(80));
  console.log();

  // Group by entity
  const personStats = sortedStats.filter((s) => s.entity.startsWith('Person'));
  const serviceStats = sortedStats.filter((s) => s.entity.startsWith('Service'));

  console.log('## PERSON FIELDS');
  console.log('-'.repeat(80));
  console.log(
    'Entity'.padEnd(35) +
      'Field'.padEnd(25) +
      'Type'.padEnd(20) +
      'Fill Rate'.padEnd(12) +
      'Filled/Total'
  );
  console.log('-'.repeat(80));

  for (const stat of personStats) {
    const fillRateStr = `${stat.fillRate.toFixed(1)}%`;
    const countStr = `${stat.filled}/${stat.total}`;
    console.log(
      stat.entity.padEnd(35) +
        stat.field.padEnd(25) +
        stat.type.substring(0, 18).padEnd(20) +
        fillRateStr.padEnd(12) +
        countStr
    );
  }

  console.log();
  console.log('## SERVICE FIELDS');
  console.log('-'.repeat(80));
  console.log(
    'Entity'.padEnd(35) +
      'Field'.padEnd(25) +
      'Type'.padEnd(20) +
      'Fill Rate'.padEnd(12) +
      'Filled/Total'
  );
  console.log('-'.repeat(80));

  for (const stat of serviceStats) {
    const fillRateStr = `${stat.fillRate.toFixed(1)}%`;
    const countStr = `${stat.filled}/${stat.total}`;
    console.log(
      stat.entity.padEnd(35) +
        stat.field.padEnd(25) +
        stat.type.substring(0, 18).padEnd(20) +
        fillRateStr.padEnd(12) +
        countStr
    );
  }

  // Summary of rarely used fields
  console.log();
  console.log('='.repeat(80));
  console.log('SUMMARY: Rarely Used Fields (< 25% fill rate)');
  console.log('='.repeat(80));

  const rarelyUsed = sortedStats.filter((s) => s.fillRate < 25 && s.total > 0);
  if (rarelyUsed.length === 0) {
    console.log('No fields with < 25% fill rate found.');
  } else {
    for (const stat of rarelyUsed) {
      console.log(
        `- ${stat.entity}.${stat.field}: ${stat.fillRate.toFixed(1)}% (${stat.filled}/${stat.total})`
      );
    }
  }

  console.log();
  console.log('='.repeat(80));
  console.log('SUMMARY: Never Used Fields (0% fill rate)');
  console.log('='.repeat(80));

  const neverUsed = sortedStats.filter((s) => s.fillRate === 0 && s.total > 0);
  if (neverUsed.length === 0) {
    console.log('No fields with 0% fill rate found.');
  } else {
    for (const stat of neverUsed) {
      console.log(`- ${stat.entity}.${stat.field} (${stat.type})`);
    }
  }
}

main().catch(console.error);
