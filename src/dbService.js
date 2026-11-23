import { supabase } from './supabaseClient';

// 1. सभी वीडियो (Reels और Long Videos) लाने के लिए (Guest Mode में भी चलेगा)
export async function fetchAllVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) console.error('Videos fetch error:', error);
  return data || [];
}

// 2. नया वीडियो अपलोड करने के लिए (केवल लॉगिन यूज़र्स के लिए)
export async function uploadNewVideo(videoData) {
  const { data, error } = await supabase
    .from('videos')
    .insert([videoData])
    .select();
  if (error) throw error;
  return data[0];
}

// 3. यूज़र की प्रोफाइल और कमाई (Wallet) देखने या बनाने के लिए
export async function getOrCreateProfile(userId, phoneOrEmail) {
  let { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!data) {
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([{ id: userId, phone: phoneOrEmail, wallet_balance: 0 }])
      .select()
      .single();
    if (insertError) throw insertError;
    return newProfile;
  }
  return data;
}

// 4. चैट मैसेज भेजने और पढ़ने के लिए
export async function sendMessage(senderId, receiverId, text) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender_id: senderId, receiver_id: receiverId, content: text }]);
  if (error) throw error;
  return data;
}

// 5. पैसे निकालने (Withdrawal) की रिक्वेस्ट भेजने के लिए
export async function requestWithdrawal(userId, amount, upiId) {
  const { data, error } = await supabase
    .from('withdrawals')
    .insert([{ user_id: userId, amount: amount, upi_id: upiId, status: 'pending' }]);
  if (error) throw error;
  return data;
}
