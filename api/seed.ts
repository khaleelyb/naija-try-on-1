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
    const { garments } = req.body;
    if (!garments || !Array.isArray(garments)) {
      return res.status(400).json({ error: 'Invalid garments data' });
    }

    const { data, error } = await supabaseAdmin.from('garments').insert(garments).select();

    if (error) throw error;

    return res.status(200).json({ success: true, count: data.length });
  } catch (error: any) {
    console.error('Seed error:', error);
    return res.status(500).json({ error: error.message || 'Failed to seed wardrobe' });
  }
}
