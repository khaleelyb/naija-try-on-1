export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  credits: number;
  created_at: string;
}

export interface Garment {
  id: string;
  name: string;
  category: 'Agbada' | 'Ankara' | 'Senator Wear' | 'Kaftan' | 'Gele & Aso-Oke' | 'Isiagu' | 'Wedding/Aso-Ebi';
  description: string | null;
  fabric_type: string | null;
  color_details: string | null;
  reference_image_url: string;
  price_credits: number;
  is_active: boolean;
  created_at: string;
}

export interface TryOnHistory {
  id: string;
  user_id: string;
  garment_id: string;
  user_photo_url: string;
  result_image_url: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  garment?: Garment;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  reference: string | null;
  type: 'purchase' | 'tryon_spend';
  created_at: string;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: 'starter', name: 'Starter', credits: 5, price: 1000 },
  { id: 'popular', name: 'Popular', credits: 15, price: 2500 },
  { id: 'value', name: 'Value', credits: 40, price: 6000 },
];
