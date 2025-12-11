# BudgetBuddy

Mobile Finanztracker App für Modul 335

**Name:** Milan Jevgenijevic  
**Modul:** 335 - Mobile Applikationen entwickeln  
**Typ:** ÜK Projekt  
**GitHub:** https://github.com/ImMilan123/milan-jevgenijevic-m335

## Beschreibung

BudgetBuddy ist eine mobile App zum Verwalten von persönlichen Ausgaben. Die App wurde mit Ionic Framework, Angular und Capacitor entwickelt.

## Features

- Ausgaben erfassen mit Titel, Betrag, Kategorie und Datum
- Belege fotografieren (Kamera oder Galerie)
- Kategorien: Food, Transport, Shopping, Entertainment, Health, Bills, Other
- Dashboard mit Monatsübersicht und Pie Chart
- Offline-Modus mit lokaler Datenspeicherung
- Dark Mode
- Netzwerkstatus-Anzeige

## Technologien

- Ionic 7
- Angular 17
- Capacitor 5
- Supabase (Database + Storage)
- Chart.js (Pie Chart)

## Capacitor Device Features

1. **Camera** - Belege fotografieren
2. **Network** - Online/Offline Status
3. **Preferences** - Lokaler Cache für Offline-Modus

## Installation

```bash
npm install
```

Supabase Credentials in `src/environments/environment.ts` eintragen.

## Entwicklung

Browser:
```bash
npm start
```

Android:
```bash
ionic build
npx cap sync android
npx cap open android
```

## Datenbank

**Tabelle: expenses**

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | UUID | Primary Key |
| title | TEXT | Bezeichnung |
| amount | NUMERIC | Betrag (CHF) |
| category | TEXT | Kategorie |
| date | DATE | Datum |
| receipt_url | TEXT | Beleg-Foto URL |
| created_at | TIMESTAMPTZ | Erstellt am |
| updated_at | TIMESTAMPTZ | Aktualisiert am |

**Storage Bucket:** receipts (für Beleg-Fotos)

## Screens

1. Dashboard - Übersicht und Statistiken
2. Expenses List - Alle Ausgaben
3. Expense Detail - Details einer Ausgabe
4. Add/Edit Expense - Ausgabe erstellen/bearbeiten
5. Settings - Einstellungen (Dark Mode, Cache löschen)

## APK Build

In Android Studio: `Build > Build Bundle(s) / APK(s) > Build APK(s)`

---

Erstellt für Modul 335 - Mobile Applikationen entwickeln
