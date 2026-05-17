export const MOROCCAN_CITIES = ['Rabat', 'Casablanca', 'Marrakech', 'Tangier', 'Agadir'];

export const SPECIALTY_OPTIONS = [
  'Tajine',
  'Couscous',
  'Pastilla',
  'Rfissa',
  'Seafood',
  'Desserts'
];

export const RATING_OPTIONS = [
  { label: '4.5+', value: '4.5' },
  { label: '4.7+', value: '4.7' },
  { label: '4.8+', value: '4.8' },
  { label: '4.9+', value: '4.9' }
];

const DEFAULT_CHEF_IMAGE = 'https://images.unsplash.com/photo-1577219492769-b63a779fac28?auto=format&fit=crop&w=900&q=80';
const DEFAULT_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1517314626714-ac1b9a16515e?auto=format&fit=crop&w=1200&q=80';

export const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  return payload?.items || payload?.data || [];
};

export const getChefCity = (chef) => chef?.city || chef?.address || 'Morocco';

export const getChefPhoto = (chef) => (
  chef?.profilePhoto || chef?.profile_picture || chef?.image || DEFAULT_CHEF_IMAGE
);

export const getChefInitial = (chef) => chef?.name?.trim()?.charAt(0)?.toUpperCase() || 'C';

export const getChefBio = (chef) => (
  chef?.bio || 'Sharing Moroccan family recipes with generous hospitality and seasonal market ingredients.'
);

export const getChefRating = (chef) => {
  const rating = Number(chef?.rating || chef?.averageRating);
  return Number.isFinite(rating) && rating > 0 ? rating : 4.8;
};

export const formatRating = (chef) => getChefRating(chef).toFixed(1);

export const getChefExperience = (chef) => {
  const years = Number(chef?.experience_years ?? chef?.experienceYears ?? chef?.experience);
  return Number.isFinite(years) && years > 0 ? years : 5;
};

export const formatExperience = (chef) => {
  const years = getChefExperience(chef);
  return `${years} year${years === 1 ? '' : 's'}`;
};

export const getChefSpecialties = (chef) => {
  const specialty = chef?.specialty || 'Moroccan cuisine';
  return String(specialty)
    .split(/[,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const getPrimarySpecialty = (chef) => getChefSpecialties(chef)[0] || 'Moroccan cuisine';

export const getUniqueCities = (chefs) => {
  const values = chefs.map(getChefCity).filter(Boolean);
  return Array.from(new Set([...MOROCCAN_CITIES.filter((city) => values.includes(city)), ...values]));
};

export const getUniqueSpecialties = (chefs) => {
  const values = chefs.flatMap(getChefSpecialties);
  return Array.from(new Set([...SPECIALTY_OPTIONS.filter((item) => values.some((value) => value.toLowerCase().includes(item.toLowerCase()))), ...values]));
};

export const matchesChefFilters = (chef, filters) => {
  const search = filters.search.trim().toLowerCase();
  const city = getChefCity(chef);
  const specialties = getChefSpecialties(chef);
  const haystack = [
    chef?.name,
    city,
    chef?.bio,
    chef?.nationality,
    specialties.join(' ')
  ].join(' ').toLowerCase();

  const searchMatch = !search || haystack.includes(search);
  const cityMatch = !filters.city || city === filters.city;
  const specialtyMatch = !filters.specialty || specialties.some((item) => (
    item.toLowerCase().includes(filters.specialty.toLowerCase())
  ));
  const ratingMatch = !filters.rating || getChefRating(chef) >= Number(filters.rating);

  return searchMatch && cityMatch && specialtyMatch && ratingMatch;
};

export const formatMAD = (price) => {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice)) return 'Price on request';
  return `${Math.round(numericPrice)} MAD`;
};

export const formatCookingTime = (recipe) => {
  const minutes = Number(recipe?.cook_time ?? recipe?.cookTime ?? recipe?.cookingTime);
  if (!Number.isFinite(minutes) || minutes <= 0) return 'Timing on request';

  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const getRecipeImage = (recipe) => recipe?.image || recipe?.image_url || DEFAULT_RECIPE_IMAGE;

export const getShortDescription = (description, maxLength = 132) => {
  if (!description) return 'A carefully prepared Moroccan dish made fresh from the chef kitchen.';
  if (description.length <= maxLength) return description;
  return `${description.slice(0, maxLength).trim()}...`;
};
