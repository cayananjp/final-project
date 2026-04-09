import React, { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import { supabase } from '../supabaseClient';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data, error } = await supabase
      .from('user_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center p-12">Loading transactions...</div>;
  }

  return (
    <div className="max-w-[800px] mx-auto mt-10 px-5">
      <h1 className="text-orange-600 mb-5"><ClipboardList className="w-6 h-6 inline-block" /> Your Activity Log</h1>
      
      {transactions.length === 0 ? (
        <p>No activity yet. Start adding ingredients and saving recipes!</p>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden shadow-md">
          {transactions.map((tx) => (
            <div key={tx.id} className="px-5 py-[15px] border-b border-gray-200 transition-colors duration-200 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-orange-600 uppercase text-sm">
                    {tx.action.replace('_', ' ').toUpperCase()}
                  </span>
                  {tx.details && (
                    <span className="text-gray-500 text-[0.9rem] ml-2.5">
                      {Object.entries(tx.details).map(([key, val]) => `${key}: ${val}`).join(', ')}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(tx.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;