import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Garment } from '../types';
import { Upload, Camera, Sparkles, Loader2, CheckCircle2, Download, Share2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function TryOn() {
  const { garmentId } = useParams();
  const navigate = useNavigate();
  const [garment, setGarment] = useState<Garment | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    const fetchGarment = async () => {
      const { data, error } = await supabase.from('garments').select('*').eq('id', garmentId).single();
      if (error) {
        console.error(error);
        navigate('/wardrobe');
      } else {
        setGarment(data);
      }
    };

    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
        if (data) setCredits(data.credits);
      }
    };

    fetchGarment();
    fetchProfile();
  }, [garmentId, navigate]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate resolution (simulated client-side check)
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      if (img.width < 500 || img.height < 500) {
        setError('Please upload a higher resolution photo (at least 500x500px) for better results.');
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const fileName = `user_${user.id}_${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('user-photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('user-photos')
          .getPublicUrl(fileName);

        setUserPhoto(publicUrl);
      } catch (err: any) {
        setError(err.message || 'Failed to upload photo');
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleTryOn = async () => {
    if (!userPhoto || !garment) return;
    if (credits < 1) {
      navigate('/wallet');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          userPhotoUrl: userPhoto,
          garmentId: garment.id
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate');

      setResultImage(data.resultImageUrl);
      setCredits(prev => prev - 1);
    } catch (err: any) {
      setError(err.message || 'An error occurred during try-on');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!garment) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex items-center space-x-4 mb-8">
        <button onClick={() => navigate('/wardrobe')} className="text-stone-500 hover:text-nigeria-green">
          ← Back to Wardrobe
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Left: Photos */}
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            {/* User Photo */}
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-wider text-stone-500">Your Photo</label>
              <div className="aspect-[3/4] rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center relative overflow-hidden group">
                {userPhoto ? (
                  <>
                    <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      <Camera className="text-white w-8 h-8" />
                      <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                    </label>
                  </>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer p-4 text-center">
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-nigeria-green" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-stone-400 mb-2" />
                        <span className="text-xs font-medium text-stone-500">Click to upload full-body photo</span>
                      </>
                    )}
                    <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" disabled={isUploading} />
                  </label>
                )}
              </div>
            </div>

            {/* Garment Photo */}
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-wider text-stone-500">Garment</label>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 shadow-sm">
                <img src={garment.reference_image_url} alt={garment.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold flex items-center text-nigeria-green">
                <Sparkles className="w-4 h-4 mr-2" />
                Virtual Try-On
              </h3>
              <span className="text-xs font-bold text-stone-500 bg-white px-2 py-1 rounded-md shadow-sm border border-stone-100">
                Credits: {credits}
              </span>
            </div>
            <p className="text-sm text-stone-600">
              Our AI will analyze your pose and light to perfectly fit the <strong>{garment.name}</strong> onto your photo.
            </p>
            <button
              onClick={handleTryOn}
              disabled={!userPhoto || isGenerating || isUploading}
              className={cn(
                "w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center",
                userPhoto && !isGenerating
                  ? "bg-nigeria-green text-white hover:bg-emerald-800 shadow-lg shadow-emerald-900/20"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Generating Your Look...
                </>
              ) : (
                <>Try It On (1 Credit)</>
              )}
            </button>
            {error && (
              <div className="flex items-center p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right: Result */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-wider text-stone-500">Result</label>
          <div className="aspect-[3/4] rounded-3xl bg-stone-100 flex items-center justify-center relative overflow-hidden border border-stone-200">
            <AnimatePresence mode="wait">
              {resultImage ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full relative"
                >
                  <img src={resultImage} alt="Try On Result" className="w-full h-full object-cover" />
                  <div className="absolute bottom-6 left-6 right-6 flex gap-3">
                    <button className="flex-1 bg-white/90 backdrop-blur text-stone-900 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-white transition-all shadow-xl">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </button>
                    <button className="flex-1 bg-nigeria-green/90 backdrop-blur text-white py-3 rounded-xl font-bold flex items-center justify-center hover:bg-nigeria-green transition-all shadow-xl">
                      <Share2 className="w-4 h-4 mr-2" /> Share
                    </button>
                  </div>
                </motion.div>
              ) : isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center p-12 space-y-6"
                >
                  <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin text-nigeria-green" />
                    <Sparkles className="w-6 h-6 text-gold absolute top-0 right-0 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold">Stitching Your Outfit</h3>
                    <p className="text-sm text-stone-500 max-w-[240px]">Gemini is weaving the fabric patterns onto your silhouette...</p>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center p-12 space-y-4 text-stone-400">
                  <div className="w-20 h-20 border-2 border-stone-200 rounded-full flex items-center justify-center mx-auto opacity-50">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <p className="text-sm font-medium">Upload your photo and tap "Try It On" to see the magic.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
