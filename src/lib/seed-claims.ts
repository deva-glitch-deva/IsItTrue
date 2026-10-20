import type { InputType, SeriousCategory, Source, Verdict } from "./types";

export interface SeedClaim {
  slug: string;
  text: string;
  verdict: Verdict;
  confidence: number;
  category: SeriousCategory;
  sensitive: boolean;
  reasoning: string;
  reasoningHinglish: string;
  reelSays: string;
  reelSaysHinglish: string;
  sourcesSay: string;
  sourcesSayHinglish: string;
  sources: Source[];
  searchTerms: string;
  inputType?: InputType;
  reelUrl?: string;
}

export const SEED_CLAIMS: SeedClaim[] = [
  {
    slug: "eiffel-temporary",
    text: "The Eiffel Tower was originally intended to be a temporary structure.",
    verdict: "TRUE",
    confidence: 96,
    category: null,
    sensitive: false,
    reasoning:
      "The Eiffel Tower was built for the 1889 Exposition Universelle with a planned lifespan of 20 years. It survived because it proved useful as a radio antenna and a scientific landmark.",
    reasoningHinglish:
      "Eiffel Tower 1889 ke Expo ke liye bana tha aur iska plan tha 20 saal mein hata dena. Radio antenna aur scientific landmark ke roop mein kaam aaya, isliye bacha raha.",
    reelSays:
      "The Eiffel Tower was never meant to be permanent; it was a temporary expo centrepiece.",
    reelSaysHinglish:
      "Eiffel Tower permanent nahi tha; yeh expo ka temporary centrepiece tha.",
    sourcesSay:
      "Official tower history and major reference works agree: the structure had a 20-year permit and was scheduled for dismantling after the 1900 World's Fair.",
    sourcesSayHinglish:
      "Official tower history aur badi reference books sehmat hain: structure ka 20-saal ka permit tha aur 1900 World's Fair ke baad hatana tha.",
    sources: [
      {
        id: "eiffel-official",
        title: "The history of the Eiffel Tower",
        publisher: "Eiffel Tower official",
        url: "https://www.toureiffel.paris/en/the-monument/history",
        snippet:
          "Built for the 1889 Exposition Universelle, the Tower was intended to last 20 years and was saved by its radio antenna.",
        credibility: "high",
      },
      {
        id: "eiffel-britannica",
        title: "Eiffel Tower",
        publisher: "Britannica",
        url: "https://www.britannica.com/topic/Eiffel-Tower-Paris-France",
        snippet:
          "Gustave Eiffel's tower was the entrance arch for the 1889 Paris exposition and was initially meant to be temporary.",
        credibility: "high",
      },
      {
        id: "eiffel-history",
        title: "How the Eiffel Tower became permanent",
        publisher: "History.com",
        url: "https://www.history.com/topics/landmarks/eiffel-tower",
        snippet:
          "The tower was scheduled for demolition but was spared partly because of its value as a radio transmitter.",
        credibility: "medium",
      },
    ],
    searchTerms: "eiffel tower temporary originally intended 20 years",
  },
  {
    slug: "lemon-cancer",
    text: "Drinking hot lemon water cures cancer.",
    verdict: "FALSE",
    confidence: 98,
    category: "health",
    sensitive: true,
    reasoning:
      "There is no credible clinical evidence that lemon water cures cancer. Lab studies use concentrated compounds, not a drink, and the human body tightly controls blood pH. Cancer treatment should come from qualified clinicians.",
    reasoningHinglish:
      "Lemon water cancer ka ilaaj karta hai—aisa koi reliable clinical evidence nahi hai. Lab studies concentrated compounds par hoti hain, lemon paani par nahi. Body apna pH khud control karti hai. Cancer treatment qualified doctor se lein.",
    reelSays:
      "Warm lemon water alkalises the body and kills cancer cells, so it can replace treatment.",
    reelSaysHinglish:
      "Garam lemon paani body ko alkaline karta hai aur cancer cells maarta hai, isliye treatment ki jagah le sakta hai.",
    sourcesSay:
      "Cancer Research UK, the WHO and major cancer centres state that no food or drink cures cancer and that alkaline diets do not change blood pH.",
    sourcesSayHinglish:
      "Cancer Research UK, WHO aur bade cancer centres kehte hain: koi food ya drink cancer cure nahi karta, aur alkaline diet blood pH nahi badalti.",
    sources: [
      {
        id: "lemon-cruk",
        title: "Can a healthy diet treat cancer?",
        publisher: "Cancer Research UK",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/complementary-alternative-therapies/individual-therapies",
        snippet:
          "There is no evidence that any diet, including alkaline or lemon-water diets, can cure cancer.",
        credibility: "high",
      },
      {
        id: "lemon-who",
        title: "Cancer fact sheet",
        publisher: "World Health Organization",
        url: "https://www.who.int/news-room/fact-sheets/detail/cancer",
        snippet:
          "Cancer treatment requires evidence-based medical care. No single food or drink is a cure.",
        credibility: "high",
      },
      {
        id: "lemon-mayo",
        title: "Cancer treatment: making informed choices",
        publisher: "Mayo Clinic",
        url: "https://www.mayoclinic.org/diseases-conditions/cancer/in-depth/cancer-treatment/art-20047246",
        snippet:
          "Unproven alternative therapies can delay effective treatment and cause harm.",
        credibility: "high",
      },
    ],
    searchTerms: "lemon water cure cancer alkaline diet evidence",
  },
  {
    slug: "carrots-night-vision",
    text: "Eating carrots improves your night vision.",
    verdict: "MISLEADING",
    confidence: 84,
    category: "health",
    sensitive: true,
    reasoning:
      "Carrots provide vitamin A, which is needed for normal eyesight. But eating extra carrots does not give healthy people night vision. The idea was amplified by WWII propaganda, and deficiency is rare in balanced diets.",
    reasoningHinglish:
      "Carrots mein vitamin A hota hai jo normal eyesight ke liye zaroori hai. Lekin extra carrots healthy logon ko night vision nahi dete. WWII propaganda ne is idea ko badhaya, aur balanced diet mein deficiency rare hai.",
    reelSays:
      "Carrots are the secret to seeing in the dark; eat more for night vision.",
    reelSaysHinglish:
      "Carrots andhere mein dekhne ka secret hain; zyada khao, night vision milegi.",
    sourcesSay:
      "Vitamin A matters for vision, especially when someone is deficient. Clinical sources say extra carrots do not enhance night vision in healthy people.",
    sourcesSayHinglish:
      "Vitamin A vision ke liye zaroori hai, khaas kar deficiency mein. Clinical sources kehte hain healthy logon ki night vision extra carrots se nahi badhti.",
    sources: [
      {
        id: "carrots-nhs",
        title: "Vitamins and minerals",
        publisher: "NHS",
        url: "https://www.nhs.uk/live-well/eat-well/food-types/vitamins-and-minerals/",
        snippet:
          "Vitamin A is needed for vision and healthy skin, but most people get enough from a balanced diet.",
        credibility: "high",
      },
      {
        id: "carrots-si",
        title: "The WWII myth that carrots help you see in the dark",
        publisher: "Smithsonian Magazine",
        url: "https://www.smithsonianmag.com/arts-culture/a-wwii-propaganda-campaign-popularized-the-myth-that-carrots-help-you-see-in-the-dark-180973704/",
        snippet:
          "British propaganda promoted carrots to explain night-fighter success and encourage ration-friendly eating.",
        credibility: "high",
      },
      {
        id: "carrots-ods",
        title: "Vitamin A and carotenoids",
        publisher: "NIH Office of Dietary Supplements",
        url: "https://ods.od.nih.gov/factsheets/VitaminA-Consumer/",
        snippet:
          "Vitamin A supports normal vision. Supplements do not improve vision in people who already get enough.",
        credibility: "high",
      },
    ],
    searchTerms: "carrots night vision vitamin A myth WWII",
  },
  {
    slug: "study-92-percent",
    text: "A 2024 study found that 92% of people cannot name three countries.",
    verdict: "UNVERIFIED",
    confidence: 26,
    category: null,
    sensitive: false,
    reasoning:
      "We could not locate the named study, its authors, sample size or publication record. Fact-check archives have no matching entry. Without a traceable source, this stays Unverified rather than being called false.",
    reasoningHinglish:
      "Naam wali study, authors, sample size ya publication record nahi mila. Fact-check archives mein bhi match nahi hai. Traceable source ke bina hum ise false nahi, Unverified kehte hain.",
    reelSays:
      "A viral 2024 study says 92% of people cannot name three countries.",
    reelSaysHinglish:
      "Ek viral 2024 study kehti hai 92% log teen countries ke naam nahi bata sakte.",
    sourcesSay:
      "Search engines, academic indexes and fact-check archives returned no direct source for the claimed statistic. The number may be mangled or invented.",
    sourcesSayHinglish:
      "Search engines, academic indexes aur fact-check archives mein is stat ka direct source nahi mila. Number bigda hua ya banaya hua ho sakta hai.",
    sources: [
      {
        id: "study-reuters",
        title: "Reuters Fact Check archive",
        publisher: "Reuters",
        url: "https://www.reuters.com/fact-check/",
        snippet:
          "No matching fact-check entry for a 2024 survey about naming three countries.",
        credibility: "high",
      },
      {
        id: "study-fullfact",
        title: "Full Fact fact checks",
        publisher: "Full Fact",
        url: "https://fullfact.org/",
        snippet:
          "No published source or methodology found for the 92% claim in public archives.",
        credibility: "high",
      },
      {
        id: "study-google",
        title: "Google Scholar search",
        publisher: "Google Scholar",
        url: "https://scholar.google.com/",
        snippet:
          "A search for the quoted statistic returned no peer-reviewed study matching the claim.",
        credibility: "medium",
      },
    ],
    searchTerms: "2024 study 92 percent people cannot name three countries",
  },
  {
    slug: "great-wall-space",
    text: "The Great Wall of China is the only human-made object visible from space with the naked eye.",
    verdict: "FALSE",
    confidence: 97,
    category: null,
    sensitive: false,
    reasoning:
      "Astronauts have repeatedly said the Great Wall is not visible to the naked eye from low Earth orbit. It is long but narrow, and often blends into the landscape. The 'only human-made object' part is also false.",
    reasoningHinglish:
      "Astronauts ne kai baar kaha hai: Great Wall low Earth orbit se naked eye se nahi dikhti. Woh lambi hai par patli, aur landscape mein mil jaati hai. 'Only human-made object' wala part bhi galat hai.",
    reelSays:
      "The Great Wall is the only human-made structure you can see from space without help.",
    reelSaysHinglish:
      "Great Wall hi ekmatra human-made cheez hai jo space se bina help dikhti hai.",
    sourcesSay:
      "NASA and astronaut accounts explain that the Wall is extremely difficult or impossible to see unaided from orbit. Satellites can image it with optics, as they can many structures.",
    sourcesSayHinglish:
      "NASA aur astronauts ke accounts kehte hain: orbit se Wall ko bina aid dekhna mushkil ya namumkin hai. Satellites optics se ise image kar sakte hain, jaise aur structures ko.",
    sources: [
      {
        id: "wall-britannica",
        title: "Is the Great Wall of China visible from space?",
        publisher: "Britannica",
        url: "https://www.britannica.com/story/is-the-great-wall-of-china-visible-from-space",
        snippet:
          "The claim is a myth; the Wall is too narrow to be seen with the naked eye from orbit.",
        credibility: "high",
      },
      {
        id: "wall-sciam",
        title: "Is China's Great Wall visible from space?",
        publisher: "Scientific American",
        url: "https://www.scientificamerican.com/article/is-the-great-wall-of-china-visible-from-space/",
        snippet:
          "Astronaut reports and orbital geometry do not support naked-eye visibility.",
        credibility: "high",
      },
      {
        id: "wall-nasa",
        title: "Earth observation and astronaut photography",
        publisher: "NASA",
        url: "https://earthobservatory.nasa.gov/",
        snippet:
          "Astronaut photography shows many human-made features from orbit, but the Great Wall is not uniquely visible.",
        credibility: "high",
      },
    ],
    searchTerms: "great wall china visible from space naked eye myth",
  },
  {
    slug: "nasa-darkness",
    inputType: "reel",
    reelUrl: "https://www.instagram.com/reel/demo-nasa-darkness/",
    text: "NASA confirmed that Earth will experience 15 days of complete darkness in December.",
    verdict: "FALSE",
    confidence: 99,
    category: null,
    sensitive: false,
    reasoning:
      "NASA has not announced a 15-day blackout, and the physics does not work: Earth's rotation guarantees day and night. This is a recurring hoax that changes the number of days and the year.",
    reasoningHinglish:
      "NASA ne 15-din ke blackout ka koi announcement nahi kiya, aur physics bhi allow nahi karti: Earth ke rotation se din-raat hote hain. Yeh ghoom-ghoom kar aane wala hoax hai, bas din aur saal badalte hain.",
    reelSays:
      "NASA confirmed Earth will go completely dark for 15 days this December.",
    reelSaysHinglish:
      "NASA ne confirm kiya hai ki is December Earth 15 din ke liye poori dark hogi.",
    sourcesSay:
      "NASA and major fact-check desks have repeatedly debunked the annual 'days of darkness' hoax. No such event is in any space agency bulletin.",
    sourcesSayHinglish:
      "NASA aur bade fact-check desks ne saalana 'days of darkness' hoax ko kai baar debunk kiya hai. Kisi space agency bulletin mein aisa event nahi hai.",
    sources: [
      {
        id: "dark-ap",
        title: "AP Fact Check",
        publisher: "Associated Press",
        url: "https://apnews.com/hub/ap-fact-check",
        snippet:
          "No NASA announcement exists about a multi-day global blackout.",
        credibility: "high",
      },
      {
        id: "dark-nasa",
        title: "NASA news and features",
        publisher: "NASA",
        url: "https://www.nasa.gov/news/",
        snippet:
          "NASA's public announcements do not include any Earth blackout event.",
        credibility: "high",
      },
      {
        id: "dark-reuters",
        title: "Reuters Fact Check archive",
        publisher: "Reuters",
        url: "https://www.reuters.com/fact-check/",
        snippet:
          "The recurring 'NASA 15 days of darkness' claim has been debunked many times.",
        credibility: "high",
      },
    ],
    searchTerms: "NASA 15 days darkness December hoax",
  },
];

export function findSeedClaim(text: string): SeedClaim | undefined {
  const normalized = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const keys: Record<string, string[]> = {
    "eiffel-temporary": ["eiffel", "temporary", "20 years", "expo"],
    "lemon-cancer": ["lemon", "cancer", "alkaline"],
    "carrots-night-vision": ["carrot", "night vision", "see in the dark"],
    "study-92-percent": ["92", "study", "three countries", "2024"],
    "great-wall-space": ["great wall", "space", "naked eye"],
    "nasa-darkness": ["nasa", "15 days", "darkness", "complete darkness"],
  };

  let best: { slug: string; score: number } | null = null;
  for (const seed of SEED_CLAIMS) {
    const phrases = keys[seed.slug] ?? [];
    const score = phrases.filter((phrase) => normalized.includes(phrase)).length;
    if (score >= 2 && (!best || score > best.score)) {
      best = { slug: seed.slug, score };
    }
  }
  return best ? SEED_CLAIMS.find((seed) => seed.slug === best?.slug) : undefined;
}
