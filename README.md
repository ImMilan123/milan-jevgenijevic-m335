# BudgetBuddy

Mobile Finanztracker App für Modul 335

**Name:** Milan Jevgenijevic  
**Modul:** 335 - Mobile Applikationen entwickeln  
**Typ:** ÜK Projekt  
**GitHub:** https://github.com/ImMilan123/milan-jevgenijevic-m335
**App Password:** 123456

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

Die App benötigt Kamera-Berechtigung und Netzwerk-Zugriff. Ausgaben die offline erstellt werden, synchronisieren sich automatisch mit Supabase wenn die Internetverbindung wiederhergestellt wird.

## Voraussetzungen

- Node.js 18 oder neuer
- npm 9 oder neuer
- Ionic CLI: `npm install -g @ionic/cli`
- Android Studio (für APK Build)

## Setup nach Git Clone

### 1. Dependencies installieren

Nach dem Klonen des Repositories müssen alle Dependencies installiert werden:

```bash
npm install
```

### 2. Supabase konfigurieren (WICHTIG!)

Die Datei `src/environments/environment.ts` ist NICHT im Repository enthalten und muss manuell erstellt werden.

**Erstelle die Datei:** `src/environments/environment.ts`

**Inhalt:**
```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  }
};
```

Ersetze `YOUR_SUPABASE_URL` und `YOUR_SUPABASE_ANON_KEY` mit deinen Supabase Credentials.

**OHNE DIESE DATEI KANN DIE APP NICHT STARTEN!**

### 3. Supabase Datenbank erstellen

In der Supabase Console (SQL Editor):

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID
);
```

### 4. Supabase Storage Bucket erstellen

In der Supabase Console (Storage):
- Erstelle einen neuen Bucket namens `receipts`
- Setze ihn auf "Public"

## Entwicklung

### Browser (Development)

```bash
npm start
```

Die App läuft auf: `http://localhost:4200`

### Android Build

```bash
# 1. Ionic App builden
ionic build

# 2. Mit Capacitor synchronisieren
npx cap sync android

# 3. In Android Studio öffnen
npx cap open android

# 4. In Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
```

Die fertige APK findest du in: `android/app/build/outputs/apk/debug/app-debug.apk`

## Datenbank Schema

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

## Wichtige Hinweise zu Git

Die folgenden Ordner sind in `.gitignore` und werden NICHT committed:

- `.angular/` und `.angular/cache/` - Angular Build Cache (sehr groß)
- `node_modules/` - Dependencies (müssen nach Clone neu installiert werden)
- `www/` - Build Output
- `dist/` - Distribution Files
- `build/` - Build Artifacts
- `android/` und `ios/` - Native Platforms (werden via Capacitor generiert)

Diese Ordner werden lokal generiert und dürfen nicht ins Repository, da sie sehr groß sind und bei jedem Build neu erstellt werden.

**Nach dem Klonen müssen diese Ordner mit `npm install` und `ionic build` neu generiert werden.**

## Projekt Struktur

```
milan-jevgenijevic-m335/
├── src/
│   ├── app/
│   │   ├── models/
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   ├── expenses/
│   │   │   ├── expense-detail/
│   │   │   ├── add-expense/
│   │   │   └── settings/
│   │   └── services/
│   ├── assets/
│   ├── environments/
│   └── theme/
├── capacitor.config.ts
├── package.json
└── README.md
```

---

Erstellt für Modul 335 - Mobile Applikationen entwickeln  
Milan Jevgenijevic
