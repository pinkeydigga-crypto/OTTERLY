import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '').trim()
      : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
      process.env.NEXT_PUBLIC_SUAbPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
    }

    // Verify caller's token and extract the authenticated user's ID
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const targetUserId = user.id;

    // Admin client with service role key only
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // 1. Delete profile entry first
    const { error: profileDeleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', targetUserId);

    if (profileDeleteError) {
      throw profileDeleteError;
    }

    // 2. Delete user from Supabase Auth
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (deleteAuthError) {
      throw deleteAuthError;
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Server deletion error:', err);
    const message = err instanceof Error ? err.message : 'Failed to delete user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}