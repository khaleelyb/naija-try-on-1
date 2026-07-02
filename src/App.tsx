import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Wardrobe from './pages/Wardrobe';
import TryOn from './pages/TryOn';
import Gallery from './pages/Gallery';
import Wallet from './pages/Wallet';
import AdminGarments from './pages/AdminGarments';
import Navbar from './components/Navbar';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      const syncProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (error || !data) {
          // Profile doesn't exist, create it with 3 free credits
          await supabase.from('profiles').insert({
            id: session.user.id,
            full_name: session.user.user_metadata.full_name || '',
            credits: 3
          });
        }
      };
      syncProfile();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      <Navbar session={session} />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/wardrobe" />} />
          <Route path="/wardrobe" element={<Wardrobe />} />
          <Route path="/tryon/:garmentId" element={session ? <TryOn /> : <Navigate to="/auth" />} />
          <Route path="/gallery" element={session ? <Gallery /> : <Navigate to="/auth" />} />
          <Route path="/wallet" element={session ? <Wallet /> : <Navigate to="/auth" />} />
          <Route path="/admin/garments" element={session ? <AdminGarments /> : <Navigate to="/auth" />} />
        </Routes>
      </main>
    </div>
  );
}
