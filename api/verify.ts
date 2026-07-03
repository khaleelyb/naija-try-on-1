import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reference, userId, packId } = req.body;

    if (!reference || !userId || !packId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Verify with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // 2. Identify credits to add
    const pack = ({ starter: 5, popular: 15, value: 40 } as Record<string, number>)[packId as string] || 0;

    if (pack === 0) {
      return res.status(400).json({ error: 'Invalid pack ID' });
    }

    // 3. Update user credits
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    await supabaseAdmin
      .from('profiles')
      .update({ credits: profile.credits + pack })
      .eq('id', userId);

    // 4. Record transaction
    await supabaseAdmin.from('credit_transactions').insert({
      user_id: userId,
      amount: pack,
      reference: reference,
      type: 'purchase',
    });

    return res.status(200).json({ success: true, newBalance: profile.credits + pack });
  } catch (error: any) {
    console.error('Paystack error:', error);
    return res.status(500).json({ error: error.message || 'Failed to verify payment' });
  }
}
