/**
 * Default Categories and Subcategories
 * Comprehensive list of categories for personal finance tracking
 */

export const DEFAULT_CATEGORIES = [
  // INCOME CATEGORIES
  { id: 'cat_income_1', name: 'Salary', type: 'income', parentId: null, icon: '💰' },
  { id: 'cat_income_2', name: 'Freelance', type: 'income', parentId: null, icon: '💼' },
  { id: 'cat_income_3', name: 'Business', type: 'income', parentId: null, icon: '🏢' },
  { id: 'cat_income_4', name: 'Investment', type: 'income', parentId: null, icon: '📈' },
  { id: 'cat_income_5', name: 'Rental Income', type: 'income', parentId: null, icon: '🏘️' },
  { id: 'cat_income_6', name: 'Gifts', type: 'income', parentId: null, icon: '🎁' },
  { id: 'cat_income_7', name: 'Refunds', type: 'income', parentId: null, icon: '💵' },
  { id: 'cat_income_8', name: 'Other Income', type: 'income', parentId: null, icon: '💸' },

  // EXPENSE CATEGORIES - HOUSING
  { id: 'cat_exp_housing', name: 'Housing', type: 'expense', parentId: null, icon: '🏠' },
  { id: 'cat_exp_housing_1', name: 'Rent', type: 'expense', parentId: 'cat_exp_housing', icon: '🏘️' },
  { id: 'cat_exp_housing_2', name: 'Mortgage', type: 'expense', parentId: 'cat_exp_housing', icon: '🏡' },
  { id: 'cat_exp_housing_3', name: 'Property Tax', type: 'expense', parentId: 'cat_exp_housing', icon: '📋' },
  { id: 'cat_exp_housing_4', name: 'Home Insurance', type: 'expense', parentId: 'cat_exp_housing', icon: '🛡️' },
  { id: 'cat_exp_housing_5', name: 'Maintenance', type: 'expense', parentId: 'cat_exp_housing', icon: '🔧' },

  // EXPENSE CATEGORIES - UTILITIES
  { id: 'cat_exp_utilities', name: 'Utilities', type: 'expense', parentId: null, icon: '💡' },
  { id: 'cat_exp_utilities_1', name: 'Electricity', type: 'expense', parentId: 'cat_exp_utilities', icon: '⚡' },
  { id: 'cat_exp_utilities_2', name: 'Water', type: 'expense', parentId: 'cat_exp_utilities', icon: '💧' },
  { id: 'cat_exp_utilities_3', name: 'Gas', type: 'expense', parentId: 'cat_exp_utilities', icon: '🔥' },
  { id: 'cat_exp_utilities_4', name: 'Internet', type: 'expense', parentId: 'cat_exp_utilities', icon: '🌐' },
  { id: 'cat_exp_utilities_5', name: 'Phone', type: 'expense', parentId: 'cat_exp_utilities', icon: '📱' },

  // EXPENSE CATEGORIES - FOOD & DINING
  { id: 'cat_exp_food', name: 'Food & Dining', type: 'expense', parentId: null, icon: '🍽️' },
  { id: 'cat_exp_food_1', name: 'Groceries', type: 'expense', parentId: 'cat_exp_food', icon: '🛒' },
  { id: 'cat_exp_food_2', name: 'Restaurants', type: 'expense', parentId: 'cat_exp_food', icon: '🍴' },
  { id: 'cat_exp_food_3', name: 'Fast Food', type: 'expense', parentId: 'cat_exp_food', icon: '🍔' },
  { id: 'cat_exp_food_4', name: 'Coffee Shops', type: 'expense', parentId: 'cat_exp_food', icon: '☕' },
  { id: 'cat_exp_food_5', name: 'Alcohol & Bars', type: 'expense', parentId: 'cat_exp_food', icon: '🍺' },

  // EXPENSE CATEGORIES - TRANSPORTATION
  { id: 'cat_exp_transport', name: 'Transportation', type: 'expense', parentId: null, icon: '🚗' },
  { id: 'cat_exp_transport_1', name: 'Fuel', type: 'expense', parentId: 'cat_exp_transport', icon: '⛽' },
  { id: 'cat_exp_transport_2', name: 'Public Transit', type: 'expense', parentId: 'cat_exp_transport', icon: '🚌' },
  { id: 'cat_exp_transport_3', name: 'Parking', type: 'expense', parentId: 'cat_exp_transport', icon: '🅿️' },
  { id: 'cat_exp_transport_4', name: 'Car Maintenance', type: 'expense', parentId: 'cat_exp_transport', icon: '🔧' },
  { id: 'cat_exp_transport_5', name: 'Car Insurance', type: 'expense', parentId: 'cat_exp_transport', icon: '🛡️' },
  { id: 'cat_exp_transport_6', name: 'Ride Share', type: 'expense', parentId: 'cat_exp_transport', icon: '🚕' },

  // EXPENSE CATEGORIES - SHOPPING
  { id: 'cat_exp_shopping', name: 'Shopping', type: 'expense', parentId: null, icon: '🛍️' },
  { id: 'cat_exp_shopping_1', name: 'Clothing', type: 'expense', parentId: 'cat_exp_shopping', icon: '👕' },
  { id: 'cat_exp_shopping_2', name: 'Electronics', type: 'expense', parentId: 'cat_exp_shopping', icon: '💻' },
  { id: 'cat_exp_shopping_3', name: 'Home Goods', type: 'expense', parentId: 'cat_exp_shopping', icon: '🏠' },
  { id: 'cat_exp_shopping_4', name: 'Books', type: 'expense', parentId: 'cat_exp_shopping', icon: '📚' },
  { id: 'cat_exp_shopping_5', name: 'Hobbies', type: 'expense', parentId: 'cat_exp_shopping', icon: '🎨' },

  // EXPENSE CATEGORIES - ENTERTAINMENT
  { id: 'cat_exp_entertainment', name: 'Entertainment', type: 'expense', parentId: null, icon: '🎬' },
  { id: 'cat_exp_entertainment_1', name: 'Movies', type: 'expense', parentId: 'cat_exp_entertainment', icon: '🎥' },
  { id: 'cat_exp_entertainment_2', name: 'Streaming Services', type: 'expense', parentId: 'cat_exp_entertainment', icon: '📺' },
  { id: 'cat_exp_entertainment_3', name: 'Music', type: 'expense', parentId: 'cat_exp_entertainment', icon: '🎵' },
  { id: 'cat_exp_entertainment_4', name: 'Games', type: 'expense', parentId: 'cat_exp_entertainment', icon: '🎮' },
  { id: 'cat_exp_entertainment_5', name: 'Sports', type: 'expense', parentId: 'cat_exp_entertainment', icon: '⚽' },
  { id: 'cat_exp_entertainment_6', name: 'Events', type: 'expense', parentId: 'cat_exp_entertainment', icon: '🎪' },

  // EXPENSE CATEGORIES - HEALTH & FITNESS
  { id: 'cat_exp_health', name: 'Health & Fitness', type: 'expense', parentId: null, icon: '🏥' },
  { id: 'cat_exp_health_1', name: 'Doctor', type: 'expense', parentId: 'cat_exp_health', icon: '👨‍⚕️' },
  { id: 'cat_exp_health_2', name: 'Dentist', type: 'expense', parentId: 'cat_exp_health', icon: '🦷' },
  { id: 'cat_exp_health_3', name: 'Pharmacy', type: 'expense', parentId: 'cat_exp_health', icon: '💊' },
  { id: 'cat_exp_health_4', name: 'Gym', type: 'expense', parentId: 'cat_exp_health', icon: '🏋️' },
  { id: 'cat_exp_health_5', name: 'Health Insurance', type: 'expense', parentId: 'cat_exp_health', icon: '🛡️' },

  // EXPENSE CATEGORIES - PERSONAL CARE
  { id: 'cat_exp_personal', name: 'Personal Care', type: 'expense', parentId: null, icon: '💅' },
  { id: 'cat_exp_personal_1', name: 'Hair', type: 'expense', parentId: 'cat_exp_personal', icon: '💇' },
  { id: 'cat_exp_personal_2', name: 'Spa & Massage', type: 'expense', parentId: 'cat_exp_personal', icon: '🧖' },
  { id: 'cat_exp_personal_3', name: 'Beauty Products', type: 'expense', parentId: 'cat_exp_personal', icon: '💄' },
  { id: 'cat_exp_personal_4', name: 'Laundry', type: 'expense', parentId: 'cat_exp_personal', icon: '🧺' },

  // EXPENSE CATEGORIES - EDUCATION
  { id: 'cat_exp_education', name: 'Education', type: 'expense', parentId: null, icon: '🎓' },
  { id: 'cat_exp_education_1', name: 'Tuition', type: 'expense', parentId: 'cat_exp_education', icon: '🏫' },
  { id: 'cat_exp_education_2', name: 'Books & Supplies', type: 'expense', parentId: 'cat_exp_education', icon: '📚' },
  { id: 'cat_exp_education_3', name: 'Courses', type: 'expense', parentId: 'cat_exp_education', icon: '💻' },
  { id: 'cat_exp_education_4', name: 'Student Loans', type: 'expense', parentId: 'cat_exp_education', icon: '📝' },

  // EXPENSE CATEGORIES - FAMILY & KIDS
  { id: 'cat_exp_family', name: 'Family & Kids', type: 'expense', parentId: null, icon: '👨‍👩‍👧‍👦' },
  { id: 'cat_exp_family_1', name: 'Childcare', type: 'expense', parentId: 'cat_exp_family', icon: '👶' },
  { id: 'cat_exp_family_2', name: 'School', type: 'expense', parentId: 'cat_exp_family', icon: '🎒' },
  { id: 'cat_exp_family_3', name: 'Toys', type: 'expense', parentId: 'cat_exp_family', icon: '🧸' },
  { id: 'cat_exp_family_4', name: 'Activities', type: 'expense', parentId: 'cat_exp_family', icon: '🎨' },
  { id: 'cat_exp_family_5', name: 'Allowance', type: 'expense', parentId: 'cat_exp_family', icon: '💰' },

  // EXPENSE CATEGORIES - PETS
  { id: 'cat_exp_pets', name: 'Pets', type: 'expense', parentId: null, icon: '🐾' },
  { id: 'cat_exp_pets_1', name: 'Food', type: 'expense', parentId: 'cat_exp_pets', icon: '🍖' },
  { id: 'cat_exp_pets_2', name: 'Vet', type: 'expense', parentId: 'cat_exp_pets', icon: '🏥' },
  { id: 'cat_exp_pets_3', name: 'Grooming', type: 'expense', parentId: 'cat_exp_pets', icon: '✂️' },
  { id: 'cat_exp_pets_4', name: 'Supplies', type: 'expense', parentId: 'cat_exp_pets', icon: '🧸' },

  // EXPENSE CATEGORIES - TRAVEL
  { id: 'cat_exp_travel', name: 'Travel', type: 'expense', parentId: null, icon: '✈️' },
  { id: 'cat_exp_travel_1', name: 'Flights', type: 'expense', parentId: 'cat_exp_travel', icon: '🛫' },
  { id: 'cat_exp_travel_2', name: 'Hotels', type: 'expense', parentId: 'cat_exp_travel', icon: '🏨' },
  { id: 'cat_exp_travel_3', name: 'Car Rental', type: 'expense', parentId: 'cat_exp_travel', icon: '🚗' },
  { id: 'cat_exp_travel_4', name: 'Vacation', type: 'expense', parentId: 'cat_exp_travel', icon: '🏖️' },

  // EXPENSE CATEGORIES - INSURANCE
  { id: 'cat_exp_insurance', name: 'Insurance', type: 'expense', parentId: null, icon: '🛡️' },
  { id: 'cat_exp_insurance_1', name: 'Life Insurance', type: 'expense', parentId: 'cat_exp_insurance', icon: '💼' },
  { id: 'cat_exp_insurance_2', name: 'Health Insurance', type: 'expense', parentId: 'cat_exp_insurance', icon: '🏥' },
  { id: 'cat_exp_insurance_3', name: 'Car Insurance', type: 'expense', parentId: 'cat_exp_insurance', icon: '🚗' },
  { id: 'cat_exp_insurance_4', name: 'Home Insurance', type: 'expense', parentId: 'cat_exp_insurance', icon: '🏠' },

  // EXPENSE CATEGORIES - TAXES
  { id: 'cat_exp_taxes', name: 'Taxes', type: 'expense', parentId: null, icon: '💰' },
  { id: 'cat_exp_taxes_1', name: 'Income Tax', type: 'expense', parentId: 'cat_exp_taxes', icon: '📊' },
  { id: 'cat_exp_taxes_2', name: 'Property Tax', type: 'expense', parentId: 'cat_exp_taxes', icon: '🏠' },
  { id: 'cat_exp_taxes_3', name: 'Sales Tax', type: 'expense', parentId: 'cat_exp_taxes', icon: '🛒' },

  // EXPENSE CATEGORIES - CHARITY & DONATIONS
  { id: 'cat_exp_charity', name: 'Charity & Donations', type: 'expense', parentId: null, icon: '❤️' },
  { id: 'cat_exp_charity_1', name: 'Religious', type: 'expense', parentId: 'cat_exp_charity', icon: '🕌' },
  { id: 'cat_exp_charity_2', name: 'Nonprofit', type: 'expense', parentId: 'cat_exp_charity', icon: '🤝' },
  { id: 'cat_exp_charity_3', name: 'Gifts', type: 'expense', parentId: 'cat_exp_charity', icon: '🎁' },

  // EXPENSE CATEGORIES - SUBSCRIPTIONS
  { id: 'cat_exp_subscriptions', name: 'Subscriptions', type: 'expense', parentId: null, icon: '📱' },
  { id: 'cat_exp_subscriptions_1', name: 'Software', type: 'expense', parentId: 'cat_exp_subscriptions', icon: '💻' },
  { id: 'cat_exp_subscriptions_2', name: 'Streaming', type: 'expense', parentId: 'cat_exp_subscriptions', icon: '📺' },
  { id: 'cat_exp_subscriptions_3', name: 'Memberships', type: 'expense', parentId: 'cat_exp_subscriptions', icon: '🎫' },
  { id: 'cat_exp_subscriptions_4', name: 'Magazines', type: 'expense', parentId: 'cat_exp_subscriptions', icon: '📰' },

  // EXPENSE CATEGORIES - MISCELLANEOUS
  { id: 'cat_exp_misc', name: 'Miscellaneous', type: 'expense', parentId: null, icon: '📦' },
  { id: 'cat_exp_misc_1', name: 'Fees', type: 'expense', parentId: 'cat_exp_misc', icon: '💳' },
  { id: 'cat_exp_misc_2', name: 'Fines', type: 'expense', parentId: 'cat_exp_misc', icon: '🚫' },
  { id: 'cat_exp_misc_3', name: 'Other', type: 'expense', parentId: 'cat_exp_misc', icon: '❓' },
];

/**
 * Auto-assign icon based on category name
 * Uses keyword matching to intelligently assign appropriate icons
 */
export function getAutoIcon(categoryName, categoryType = 'expense') {
  const name = categoryName.toLowerCase();

  // Income icons
  if (categoryType === 'income') {
    if (name.includes('salary') || name.includes('wage')) return '💰';
    if (name.includes('freelance') || name.includes('consulting')) return '💼';
    if (name.includes('business') || name.includes('revenue')) return '🏢';
    if (name.includes('investment') || name.includes('dividend') || name.includes('stock')) return '📈';
    if (name.includes('rental') || name.includes('rent')) return '🏘️';
    if (name.includes('gift') || name.includes('bonus')) return '🎁';
    if (name.includes('refund') || name.includes('return')) return '💵';
    if (name.includes('interest') || name.includes('saving')) return '🏦';
    return '💸'; // Default income icon
  }

  // Expense icons (based on keywords)
  // Housing
  if (name.includes('rent') || name.includes('mortgage') || name.includes('housing')) return '🏠';
  if (name.includes('property') || name.includes('real estate')) return '🏡';

  // Utilities
  if (name.includes('electric') || name.includes('light')) return '💡';
  if (name.includes('water')) return '💧';
  if (name.includes('gas') || name.includes('heat')) return '🔥';
  if (name.includes('internet') || name.includes('wifi')) return '🌐';
  if (name.includes('phone') || name.includes('mobile') || name.includes('cell')) return '📱';

  // Food & Dining
  if (name.includes('food') || name.includes('dining') || name.includes('meal')) return '🍽️';
  if (name.includes('grocery') || name.includes('groceries') || name.includes('supermarket')) return '🛒';
  if (name.includes('restaurant') || name.includes('dining out')) return '🍴';
  if (name.includes('fast food') || name.includes('burger') || name.includes('pizza')) return '🍔';
  if (name.includes('coffee') || name.includes('cafe')) return '☕';
  if (name.includes('bar') || name.includes('alcohol') || name.includes('beer') || name.includes('wine')) return '🍺';

  // Transportation
  if (name.includes('car') || name.includes('auto') || name.includes('vehicle')) return '🚗';
  if (name.includes('fuel') || name.includes('gas') || name.includes('petrol')) return '⛽';
  if (name.includes('transit') || name.includes('bus') || name.includes('train') || name.includes('subway')) return '🚌';
  if (name.includes('parking')) return '🅿️';
  if (name.includes('taxi') || name.includes('uber') || name.includes('lyft') || name.includes('ride')) return '🚕';
  if (name.includes('flight') || name.includes('airline')) return '✈️';

  // Shopping
  if (name.includes('shopping') || name.includes('retail')) return '🛍️';
  if (name.includes('clothing') || name.includes('clothes') || name.includes('fashion')) return '👕';
  if (name.includes('electronics') || name.includes('computer') || name.includes('laptop')) return '💻';
  if (name.includes('book')) return '📚';
  if (name.includes('hobby') || name.includes('craft')) return '🎨';

  // Entertainment
  if (name.includes('entertainment') || name.includes('fun')) return '🎬';
  if (name.includes('movie') || name.includes('cinema') || name.includes('film')) return '🎥';
  if (name.includes('streaming') || name.includes('netflix') || name.includes('tv')) return '📺';
  if (name.includes('music') || name.includes('spotify')) return '🎵';
  if (name.includes('game') || name.includes('gaming')) return '🎮';
  if (name.includes('sport') || name.includes('fitness')) return '⚽';
  if (name.includes('event') || name.includes('concert') || name.includes('show')) return '🎪';

  // Health & Fitness
  if (name.includes('health') || name.includes('medical') || name.includes('hospital')) return '🏥';
  if (name.includes('doctor') || name.includes('physician')) return '👨‍⚕️';
  if (name.includes('dentist') || name.includes('dental')) return '🦷';
  if (name.includes('pharmacy') || name.includes('medicine') || name.includes('drug')) return '💊';
  if (name.includes('gym') || name.includes('fitness') || name.includes('workout')) return '🏋️';

  // Personal Care
  if (name.includes('hair') || name.includes('salon') || name.includes('barber')) return '💇';
  if (name.includes('spa') || name.includes('massage')) return '🧖';
  if (name.includes('beauty') || name.includes('makeup') || name.includes('cosmetic')) return '💄';
  if (name.includes('laundry') || name.includes('cleaning')) return '🧺';

  // Education
  if (name.includes('education') || name.includes('school') || name.includes('university')) return '🎓';
  if (name.includes('tuition') || name.includes('course') || name.includes('class')) return '🏫';
  if (name.includes('student') || name.includes('learning')) return '📚';

  // Family & Kids
  if (name.includes('family') || name.includes('kids') || name.includes('children')) return '👨‍👩‍👧‍👦';
  if (name.includes('childcare') || name.includes('daycare') || name.includes('baby')) return '👶';
  if (name.includes('toy')) return '🧸';
  if (name.includes('allowance') || name.includes('pocket money')) return '💰';

  // Pets
  if (name.includes('pet') || name.includes('dog') || name.includes('cat') || name.includes('animal')) return '🐾';
  if (name.includes('vet') || name.includes('veterinary')) return '🏥';
  if (name.includes('groom')) return '✂️';

  // Travel
  if (name.includes('travel') || name.includes('trip') || name.includes('vacation') || name.includes('holiday')) return '✈️';
  if (name.includes('hotel') || name.includes('accommodation')) return '🏨';
  if (name.includes('beach') || name.includes('resort')) return '🏖️';

  // Insurance
  if (name.includes('insurance')) return '🛡️';

  // Taxes
  if (name.includes('tax')) return '💰';

  // Charity
  if (name.includes('charity') || name.includes('donation') || name.includes('giving')) return '❤️';
  if (name.includes('church') || name.includes('mosque') || name.includes('temple') || name.includes('religious')) return '🕌';
  if (name.includes('gift') || name.includes('present')) return '🎁';

  // Subscriptions
  if (name.includes('subscription') || name.includes('membership')) return '📱';
  if (name.includes('software') || name.includes('app')) return '💻';

  // Fees & Misc
  if (name.includes('fee') || name.includes('charge')) return '💳';
  if (name.includes('fine') || name.includes('penalty')) return '🚫';
  if (name.includes('maintenance') || name.includes('repair')) return '🔧';

  // Default
  return '📦';
}
