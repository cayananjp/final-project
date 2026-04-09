import { supabase } from '../supabaseClient';

export const logTransaction = async (action, details = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user logged in, skipping transaction log:', action);
      return;
    }
    
    const { error } = await supabase.from('user_transactions').insert([{
      user_id: user.id,
      action: action,
      details: details
    }]);
    
    if (error) {
      console.error('Failed to log transaction:', error);
    } else {
      console.log(`📝 Logged: ${action}`, details);
    }
  } catch (error) {
    console.error('Error in logTransaction:', error);
  }
};

export default logTransaction;