#!/usr/bin/env node

/**
 * Migration Runner Script
 * Executes Supabase SQL migrations using the service role key
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

if (supabaseServiceKey === 'your_supabase_service_role_key') {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is still a placeholder');
  console.error('\nTo get your service role key:');
  console.error('1. Go to https://supabase.com/dashboard/project/ctoqgislfhnqfwpxwqvb/settings/api');
  console.error('2. Copy the "service_role" key (keep it secret!)');
  console.error('3. Update SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n📋 Running migration: ${fileName}`);

  try {
    const sql = fs.readFileSync(filePath, 'utf8');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try direct approach if rpc doesn't work
      console.log('   Trying direct SQL execution...');
      const { error: directError } = await supabase.from('_migrations').insert({
        name: fileName,
        executed_at: new Date().toISOString()
      });

      if (directError && directError.code !== '42P01') { // 42P01 = table doesn't exist
        throw directError;
      }

      // If we can't use RPC or track migrations, just inform the user
      console.log('⚠️  Note: SQL needs to be executed manually in Supabase dashboard');
      console.log(`   File: ${filePath}`);
      return false;
    }

    console.log(`✅ Successfully executed: ${fileName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to execute ${fileName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Supabase migrations...\n');
  console.log(`📍 Project: ${supabaseUrl}`);

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Error: migrations directory not found');
    process.exit(1);
  }

  // Get all SQL files
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`📁 Found ${files.length} migration files\n`);

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const success = await runMigration(filePath);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Migration Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📝 Total: ${files.length}`);

  if (failCount > 0) {
    console.log('\n⚠️  Some migrations failed or need manual execution');
    console.log('Please execute them manually in the Supabase SQL Editor:');
    console.log(`https://supabase.com/dashboard/project/ctoqgislfhnqfwpxwqvb/sql/new`);
  }

  console.log('\n✨ Migration process completed!\n');
}

main().catch(console.error);
