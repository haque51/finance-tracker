/**
 * Base44 Client Adapter
 * This file provides a compatible interface with the Base44 SDK
 * but uses our Supabase + Railway backend instead
 */

// This is a placeholder to maintain compatibility with old imports
// The actual implementation is in entities.js
export const base44 = {
  entities: {}, // Will be populated by entities.js
  auth: {} // Will be populated by entities.js
};

export const createClient = (config) => {
  return base44;
};
