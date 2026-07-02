import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Garment } from '../types';
import { Loader2, Plus, Trash2, EyeOff, Eye, UploadCloud, X } from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES = ['Agbada', 'Ankara', 'Senator Wear', 'Kaftan', 'Gele & Aso-Oke', 'Isiagu', 'Wedding/Aso-Ebi'];

const EMPTY_FORM = {
  name: '',
  category: CATEGORIES[0],
  description: '',
  fabric_type: '',
  color_details: '',
  price_credits: 1,
};

export default function AdminGarments() {
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCheckingAccess(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      setIsAdmin(!!data?.is_admin);
      setCheckingAccess(false);
    };
    checkAccess();
  }, []);

  const fetchGarments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('garments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setGarments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchGarments();
  }, [isAdmin]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageUrlInput('');
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrlInput('');
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    clearImage();
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.name.trim()) {
      setErrorMsg('Name is required.');
      return;
    }
    if (!imageFile && !imageUrlInput.trim()) {
      setErrorMsg('Upload an image or paste an image URL.');
      return;
    }

    setSaving(true);
    try {
      let reference_image_url = imageUrlInput.trim();

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const fileName = `garment_${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('garment-references')
          .upload(fileName, imageFile, { contentType: imageFile.type });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('garment-references')
          .getPublicUrl(fileName);

        reference_image_url = publicUrl;
      }

      const { error: insertError } = await supabase.from('garments').insert({
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim() || null,
        fabric_type: form.fabric_type.trim() || null,
        color_details: form.color_details.trim() || null,
        reference_image_url,
        price_credits: form.price_credits,
        is_active: true,
      });

      if (insertError) throw insertError;

      resetForm();
      fetchGarments();
    } catch (err: any) {
      console.error('Error adding garment:', err);
      setErrorMsg(err.message || 'Failed to add garment.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (garment: Garment) => {
    await supabase
      .from('garments')
      .update({ is_active: !garment.is_active })
      .eq('id', garment.id);
    fetchGarments();
  };

  const deleteGarment = async (garment: Garment) => {
    if (!confirm(`Delete "${garment.name}"? This cannot be undone.`)) return;
    await supabase.from('garments').delete().eq('id', garment.id);
    fetchGarments();
  };

  if (checkingAccess) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-nigeria-green" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/wardrobe" />;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold font-display">Manage Wardrobe</h1>
        <p className="text-stone-500">Add and manage the garments shown to users.</p>
      </div>

      {/* Add garment form */}
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-3xl p-6 space-y-6">
        <h2 className="text-lg font-bold">Add New Garment</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-stone-700">Image</label>

            {imagePreview || imageUrlInput ? (
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                <img
                  src={imagePreview || imageUrlInput}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 hover:bg-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[3/4] rounded-2xl border-2 border-dashed border-stone-300 cursor-pointer hover:border-nigeria-green transition-colors bg-stone-50">
                <UploadCloud className="w-8 h-8 text-stone-400 mb-2" />
                <span className="text-sm text-stone-500">Click to upload image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400">OR</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            <input
              type="url"
              placeholder="Paste image URL instead"
              className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-nigeria-green outline-none text-sm"
              value={imageUrlInput}
              onChange={(e) => {
                setImageUrlInput(e.target.value);
                setImageFile(null);
                setImagePreview(null);
              }}
            />
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-700">Name</label>
              <input
                type="text"
                required
                className="w-full mt-1 px-4 py-2 rounded-xl border border-stone-200 focus:border-nigeria-green outline-none"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Royal Blue Agbada"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700">Category</label>
              <select
                className="w-full mt-1 px-4 py-2 rounded-xl border border-stone-200 focus:border-nigeria-green outline-none"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-stone-700">Fabric Type</label>
                <input
                  type="text"
                  className="w-full mt-1 px-4 py-2 rounded-xl border border-stone-200 focus:border-nigeria-green outline-none"
                  value={form.fabric_type}
                  onChange={(e) => setForm({ ...form, fabric_type: e.target.value })}
                  placeholder="e.g. Silk-Cotton Blend"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700">Price (credits)</label>
                <input
                  type="number"
                  min={1}
                  className="w-full mt-1 px-4 py-2 rounded-xl border border-stone-200 focus:border-nigeria-green outline-none"
                  value={form.price_credits}
                  onChange={(e) => setForm({ ...form, price_credits: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700">Color Details</label>
              <input
                type="text"
                className="w-full mt-1 px-4 py-2 rounded-xl border border-stone-200 focus:border-nigeria-green outline-none"
                value={form.color_details}
                onChange={(e) => setForm({ ...form, color_details: e.target.value })}
                placeholder="e.g. Royal Blue with White details"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700">Description</label>
              <textarea
                rows={3}
                className="w-full mt-1 px-4 py-2 rounded-xl border border-stone-200 focus:border-nigeria-green outline-none resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description shown on the garment card"
              />
            </div>
          </div>
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-nigeria-green text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors disabled:opacity-50 inline-flex items-center"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
          Add Garment
        </button>
      </form>

      {/* Existing garments */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Existing Garments ({garments.length})</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-nigeria-green" />
          </div>
        ) : garments.length === 0 ? (
          <p className="text-stone-500">No garments yet. Add your first one above.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {garments.map((garment) => (
              <div
                key={garment.id}
                className={cn(
                  "bg-white rounded-2xl border border-stone-100 overflow-hidden flex flex-col",
                  !garment.is_active && "opacity-50"
                )}
              >
                <div className="aspect-[3/4] bg-stone-100">
                  <img
                    src={garment.reference_image_url}
                    alt={garment.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-3 flex flex-col flex-grow">
                  <p className="font-bold text-sm">{garment.name}</p>
                  <p className="text-xs text-stone-500 mb-3">{garment.category}</p>
                  <div className="mt-auto flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(garment)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors"
                    >
                      {garment.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {garment.is_active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => deleteGarment(garment)}
                      className="flex items-center justify-center p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
