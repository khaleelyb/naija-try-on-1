import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TryOnHistory } from '../types';
import { Loader2, Download, Trash2, ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function Gallery() {
  const [history, setHistory] = useState<TryOnHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tryon_history')
        .select('*, garment:garments(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;
    
    try {
      const { error } = await supabase.from('tryon_history').delete().eq('id', id);
      if (error) throw error;
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold font-display">My Gallery</h1>
        <p className="text-stone-500">Your virtual try-on history and saved looks.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-nigeria-green" />
          <p className="text-stone-500">Loading your history...</p>
        </div>
      ) : history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {history.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm group"
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-stone-100">
                <img
                  src={item.result_image_url || ''}
                  alt={item.garment?.name || 'Try On Result'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                  <a
                    href={item.result_image_url || ''}
                    download
                    className="p-3 bg-white rounded-full text-stone-900 hover:scale-110 transition-transform"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-3 bg-white rounded-full text-red-500 hover:scale-110 transition-transform"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{item.garment?.name}</h3>
                    <p className="text-xs text-stone-400">
                      {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-stone-100 rounded text-stone-500">
                    {item.garment?.category}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-stone-100 rounded-3xl p-20 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center mx-auto">
            <ImageIcon className="w-10 h-10 text-stone-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Your gallery is empty</h3>
            <p className="text-stone-500">Try on some garments from the wardrobe to see them here!</p>
          </div>
          <button
            onClick={() => window.location.href = '/wardrobe'}
            className="bg-nigeria-green text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors"
          >
            Go to Wardrobe
          </button>
        </div>
      )}
    </div>
  );
}
