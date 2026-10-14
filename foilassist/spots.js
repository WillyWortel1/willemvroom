// ==== SPOTLIJST (makkelijk aan te passen) ====
// Voeg een spot toe of zet 'actief' op true/false. Coördinaten in decimale graden.
// Bronnen: foil.guide (NL/FR/ES/PT spotpagina's), ophetwater.nl (Watersportverbond),
// foilschoolnederland.nl (Foil Assist-lessen Brouwersdam).
window.SPOTS = [
  { naam: "Hoek van Holland",   land: "NL", lat: 51.985, lon: 4.115, actief: true, bron: "ophetwater.nl" },
  { naam: "Kijkduin",           land: "NL", lat: 52.067, lon: 4.212, actief: true, bron: "foil.guide" },
  { naam: "Scheveningen",       land: "NL", lat: 52.108, lon: 4.268, actief: true, bron: "foil.guide" },
  { naam: "Katwijk",            land: "NL", lat: 52.205, lon: 4.394, actief: true, bron: "foil.guide" },
  { naam: "Noordwijk",          land: "NL", lat: 52.244, lon: 4.424, actief: true, bron: "foil.guide" },
  { naam: "IJmuiden",           land: "NL", lat: 52.462, lon: 4.555, actief: true, bron: "foil.guide" },
  { naam: "Wijk aan Zee",       land: "NL", lat: 52.493, lon: 4.585, actief: true, bron: "foil.guide / ophetwater.nl" },
  { naam: "Bergen aan Zee",     land: "NL", lat: 52.660, lon: 4.628, actief: true, bron: "foil.guide" },
  { naam: "Callantsoog",        land: "NL", lat: 52.840, lon: 4.692, actief: true, bron: "foil.guide" },
  { naam: "Texel (Paal 17)",    land: "NL", lat: 53.088, lon: 4.735, actief: true, bron: "foil.guide" },
  { naam: "Brouwersdam",        land: "NL", lat: 51.765, lon: 3.853, actief: true, bron: "foil.guide / Foil School Nederland" },
  { naam: "Vrouwenpolder",      land: "NL", lat: 51.595, lon: 3.611, actief: true, bron: "foil.guide" },
  { naam: "Cadzand",            land: "NL", lat: 51.378, lon: 3.383, actief: true, bron: "foil.guide" },
  // Later: zet op actief: true
  { naam: "Wissant",            land: "FR", lat: 50.886, lon: 1.660, actief: true, bron: "foil.guide" },
  { naam: "La Torche",          land: "FR", lat: 47.838, lon: -4.350, actief: true, bron: "foil.guide" },
  { naam: "Somo (Santander)",   land: "ES", lat: 43.455, lon: -3.735, actief: true, bron: "foil.guide" },
  { naam: "Tarifa",             land: "ES", lat: 36.030, lon: -5.620, actief: true, bron: "foil.guide" },
  { naam: "Peniche – Baleal",   land: "PT", lat: 39.370, lon: -9.340, actief: true, bron: "foil.guide" },
  { naam: "Guincho",            land: "PT", lat: 38.730, lon: -9.474, actief: true, bron: "foil.guide" },
  { naam: "Costa da Caparica",  land: "PT", lat: 38.640, lon: -9.240, actief: true, bron: "foil.guide" },
];
