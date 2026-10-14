# Foilassist ervaringen – eenmalig instellen (± 10 min)

Sheet: https://docs.google.com/spreadsheets/d/1M1zCMLe5vcOAyhp8ONnsB4U9iRu1sd4eI-rN-De-Qn4/edit
(privé; niet delen. De web-app leest/schrijft namens jou, bezoekers zien de Sheet nooit.)

(De menunamen kunnen per Google-versie iets afwijken; Engelse naam staat tussen haakjes.)

1. Open de Sheet hierboven op een computer.
2. Menu **Extensies → Apps Script** (Extensions → Apps Script). Er opent een editor met een bestand `Code.gs`.
3. Verwijder de voorbeeldcode en plak de volledige inhoud van `Code.gs` (uit deze map). Klik op het **diskette-icoon (Opslaan)**.
4. (Optioneel) Kies bovenin de functie **setup** en klik **Uitvoeren** (Run). Geef toestemming (zie stap 7). Dit zet selectievakjes in de kolom `verborgen` en werkt de kopregel bij (incl. merk_foil en mastlengte).
5. Rechtsboven: **Implementeren → Nieuwe implementatie** (Deploy → New deployment).
6. Klik op het tandwiel bij "Type selecteren" → **Web-app**. Vul in:
   - Beschrijving: `Foilassist ervaringen`
   - **Uitvoeren als: Ik** (Execute as: Me)
   - **Wie heeft toegang: Iedereen** (Who has access: Anyone) – dus niet "Iedereen met een Google-account".
   Klik **Implementeren**.
7. Klik **Toegang autoriseren** (Authorize access), kies je Google-account. Bij "Google heeft deze app niet geverifieerd": **Geavanceerd → Ga naar … (onveilig)** (Advanced → Go to …) en **Toestaan**. Dat is normaal voor je eigen script. Het vraagt toegang tot deze spreadsheet en tot "externe service" (om de spotlijst van willemvroom.nl op te halen).
8. Kopieer de **URL van de web-app** (eindigt op `/exec`) en stuur die naar Grok Bot. Die wordt in de pagina gezet als `REPORTS_URL`.

## Beheer
- **Verbergen:** vink `verborgen` aan in die rij – direct weg van de site.
- **Verwijderen:** rij verwijderen.
- **Code aanpassen later:** na wijzigen **Implementeren → Implementaties beheren → potlood → Versie: Nieuwe versie → Implementeren** (anders blijft de oude versie actief; de URL blijft hetzelfde).
- Limieten (bovenin Code.gs): max 5 per spot per 10 min, max 100 per dag, teksten ingekort, HTML/links verwijderd.
