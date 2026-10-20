import type { DailyClaim } from "./types";

const s = (
  id: string,
  title: string,
  publisher: string,
  url: string,
  snippet: string,
) => ({
  id,
  title,
  publisher,
  url,
  snippet,
  credibility: "high" as const,
});

export const DAILY_CLAIMS: DailyClaim[] = [
  {
    id: "octopus-hearts",
    claim: "An octopus has three hearts.",
    verdict: "TRUE",
    confidence: 98,
    explanation:
      "Two hearts pump blood through the gills and one pumps it around the body. Their blood is blue because it uses copper-based haemocyanin.",
    explanationHinglish:
      "Do hearts gills mein blood pump karte hain aur ek poore body mein. Blood blue hai kyunki isme copper-based haemocyanin hota hai.",
    source: s(
      "daily-octopus",
      "Octopus facts",
      "Natural History Museum",
      "https://www.nhm.ac.uk/discover/octopuses.html",
      "Octopuses have three hearts and blue blood.",
    ),
    category: null,
  },
  {
    id: "banana-berry",
    claim: "Bananas are berries, but strawberries are not.",
    verdict: "TRUE",
    confidence: 97,
    explanation:
      "Botanically, bananas qualify as berries while strawberries are aggregate accessory fruits. Common kitchen language is different from botany.",
    explanationHinglish:
      "Botany ke hisaab se banana berry hai, strawberry nahi—woh aggregate accessory fruit hai. Kitchen ki bhasha botany se alag hoti hai.",
    source: s(
      "daily-berry",
      "Berry or not?",
      "Britannica",
      "https://www.britannica.com/story/is-a-banana-a-berry",
      "Bananas are berries, while strawberries are not true berries.",
    ),
    category: null,
  },
  {
    id: "dinosaurs-humans",
    claim: "Humans and non-avian dinosaurs lived at the same time.",
    verdict: "FALSE",
    confidence: 99,
    explanation:
      "Non-avian dinosaurs went extinct about 66 million years ago. Modern humans appeared roughly 300,000 years ago, with a huge gap between them.",
    explanationHinglish:
      "Non-avian dinosaurs karib 6.6 crore saal pehle gaye. Modern humans karib 3 lakh saal pehle aaye. Beech mein bahut bada gap hai.",
    source: s(
      "daily-dino",
      "Dinosaur extinction",
      "Natural History Museum",
      "https://www.nhm.ac.uk/discover/dinosaur-extinction.html",
      "Non-avian dinosaurs died out 66 million years ago, long before humans.",
    ),
    category: null,
  },
  {
    id: "goldfish-memory",
    claim: "Goldfish have a three-second memory.",
    verdict: "FALSE",
    confidence: 95,
    explanation:
      "Studies show goldfish can learn and remember tasks for weeks or months. The three-second claim is a popular myth.",
    explanationHinglish:
      "Studies dikhate hain goldfish hafton ya mahinon tak tasks yaad rakhte hain. Teen-second memory wali baat myth hai.",
    source: s(
      "daily-goldfish",
      "Goldfish memory myth",
      "BBC Science Focus",
      "https://www.sciencefocus.com/nature/goldfish-memory",
      "Research shows goldfish can remember information for months.",
    ),
    category: null,
  },
  {
    id: "lightning-twice",
    claim: "Lightning never strikes the same place twice.",
    verdict: "FALSE",
    confidence: 99,
    explanation:
      "Tall structures are struck repeatedly. The Empire State Building is hit many times each year, and lightning can strike the same spot within seconds.",
    explanationHinglish:
      "Oonchi buildings par baar-baar lightning girti hai. Empire State Building par saal mein kai baar girti hai, aur same jagah seconds mein dobara gir sakti hai.",
    source: s(
      "daily-lightning",
      "Lightning facts",
      "National Weather Service",
      "https://www.weather.gov/safety/lightning",
      "Lightning can and does strike the same place repeatedly.",
    ),
    category: null,
  },
  {
    id: "bulls-red",
    claim: "Bulls charge because they hate the colour red.",
    verdict: "FALSE",
    confidence: 96,
    explanation:
      "Cattle are dichromatic and do not see red the way humans do. The bull reacts to the movement of the cape, not its colour.",
    explanationHinglish:
      "Cattle red colour insaan ki tarah nahi dekhte. Bull cape ki movement par charge karta hai, colour par nahi.",
    source: s(
      "daily-bull",
      "Why bulls charge",
      "Britannica",
      "https://www.britannica.com/story/why-do-bulls-charge-at-red-capes",
      "Bulls respond to movement; their colour vision is limited.",
    ),
    category: null,
  },
  {
    id: "spiders-swallow",
    claim: "The average person swallows eight spiders per year while sleeping.",
    verdict: "FALSE",
    confidence: 97,
    explanation:
      "There is no research supporting this. It originated as an internet hoax designed to show how easily people accept alarming statistics.",
    explanationHinglish:
      "Iske peeche koi research nahi hai. Yeh internet hoax tha jo dikhata hai log alarming numbers ko kitni jaldi maan lete hain.",
    source: s(
      "daily-spiders",
      "Spider swallowing myth",
      "Scientific American",
      "https://www.scientificamerican.com/article/fact-or-fiction-people-swallow-spiders-in-their-sleep/",
      "No evidence supports the eight-spiders-a-year claim.",
    ),
    category: null,
  },
  {
    id: "sun-star",
    claim: "The Sun is a star.",
    verdict: "TRUE",
    confidence: 99,
    explanation:
      "The Sun is a G-type main-sequence star, the closest star to Earth. It produces energy through nuclear fusion in its core.",
    explanationHinglish:
      "Sun ek G-type main-sequence star hai, Earth ke sabse kareeb. Core mein nuclear fusion se energy banati hai.",
    source: s(
      "daily-sun",
      "Our Sun",
      "NASA",
      "https://science.nasa.gov/sun/",
      "The Sun is the star at the centre of our solar system.",
    ),
    category: null,
  },
  {
    id: "one-dog-year",
    claim: "One dog year equals seven human years.",
    verdict: "MISLEADING",
    confidence: 88,
    explanation:
      "The 7:1 rule is a rough shorthand. Dogs age quickly early in life, and breed size changes the curve significantly.",
    explanationHinglish:
      "7:1 rule bas rough shortcut hai. Dogs shuru mein jaldi badhe hote hain, aur breed size se curve kaafi badalta hai.",
    source: s(
      "daily-dog",
      "How old is your dog?",
      "American Kennel Club",
      "https://www.akc.org/expert-advice/health/how-to-calculate-dog-years-to-human-years/",
      "Dog aging is not a simple seven-to-one conversion.",
    ),
    category: null,
  },
  {
    id: "knuckles-arthritis",
    claim: "Cracking your knuckles causes arthritis.",
    verdict: "MISLEADING",
    confidence: 82,
    explanation:
      "The pop comes from gas bubbles in the joint fluid. Studies have not found a clear causal link to arthritis, though habitual cracking can cause temporary swelling or grip changes.",
    explanationHinglish:
      "Pop joint fluid ke gas bubbles se aata hai. Studies ne arthritis se clear link nahi paya, par aadat se temporary swelling ya grip change ho sakta hai.",
    source: s(
      "daily-knuckle",
      "Does cracking knuckles cause arthritis?",
      "Mayo Clinic",
      "https://www.mayoclinic.org/diseases-conditions/arthritis/expert-answers/arthritis/faq-20057820",
      "No evidence supports a direct causal link to arthritis.",
    ),
    category: null,
  },
  {
    id: "viking-horns",
    claim: "Vikings wore horned helmets into battle.",
    verdict: "FALSE",
    confidence: 95,
    explanation:
      "There is no evidence Viking warriors wore horned helmets. The image comes largely from later opera and romantic artwork.",
    explanationHinglish:
      "Viking warriors horned helmets pehnte the—iska evidence nahi hai. Yeh image baad ke opera aur romantic artwork se aayi.",
    source: s(
      "daily-viking",
      "Viking helmets",
      "National Museum of Denmark",
      "https://en.natmus.dk/historical-knowledge/denmark/prehistoric-period-until-1050-ad/the-viking-age/weapons/helmets/",
      "Viking helmets were practical and did not have horns.",
    ),
    category: null,
  },
  {
    id: "everest-tallest",
    claim: "Mount Everest is the tallest mountain above sea level.",
    verdict: "TRUE",
    confidence: 98,
    explanation:
      "Everest's summit is the highest point above mean sea level. Measured from base to peak, Mauna Kea is taller, which is why the wording matters.",
    explanationHinglish:
      "Everest ka summit sea level se sabse ooncha hai. Base se peak tak Mauna Kea zyada tall hai, isliye wording important hai.",
    source: s(
      "daily-everest",
      "Highest mountains",
      "Britannica",
      "https://www.britannica.com/science/Mount-Everest",
      "Everest has the highest elevation above sea level.",
    ),
    category: null,
  },
  {
    id: "water-electricity",
    claim: "Pure water is a strong conductor of electricity.",
    verdict: "MISLEADING",
    confidence: 84,
    explanation:
      "Pure water conducts very poorly. Dissolved minerals and salts make everyday water conductive, which is why tap water and pools can be dangerous around electricity.",
    explanationHinglish:
      "Pure water bahut kam conduct karta hai. Minerals aur salts ki wajah se everyday water conductive hota hai, isliye tap water aur pool electricity ke saath dangerous ho sakte hain.",
    source: s(
      "daily-water",
      "Conductivity of water",
      "USGS",
      "https://www.usgs.gov/special-topics/water-science-school/science/conductivity-electrical-conductance-and-water",
      "Pure water is a poor conductor; dissolved ions increase conductivity.",
    ),
    category: null,
  },
  {
    id: "sahara-largest",
    claim: "The Sahara is the world's largest hot desert.",
    verdict: "TRUE",
    confidence: 97,
    explanation:
      "The Sahara is the largest hot desert. Antarctica is the largest desert overall, but it is a cold desert.",
    explanationHinglish:
      "Sahara sabse bada hot desert hai. Overall sabse bada desert Antarctica hai, par woh cold desert hai.",
    source: s(
      "daily-sahara",
      "Desert",
      "Britannica",
      "https://www.britannica.com/science/desert",
      "The Sahara is the largest hot desert; Antarctica is the largest desert overall.",
    ),
    category: null,
  },
  {
    id: "nails-grow",
    claim: "Hair and nails continue to grow after death.",
    verdict: "FALSE",
    confidence: 94,
    explanation:
      "The skin retracts as it dehydrates, making hair and nails appear longer. Actual growth requires biological processes that stop at death.",
    explanationHinglish:
      "Skin dehydrate hokar sikudti hai, isliye hair aur nails lambe dikhte hain. Asli growth ke liye biological process chahiye jo death par ruk jaata hai.",
    source: s(
      "daily-nails",
      "Do hair and nails grow after death?",
      "BBC Science Focus",
      "https://www.sciencefocus.com/science/do-hair-and-nails-continue-to-grow-after-death",
      "Skin shrinkage creates the illusion of post-death growth.",
    ),
    category: null,
  },
];

export function getDailyClaims(date = new Date()): {
  dayKey: string;
  claims: DailyClaim[];
} {
  const dayKey = date.toISOString().slice(0, 10);
  const seed = Number(dayKey.replaceAll("-", ""));
  const pool = [...DAILY_CLAIMS];
  const picked: DailyClaim[] = [];
  for (let i = 0; i < 5; i += 1) {
    const index = (seed + i * 7) % pool.length;
    picked.push(pool.splice(index, 1)[0]);
  }
  return { dayKey, claims: picked };
}
