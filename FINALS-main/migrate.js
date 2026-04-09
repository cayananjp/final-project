// ============================================================
// migrate.js — SavorSense Full Recipe Migration Script
// ============================================================
// HOW TO RUN:
//   1. Place this file in your project ROOT (same level as package.json)
//   2. Make sure your .env file has:
//        REACT_APP_SUPABASE_URL=your_supabase_url
//        REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
//   3. Run: node migrate.js
// ============================================================

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
// ============================================================
// IMAGE FILE MAP — exact filenames from your public/pictures/
// ============================================================
const IMAGE_FILES = {
  "adobong-kangkong":      "adobongkangkong.jpg",
  "pinakbet":              "pinakbet.jpg",
  "laing":                 "laing.jpg",
  "gising-gising":         "gisinggising.jpg",
  "bulanglang":            "bulanglang.png",
  "ginataang-kalabasa":    "Ginataangkalabasa.jpg",
  "ensaladang-talong":     "ensaladangtalong.png",
  "tortang-talong":        "Tortangtalong.jpg",
  "chopseuy":              "chopsuey.jpg",
  "monggo-guisado":        "Monggoguisado.jpg",
  "sinigang-baka":         "sinigangbaka.jpg",
  "beef-kaldereta":        "beefkaldereta.jpg",
  "beef-nilaga":           "beefnilaga.png",
  "bistek-tagalog":        "bistektagalog.png",
  "beef-pakbet":           "beefpinakbet.jpg",
  "beef-broccoli":         "Beefbroccoli.jpg",
  "beef-adobo":            "beefadobo.jpg",
  "beef-morcon":           "beefmorcon.png",
  "beef-lumpia":           "beeflumpia.jpg",
  "sinanglaw":             "beefSinanglaw.jpg",
  "chicken-adobo":         "chickenadobo.jpg",
  "tinolang-manok":        "tinolangmanok.jpg",
  "chicken-curry":         "chickencurry.jpg",
  "afritada-manok":        "Afritadangmanok.png",
  "chicken-sopas":         "chickensopas.jpg",
  "ginisang-manok":        "ginisangmanokwithveggies.jpg",
  "chicken-mechado":       "chickenmechado.jpg",
  "chicken-bbq":           "ChickenBarbecue.jpg",
  "tinola-gata":           "chickentinolasagata.png",
  "arroz-caldo":           "chickenarrozcaldo.png",
  "pork-giniling":         "porkginiling.jpg",
  "pork-adobo":            "porkadobo.jpg",
  "sisig":                 "porksisig.jpg",
  "bicol-express":         "bicolexpress.jpg",
  "lechon-kawali":         "lechonkawali.jpg",
  "lechon-paksiw":         "lechonpaksiw.png",
  "pork-lumpia":           "porklumpia.jpg",
  "pork-menudo":           "porkmenudo.png",
  "pork-dinuguan":         "porkdinuguan.jpg",
  "pork-sinigang":         "porksinigang.jpg",
  "filipino-paella":       "filipinopaella.jpg",
  "bicol-express-seafood": "bicolexpressseafood.jpg",
  "ginataang-seafood":     "ginataangseafood.jpg",
  "seafood-karekare":      "seafoodkarekare.jpg",
  "sinigang-hipon":        "sinigangnahipon.jpg",
  "adobong-pusit":         "adobongpusit.jpg",
  "inihaw-na-bangus":      "inihawnabangus.jpg",
  "kinilaw-na-bangus":     "kinilawnabangus.jpg",
  "rellenong-bangus":      "rellenongbangus.jpg",
  "escabecheng-isda":      "escabechengisda.jpg",
  "halo-halo":             "halohalo.jpg",
  "leche-flan":            "lecheflan.jpg",
  "bibingka":              "bibingka.jpg",
  "puto-cheese":           "putocheese.jpg",
  "kutsinta":              "kutsinta.jpg",
  "turon":                 "turon.jpg",
  "banana-cue":            "bananacue.jpg",
  "bibingkang-latik":      "bibingkanglatik.jpg",
  "biko":                  "biko.jpg",
  "mais-con-yelo":         "maisconyelo.jpg",
};

// ============================================================
// ALL 60 RECIPES
// ============================================================
const RECIPES = [
  // VEGETABLES
  { id: "adobong-kangkong", title: "Adobong Kangkong", category: "Vegetables", time: "15 mins", cuisine: "Filipino", description: "A simple and healthy water spinach dish simmered in soy sauce and vinegar.", required: ["kangkong","soy sauce","vinegar","garlic"], ingredients: ["500 grams kangkong (water spinach)","45 ml soy sauce (3 tbsp)","30 ml cane vinegar (2 tbsp)","4 cloves garlic, minced","1 piece small onion, chopped","15 ml cooking oil (1 tbsp)","1 pinch ground black pepper"], steps: ["Heat oil in a pan and sauté garlic until golden brown. Set aside a little toasted garlic for topping.","Add the onions and sauté until translucent.","Add the kangkong stalks and cook for 1 minute.","Pour in soy sauce and vinegar. Let it boil without stirring for 2 minutes.","Add the kangkong leaves and black pepper. Toss well and cook for 1 more minute.","Transfer to a plate and top with toasted garlic."], video: "https://www.youtube.com/embed/wnmrlZDgj5U" },
  { id: "pinakbet", title: "Pinakbet", category: "Vegetables", time: "30 mins", cuisine: "Filipino", description: "Classic Ilocano vegetable stew flavored with salty shrimp paste.", required: ["squash","okra","eggplant","string beans","bagoong"], ingredients: ["250 grams pork belly, sliced","300 grams squash, cubed","1 piece large eggplant, sliced","6 pieces okra, ends trimmed","200 grams string beans (sitaw)","1 piece ampalaya, sliced","45 ml bagoong alamang (3 tbsp)","3 cloves garlic, minced","1 piece onion, chopped","240 ml water (1 cup)"], steps: ["In a pot, fry the pork belly until it browns and releases its own oil.","Sauté garlic and onions in the pork fat until fragrant.","Stir in the shrimp paste and cook for 1 minute.","Add the pork and water, cover, and simmer for 10 minutes until pork is tender.","Add the squash and cook for 3 minutes.","Add the remaining vegetables. Cover and simmer for 5-7 minutes until cooked but crisp."], video: "https://www.youtube.com/embed/OzfTQZVYKmY" },
  { id: "laing", title: "Laing", category: "Vegetables", time: "45 mins", cuisine: "Filipino", description: "Dried taro leaves cooked gently in creamy coconut milk and chilies.", required: ["taro leaves","coconut milk","chili","ginger"], ingredients: ["60 grams dried taro leaves","960 ml coconut milk (4 cups)","250 grams pork belly, thinly sliced","2 thumbs ginger, julienned","4 cloves garlic, minced","1 piece onion, minced","45 ml bagoong alamang (3 tbsp)","5 pieces Thai chilies"], steps: ["In a wide pan, combine coconut milk, ginger, garlic, onion, pork, and bagoong.","Bring to a gentle boil, then lower heat and simmer for 15 minutes.","Add the dried taro leaves. Do NOT stir. Just gently push them down.","Simmer uncovered for 20-30 minutes until the milk reduces to a thick oil.","Add the chilies in the last 5 minutes. Serve hot."], video: "https://www.youtube.com/embed/sUgwuoiT3RU" },
  { id: "gising-gising", title: "Gising-gising", category: "Vegetables", time: "25 mins", cuisine: "Filipino", description: "Spicy green bean and ground pork stew in coconut milk.", required: ["sigarilyas","coconut milk","ground pork","chili"], ingredients: ["300 grams sigarilyas or green beans, chopped","250 grams ground pork","480 ml coconut milk (2 cups)","30 ml shrimp paste (2 tbsp)","1 piece onion, minced","4 cloves garlic, minced","4 pieces Thai chilies, chopped","15 ml cooking oil (1 tbsp)"], steps: ["Heat oil and sauté garlic and onions until soft.","Add the ground pork and cook until light brown.","Stir in the shrimp paste and cook for 2 minutes.","Pour in the coconut milk. Boil, then simmer for 10 minutes.","Add the beans and chilies. Simmer for 5 minutes until the sauce reduces."], video: "https://www.youtube.com/embed/mACkMWS0LSw" },
  { id: "bulanglang", title: "Bulanglang na Gulay", category: "Vegetables", time: "25 mins", cuisine: "Filipino", description: "A light, healthy, and comforting Batangas vegetable soup boiled with ginger.", required: ["squash","papaya","string beans","malunggay","ginger"], ingredients: ["200 grams squash, cubed","1 piece green papaya, sliced","150 grams string beans","100 grams malunggay leaves","2 pieces tomatoes, quartered","1 thumb ginger, crushed","960 ml rice wash or water (4 cups)","15 ml fish sauce (1 tbsp)"], steps: ["Pour the rice wash into a pot and bring to a boil.","Add the crushed ginger and tomatoes. Simmer for 3 minutes.","Drop in the squash and green papaya. Simmer for 5 minutes.","Add the string beans and cook for 3 more minutes.","Season with fish sauce.","Turn off heat, stir in malunggay leaves, and cover."], video: "https://www.youtube.com/embed/Gj8hBiLG7Nk" },
  { id: "ginataang-kalabasa", title: "Ginataan (Kalabasa at Sitaw)", category: "Vegetables", time: "30 mins", cuisine: "Filipino", description: "Squash and string beans cooked in rich coconut milk.", required: ["squash","string beans","coconut milk","shrimp"], ingredients: ["300 grams squash, cubed","200 grams string beans, cut","480 ml coconut milk (2 cups)","250 grams shrimp, peeled","1 piece onion, minced","3 cloves garlic, minced","15 ml cooking oil (1 tbsp)","15 ml fish sauce (1 tbsp)"], steps: ["Heat oil in a pan. Sauté garlic and onions.","Add the shrimp, cook until pink, then remove and set aside.","Pour the coconut milk into the pan and bring to a gentle boil.","Add the squash and simmer for 8 minutes.","Add the string beans and simmer for 5 minutes.","Return the shrimp, season with fish sauce, and serve."], video: "https://www.youtube.com/embed/tdrNMVM-0bY" },
  { id: "ensaladang-talong", title: "Ensaladang Talong", category: "Vegetables", time: "15 mins", cuisine: "Filipino", description: "Roasted eggplant salad with tomatoes and onions.", required: ["eggplant","tomato","onion","vinegar"], ingredients: ["3 pieces medium eggplants","2 pieces tomatoes, diced","1 piece red onion, diced","45 ml cane vinegar (3 tbsp)","1 pinch salt","1 pinch ground black pepper"], steps: ["Grill the eggplants until the skin is completely charred and flesh is soft.","Let cool, then peel off the charred skin.","Chop the eggplant flesh or mash slightly.","Combine eggplant, tomatoes, and onions in a bowl.","Drizzle with vinegar, season with salt and pepper, and toss."], video: "https://www.youtube.com/embed/kkMBSF4mt3Q" },
  { id: "tortang-talong", title: "Tortang Talong", category: "Vegetables", time: "20 mins", cuisine: "Filipino", description: "Filipino eggplant omelet, crispy on the outside and soft inside.", required: ["eggplant","egg","salt","oil"], ingredients: ["4 pieces medium eggplants","3 pieces large eggs","1 pinch salt","1 pinch ground black pepper","60 ml cooking oil (4 tbsp)"], steps: ["Grill the eggplants until the skin is charred. Peel off skin, leaving stem intact.","Flatten the eggplant flesh with a fork.","Beat the eggs in a bowl and season with salt and pepper.","Heat oil. Dip the flattened eggplant into the egg mixture.","Fry until golden brown and crispy, about 3 minutes per side."], video: "https://www.youtube.com/embed/hM24u0gRjIM" },
  { id: "chopseuy", title: "Chopsuey", category: "Vegetables", time: "30 mins", cuisine: "Filipino-Chinese", description: "Stir-fried mixed vegetables with thick savory sauce.", required: ["cabbage","carrots","cauliflower","bell pepper","oyster sauce"], ingredients: ["200 grams cabbage, sliced","1 piece carrot, sliced","200 grams cauliflower florets","1 piece bell pepper, sliced","150 grams pork breast, sliced","150 grams shrimp, peeled","45 ml oyster sauce (3 tbsp)","15 ml soy sauce (1 tbsp)","15 grams cornstarch (1 tbsp) dissolved in water","3 cloves garlic, minced"], steps: ["Sauté garlic in hot oil. Add pork and cook until brown.","Add the shrimp and cook until pink.","Add hard vegetables (carrots, cauliflower) and stir-fry for 3 minutes.","Pour in oyster sauce, soy sauce, and cornstarch slurry.","Add cabbage and bell peppers last. Cook until sauce thickens."], video: "https://www.youtube.com/embed/A6aG0riTiyw" },
  { id: "monggo-guisado", title: "Monggo Guisado", category: "Vegetables", time: "45 mins", cuisine: "Filipino", description: "Hearty mung bean stew with spinach and pork.", required: ["monggo","spinach","pork","garlic","tomato"], ingredients: ["200 grams dried mung beans (monggo)","250 grams pork belly, diced","100 grams spinach leaves","2 pieces tomatoes, chopped","1 piece onion, minced","4 cloves garlic, minced","30 ml fish sauce (2 tbsp)","960 ml water (4 cups)"], steps: ["Boil mung beans in water until very soft (about 30 mins). Set aside.","In a separate pot, sauté garlic, onions, and tomatoes.","Add the diced pork and cook until browned.","Pour the cooked mung beans (with water) into the pot. Simmer for 10 mins.","Season with fish sauce, stir in spinach, and serve."], video: "https://www.youtube.com/embed/4QbSN8TNQUk" },
  // BEEF
  { id: "sinigang-baka", title: "Sinigang na Baka", category: "Beef", time: "90 mins", cuisine: "Filipino", description: "Beef soup with a sour tamarind broth and vegetables.", required: ["beef","tamarind","radish","kangkong"], ingredients: ["1000 grams beef short ribs","1 packet tamarind soup base","1 piece large radish, sliced","300 grams kangkong","2 pieces tomatoes, quartered","1 piece red onion, quartered","2 pieces green chilies","30 ml fish sauce (2 tbsp)"], steps: ["Place beef, tomatoes, and onions in a large pot. Cover with water and boil.","Simmer for 1.5 hours until beef is tender. Skim the scum.","Add the radish and simmer for 10 minutes.","Stir in the tamarind base and green chilies. Season with fish sauce.","Turn off heat, add kangkong, and cover for 2 minutes."], video: "https://www.youtube.com/embed/KOTFW1OYe2o" },
  { id: "beef-kaldereta", title: "Beef Kaldereta", category: "Beef", time: "90 mins", cuisine: "Filipino", description: "Rich and hearty beef stew with liver spread, potatoes, carrots, and tomato sauce.", required: ["beef","tomato sauce","liver spread","potatoes","carrots"], ingredients: ["1000 grams beef brisket, cubed","240 ml tomato sauce (1 cup)","120 grams liver spread (1/2 cup)","2 pieces potatoes, cubed","2 pieces carrots, sliced","1 piece red bell pepper, sliced","1 piece onion, minced","4 cloves garlic, minced","480 ml beef broth (2 cups)","30 ml cooking oil (2 tbsp)"], steps: ["Heat oil and sauté garlic and onions.","Add beef cubes and brown the outside.","Pour in tomato sauce and beef broth. Simmer for 1.5 hours.","Stir in liver spread to thicken.","Add potatoes and carrots, cook for 10 mins. Add bell peppers last."], video: "https://www.youtube.com/embed/7jyJZkVvyzo" },
  { id: "beef-nilaga", title: "Beef Nilaga", category: "Beef", time: "90 mins", cuisine: "Filipino", description: "A comforting boiled beef soup with corn and cabbage.", required: ["beef","corn","cabbage","potatoes","peppercorn"], ingredients: ["1000 grams beef shank (bulalo)","2 pieces ears of corn, cut","1 piece small cabbage, quartered","2 pieces medium potatoes, quartered","1 piece large onion, quartered","15 grams whole black peppercorns (1 tbsp)","30 ml fish sauce (2 tbsp)"], steps: ["Place beef, onion, and peppercorns in a pot. Cover with water.","Bring to a boil, skim scum, then simmer for 1.5 to 2 hours.","Add corn and potatoes, simmer for 15 minutes.","Season with fish sauce.","Add cabbage, turn off heat, and cover pot."], video: "https://www.youtube.com/embed/e98fUb1H8Gc" },
  { id: "bistek-tagalog", title: "Bistek Tagalog", category: "Beef", time: "40 mins", cuisine: "Filipino", description: "Thinly sliced beef marinated in soy sauce and calamansi, topped with onions.", required: ["beef","soy sauce","calamansi","onion"], ingredients: ["500 grams beef sirloin, thinly sliced","60 ml soy sauce (1/4 cup)","45 ml calamansi juice (3 tbsp)","2 pieces large white onions, sliced into rings","1 pinch ground black pepper","45 ml cooking oil (3 tbsp)"], steps: ["Marinate beef in soy sauce, calamansi, and pepper for 30 minutes.","Sauté onion rings in oil until soft, then set aside.","Pan-fry the beef slices in batches for 1-2 minutes per side. Set aside.","Boil the remaining marinade in the pan.","Return beef and onions to the pan, toss, and serve."], video: "https://www.youtube.com/embed/xH746HwUlbQ" },
  { id: "beef-pakbet", title: "Beef Pakbet", category: "Beef", time: "45 mins", cuisine: "Filipino", description: "Beef cooked with mixed vegetables and shrimp paste.", required: ["beef","bagoong","squash","eggplant"], ingredients: ["500 grams beef sirloin, strips","30 ml bagoong alamang (2 tbsp)","200 grams squash, cubed","1 piece eggplant, sliced","150 grams string beans","1 piece onion, minced","3 cloves garlic, minced","240 ml water (1 cup)"], steps: ["Sauté garlic and onions.","Add beef strips and brown.","Stir in shrimp paste.","Pour water, cover, and simmer 15 mins.","Add squash, cook 5 mins. Add remaining veggies until tender."], video: "https://www.youtube.com/embed/TWz8Z-o_CBg" },
  { id: "beef-broccoli", title: "Beef Broccoli", category: "Beef", time: "30 mins", cuisine: "Filipino-Chinese", description: "Tender beef slices stir-fried with fresh broccoli florets in a savory oyster sauce glaze.", required: ["beef","broccoli","oyster sauce","soy sauce","garlic"], ingredients: ["500 grams beef sirloin, thinly sliced","1 piece large head broccoli, florets","45 ml oyster sauce (3 tbsp)","30 ml soy sauce (2 tbsp)","15 grams cornstarch (1 tbsp)","3 cloves garlic, minced","1 piece onion, sliced"], steps: ["Marinate beef in soy sauce and cornstarch for 15 mins.","Blanch broccoli in boiling water for 2 mins, drain.","Sauté garlic, onions, and marinated beef until brown.","Mix oyster sauce with water and pour into pan.","Toss broccoli in the thick glaze and serve."], video: "https://www.youtube.com/embed/_h8kJ5vV1E8" },
  { id: "beef-adobo", title: "Beef Adobo", category: "Beef", time: "60 mins", cuisine: "Filipino", description: "Tender beef chunks braised in soy sauce, vinegar, and garlic.", required: ["beef","soy sauce","vinegar","garlic"], ingredients: ["1000 grams beef chuck, cubed","120 ml soy sauce (1/2 cup)","80 ml white vinegar (1/3 cup)","1 head garlic, crushed","15 grams whole black peppercorns (1 tbsp)","3 pieces bay leaves","240 ml water (1 cup)","30 ml cooking oil (2 tbsp)"], steps: ["Marinate beef in soy sauce, garlic, and peppercorns for 30 mins.","Sear the beef cubes in oil until brown.","Pour in marinade, bay leaves, and water. Simmer for 60 mins.","Pour in vinegar. Boil uncovered for 5 mins.","Simmer until sauce thickens."], video: "https://www.youtube.com/embed/TKrn_tsMIXY" },
  { id: "beef-morcon", title: "Beef Morcon", category: "Beef", time: "120 mins", cuisine: "Filipino", description: "A festive stuffed beef roll braised in tomato sauce.", required: ["beef","hotdog","cheese","egg","tomato sauce"], ingredients: ["1000 grams flank steak, single thin slice","2 pieces hotdogs, sliced","100 grams cheddar cheese, strips","2 pieces hard-boiled eggs, quartered","1 piece carrot, sticks","240 ml tomato sauce (1 cup)","480 ml beef broth (2 cups)"], steps: ["Lay steak flat and marinate in soy sauce/calamansi.","Arrange fillings in a row.","Roll beef tightly and tie with twine.","Sear the beef roll until brown.","Simmer in tomato sauce and broth for 1.5 hours. Slice to serve."], video: "https://www.youtube.com/embed/17yUhn4hq1E" },
  { id: "beef-lumpia", title: "Beef Lumpia", category: "Beef", time: "30 mins", cuisine: "Filipino", description: "Crispy fried spring rolls filled with savory ground beef.", required: ["ground beef","lumpia wrapper","carrots","onion"], ingredients: ["500 grams ground beef","20 pieces lumpia wrappers","1 piece carrot, minced","1 piece onion, minced","3 cloves garlic, minced","1 piece raw egg","5 grams salt","240 ml cooking oil (1 cup)"], steps: ["Mix beef, carrot, onion, garlic, egg, and salt.","Place 1 tbsp of mixture on wrapper.","Roll tightly and seal with water.","Deep fry in hot oil until golden brown."], video: "https://www.youtube.com/embed/6G-cfgTDSW4" },
  { id: "sinanglaw", title: "Beef Sinanglaw", category: "Beef", time: "90 mins", cuisine: "Filipino", description: "An Ilocano soup made of beef and beef innards flavored with bile and kamias.", required: ["beef","ginger","kamias","onion"], ingredients: ["500 grams beef brisket, cubed","250 grams beef tripe, boiled","1 thumb ginger, crushed","1 piece red onion, sliced","5 pieces kamias, sliced","5 ml beef bile (1 tsp)","30 ml fish sauce (2 tbsp)"], steps: ["Boil beef with ginger and onions until tender.","Add the pre-boiled tripe.","Drop in kamias and simmer 10 mins.","Add beef bile drop by drop for slight bitterness.","Season with fish sauce."], video: "https://www.youtube.com/embed/03CB3PU4l48" },
  // CHICKEN
  { id: "chicken-adobo", title: "Chicken Adobo", category: "Chicken", time: "45 mins", cuisine: "Filipino", description: "The ultimate Filipino classic. Chicken braised in soy sauce, vinegar, and aromatics.", required: ["chicken","soy sauce","vinegar","garlic","bay leaves"], ingredients: ["1000 grams chicken, cut into pieces","120 ml soy sauce (1/2 cup)","80 ml cane vinegar (1/3 cup)","1 head garlic, smashed","15 grams whole black peppercorns (1 tbsp)","3 pieces bay leaves","120 ml water (1/2 cup)","15 ml cooking oil (1 tbsp)"], steps: ["Marinate chicken in soy sauce and garlic for 30 mins.","Pan-fry chicken until brown.","Add marinade, water, peppercorns, and bay leaves. Simmer 20 mins.","Pour in vinegar. Boil uncovered for 5 mins.","Simmer until sauce thickens."], video: "https://www.youtube.com/embed/FWjp0ieChzs" },
  { id: "tinolang-manok", title: "Tinolang Manok", category: "Chicken", time: "40 mins", cuisine: "Filipino", description: "A comforting ginger-based chicken soup with green papaya and chili leaves.", required: ["chicken","ginger","papaya","spinach"], ingredients: ["1000 grams chicken, pieces","2 thumbs ginger, julienned","1 piece green papaya, wedges","150 grams chili leaves or spinach","1 piece onion, minced","4 cloves garlic, minced","30 ml fish sauce (2 tbsp)","960 ml water (4 cups)"], steps: ["Sauté ginger, garlic, and onions.","Add chicken and cook until white.","Season with fish sauce.","Pour water, boil, and simmer 20 mins.","Add papaya, cook 10 mins. Add leaves last."], video: "https://www.youtube.com/embed/pEMMBceYyMw" },
  { id: "chicken-curry", title: "Chicken Curry", category: "Chicken", time: "45 mins", cuisine: "Filipino", description: "Filipino-style yellow chicken curry with potatoes, carrots, and coconut milk.", required: ["chicken","curry powder","coconut milk","potatoes"], ingredients: ["1000 grams chicken, pieces","30 grams curry powder (2 tbsp)","240 ml thick coconut milk (1 cup)","2 pieces medium potatoes, quartered","1 piece carrot, chunks","1 piece bell pepper, squares","1 piece onion, minced","3 cloves garlic, minced"], steps: ["Pan-fry potatoes and carrots lightly, set aside.","Sauté ginger, garlic, onions, and chicken until brown.","Sprinkle curry powder and add a little water. Simmer 15 mins.","Add fried veggies and coconut milk.","Simmer 10 mins. Add bell pepper last."], video: "https://www.youtube.com/embed/7XTfubpo5Yo" },
  { id: "afritada-manok", title: "Afritadang Manok", category: "Chicken", time: "50 mins", cuisine: "Filipino", description: "Chicken braised in tomato sauce with potatoes, carrots, and bell peppers.", required: ["chicken","tomato sauce","potatoes","carrots"], ingredients: ["1000 grams chicken cuts","240 ml tomato sauce (1 cup)","2 pieces potatoes, quartered","1 piece large carrot, sliced","2 pieces bell peppers, sliced","1 piece onion, minced","4 cloves garlic, minced","240 ml chicken broth (1 cup)"], steps: ["Pan-fry chicken until brown. Set aside.","Sauté garlic and onions.","Return chicken, pour tomato sauce and broth. Simmer 20 mins.","Add potatoes and carrots, simmer 15 mins.","Add bell peppers last."], video: "https://www.youtube.com/embed/gKTg9ox28yI" },
  { id: "chicken-sopas", title: "Chicken Sopas", category: "Chicken", time: "40 mins", cuisine: "Filipino", description: "Creamy macaroni chicken soup perfect for rainy days.", required: ["chicken","macaroni","milk","cabbage"], ingredients: ["500 grams chicken breast, shredded","250 grams elbow macaroni (2 cups)","150 ml evaporated milk (1 small can)","150 grams cabbage, chopped","1 piece carrot, diced","3 pieces hotdogs, sliced","1 piece onion, minced","1440 ml chicken broth (6 cups)"], steps: ["Melt butter, sauté garlic and onions.","Add shredded chicken and hotdogs.","Pour broth, boil, and add macaroni. Cook 10 mins.","Add carrots and cabbage.","Pour evaporated milk, season, and serve."], video: "https://www.youtube.com/embed/C9jlQixrfsw" },
  { id: "ginisang-manok", title: "Ginisang Manok with Veggies", category: "Chicken", time: "30 mins", cuisine: "Filipino", description: "Simple stir-fried chicken with mixed vegetables.", required: ["chicken","garlic","onion","sayote"], ingredients: ["500 grams boneless chicken, sliced","1 piece sayote, peeled and sliced","1 piece onion, minced","3 cloves garlic, minced","30 ml oyster sauce (2 tbsp)","15 ml soy sauce (1 tbsp)","120 ml water (1/2 cup)"], steps: ["Sauté garlic and onions.","Add chicken, cook until white.","Season with soy and oyster sauce.","Add sayote and water.","Simmer 7 mins until tender."], video: "https://www.youtube.com/embed/j3kIj35AVdA" },
  { id: "chicken-mechado", title: "Chicken Mechado", category: "Chicken", time: "50 mins", cuisine: "Filipino", description: "Tangy and savory chicken stew with soy sauce and calamansi in tomato sauce.", required: ["chicken","tomato sauce","soy sauce","calamansi"], ingredients: ["1000 grams chicken cuts","240 ml tomato sauce (1 cup)","60 ml soy sauce (1/4 cup)","45 ml calamansi juice (3 tbsp)","2 pieces potatoes, quartered","1 piece onion, minced","4 cloves garlic, minced","1 piece bay leaf"], steps: ["Marinate chicken in soy sauce and calamansi for 30 mins.","Pan-fry chicken. Set aside.","Sauté garlic and onions.","Return chicken, add tomato sauce, marinade, and bay leaf.","Simmer 20 mins, add potatoes until soft."], video: "https://www.youtube.com/embed/SXtm9-01y0g" },
  { id: "chicken-bbq", title: "Chicken Barbecue", category: "Chicken", time: "60 mins", cuisine: "Filipino", description: "Filipino-style sweet and savory grilled chicken.", required: ["chicken","banana ketchup","soy sauce","calamansi"], ingredients: ["1000 grams chicken parts","120 ml banana ketchup (1/2 cup)","60 ml soy sauce (1/4 cup)","60 ml calamansi juice (1/4 cup)","50 grams brown sugar (1/4 cup)","1 head garlic, minced","30 ml cooking oil (2 tbsp)"], steps: ["Mix ketchup, soy sauce, calamansi, sugar, garlic, and oil.","Reserve 1/3 of marinade for basting.","Marinate chicken overnight.","Grill over hot coals.","Baste continuously until charred."], video: "https://www.youtube.com/embed/Xpseg1tpMws" },
  { id: "tinola-gata", title: "Chicken Tinola sa Gata", category: "Chicken", time: "45 mins", cuisine: "Filipino", description: "A rich twist on Tinola using coconut milk.", required: ["chicken","coconut milk","ginger","sayote"], ingredients: ["1000 grams chicken, pieces","480 ml coconut milk (2 cups)","2 thumbs ginger, julienned","1 piece sayote, sliced","150 grams malunggay leaves","1 piece onion, minced","3 cloves garlic, minced","15 ml fish sauce (1 tbsp)"], steps: ["Sauté ginger, garlic, and onions.","Add chicken and brown. Season with fish sauce.","Pour coconut milk, boil gently.","Simmer 20 mins, add sayote.","Top with malunggay leaves."], video: "https://www.youtube.com/embed/DLYPotm2oVY" },
  { id: "arroz-caldo", title: "Chicken Arroz Caldo", category: "Chicken", time: "45 mins", cuisine: "Filipino", description: "Comforting ginger-infused rice porridge with chicken.", required: ["chicken","rice","ginger","garlic","fish sauce"], ingredients: ["500 grams chicken cuts","200 grams glutinous rice (1 cup)","1 thumb ginger, minced","1 piece onion, minced","4 cloves garlic, minced","30 ml fish sauce (2 tbsp)","1440 ml water (6 cups)"], steps: ["Sauté garlic until brown, remove half for garnish.","Sauté ginger and onions.","Add chicken, season with fish sauce.","Add rice and water. Simmer 30-40 mins, stirring often.","Serve with toasted garlic and calamansi."], video: "https://www.youtube.com/embed/3jUtOPlkZPo" },
  // PORK
  { id: "pork-giniling", title: "Pork Giniling", category: "Pork", time: "40 mins", cuisine: "Filipino", description: "Ground pork cooked in tomato sauce with potatoes, carrots, and raisins.", required: ["ground pork","tomato sauce","potatoes","carrots"], ingredients: ["500 grams ground pork","240 ml tomato sauce (1 cup)","1 piece medium potato, cubed","1 piece carrot, cubed","50 grams raisins (1/4 cup)","1 piece red bell pepper, diced","1 piece onion, minced","3 cloves garlic, minced","120 ml water (1/2 cup)"], steps: ["Sauté garlic and onions.","Add ground pork and brown.","Pour tomato sauce and water. Simmer 15 mins.","Add potatoes and carrots, cook until soft.","Stir in bell pepper and raisins. Cook 3 mins."], video: "https://www.youtube.com/embed/iB3QBl-d0Wg" },
  { id: "pork-adobo", title: "Pork Adobo", category: "Pork", time: "60 mins", cuisine: "Filipino", description: "The ultimate savory, garlicky, and tangy pork stew.", required: ["pork","soy sauce","vinegar","garlic","peppercorn"], ingredients: ["1000 grams pork belly, cubed","120 ml soy sauce (1/2 cup)","80 ml white vinegar (1/3 cup)","1 head garlic, crushed","15 grams whole black peppercorns (1 tbsp)","3 pieces bay leaves","240 ml water (1 cup)"], steps: ["Combine pork, soy sauce, garlic, and peppercorns. Sit 30 mins.","Add water and bay leaves, bring to boil.","Simmer for 40 mins until tender.","Pour in vinegar. Boil uncovered 5 mins.","Simmer until sauce reduces to fat."], video: "https://www.youtube.com/embed/Ix5Dnud1bl0" },
  { id: "sisig", title: "Sisig", category: "Pork", time: "90 mins", cuisine: "Filipino", description: "Sizzling chopped pork face/ears with onions, calamansi, and chili.", required: ["pork","onion","calamansi","chili","mayonnaise"], ingredients: ["1000 grams pork face or belly","1 piece large red onion, diced","45 ml calamansi juice (3 tbsp)","4 pieces Thai chilies, minced","30 ml mayonnaise (2 tbsp)","15 ml soy sauce (1 tbsp)","1 pinch salt"], steps: ["Boil pork until tender, drain.","Grill pork until skin is crispy.","Chop into fine pieces.","Mix with onions, chilies, soy sauce, and calamansi.","Serve on sizzling plate with mayonnaise."], video: "https://www.youtube.com/embed/_gWSWtikr9g" },
  { id: "bicol-express", title: "Bicol Express", category: "Pork", time: "50 mins", cuisine: "Filipino", description: "Spicy pork stew simmered in coconut milk and shrimp paste.", required: ["pork","coconut milk","chili","shrimp paste"], ingredients: ["500 grams pork belly, cubed","480 ml thick coconut milk (2 cups)","45 ml bagoong alamang (3 tbsp)","8 pieces green chilies, sliced","1 piece onion, minced","4 cloves garlic, minced","1 thumb ginger, minced"], steps: ["Sauté ginger, garlic, and onions.","Add pork belly and brown.","Stir in shrimp paste.","Pour coconut milk, boil, and simmer 30 mins.","Add chilies and simmer until oil separates."], video: "https://www.youtube.com/embed/u6kAgfGVl28" },
  { id: "lechon-kawali", title: "Lechon Kawali", category: "Pork", time: "75 mins", cuisine: "Filipino", description: "Crispy deep-fried pork belly, usually served with liver sauce.", required: ["pork belly","garlic","salt","oil"], ingredients: ["1000 grams pork belly slab","15 grams salt (1 tbsp)","1 head garlic, halved","15 grams whole black peppercorns (1 tbsp)","2 pieces bay leaves","960 ml cooking oil (4 cups)"], steps: ["Boil pork belly with salt, garlic, peppercorns, and bay leaves for 60 mins.","Air dry the pork completely.","Heat oil until very hot.","Deep fry until skin blisters and turns golden brown.","Chop and serve with Mang Tomas."], video: "https://www.youtube.com/embed/Df8uYWP5hEU" },
  { id: "lechon-paksiw", title: "Lechon Paksiw", category: "Pork", time: "40 mins", cuisine: "Filipino", description: "Leftover roasted pork stewed in sweet and tangy liver sauce.", required: ["pork","vinegar","lechon sauce","garlic"], ingredients: ["500 grams leftover lechon, chopped","240 ml lechon sauce (1 cup)","60 ml cane vinegar (1/4 cup)","120 ml water (1/2 cup)","1 piece onion, minced","4 cloves garlic, minced","1 piece bay leaf"], steps: ["Sauté garlic and onions.","Add lechon and cook 2 mins.","Pour lechon sauce, water, and bay leaf. Boil.","Pour vinegar. Boil uncovered 3 mins.","Simmer 15 mins until glossy."], video: "https://www.youtube.com/embed/keP0IWdfS7M" },
  { id: "pork-lumpia", title: "Pork Lumpia (Shanghai)", category: "Pork", time: "45 mins", cuisine: "Filipino", description: "Bite-sized crispy spring rolls filled with seasoned ground pork.", required: ["ground pork","lumpia wrapper","carrots","onion"], ingredients: ["500 grams ground pork","30 pieces lumpia wrappers","1 piece large carrot, minced","1 piece onion, minced","3 cloves garlic, minced","1 piece raw egg","15 ml soy sauce (1 tbsp)","480 ml cooking oil (2 cups)"], steps: ["Mix pork, carrot, onion, garlic, egg, and soy sauce.","Place 1 tbsp mixture on wrapper edge.","Roll tightly and seal with water.","Deep fry in batches until golden brown."], video: "https://www.youtube.com/embed/BIarUjm4U-0" },
  { id: "pork-menudo", title: "Pork Menudo", category: "Pork", time: "60 mins", cuisine: "Filipino", description: "Pork and liver stewed in tomato sauce with potatoes and carrots.", required: ["pork","liver","tomato sauce","potatoes","carrots"], ingredients: ["500 grams pork shoulder, cubed","250 grams pork liver, cubed","240 ml tomato sauce (1 cup)","1 piece medium potato, cubed","1 piece carrot, cubed","3 pieces hotdogs, sliced","1 piece onion, minced","100 grams raisins (1/2 cup)","120 ml water (1/2 cup)"], steps: ["Marinate liver in soy sauce/calamansi.","Sauté garlic, onions, and pork.","Add liver and hotdogs.","Pour tomato sauce and water. Simmer 30 mins.","Add veggies and raisins, cook 10 mins."], video: "https://www.youtube.com/embed/F1QZ9gt-skc" },
  { id: "pork-dinuguan", title: "Pork Dinuguan", category: "Pork", time: "60 mins", cuisine: "Filipino", description: "Savory pork stew simmered in a rich, dark pig's blood gravy.", required: ["pork","pig blood","vinegar","chili"], ingredients: ["1000 grams pork belly, cubed","480 ml fresh pig's blood (2 cups)","120 ml cane vinegar (1/2 cup)","3 pieces green chilies","1 piece onion, minced","4 cloves garlic, minced","240 ml water (1 cup)"], steps: ["Sauté garlic, onions, and pork until brown.","Pour vinegar. Boil uncovered 5 mins.","Pour water, simmer 30 mins.","Continuously stir while slowly pouring blood.","Simmer 15 mins, add chilies."], video: "https://www.youtube.com/embed/Gq40YDPLrMI" },
  { id: "pork-sinigang", title: "Pork Sinigang", category: "Pork", time: "60 mins", cuisine: "Filipino", description: "Tender pork ribs in a deeply sour tamarind broth.", required: ["pork","tamarind","radish","kangkong","taro"], ingredients: ["1000 grams pork ribs","1 packet tamarind soup base","2 pieces taro (gabi), quartered","1 piece large radish, sliced","300 grams kangkong","2 pieces tomatoes, quartered","2 pieces green chilies","15 ml fish sauce (1 tbsp)"], steps: ["Boil pork with tomatoes and onions.","Add taro and simmer 45 mins until thick.","Add radish, simmer 10 mins.","Stir in tamarind base, chilies, and fish sauce.","Turn off heat, add kangkong."], video: "https://www.youtube.com/embed/t-beBtUZz3E" },
  // SEAFOOD
  { id: "filipino-paella", title: "Filipino Paella", category: "Seafood", time: "60 mins", cuisine: "Filipino-Spanish", description: "A festive rice dish loaded with mixed seafood, meats, and vibrant bell peppers.", required: ["rice","shrimp","mussels","squid","bell pepper"], ingredients: ["400 grams mixed rice (2 cups)","500 grams mixed seafood","250 grams chicken, pieces","1 piece chorizo, sliced","1 piece red bell pepper, strips","240 ml tomato sauce (1 cup)","480 ml chicken broth (2 cups)","15 ml annatto water (1 tbsp)"], steps: ["Sauté garlic, onions, and chorizo.","Add chicken and brown. Add seafood, cook 3 mins, then set seafood aside.","Add rice, tomato sauce, annatto, and broth.","Simmer 20-30 mins.","Arrange seafood on top."], video: "https://www.youtube.com/embed/fX7ko-6RSdo" },
  { id: "bicol-express-seafood", title: "Bicol Express Seafood", category: "Seafood", time: "45 mins", cuisine: "Filipino", description: "A spicy and creamy mix of fresh seafood simmered in coconut milk and chilies.", required: ["mixed seafood","coconut milk","chili","shrimp paste"], ingredients: ["500 grams mixed seafood","480 ml thick coconut milk (2 cups)","8 pieces Thai chilies, chopped","3 pieces green chilies, sliced","30 ml bagoong alamang (2 tbsp)","1 thumb ginger, minced","1 piece onion, minced","4 cloves garlic, minced"], steps: ["Sauté ginger, garlic, and onions.","Stir in shrimp paste.","Pour coconut milk, simmer 15 mins to thicken.","Add seafood. Simmer exactly 3-5 mins.","Add chilies and serve."], video: "https://www.youtube.com/embed/tanAP90ZRNU" },
  { id: "ginataang-seafood", title: "Ginataang Seafood", category: "Seafood", time: "40 mins", cuisine: "Filipino", description: "Crabs, shrimp, and squash cooked in a rich, savory coconut milk broth.", required: ["crab","shrimp","coconut milk","squash"], ingredients: ["500 grams crabs, halved","250 grams shrimp","480 ml coconut milk (2 cups)","200 grams squash, cubed","150 grams string beans","1 thumb ginger, minced","1 piece onion, minced","3 cloves garlic, minced"], steps: ["Sauté ginger, garlic, and onions.","Pour coconut milk and boil.","Add squash, simmer 8 mins.","Add crabs, cook 5 mins.","Add shrimp and string beans. Simmer 5 mins."], video: "https://www.youtube.com/embed/b8tfNB6vvFE" },
  { id: "seafood-karekare", title: "Seafood Kare-Kare", category: "Seafood", time: "50 mins", cuisine: "Filipino", description: "A seafood twist on the classic Kare-Kare, served in a thick peanut sauce with vegetables.", required: ["shrimp","squid","peanut butter","pechay","string beans"], ingredients: ["500 grams mixed seafood","120 ml peanut butter (1/2 cup)","60 grams toasted rice flour (1/4 cup)","200 grams pechay","1 piece eggplant, sliced","150 grams string beans","60 ml annatto water (1/4 cup)","480 ml seafood broth (2 cups)"], steps: ["Blanch veggies and seafood separately. Set aside.","Sauté garlic and onions.","Pour broth, annatto, and peanut butter. Whisk.","Stir in rice flour slurry until thick.","Pour sauce over seafood and veggies."], video: "https://www.youtube.com/embed/vuwr3bN5b4U" },
  { id: "sinigang-hipon", title: "Sinigang na Hipon", category: "Seafood", time: "30 mins", cuisine: "Filipino", description: "Fresh shrimp and vegetables in a deeply sour and comforting tamarind broth.", required: ["shrimp","tamarind","kangkong","radish","tomato"], ingredients: ["500 grams fresh shrimp","1 packet tamarind soup base","1 piece medium radish, sliced","200 grams kangkong","2 pieces tomatoes, quartered","1 piece onion, quartered","2 pieces green chilies","960 ml water (4 cups)"], steps: ["Boil water with tomatoes and onions.","Add radish, simmer 7 mins.","Stir in tamarind base and chilies.","Add shrimp, cook exactly 2-3 mins.","Turn off heat, stir in kangkong."], video: "https://www.youtube.com/embed/7QKr1oy4Ykc" },
  { id: "adobong-pusit", title: "Adobong Pusit", category: "Seafood", time: "25 mins", cuisine: "Filipino", description: "Fresh squid stewed in a savory and tangy mix of soy sauce, vinegar, and its own natural ink.", required: ["squid","soy sauce","vinegar","garlic","tomato"], ingredients: ["500 grams fresh squid (ink intact)","60 ml soy sauce (1/4 cup)","60 ml white vinegar (1/4 cup)","1 piece tomato, diced","1 piece onion, minced","4 cloves garlic, minced","5 grams sugar (1 tsp)"], steps: ["Clean squid, keep ink sacs.","Sauté garlic, onions, and tomatoes.","Add squid, sauté 1 min.","Pour soy sauce and vinegar. Boil 2 mins.","Stir, add sugar. Simmer only 2 more mins."], video: "https://www.youtube.com/embed/EZh-F39ZJ-c" },
  { id: "inihaw-na-bangus", title: "Inihaw na Bangus", category: "Seafood", time: "45 mins", cuisine: "Filipino", description: "Grilled milkfish stuffed with a fresh mixture of tomatoes and onions.", required: ["bangus","tomato","onion","ginger"], ingredients: ["1 piece large bangus (milkfish)","3 pieces large tomatoes, diced","2 pieces large onions, diced","1 thumb ginger, minced","5 grams salt (1 tsp)","5 grams ground black pepper (1 tsp)"], steps: ["Wash inside of bangus and rub with salt/pepper.","Mix tomatoes, onions, and ginger.","Stuff mixture into bangus.","Wrap tightly in aluminum foil.","Grill 15-20 mins per side."], video: "https://www.youtube.com/embed/IhwOQUaofoM" },
  { id: "kinilaw-na-bangus", title: "Kinilaw na Bangus", category: "Seafood", time: "20 mins", cuisine: "Filipino", description: "Fresh milkfish ceviche 'cooked' in natural vinegar, calamansi, and aromatics.", required: ["bangus","vinegar","ginger","onion","calamansi"], ingredients: ["500 grams bangus fillet, cubed","240 ml cane vinegar (1 cup)","1 thumb ginger, minced","1 piece red onion, sliced","4 pieces Thai chilies, chopped","45 ml calamansi juice (3 tbsp)","5 grams salt (1 tsp)"], steps: ["Wash fish in 1/2 cup vinegar, then drain.","Mix fish with remaining vinegar, calamansi, ginger, onions, chilies.","Season with salt.","Chill 15 mins before serving."], video: "https://www.youtube.com/embed/aMCfuJ5EYoY" },
  { id: "rellenong-bangus", title: "Rellenong Bangus", category: "Seafood", time: "90 mins", cuisine: "Filipino", description: "A labor of love: stuffed milkfish loaded with its own flaked meat, carrots, peas, and raisins.", required: ["bangus","carrots","peas","raisins","egg"], ingredients: ["1 piece large bangus","1 piece large carrot, minced","100 grams green peas (1/2 cup)","50 grams raisins (1/4 cup)","1 piece raw egg, beaten","1 piece onion, minced","3 cloves garlic, minced","15 ml soy sauce (1 tbsp)"], steps: ["Extract fish meat and skeleton, leaving skin intact.","Boil and flake meat.","Sauté veggies, add flaked meat, cook 5 mins.","Mix with raw egg.","Stuff back into skin and fry until crispy."], video: "https://www.youtube.com/embed/JdCdgBbK9do" },
  { id: "escabecheng-isda", title: "Escabecheng Isda", category: "Seafood", time: "40 mins", cuisine: "Filipino", description: "Crispy fried whole fish topped with a sweet and sour sauce full of vibrant bell peppers.", required: ["fish","bell pepper","vinegar","sugar","carrots"], ingredients: ["1 piece medium whole fish","2 pieces bell peppers, strips","1 piece small carrot, julienned","1 thumb ginger, strips","60 ml white vinegar (1/4 cup)","45 grams brown sugar (3 tbsp)","15 ml soy sauce (1 tbsp)","15 grams cornstarch (1 tbsp)"], steps: ["Deep fry fish until crispy. Set aside.","Sauté ginger, veggies until tender.","Pour vinegar, soy sauce, sugar. Boil.","Stir in cornstarch slurry.","Pour hot sauce over fish."], video: "https://www.youtube.com/embed/hWPFSiZW_jg" },
  // SNACKS & DESSERTS
  { id: "halo-halo", title: "Halo-Halo", category: "Snacks", time: "15 mins", cuisine: "Filipino", description: "The ultimate Filipino summer dessert: shaved ice topped with a mix of sweet beans, jellies, and leche flan.", required: ["shaved ice","evaporated milk","ube","sweetened beans","leche flan"], ingredients: ["400 grams shaved ice","240 ml evaporated milk (1 cup)","50 grams sweetened saba bananas","50 grams sweetened beans","50 grams nata de coco","1 scoop ube jam","1 slice leche flan","1 scoop ube ice cream"], steps: ["Layer sweet preserves at bottom of glass.","Pack glass with shaved ice.","Pour evaporated milk over ice.","Top with ube jam, leche flan, and ice cream.","Mix vigorously before eating!"], video: "https://www.youtube.com/embed/JTKGUPPAr5E" },
  { id: "leche-flan", title: "Leche Flan", category: "Snacks", time: "60 mins", cuisine: "Filipino", description: "A rich, creamy, and decadent caramel custard dessert.", required: ["egg yolks","condensed milk","evaporated milk","sugar"], ingredients: ["10 pieces large egg yolks","400 ml condensed milk (1 can)","350 ml evaporated milk (1 can)","5 ml vanilla extract (1 tsp)","100 grams white sugar (1/2 cup)"], steps: ["Melt sugar in llanera over heat until caramel. Cool.","Mix egg yolks, condensed, evaporated milk, and vanilla.","Strain mixture into llanera.","Cover with foil, steam 40 mins.","Cool completely before flipping."], video: "https://www.youtube.com/embed/vN5G2iBUHO0" },
  { id: "bibingka", title: "Bibingka", category: "Snacks", time: "45 mins", cuisine: "Filipino", description: "A warm, slightly sweet baked rice cake traditionally cooked in banana leaves.", required: ["rice flour","coconut milk","sugar","salted egg","cheese"], ingredients: ["200 grams rice flour (1 cup)","180 ml coconut milk (3/4 cup)","100 grams white sugar (1/2 cup)","30 ml melted butter (2 tbsp)","15 grams baking powder (1 tbsp)","2 pieces raw eggs","1 piece salted egg, sliced","50 grams grated cheese"], steps: ["Line pan with banana leaves.","Whisk flour, baking powder, and sugar.","Mix eggs, coconut milk, and butter.","Combine wet and dry, pour into pan. Bake 15 mins.","Top with salted egg/cheese. Bake 10 mins."], video: "https://www.youtube.com/embed/rJwHZ3GrTC0" },
  { id: "puto-cheese", title: "Puto Cheese", category: "Snacks", time: "30 mins", cuisine: "Filipino", description: "Soft, fluffy, and slightly sweet steamed rice cakes topped with a slice of melted cheese.", required: ["flour","sugar","baking powder","milk","cheese"], ingredients: ["200 grams all-purpose flour (1 cup)","100 grams white sugar (1/2 cup)","15 grams baking powder (1 tbsp)","180 ml fresh milk (3/4 cup)","1 piece raw egg","15 ml melted butter (1 tbsp)","50 grams cheddar cheese, strips"], steps: ["Sift flour, sugar, baking powder.","Whisk in milk, egg, butter until smooth.","Fill molds 3/4 full.","Steam 10 mins.","Top with cheese, steam 1 min."], video: "https://www.youtube.com/embed/dBEnJXg6yzQ" },
  { id: "kutsinta", title: "Kutsinta", category: "Snacks", time: "45 mins", cuisine: "Filipino", description: "Sticky, chewy, and sweet brown steamed cakes served with freshly grated coconut.", required: ["flour","brown sugar","lye water","grated coconut"], ingredients: ["200 grams all-purpose flour (1 cup)","200 grams tapioca starch (1 cup)","200 grams brown sugar (1 cup)","5 ml lye water (1 tsp)","480 ml water (2 cups)","5 grams annatto powder (1 tsp)","100 grams grated coconut"], steps: ["Mix flour, starch, sugar.","Whisk in water gradually.","Add annatto water and lye water.","Pour into molds.","Steam 40 mins. Top with coconut."], video: "https://www.youtube.com/embed/ukjIP74-hDI" },
  { id: "turon", title: "Turon", category: "Snacks", time: "20 mins", cuisine: "Filipino", description: "Sweet saba bananas and jackfruit wrapped in spring roll wrappers and fried with a caramelized sugar coating.", required: ["saba banana","lumpia wrapper","brown sugar","jackfruit"], ingredients: ["6 pieces saba bananas, halved","12 pieces lumpia wrappers","100 grams brown sugar (1/2 cup)","100 grams jackfruit strips (1/2 cup)","480 ml cooking oil (2 cups)"], steps: ["Roll banana in brown sugar.","Place banana and jackfruit on wrapper.","Roll tightly and seal.","Sprinkle sugar in hot oil.","Fry until caramelized and crispy."], video: "https://www.youtube.com/embed/4QeQ4O6WHkc" },
  { id: "banana-cue", title: "Banana Cue", category: "Snacks", time: "15 mins", cuisine: "Filipino", description: "Deep-fried saba bananas coated in a thick, crunchy layer of caramelized brown sugar, served on a skewer.", required: ["saba banana","brown sugar","oil"], ingredients: ["6 pieces saba bananas, peeled","200 grams dark brown sugar (1 cup)","720 ml cooking oil (3 cups)","3 pieces bamboo skewers"], steps: ["Heat oil, pour in sugar. Wait for it to float.","Drop bananas in.","Stir to coat bananas in caramel.","Fry 7 mins.","Thread onto skewers."], video: "https://www.youtube.com/embed/nprjczs6z5M" },
  { id: "bibingkang-latik", title: "Bibingkang Latik", category: "Snacks", time: "60 mins", cuisine: "Filipino", description: "Sticky rice baked in coconut milk and topped with a thick, sweet coconut caramel crust.", required: ["glutinous rice","coconut milk","brown sugar"], ingredients: ["400 grams glutinous rice (2 cups)","480 ml thin coconut milk (2 cups)","100 grams brown sugar (1/2 cup)","360 ml thick coconut cream (1.5 cups)","200 grams dark brown sugar (1 cup)"], steps: ["Cook rice, thin coconut milk, and 1/2 cup sugar until liquid absorbs.","Boil thick coconut cream and 1 cup sugar until thick caramel.","Pour caramel over rice.","Bake 20 mins until bubbling."], video: "https://www.youtube.com/embed/RaeHyo_Djj0" },
  { id: "biko", title: "Biko", category: "Snacks", time: "45 mins", cuisine: "Filipino", description: "A classic Filipino sticky rice dessert cooked with brown sugar and coconut milk.", required: ["glutinous rice","coconut milk","brown sugar"], ingredients: ["400 grams glutinous rice (2 cups)","360 ml water (1.5 cups)","480 ml thick coconut milk (2 cups)","300 grams dark brown sugar (1.5 cups)","1 pinch salt"], steps: ["Cook rice and water in rice cooker.","Boil coconut milk, sugar, and salt until thick syrup.","Add cooked rice into syrup.","Fold continuously until sticky and heavy.","Flatten in dish and slice."], video: "https://www.youtube.com/embed/ThY66jHY-uI" },
  { id: "mais-con-yelo", title: "Mais Con Yelo", category: "Snacks", time: "10 mins", cuisine: "Filipino", description: "A refreshing layered dessert of sweet corn, shaved ice, and milk.", required: ["sweet corn","shaved ice","evaporated milk","sugar"], ingredients: ["400 grams cream-style corn (1 can)","400 grams shaved ice","240 ml evaporated milk (1 cup)","60 grams white sugar (4 tbsp)","50 grams cornflakes","1 scoop vanilla ice cream"], steps: ["Spoon corn into glass, sprinkle sugar.","Fill glass with shaved ice.","Pour evaporated milk over ice.","Top with corn, cornflakes, and ice cream.","Mix thoroughly."], video: "https://www.youtube.com/embed/O7GQGQ3R14U" },
];

// ============================================================
// HELPER: Get MIME type from filename
// ============================================================
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
  return types[ext] || "image/jpeg";
}

// ============================================================
// STEP 1: Upload image to Supabase Storage
// ============================================================
async function uploadImage(recipeId) {
  const filename = IMAGE_FILES[recipeId];
  if (!filename) {
    console.warn(`  ⚠️  No image mapped for: ${recipeId}`);
    return null;
  }

  const localPath = path.join(__dirname, "public", "pictures", filename);
  if (!fs.existsSync(localPath)) {
    console.warn(`  ⚠️  File not found: ${localPath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(localPath);
  const storagePath = `hardcoded/${filename}`;

  const { error } = await supabase.storage
    .from("recipe-images")
    .upload(storagePath, fileBuffer, {
      contentType: getMimeType(filename),
      upsert: true,
    });

  if (error) {
    console.error(`  ❌ Upload failed for ${filename}:`, error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("recipe-images")
    .getPublicUrl(storagePath);

  return urlData.publicUrl;
}

// ============================================================
// STEP 2: Insert recipe into Supabase DB
// ============================================================
async function insertRecipe(recipe, imageUrl) {
  const { error } = await supabase.from("recipes").upsert(
    {
      id:                    recipe.id,
      title:                 recipe.title,
      category:              recipe.category,
      time:                  recipe.time,
      cuisine:               recipe.cuisine,
      description:           recipe.description,
      image:                 imageUrl || `/pictures/${IMAGE_FILES[recipe.id]}`,
      required:              recipe.required,
      ingredients:           recipe.ingredients,
      steps:                 recipe.steps,
      video:                 recipe.video,
      price:                 0,
      is_user_recipe:        false,
      is_approved:           true,
      status:                "approved",
      marinating_ingredients: [],
      marinating_steps:      [],
      marinating_step_photos: [],
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error(`  ❌ DB insert failed for ${recipe.id}:`, error.message);
    return false;
  }
  return true;
}

// ============================================================
// MAIN
// ============================================================
async function migrate() {
  console.log("\n SavorSense Migration Starting...");
  console.log(`   Total recipes: ${RECIPES.length}\n`);
  console.log("=".repeat(50));

  let success = 0;
  let failed = 0;

  for (let i = 0; i < RECIPES.length; i++) {
    const recipe = RECIPES[i];
    console.log(`\n[${i + 1}/${RECIPES.length}] ${recipe.title}`);

    process.stdout.write(`  → Uploading image...    `);
    const imageUrl = await uploadImage(recipe.id);
    console.log(imageUrl ? `Done` : `Skipped (using fallback)`);

    process.stdout.write(`  → Saving to database... `);
    const ok = await insertRecipe(recipe, imageUrl);
    console.log(ok ? `Done` : `FAILED`);

    if (ok) success++; else failed++;
  }

  console.log("\n" + "=".repeat(50));
  console.log(`\n Migrated: ${success}/${RECIPES.length} recipes`);
  if (failed > 0) console.log(` Failed:   ${failed} recipes`);
  console.log("\n Done! Your recipes are now in Supabase.");
  console.log(" You can now safely remove src/data/recipes.js from your app.\n");
}

migrate();