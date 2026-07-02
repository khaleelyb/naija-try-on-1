import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Garment } from '../types';
import { INITIAL_GARMENTS } from '../data/garments';
import GarmentCard from '../components/GarmentCard';
import { Search, Filter, Loader2, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Wardrobe() {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [seeding, setSeeding] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');

  const categories = ['All', 'Agbada', 'Ankara', 'Senator Wear', 'Kaftan', 'Gele & Aso-Oke', 'Isiagu', 'Wedding/Aso-Ebi'];

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error) throw error;
      setConnectionStatus('ok');
    } catch (err) {
      setConnectionStatus('error');
      console.error('Connection error:', err);
    }
  };

  const fetchGarments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('garments')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGarments(data || []);
    } catch (err) {
      console.error('Error fetching garments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGarments();
  }, []);

  const seedWardrobe = async () => {
    setSeeding(true);
    try {
      const { error } = await supabase.from('garments').insert(INITIAL_GARMENTS);
      if (error) throw error;
      alert('Wardrobe seeded successfully!');
      fetchGarments();
    } catch (err: any) {
      console.error('Seeding error:', err);
      alert('Failed to seed. Make sure you have created the table in Supabase. Check console for SQL.');
    } finally {
      setSeeding(false);
    }
  };

  const filteredGarments = garments.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) || 
                          g.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || g.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-display">Wardrobe</h1>
          <div className="flex items-center space-x-2">
            <p className="text-stone-500">Discover authentic Nigerian styles for your virtual try-on.</p>
            <button 
              onClick={checkConnection}
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-bold transition-all",
                connectionStatus === 'ok' ? "bg-emerald-100 text-emerald-700" :
                connectionStatus === 'error' ? "bg-red-100 text-red-700" :
                "bg-stone-100 text-stone-500 hover:bg-stone-200"
              )}
            >
              {connectionStatus === 'checking' ? 'Checking...' : 
               connectionStatus === 'ok' ? 'Database Connected' : 
               connectionStatus === 'error' ? 'Database Error' : 'Check Database'}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search garments..."
              className="pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:border-nigeria-green outline-none w-full sm:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-nigeria-green"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-nigeria-green" />
          <p className="text-stone-500 font-medium">Fetching the collection...</p>
        </div>
      ) : garments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGarments.map((garment, idx) => (
            <motion.div
              key={garment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <GarmentCard garment={garment} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-stone-100 rounded-3xl p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center mx-auto">
            <RefreshCcw className="w-10 h-10 text-stone-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">No Garments Found</h3>
            <p className="text-stone-500 max-w-md mx-auto">
              Your wardrobe is currently empty. You can seed it with initial designs to get started.
            </p>
          </div>
          <button
            onClick={seedWardrobe}
            disabled={seeding}
            className="bg-nigeria-green text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors disabled:opacity-50 inline-flex items-center"
          >
            {seeding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Seed Wardrobe Data
          </button>
        </div>
      )}

      {/* SQL Script info for the user if they haven't set up Supabase */}
      {garments.length === 0 && !loading && (
        <div className="mt-20 p-6 bg-stone-900 rounded-2xl text-white overflow-hidden relative">
          <div className="relative z-10 space-y-4">
            <h4 className="text-gold font-bold">Quick Setup Guide</h4>
            <p className="text-sm text-stone-400">
              To use this app, follow these steps in your Supabase dashboard:
            </p>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-stone-300">1. Create SQL Tables</p>
                <pre className="text-[10px] bg-black/50 p-4 rounded-lg overflow-x-auto text-emerald-400">
{`-- Create tables and policies
create table profiles ( id uuid references auth.users primary key, full_name text, credits int default 3, created_at timestamptz default now() );
create table garments ( id uuid primary key default gen_random_uuid(), name text not null, category text not null, description text, fabric_type text, color_details text, reference_image_url text not null, price_credits int default 1, is_active boolean default true, created_at timestamptz default now() );
create table tryon_history ( id uuid primary key default gen_random_uuid(), user_id uuid references profiles(id), garment_id uuid references garments(id), user_photo_url text not null, result_image_url text, status text default 'pending', created_at timestamptz default now() );

alter table profiles enable row level security;
alter table garments enable row level security;
alter table tryon_history enable row level security;

create policy "Public read garments" on garments for select using (true);
create policy "Allow insert garments" on garments for insert with check (true);
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can view own history" on tryon_history for select using (auth.uid() = user_id);
create policy "Users can insert own history" on tryon_history for insert with check (auth.uid() = user_id);`}
                </pre>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-stone-300">2. Create Storage Buckets</p>
                <ul className="text-[10px] text-stone-400 list-disc ml-4">
                  <li><strong>user-photos</strong> (Private)</li>
                  <li><strong>tryon-results</strong> (Private)</li>
                  <li><strong>garment-references</strong> (Public)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
