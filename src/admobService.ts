import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

// आपकी असली Google AdMob IDs
export const ADMOB_CONFIG = {
  appId: 'ca-app-pub-3864474052773685~5278392075',
  bannerId: 'ca-app-pub-3864474052773685/5997411521',
  interstitialId: 'ca-app-pub-3864474052773685/2764743520',
  rewardedId: 'ca-app-pub-3864474052773685/3747360540',
};

let lastWalletAdTime = 0;
let shortsWatchedCount = 0;

// 1. नीचे पट्टी वाला विज्ञापन (Banner Ad)
export const showBottomBanner = async () => {
  try {
    await AdMob.initialize();
    await AdMob.showBanner({
      adId: ADMOB_CONFIG.bannerId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 60,
    });
  } catch (e) {}
};

// 2. वॉलेट खोलने पर 10 मिनट वाला विज्ञापन नियम
export const checkWalletAdRule = async () => {
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;
  if (now - lastWalletAdTime >= tenMinutes) {
    lastWalletAdTime = now;
    await showFullScreenAd();
  }
};

// 3. हर 5 Shorts के बाद 1 विज्ञापन नियम
export const onShortVideoChanged = async () => {
  shortsWatchedCount += 1;
  if (shortsWatchedCount % 5 === 0) {
    await showFullScreenAd();
  }
};

// 4. लंबे वीडियो (Long Video) पर विज्ञापन नियम
export const onLongVideoOpened = async () => {
  await showFullScreenAd();
};

export const showFullScreenAd = async () => {
  try {
    await AdMob.prepareInterstitial({ adId: ADMOB_CONFIG.interstitialId });
    await AdMob.showInterstitial();
  } catch (e) {}
};

// 5. ज्यादा व्यूज़ वाले लॉक वीडियो को खोलने के लिए इनाम वाला विज्ञापन (Rewarded Ad)
export const unlockPopularVideoWithAd = async (onUnlocked: () => void) => {
  try {
    await AdMob.prepareRewardVideoAd({ adId: ADMOB_CONFIG.rewardedId });
    await AdMob.showRewardVideoAd();
    onUnlocked();
  } catch (e) {
    onUnlocked();
  }
};

// 6. खुद के स्पॉन्सर विज्ञापन का नियंत्रण (Admin Panel से सेट होगा)
export const getCustomSponsorAd = () => {
  const savedAd = localStorage.getItem('yashucook_sponsor_ad');
  return savedAd ? JSON.parse(savedAd) : null;
};

// 7. Anti-Fraud सुरक्षा कवच: एक फोन से 24 घंटे में केवल 1 ही असली व्यू गिनना
export const isValidUniqueView = (videoId: string | number): boolean => {
  const key = `viewed_${videoId}`;
  const lastViewed = localStorage.getItem(key);
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  if (lastViewed && now - Number(lastViewed) < twentyFourHours) {
    return false; // नकली या बार-बार देखा गया व्यू रोका गया
  }
  localStorage.setItem(key, String(now));
  return true; // असली व्यू मान्य
};
