import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Garment } from '../types';
import GarmentCard from '../components/GarmentCard';
import { Search, Filter, Loader2, Shirt } from 'lucide-react';
import { motion } from 'motion/react';

export default function Wardrobe() {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Agbada', 'Ankara', 'Senator Wear', 'Kaftan', 'Gele & Aso-Oke', 'Isiagu', 'Wedding/Aso-Ebi'];

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
          <p className="text-stone-500">Discover authentic Nigerian styles for your virtual try-on.</p>
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
        <div className="bg-stone-100 rounded-3xl p-12 text-center space-y-4">
          <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center mx-auto">
            <Shirt className="w-10 h-10 text-stone-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">New Styles Coming Soon</h3>
            <p className="text-stone-500 max-w-md mx-auto">
              We're adding fresh Nigerian styles to the wardrobe. Check back shortly!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
