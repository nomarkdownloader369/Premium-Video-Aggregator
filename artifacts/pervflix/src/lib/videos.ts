export type Video = {
  slug: string;
  title: string;
  studio: string;
  stars: string[];
  year: number;
  duration: string;
  views: string;
  quality: "4K" | "1080p" | "HD";
  description: string;
  thumbSeed: string;
  tags: string[];
};

export const STUDIOS = [
  "Brazzers",
  "MYLF",
  "BLACKED",
  "Team Skeet",
  "Bangbros",
  "Nubiles",
  "TUSHY",
  "Adult Time",
  "Reality Kings",
  "Mofos",
  "Naughty America",
  "Digital Playground",
];

export const TRENDING = [
  "4k",
  "stepmom",
  "milf",
  "teen",
  "pov",
  "creampie",
  "big tits",
  "anal",
  "threesome",
  "lesbian",
  "amateur",
  "public",
];

export const CATEGORIES = [
  "Anal",
  "MILF",
  "Lesbian",
  "Teen",
  "POV",
  "Amateur",
  "Interracial",
  "Blowjob",
  "Big Tits",
  "Creampie",
  "Threesome",
  "Stepmom",
  "Cosplay",
  "Public",
];

export type Pornstar = { name: string; slug: string; avatarSeed: string };

export const PORNSTARS: Pornstar[] = [
  { name: "Angela White", slug: "angela-white", avatarSeed: "ps-angela" },
  { name: "Julia Ann", slug: "julia-ann", avatarSeed: "ps-julia" },
  { name: "Lana Rhoades", slug: "lana-rhoades", avatarSeed: "ps-lana" },
  { name: "Riley Reid", slug: "riley-reid", avatarSeed: "ps-riley" },
  { name: "Abella Danger", slug: "abella-danger", avatarSeed: "ps-abella" },
  { name: "Mia Malkova", slug: "mia-malkova", avatarSeed: "ps-mia" },
  { name: "Adriana Chechik", slug: "adriana-chechik", avatarSeed: "ps-adriana" },
  { name: "Brandi Love", slug: "brandi-love", avatarSeed: "ps-brandi" },
];

const titles = [
  "Midnight Rendezvous in Milan",
  "The Penthouse Confession",
  "Weekend at the Lake House",
  "After Hours: The Director's Cut",
  "Silk & Shadows",
  "The Concierge Service",
  "Roommates: Chapter Three",
  "Private Villa Getaway",
  "The Neighbor's Secret",
  "Backstage Pass",
  "The Photographer's Muse",
  "One Last Night in Paris",
  "The Interview Room",
  "Uptown Affairs",
  "The Yoga Instructor",
  "Coastal Retreat",
];

const stars = [
  ["Ava Sinclair", "Marcus Vale"],
  ["Isabella Rose"],
  ["Sasha Knight", "Julian Cross"],
  ["Nina Vega"],
  ["Chloe Monroe", "Dante Rivers"],
  ["Elena Frost"],
  ["Maya Adler", "Ryder Kane"],
  ["Vivian Lux"],
];

export const VIDEOS: Video[] = titles.map((title, i) => ({
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  title,
  studio: STUDIOS[i % STUDIOS.length],
  stars: stars[i % stars.length],
  year: 2024 + (i % 3),
  duration: `${28 + ((i * 3) % 30)}:${String((i * 17) % 60).padStart(2, "0")}`,
  views: `${(1.2 + i * 0.37).toFixed(1)}M`,
  quality: (["4K", "1080p", "HD"] as const)[i % 3],
  description:
    "A meticulously produced full-length feature shot on cinema-grade cameras with layered sound design and a slow-burn narrative that pays off in every frame.",
  thumbSeed: `pervflix-${i}-${title.split(" ")[0].toLowerCase()}`,
  tags: ["premium", "full-length", "studio"],
}));

export const HERO_SLIDES = VIDEOS.slice(0, 4);

export function getVideo(slug: string): Video | undefined {
  return VIDEOS.find((v) => v.slug === slug);
}

export function thumbUrl(seed: string, w = 800, h = 450) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}
