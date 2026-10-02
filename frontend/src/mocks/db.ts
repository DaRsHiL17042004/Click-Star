/**
 * Seed data for the in-browser demo backend (VITE_API_MODE=mock).
 * Shapes intentionally match what the Express API returns.
 */
import type { Booking, ClientProfile, Lead, Photographer, Review, Role } from "@/types";
import { storage } from "@/lib/storage";

const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}.webp`;

export interface MockUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: string;
}

export interface MockDB {
  users: MockUser[];
  photographers: Photographer[];
  clients: ClientProfile[];
  bookings: Booking[];
  reviews: Review[];
  leads: Lead[];
}

const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();

const P = {
  rajesh: "p_rajesh",
  meera: "p_meera",
  arjun: "p_arjun",
  zoya: "p_zoya",
  vikram: "p_vikram",
  ananya: "p_ananya",
  kabir: "p_kabir",
  sana: "p_sana",
};

const seed = (): MockDB => {
  const users: MockUser[] = [
    { _id: "u_asha", name: "Asha Patil", email: "client@clickstar.in", password: "demo1234", role: "client", createdAt: daysFromNow(-120) },
    { _id: "u_nikhil", name: "Nikhil Shah", email: "nikhil@example.com", password: "demo1234", role: "client", createdAt: daysFromNow(-60) },
    { _id: "u_priya", name: "Priya Iyer", email: "priya@example.com", password: "demo1234", role: "client", createdAt: daysFromNow(-21) },
    { _id: P.rajesh, name: "Rajesh Sharma", email: "photographer@clickstar.in", password: "demo1234", role: "photographer", createdAt: daysFromNow(-300) },
    { _id: P.meera, name: "Meera Kulkarni", email: "meera@example.com", password: "demo1234", role: "photographer", createdAt: daysFromNow(-280) },
    { _id: P.arjun, name: "Arjun Desai", email: "arjun@example.com", password: "demo1234", role: "photographer", createdAt: daysFromNow(-200) },
    { _id: P.zoya, name: "Zoya Merchant", email: "zoya@example.com", password: "demo1234", role: "photographer", createdAt: daysFromNow(-180) },
    { _id: P.vikram, name: "Vikram Jadhav", email: "vikram@example.com", password: "demo1234", role: "photographer", createdAt: daysFromNow(-150) },
    { _id: P.ananya, name: "Ananya Rao", email: "ananya@example.com", password: "demo1234", role: "photographer", createdAt: daysFromNow(-90) },
    { _id: P.kabir, name: "Kabir Momin", email: "kabir@example.com", password: "demo1234", role: "photographer", createdAt: daysFromNow(-75) },
    { _id: P.sana, name: "Sana Fernandes", email: "sana@example.com", password: "demo1234", role: "photographer", createdAt: daysFromNow(-40) },
    { _id: "u_admin", name: "Darshil (Admin)", email: "admin@clickstar.in", password: "demo1234", role: "admin", createdAt: daysFromNow(-365) },
  ];

  const photographers: Photographer[] = [
    {
      _id: P.rajesh, name: "Rajesh Sharma", location: "Mumbai", yearsExperience: 11,
      bio: "Candid wedding storyteller. I work quietly in the background so your families can be themselves — the laughter during haldi, the tears at bidaai, the cousins dancing past midnight.",
      specialties: ["Wedding", "Pre-wedding", "Candid"], pricing: { hourly: 4500, event: 38000, package: 145000 },
      phone: "+91 98200 11223", instagram: "rajesh.frames", website: "https://rajeshframes.in",
      availability: [daysFromNow(4), daysFromNow(9), daysFromNow(16), daysFromNow(23)],
      coverImage: img("pf-wedding"), portfolio: [img("pf-wedding"), img("hero-wedding"), img("pf-prewedding"), img("pf-event")],
    },
    {
      _id: P.meera, name: "Meera Kulkarni", location: "Pune", yearsExperience: 8,
      bio: "Portraits with honesty. Natural light, slow conversations and frames that look like you on your best day — not someone else.",
      specialties: ["Portrait", "Maternity", "Family"], pricing: { hourly: 3000, event: 18000, package: 42000 },
      instagram: "meera.k.studio", availability: [daysFromNow(2), daysFromNow(6), daysFromNow(12)],
      coverImage: img("pf-maternity"), portfolio: [img("pf-maternity"), img("pf-portrait"), img("pf-newborn")],
    },
    {
      _id: P.arjun, name: "Arjun Desai", location: "Thane", yearsExperience: 6,
      bio: "Studio-grade product and food photography for D2C brands, cloud kitchens and restaurants. Fast turnaround, catalogue-ready files.",
      specialties: ["Product", "Food", "Commercial"], pricing: { hourly: 3500, event: 22000, package: 60000 },
      website: "https://arjundesai.co", availability: [daysFromNow(1), daysFromNow(3), daysFromNow(8)],
      coverImage: img("pf-product"), portfolio: [img("pf-product"), img("pf-food")],
    },
    {
      _id: P.zoya, name: "Zoya Merchant", location: "Mumbai", yearsExperience: 9,
      bio: "Fashion and editorial work for designers, models and handloom labels. Strong light, strong shapes, nothing fussy.",
      specialties: ["Fashion", "Portrait", "Commercial"], pricing: { hourly: 6000, event: 45000, package: 120000 },
      instagram: "zoya.editorial", availability: [daysFromNow(5), daysFromNow(14)],
      coverImage: img("pf-fashion"), portfolio: [img("pf-fashion"), img("pf-portrait")],
    },
    {
      _id: P.vikram, name: "Vikram Jadhav", location: "Bhiwandi", yearsExperience: 5,
      bio: "Born and raised in Bhiwandi. Festivals, functions and the everyday life of the city — I know every lane and every light.",
      specialties: ["Event", "Street", "Wedding"], pricing: { hourly: 2000, event: 14000, package: 55000 },
      phone: "+91 90040 55667", availability: [daysFromNow(2), daysFromNow(7), daysFromNow(10), daysFromNow(18)],
      coverImage: img("pf-event"), portfolio: [img("pf-event"), img("pf-street"), img("hero-wedding")],
    },
    {
      _id: P.ananya, name: "Ananya Rao", location: "Navi Mumbai", yearsExperience: 4,
      bio: "Newborn and baby photographer. Safety-first posing, warm props and a calm studio that babies actually sleep in.",
      specialties: ["Newborn", "Family", "Maternity"], pricing: { hourly: 2800, event: 15000, package: 32000 },
      availability: [daysFromNow(3), daysFromNow(11)],
      coverImage: img("pf-newborn"), portfolio: [img("pf-newborn"), img("pf-maternity")],
    },
    {
      _id: P.kabir, name: "Kabir Momin", location: "Nashik", yearsExperience: 7,
      bio: "Travel and landscape commissions across the Sahyadris — tourism boards, resorts and adventure brands.",
      specialties: ["Travel", "Landscape", "Commercial"], pricing: { hourly: 3200, event: 20000, package: 70000 },
      instagram: "kabir.outdoors", availability: [daysFromNow(6), daysFromNow(20)],
      coverImage: img("pf-travel"), portfolio: [img("pf-travel"), img("pf-street")],
    },
    {
      _id: P.sana, name: "Sana Fernandes", location: "Mumbai", yearsExperience: 3,
      bio: "Pre-wedding and couple shoots in the city's heritage streets. Monsoon is my favourite season — bring an umbrella.",
      specialties: ["Pre-wedding", "Candid", "Portrait"], pricing: { hourly: 2500, event: 16000, package: 48000 },
      availability: [daysFromNow(1), daysFromNow(5), daysFromNow(13)],
      coverImage: img("pf-prewedding"), portfolio: [img("pf-prewedding"), img("pf-wedding"), img("pf-portrait")],
    },
  ];

  const clients: ClientProfile[] = [
    { _id: "c_asha", userId: "u_asha", name: "Asha Patil", email: "client@clickstar.in", phone: "+91 98765 43210", location: "Bhiwandi", favorites: [P.rajesh, P.meera] },
    { _id: "c_nikhil", userId: "u_nikhil", name: "Nikhil Shah", email: "nikhil@example.com", location: "Thane", favorites: [] },
    { _id: "c_priya", userId: "u_priya", name: "Priya Iyer", email: "priya@example.com", location: "Pune", favorites: [P.zoya] },
  ];

  const bookings: Booking[] = [
    { _id: "b1", clientId: "u_asha", photographerId: P.rajesh, shootDate: daysFromNow(16), shootType: "Wedding", location: "Bhiwandi, Kalyan Road banquet", status: "confirmed", price: 145000, notes: "Two-day ceremony, ~400 guests.", createdAt: daysFromNow(-10) },
    { _id: "b2", clientId: "u_asha", photographerId: P.meera, shootDate: daysFromNow(-30), shootType: "Maternity", location: "Pune, Koregaon Park", status: "completed", price: 18000, createdAt: daysFromNow(-50) },
    { _id: "b3", clientId: "u_nikhil", photographerId: P.rajesh, shootDate: daysFromNow(9), shootType: "Pre-wedding", location: "Mumbai, Fort", status: "pending", price: 38000, notes: "Sunset slot if possible.", createdAt: daysFromNow(-2) },
    { _id: "b4", clientId: "u_priya", photographerId: P.rajesh, shootDate: daysFromNow(-45), shootType: "Candid", location: "Mumbai, Bandra", status: "completed", price: 13500, createdAt: daysFromNow(-70) },
    { _id: "b5", clientId: "u_priya", photographerId: P.zoya, shootDate: daysFromNow(5), shootType: "Fashion", location: "Mumbai, Kala Ghoda", status: "pending", price: 45000, createdAt: daysFromNow(-1) },
    { _id: "b6", clientId: "u_nikhil", photographerId: P.arjun, shootDate: daysFromNow(-12), shootType: "Product", location: "Thane, Wagle Estate studio", status: "completed", price: 22000, createdAt: daysFromNow(-25) },
    { _id: "b7", clientId: "u_asha", photographerId: P.vikram, shootDate: daysFromNow(-90), shootType: "Event", location: "Bhiwandi", status: "cancelled", price: 14000, createdAt: daysFromNow(-100) },
  ];

  const review = (id: string, clientId: string, photographerId: string, rating: number, comment: string, ago: number, bookingId?: string): Review => ({
    _id: id, clientId, photographerId, rating, comment, bookingId, createdAt: daysFromNow(-ago),
  });

  const reviews: Review[] = [
    review("r1", "u_priya", P.rajesh, 5, "Rajesh barely felt present, yet he caught everything. The candid frames of my grandmother are my favourite photos ever.", 40, "b4"),
    review("r2", "u_nikhil", P.rajesh, 5, "Calm, punctual and his team handled a chaotic sangeet like pros.", 120),
    review("r3", "u_asha", P.rajesh, 4, "Gorgeous edits. Delivery took a week longer than promised, but worth it.", 200),
    review("r4", "u_asha", P.meera, 5, "Made me feel so comfortable during my maternity shoot. The light was unreal.", 28, "b2"),
    review("r5", "u_priya", P.meera, 5, "Patient with our toddler and the family portraits are beautiful.", 90),
    review("r6", "u_nikhil", P.arjun, 5, "Our catalogue conversion went up after the reshoot. Clean, sharp, on-brand.", 10, "b6"),
    review("r7", "u_priya", P.zoya, 4, "Bold, editorial look. Exactly what our label needed.", 60),
    review("r8", "u_asha", P.vikram, 5, "Knows Bhiwandi inside out — found spots I never knew existed.", 150),
    review("r9", "u_nikhil", P.ananya, 5, "Our newborn slept through the whole session. Magic.", 35),
    review("r10", "u_priya", P.kabir, 4, "Stunning monsoon landscapes for our resort brochure.", 80),
    review("r11", "u_asha", P.sana, 5, "Rainy Fort-area pre-wedding shoot — absolutely cinematic.", 15),
  ];

  const leads: Lead[] = [
    { _id: "l1", clientId: "c_nikhil", photographerId: P.rajesh, status: "assigned", createdAt: daysFromNow(-3), updatedAt: daysFromNow(-2) },
    { _id: "l2", clientId: "c_priya", photographerId: P.zoya, status: "pending", createdAt: daysFromNow(-1), updatedAt: daysFromNow(-1) },
    { _id: "l3", clientId: "c_asha", photographerId: P.meera, status: "completed", createdAt: daysFromNow(-52), updatedAt: daysFromNow(-30) },
    { _id: "l4", clientId: "c_asha", photographerId: P.vikram, status: "pending", createdAt: daysFromNow(-6), updatedAt: daysFromNow(-6) },
  ];

  return { users, photographers, clients, bookings, reviews, leads };
};

const KEY = "clickstar.mockdb.v1";

let db: MockDB = storage.get<MockDB>(KEY) ?? seed();

export const getDB = () => db;
export const persist = () => storage.set(KEY, db);
export const resetDB = () => {
  db = seed();
  persist();
};
