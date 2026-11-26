// Hearth & Ledger — the Okafor family's November 2026 budget.
// A family of four: Amara (teacher) and Daniel (engineer), with Maya, 11, and Leo, 8.
// Every figure below adds up: income $5,850; planned spending $4,260; savings $700;
// spent so far $3,786 across 58 expense transactions and 2 paydays.

export const MONTH = { label: 'November 2026', daysInMonth: 30, dayToday: 26 };

export const CATEGORIES = [
  { id: 'groceries', name: 'Groceries', color: '#4e7d5b', budget: 720 },
  { id: 'housing', name: 'Housing', color: '#14564f', budget: 1450 },
  { id: 'utilities', name: 'Utilities', color: '#c98f2d', budget: 260 },
  { id: 'transport', name: 'Transport', color: '#5b7fa6', budget: 380 },
  { id: 'dining', name: 'Dining out', color: '#c25a3a', budget: 180 },
  { id: 'kids', name: 'Kids & school', color: '#8a6fb8', budget: 320 },
  { id: 'entertainment', name: 'Entertainment', color: '#d96c8f', budget: 150 },
  { id: 'health', name: 'Health', color: '#3f9d8a', budget: 200 },
  { id: 'clothing', name: 'Clothing', color: '#a66a3f', budget: 120 },
  { id: 'personal', name: 'Personal', color: '#7d8a86', budget: 160 },
  { id: 'household', name: 'Household', color: '#7a9e4b', budget: 140 },
  { id: 'subscriptions', name: 'Subscriptions', color: '#4a6fa5', budget: 85 },
  { id: 'misc', name: 'Miscellaneous', color: '#9a8c7a', budget: 95 },
];

export const SAVINGS_TARGET = 700;

// Monthly auto-save split across the goals, $700 in all.
export const SAVINGS_SPLIT = [
  { goalId: 'emergency', amount: 300 },
  { goalId: 'holiday', amount: 150 },
  { goalId: 'car', amount: 150 },
  { goalId: 'college', amount: 100 },
];

export const GOALS = [
  { id: 'emergency', name: 'Emergency fund', target: 8000, saved: 5240, note: 'Six months of essentials, for the unexpected.' },
  { id: 'holiday', name: 'Family holiday — Portugal', target: 2400, saved: 1150, note: 'Flights and a week by the sea next summer.' },
  { id: 'car', name: 'New family car', target: 6000, saved: 2780, note: 'Replacing the old hatchback before it gives up.' },
  { id: 'college', name: "Kids' college fund", target: 10000, saved: 1430, note: 'A little each month, for Maya and Leo later on.' },
];

// Transactions: id, date (2026-11-DD), description, category, amount, type.
// Income is type 'income'; everything else is an expense. Category totals:
// groceries 612.00, housing 1450.00, utilities 212.00, transport 341.00,
// dining 196.00, kids 284.00, entertainment 96.00, health 143.00,
// clothing 88.00, personal 121.00, household 97.00, subscriptions 85.00, misc 61.00.
export const TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', description: 'Salary — Amara (teacher)', category: 'income', amount: 3400.00, type: 'income' },
  { id: 't02', date: '2026-11-01', description: 'Salary — Daniel (engineer)', category: 'income', amount: 2450.00, type: 'income' },
  { id: 't03', date: '2026-11-01', description: 'Rent — Maple Court, Apt 4B', category: 'housing', amount: 1450.00, type: 'expense' },
  { id: 't04', date: '2026-11-01', description: 'FreshMart weekly shop', category: 'groceries', amount: 148.20, type: 'expense' },
  { id: 't05', date: '2026-11-01', description: 'Streaming bundle', category: 'subscriptions', amount: 24.99, type: 'expense' },
  { id: 't06', date: '2026-11-01', description: 'Music family plan', category: 'subscriptions', amount: 16.99, type: 'expense' },
  { id: 't07', date: '2026-11-02', description: 'Fuel — Shell', category: 'transport', amount: 52.00, type: 'expense' },
  { id: 't08', date: '2026-11-02', description: 'School lunch money', category: 'kids', amount: 60.00, type: 'expense' },
  { id: 't09', date: '2026-11-03', description: 'Electricity bill', category: 'utilities', amount: 96.40, type: 'expense' },
  { id: 't10', date: '2026-11-03', description: 'Pharmacy — vitamins', category: 'health', amount: 28.40, type: 'expense' },
  { id: 't11', date: '2026-11-04', description: 'Corner Market top-up', category: 'groceries', amount: 42.75, type: 'expense' },
  { id: 't12', date: '2026-11-04', description: 'Haircut — Daniel', category: 'personal', amount: 25.00, type: 'expense' },
  { id: 't13', date: '2026-11-05', description: 'Bus passes — Maya & Leo', category: 'transport', amount: 38.00, type: 'expense' },
  { id: 't14', date: '2026-11-05', description: 'Winter jacket — Leo', category: 'clothing', amount: 62.00, type: 'expense' },
  { id: 't15', date: '2026-11-05', description: 'Cloud storage', category: 'subscriptions', amount: 9.99, type: 'expense' },
  { id: 't16', date: '2026-11-06', description: 'Water bill', category: 'utilities', amount: 48.25, type: 'expense' },
  { id: 't17', date: '2026-11-06', description: 'Art supplies — Maya', category: 'kids', amount: 34.50, type: 'expense' },
  { id: 't18', date: '2026-11-07', description: 'Pizza night', category: 'dining', amount: 46.50, type: 'expense' },
  { id: 't19', date: '2026-11-07', description: 'Cleaning supplies', category: 'household', amount: 34.20, type: 'expense' },
  { id: 't20', date: '2026-11-08', description: 'FreshMart weekly shop', category: 'groceries', amount: 162.40, type: 'expense' },
  { id: 't21', date: '2026-11-08', description: 'Cinema — family film', category: 'entertainment', amount: 38.00, type: 'expense' },
  { id: 't22', date: '2026-11-08', description: 'Gift — birthday card & wrap', category: 'misc', amount: 14.50, type: 'expense' },
  { id: 't23', date: '2026-11-09', description: 'Fuel — BP', category: 'transport', amount: 48.50, type: 'expense' },
  { id: 't24', date: '2026-11-09', description: 'Hair salon — Amara', category: 'personal', amount: 48.00, type: 'expense' },
  { id: 't25', date: '2026-11-10', description: 'Internet & phone', category: 'utilities', amount: 67.35, type: 'expense' },
  { id: 't26', date: '2026-11-10', description: 'Dentist check-up — Leo', category: 'health', amount: 65.00, type: 'expense' },
  { id: 't27', date: '2026-11-11', description: 'Bakery & deli', category: 'groceries', amount: 28.90, type: 'expense' },
  { id: 't28', date: '2026-11-11', description: 'Magazine app', category: 'subscriptions', amount: 7.99, type: 'expense' },
  { id: 't29', date: '2026-11-12', description: 'Football boots — Maya', category: 'kids', amount: 74.99, type: 'expense' },
  { id: 't30', date: '2026-11-12', description: 'Light bulbs & batteries', category: 'household', amount: 18.75, type: 'expense' },
  { id: 't31', date: '2026-11-13', description: 'Family lunch — Olive Garden', category: 'dining', amount: 68.25, type: 'expense' },
  { id: 't32', date: '2026-11-14', description: 'Ride-hailing', category: 'transport', amount: 22.75, type: 'expense' },
  { id: 't33', date: '2026-11-14', description: 'Socks & underwear pack', category: 'clothing', amount: 26.00, type: 'expense' },
  { id: 't34', date: '2026-11-15', description: 'FreshMart weekly shop', category: 'groceries', amount: 139.55, type: 'expense' },
  { id: 't35', date: '2026-11-15', description: 'Board game', category: 'entertainment', amount: 24.99, type: 'expense' },
  { id: 't36', date: '2026-11-15', description: 'Fitness app', category: 'subscriptions', amount: 12.99, type: 'expense' },
  { id: 't37', date: '2026-11-16', description: 'Fuel — Shell', category: 'transport', amount: 55.00, type: 'expense' },
  { id: 't38', date: '2026-11-16', description: 'Toiletries', category: 'personal', amount: 31.50, type: 'expense' },
  { id: 't39', date: '2026-11-17', description: 'School trip contribution', category: 'kids', amount: 45.00, type: 'expense' },
  { id: 't40', date: '2026-11-17', description: 'Charity donation', category: 'misc', amount: 25.00, type: 'expense' },
  { id: 't41', date: '2026-11-18', description: 'Takeaway Thai', category: 'dining', amount: 41.75, type: 'expense' },
  { id: 't42', date: '2026-11-18', description: 'Laundry detergent', category: 'household', amount: 22.05, type: 'expense' },
  { id: 't43', date: '2026-11-19', description: 'Corner Market top-up', category: 'groceries', amount: 36.40, type: 'expense' },
  { id: 't44', date: '2026-11-19', description: 'Pharmacy — cold medicine', category: 'health', amount: 19.60, type: 'expense' },
  { id: 't45', date: '2026-11-20', description: 'Car wash & parking', category: 'transport', amount: 18.50, type: 'expense' },
  { id: 't46', date: '2026-11-20', description: 'Haircut — Leo', category: 'personal', amount: 16.50, type: 'expense' },
  { id: 't47', date: '2026-11-21', description: 'Coffee & pastries', category: 'dining', amount: 17.50, type: 'expense' },
  { id: 't48', date: '2026-11-21', description: 'Books & stationery', category: 'kids', amount: 39.75, type: 'expense' },
  { id: 't49', date: '2026-11-21', description: 'News subscription', category: 'subscriptions', amount: 12.05, type: 'expense' },
  { id: 't50', date: '2026-11-22', description: 'FreshMart weekly shop', category: 'groceries', amount: 53.80, type: 'expense' },
  { id: 't51', date: '2026-11-22', description: 'Streaming rental', category: 'entertainment', amount: 12.99, type: 'expense' },
  { id: 't52', date: '2026-11-23', description: 'Fuel — BP', category: 'transport', amount: 51.25, type: 'expense' },
  { id: 't53', date: '2026-11-23', description: 'Arcade tokens', category: 'entertainment', amount: 20.02, type: 'expense' },
  { id: 't54', date: '2026-11-23', description: 'Postage & printing', category: 'misc', amount: 21.50, type: 'expense' },
  { id: 't55', date: '2026-11-24', description: 'Ride-hailing', category: 'transport', amount: 15.00, type: 'expense' },
  { id: 't56', date: '2026-11-24', description: 'Swimming lessons', category: 'kids', amount: 29.76, type: 'expense' },
  { id: 't57', date: '2026-11-24', description: 'Gym membership', category: 'health', amount: 30.00, type: 'expense' },
  { id: 't58', date: '2026-11-25', description: 'Bus top-up', category: 'transport', amount: 40.00, type: 'expense' },
  { id: 't59', date: '2026-11-25', description: 'Burger joint', category: 'dining', amount: 22.00, type: 'expense' },
  { id: 't60', date: '2026-11-25', description: 'Kitchen towels', category: 'household', amount: 22.00, type: 'expense' },
];
