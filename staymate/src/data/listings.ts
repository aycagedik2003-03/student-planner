export type ListingOwner = {
  name: string;
  initial: string;
  avatarColor: string;
  matchId: string;
};

export type Listing = {
  id: string;
  photos: string[];   // color codes — placeholder swatches
  address: string;
  district: string;
  city: string;
  price: number;      // PLN/month
  rooms: number;
  area: number;       // m²
  furnished: boolean;
  wifi: boolean;
  ac: boolean;
  parking: boolean;
  elevator: boolean;
  petsAllowed: boolean;
  description: string;
  owner: ListingOwner;
};

export const LISTINGS: Listing[] = [
  {
    id: '1',
    photos: ['#E6FBFA', '#D1F7F5', '#F0FFF4'],
    address: 'ul. Szewska 12/4',
    district: 'Stare Miasto',
    city: 'Kraków',
    price: 1850,
    rooms: 2,
    area: 48,
    furnished: true,
    wifi: true,
    ac: false,
    parking: false,
    elevator: true,
    petsAllowed: false,
    description: 'Güneş ışığı alan, tamamen mobilyalı modern daire. Eski şehir merkezinde, her yere yürüme mesafesinde. Yüksek tavan, geniş pencereler. Ev sahibi binada oturmaz.',
    owner: { name: 'Janusz K.', initial: 'J', avatarColor: '#00CFC8', matchId: '1' },
  },
  {
    id: '2',
    photos: ['#FFF0F7', '#FFE0EF', '#FFF7E6'],
    address: 'ul. Długa 44/8',
    district: 'Krowodrza',
    city: 'Kraków',
    price: 2400,
    rooms: 3,
    area: 72,
    furnished: true,
    wifi: true,
    ac: true,
    parking: true,
    elevator: false,
    petsAllowed: true,
    description: 'Geniş, 3 odalı aile dairesi. Kliması, yeraltı otoparkı mevcut. Evcil hayvanlara izin verilir. Tramvay durağına 3 dakika yürüyüş mesafesi.',
    owner: { name: 'Monika W.', initial: 'M', avatarColor: '#FF9ACD', matchId: '2' },
  },
  {
    id: '3',
    photos: ['#F0F9FF', '#E0F2FE', '#F5F3FF'],
    address: 'ul. Nowy Świat 15/20',
    district: 'Śródmieście',
    city: 'Warszawa',
    price: 3200,
    rooms: 2,
    area: 55,
    furnished: true,
    wifi: true,
    ac: true,
    parking: false,
    elevator: true,
    petsAllowed: false,
    description: 'Merkezde, yeni binada premium daire. Full donanımlı mutfak, akıllı ev sistemi. Metro istasyonuna 2 dakika yürüyüş mesafesi.',
    owner: { name: 'Piotr N.', initial: 'P', avatarColor: '#A8C5FF', matchId: '3' },
  },
  {
    id: '4',
    photos: ['#F5F3FF', '#EDE9FE', '#E6FBFA'],
    address: 'ul. Puławska 82/5',
    district: 'Ursynów',
    city: 'Warszawa',
    price: 2200,
    rooms: 1,
    area: 32,
    furnished: true,
    wifi: true,
    ac: false,
    parking: false,
    elevator: true,
    petsAllowed: false,
    description: 'Öğrenci veya genç profesyoneller için ideal studio daire. Compact ama akıllıca tasarlanmış. Süpermarket ve metro çok yakın.',
    owner: { name: 'Katarzyna B.', initial: 'K', avatarColor: '#C9A8FF', matchId: '4' },
  },
  {
    id: '5',
    photos: ['#FFF7E6', '#FFF3CD', '#E6FBFA'],
    address: 'ul. Roosevelta 8/14',
    district: 'Jeżyce',
    city: 'Poznań',
    price: 1650,
    rooms: 2,
    area: 50,
    furnished: false,
    wifi: true,
    ac: false,
    parking: true,
    elevator: false,
    petsAllowed: true,
    description: 'Trendy Jeżyce semtinde, mobilyasız 2 odalı daire. Kendi mobilyanı getirene uygun fiyat. Otopark dahil. Kafeler ve restoranlar yürüme mesafesinde.',
    owner: { name: 'Adam S.', initial: 'A', avatarColor: '#98E8C1', matchId: '5' },
  },
  {
    id: '6',
    photos: ['#FFF0F7', '#E6FBFA', '#F0F9FF'],
    address: 'ul. Świdnicka 21/3',
    district: 'Stare Miasto',
    city: 'Wrocław',
    price: 2800,
    rooms: 3,
    area: 80,
    furnished: true,
    wifi: true,
    ac: true,
    parking: false,
    elevator: true,
    petsAllowed: true,
    description: 'Wrocław\'ın tarihi merkezinde prestijli daire. Rynek\'e 5 dakika. 3 büyük oda, 2 banyo. Tamamen mobilyalı, modern ve şık tasarım.',
    owner: { name: 'Agnieszka M.', initial: 'A', avatarColor: '#FF9ACD', matchId: '2' },
  },
];
