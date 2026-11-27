import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const authHeader =
      request.headers.get('authorization') || request.headers.get('Authorization');
    const token =
      authHeader && authHeader.toLowerCase().startsWith('bearer ')
        ? authHeader.slice(7).trim()
        : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUAbPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const missingVars: string[] = [];
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!anonKey) missingVars.push('NEXT_PUBLIC_SUAbPABASE_ANON_KEY');
    if (!serviceRoleKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');

    if (missingVars.length > 0) {
      return NextResponse.json(
        { error: `Server configuration missing: ${missingVars.join(', ')}` },
        { status: 500 }
      );
    }

    const validUrl = supabaseUrl as string;
    const validAnonKey = anonKey as string;
    const validServiceRoleKey = serviceRoleKey as string;

    const supabaseAuth = createClient(validUrl, validAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);

    if (authError || !user?.id) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const targetUserId = user.id;

    const supabaseAdmin = createClient(validUrl, validServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: profileDeleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', targetUserId);

    if (profileDeleteError) {
      throw profileDeleteError;
    }

    const { error: deleteAuthError } =
      await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (deleteAuthError) {
      throw deleteAuthError;
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Server deletion error:', err);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}