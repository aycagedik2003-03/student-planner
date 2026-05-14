export const POLISH_CITIES = [
  'Warszawa',
  'Kraków',
  'Poznań',
  'Wrocław',
  'Gdańsk',
  'Łódź',
  'Lublin',
  'Katowice',
  'Szczecin',
  'Białystok',
  'Bydgoszcz',
  'Toruń',
  'Rzeszów',
  'Olsztyn',
  'Kielce',
  'Częstochowa',
  'Opole',
  'Gdynia',
  'Sopot',
  'Zielona Góra',
] as const;

export type PolishCity = typeof POLISH_CITIES[number];
