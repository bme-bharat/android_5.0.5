import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_KEY = 'RECENTLY_VIEWED_ITEMS';
const MAX_ITEMS = 20;
const ID_KEYS = {
  product: 'product_id',
  service: 'service_id',
  job: 'post_id',
  contact: 'target_user_id',
};
/**
 * Track a recently viewed post/item
 * - Stores the full post object
 * - Includes resolved image if provided
 * - Avoids duplicates (based on post_id)
 * - Keeps latest MAX_ITEMS
 */


export const trackRecent = async ({ type, data, id }) => {
  if (!type || !data) return;

  const idKey = ID_KEYS[type];
  const itemId = id || (idKey ? data[idKey] : data.id);
  if (!itemId) return;

  try {
    const existing = await AsyncStorage.getItem(RECENT_KEY);
    let list = existing ? JSON.parse(existing) : [];

    // 1️⃣ Deduplicate by type + itemId
    list = list.filter(
      i =>
        i.type !== type ||
        ((i.data[idKey] || i.data.id) !== itemId)
    );

    // 2️⃣ Add latest item at top
    list.unshift({
      data,
      type,
      viewedAt: Date.now(),
    });

    // 3️⃣ Enforce MAX 10 items PER TYPE
    const typeCount = {};
    list = list.filter(item => {
      typeCount[item.type] = (typeCount[item.type] || 0) + 1;
      return typeCount[item.type] <= 10;
    });

    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('❌ trackRecent error:', err);
  }
};



/**
 * Get all recent items
 */
export const getRecentItems = async () => {
  try {
    const data = await AsyncStorage.getItem(RECENT_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ getRecentItems error:', error);
    return [];  
  }
};

/**
 * Clear recent items
 */
export const clearRecentItems = async () => {
  try {
    await AsyncStorage.removeItem(RECENT_KEY);
  } catch (error) {
    console.error('❌ clearRecentItems error:', error);
  }
};
