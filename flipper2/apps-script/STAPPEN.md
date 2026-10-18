# FLIPPER! II gedeelde top 10 – eenmalig instellen (± 10 min)

Werkt net als Foilassist "Ervaring delen": een Google Sheet met een Apps Script web-app.
De Sheet blijft privé (niet delen). De web-app leest/schrijft namens jou; spelers zien alleen naam, score, niveau en datum. Er wordt geen e-mailadres of IP opgeslagen of getoond.

(De menunamen kunnen per Google-versie iets afwijken; Engelse naam staat tussen haakjes.)

1. Maak in Google Drive een nieuwe, lege Google Sheet, bijvoorbeeld **FLIPPER! II scores**.
2. Menu **Extensies → Apps Script** (Extensions → Apps Script). Er opent een editor met een bestand `Code.gs`.
3. Verwijder de voorbeeldcode en plak de volledige inhoud van `Code.gs` (uit deze map). Klik op het **diskette-icoon (Opslaan)**.
4. (Optioneel) Kies bovenin de functie **setup** en klik **Uitvoeren** (Run). Geef toestemming (zie stap 7). Dit zet de kopregel en selectievakjes in de kolom `verborgen`; in het logboek staat een test van het scheldwoordenfilter.
5. Rechtsboven: **Implementeren → Nieuwe implementatie** (Deploy → New deployment).
6. Klik op het tandwiel bij "Type selecteren" → **Web-app**. Vul in:
   - Beschrijving: `FLIPPER! II top 10`
   - **Uitvoeren als: Ik** (Execute as: Me)
   - **Wie heeft toegang: Iedereen** (Who has access: Anyone) – dus niet "Iedereen met een Google-account".
   Klik **Implementeren**.
7. Klik **Toegang autoriseren** (Authorize access), kies je Google-account. Bij "Google heeft deze app niet geverifieerd": **Geavanceerd → Ga naar … (onveilig)** (Advanced → Go to …) en **Toestaan**. Dat is normaal voor je eigen script. Het vraagt alleen toegang tot deze spreadsheet.
8. Kopieer de **URL van de web-app** (eindigt op `/exec`) en stuur die naar Grok Bot. Die wordt in `flipper2/index.html` gezet als `LEADERBOARD_URL`.

## Beheer
- **Verbergen:** vink `verborgen` aan in die rij – binnen een minuut weg uit de top 10.
- **Verwijderen:** rij verwijderen.
- **Code aanpassen later:** na wijzigen **Implementeren → Implementaties beheren → potlood → Versie: Nieuwe versie → Implementeren** (anders blijft de oude versie actief; de URL blijft hetzelfde).
- Limieten (bovenin Code.gs): naam 1–12 tekens met scheldwoordenfilter, score 10–50.000.000 (veelvoud van 10), niveau 1–50, max 40.000 punten per seconde speeltijd, spel minstens 15 s, max 3 inzendingen per naam per 10 min, max 500 per dag, alleen de beste 100 rijen worden bewaard.
- Leeg maken van `LEADERBOARD_URL` in `flipper2/index.html` zet de gedeelde lijst uit; de lokale top 10 blijft werken.
