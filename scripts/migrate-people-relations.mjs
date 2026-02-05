/**
 * Migration Script: People Relations
 *
 * Updates existing people in Strapi with:
 * - team/expertGroup relations (via team-config and expert-config single types)
 * - Flat fields: position, headline, experienceYears
 *
 * This script assumes people already exist in Strapi (created by migrate-to-strapi.mjs)
 * and just updates the relations and flat fields from the JSON source.
 *
 * Usage:
 *   STRAPI_URL=http://localhost:1337 \
 *   STRAPI_API_TOKEN=your_token \
 *   node scripts/migrate-people-relations.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const CONFIG = {
  strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
  strapiToken: process.env.STRAPI_API_TOKEN,
  peoplePath: path.join(__dirname, '../apps/web/public/content/ncfg_finzdorov_people.json'),
};

// Helper: Make API request to Strapi
async function strapiRequest(endpoint, method = 'GET', data = null) {
  const url = `${CONFIG.strapiUrl}/api${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (CONFIG.strapiToken) {
    options.headers['Authorization'] = `Bearer ${CONFIG.strapiToken}`;
  }

  if (data !== null) {
    options.body = JSON.stringify({ data });
  }

  const response = await fetch(url, options);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Strapi API error (${response.status}): ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

// Helper: Read JSON file
async function readJSON(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

// ====================
// MIGRATION: People Relations
// ====================
async function migrate() {
  console.log('\n🔄 Migrating People Relations to Strapi');
  console.log('=========================================');
  console.log(`   Strapi URL: ${CONFIG.strapiUrl}`);
  console.log(`   Token configured: ${CONFIG.strapiToken ? 'Yes' : 'No'}\n`);

  // 1. Get or create team-config (Single Type)
  console.log('📋 Step 1: Setting up Team Configuration...');
  let teamConfig;
  try {
    teamConfig = await strapiRequest('/team-config');
    if (teamConfig?.data) {
      console.log(`   ✅ Team config exists (id: ${teamConfig.data.id})`);
    } else {
      throw new Error('No data');
    }
  } catch {
    console.log('   Creating team-config...');
    teamConfig = await strapiRequest('/team-config', 'PUT', {
      title: 'Наша команда',
    });
    console.log(`   ✅ Created team config (id: ${teamConfig.data.id})`);
  }
  const teamConfigId = teamConfig.data.id;

  // 2. Get or create expert-config (Single Type)
  console.log('\n📋 Step 2: Setting up Expert Configuration...');
  let expertConfig;
  try {
    expertConfig = await strapiRequest('/expert-config');
    if (expertConfig?.data) {
      console.log(`   ✅ Expert config exists (id: ${expertConfig.data.id})`);
    } else {
      throw new Error('No data');
    }
  } catch {
    console.log('   Creating expert-config...');
    expertConfig = await strapiRequest('/expert-config', 'PUT', {
      title: 'Наши эксперты',
    });
    console.log(`   ✅ Created expert config (id: ${expertConfig.data.id})`);
  }
  const expertConfigId = expertConfig.data.id;

  // 3. Get all people from Strapi
  console.log('\n👥 Step 3: Fetching people from Strapi...');
  const strapiPeopleResponse = await strapiRequest('/people?pagination[limit]=100&populate=*');
  const strapiPeople = strapiPeopleResponse.data || [];
  console.log(`   Found ${strapiPeople.length} people in Strapi`);

  // 4. Load JSON data
  console.log('\n📂 Step 4: Loading JSON data...');
  const jsonData = await readJSON(CONFIG.peoplePath);
  const jsonPeople = jsonData.people || [];
  console.log(`   Found ${jsonPeople.length} people in JSON`);

  // 5. Update each person
  console.log('\n🔄 Step 5: Updating people relations...\n');

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const jsonPerson of jsonPeople) {
    // Find matching person in Strapi by fullName
    const strapiPerson = strapiPeople.find(
      (p) => p.fullName === jsonPerson.fullName
    );

    if (!strapiPerson) {
      console.log(`   ⚠️  Not found in Strapi: ${jsonPerson.fullName}`);
      notFound++;
      continue;
    }

    // Check if already has relations set
    const hasTeamRelation = strapiPerson.team !== null;
    const hasExpertRelation = strapiPerson.expertGroup !== null;
    const shouldBeTeam = jsonPerson.isTeam === true;
    const shouldBeExpert = jsonPerson.isExpert === true;

    // Skip if relations are already correct
    if (hasTeamRelation === shouldBeTeam && hasExpertRelation === shouldBeExpert) {
      console.log(`   ⏭️  Already configured: ${jsonPerson.fullName}`);
      skipped++;
      continue;
    }

    // Prepare update data
    const updateData = {
      // Flat fields from nested structure
      position: jsonPerson.team?.title || null,
      headline: jsonPerson.expertProfile?.headline || null,
      experienceYears: jsonPerson.expertProfile?.experienceYears || null,
    };

    // Set relations based on flags
    if (shouldBeTeam) {
      updateData.team = teamConfigId;
    } else {
      updateData.team = null;
    }

    if (shouldBeExpert) {
      updateData.expertGroup = expertConfigId;
    } else {
      updateData.expertGroup = null;
    }

    try {
      // Strapi 5 uses documentId for updates
      const documentId = strapiPerson.documentId || strapiPerson.id;
      await strapiRequest(`/people/${documentId}`, 'PUT', updateData);

      const roles = [];
      if (shouldBeTeam) roles.push('team');
      if (shouldBeExpert) roles.push('expert');
      console.log(`   ✅ Updated: ${jsonPerson.fullName} [${roles.join(', ') || 'none'}]`);
      updated++;
    } catch (error) {
      console.error(`   ❌ Error updating ${jsonPerson.fullName}:`, error.message);
    }
  }

  // Summary
  console.log('\n=========================================');
  console.log('📊 Migration Summary:');
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped (already configured): ${skipped}`);
  console.log(`   Not found in Strapi: ${notFound}`);
  console.log('\n🎉 Migration complete!');

  // Verification hint
  console.log('\n📋 Verification steps:');
  console.log('   1. Open Strapi Admin: http://localhost:1337/admin');
  console.log('   2. Go to Content Manager > Person');
  console.log('   3. Check that team/expertGroup relations are set');
  console.log('   4. Test on website: http://localhost:3000/about');
}

// Main
migrate().catch((error) => {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
});
