
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing environment variables. Check .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifyUser() {
    const email = 'vitorkim1971@gmail.com';
    console.log(`Searching for user: ${email}...`);

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    console.log('Found users:', data.users.map(u => u.email));

    const user = data.users.find((u) => u.email === email);

    if (!user) {
        console.error(`User ${email} not found! Check the email list above.`);
        return;
    }

    console.log(`Found user ${user.id}. Verifying...`);

    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
    );

    if (updateError) {
        console.error('Error verifying user:', updateError);
    } else {
        console.log('Successfully verified user email!');
    }
}

verifyUser();
