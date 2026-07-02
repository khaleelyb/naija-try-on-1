import { Link } from 'react-router-dom';
import { Shirt, Sparkles } from 'lucide-react';
import { Garment } from '../types';

export default function GarmentCard({ garment }: { garment: Garment }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
      <div className="aspect-[3/4] relative overflow-hidden bg-stone-100">
        <img
          src={garment.reference_image_url}
          alt={garment.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-md text-[10px] font-bold uppercase tracking-wider text-stone-600 shadow-sm">
          {garment.category}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-display font-bold text-lg mb-1">{garment.name}</h3>
        <p className="text-stone-500 text-sm line-clamp-2 mb-4 flex-grow">
          {garment.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-50">
          <div className="flex items-center text-xs font-bold text-gold">
            <Sparkles className="w-3 h-3 mr-1" />
            {garment.price_credits} {garment.price_credits === 1 ? 'Credit' : 'Credits'}
          </div>
          <Link
            to={`/tryon/${garment.id}`}
            className="bg-nigeria-green text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-800 transition-colors"
          >
            Try It On
          </Link>
        </div>
      </div>
    </div>
  );
}
