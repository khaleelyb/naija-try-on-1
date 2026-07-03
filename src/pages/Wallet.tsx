import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CREDIT_PACKS, CreditPack, CreditTransaction } from '../types';
import { Wallet as WalletIcon, Plus, Sparkles, Loader2, CheckCircle2, History } from 'lucide-react';
import { motion } from 'motion/react';
import { formatNaira, cn } from '../lib/utils';

declare const PaystackPop: any;

export default function Wallet() {
  const [credits, setCredits] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingPack, setPurchasingPack] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, transRes] = await Promise.all([
        supabase.from('profiles').select('credits').eq('id', user.id).single(),
        supabase.from('credit_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
      ]);

      if (profileRes.data) setCredits(profileRes.data.credits);
      if (transRes.data) setTransactions(transRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePurchase = (pack: CreditPack) => {
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      alert('Paystack public key is not configured.');
      return;
    }

    if (typeof PaystackPop === 'undefined') {
      console.error('PaystackPop is not defined — the Paystack script may be blocked or failed to load.');
      alert('Payment system failed to load. Please disable any ad blockers and refresh the page, then try again.');
      return;
    }

    setPurchasingPack(pack.id);

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setPurchasingPack(null);
        return;
      }

      try {
        const handler = PaystackPop.setup({
          key: publicKey,
          email: user.email,
          amount: pack.price * 100, // Paystack expects amount in Kobo
          currency: 'NGN',
          callback: async (response: any) => {
            // Verify on backend
            try {
              const verifyRes = await fetch('/api/paystack/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  reference: response.reference,
                  userId: user.id,
                  packId: pack.id
                })
              });

              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                setCredits(verifyData.newBalance);
                alert('Payment successful! Credits added to your account.');
                fetchData();
              } else {
                alert('Payment verification failed.');
              }
            } catch (err) {
              console.error('Payment verification error:', err);
              alert('Error verifying payment.');
            } finally {
              setPurchasingPack(null);
            }
          },
          onClose: () => {
            setPurchasingPack(null);
          }
        });
        handler.openIframe();
      } catch (err) {
        console.error('Failed to open Paystack checkout:', err);
        alert('Could not open the payment window. Please try again.');
        setPurchasingPack(null);
      }
    }).catch((err) => {
      console.error('Failed to get user for purchase:', err);
      setPurchasingPack(null);
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-nigeria-green text-white p-10 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="space-y-4 relative z-10">
          <div className="flex items-center space-x-2">
            <WalletIcon className="w-6 h-6 text-emerald-300" />
            <h2 className="text-xl font-bold font-display uppercase tracking-wider">Your Balance</h2>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-7xl font-bold font-display tracking-tight">{credits}</span>
            <span className="text-2xl font-bold text-emerald-300 uppercase tracking-widest">Credits</span>
          </div>
          <p className="text-emerald-100/70 text-sm">Use credits to try on new garments in the wardrobe.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 relative z-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-70">Next Step</p>
          <button 
            onClick={() => window.location.href = '/wardrobe'}
            className="bg-white text-nigeria-green px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-lg"
          >
            Browse Wardrobe
          </button>
        </div>
        {/* Background Sparkles */}
        <div className="absolute -bottom-10 -right-10 opacity-20">
          <Sparkles className="w-64 h-64 text-white rotate-12" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-display">Buy Credits</h2>
          <span className="text-stone-400 text-sm font-medium">Instant activation</span>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.id}
              className="bg-white border border-stone-200 p-8 rounded-3xl space-y-6 hover:border-nigeria-green transition-all group flex flex-col"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-bold">{pack.name} Pack</h3>
                <p className="text-stone-400 text-sm">{pack.credits} virtual try-ons</p>
              </div>
              <div className="text-3xl font-bold font-display">
                {formatNaira(pack.price)}
              </div>
              <button
                onClick={() => handlePurchase(pack)}
                disabled={purchasingPack !== null}
                className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold hover:bg-nigeria-green transition-all group-hover:shadow-lg disabled:opacity-50 flex items-center justify-center mt-auto"
              >
                {purchasingPack === pack.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Buy Now <Plus className="w-4 h-4 ml-2" /></>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-stone-400" />
          <h2 className="text-xl font-bold font-display">Recent Transactions</h2>
        </div>
        <div className="bg-white border border-stone-100 rounded-3xl overflow-hidden divide-y divide-stone-50">
          {loading ? (
            <div className="p-12 text-center text-stone-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Fetching history...</p>
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((tx) => (
              <div key={tx.id} className="p-5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="font-bold text-sm">
                    {tx.type === 'purchase' ? 'Credit Purchase' : 'Virtual Try-On'}
                  </p>
                  <p className="text-xs text-stone-400">
                    {new Date(tx.created_at).toLocaleDateString()}
                    {tx.reference && ` • Ref: ${tx.reference.substring(0, 8)}...`}
                  </p>
                </div>
                <div className={cn(
                  "font-bold font-display text-lg",
                  tx.amount > 0 ? "text-nigeria-green" : "text-terracotta"
                )}>
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-stone-400 italic text-sm">
              No transactions yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
