# Job Tracker

Jednoduchá lokální aplikace pro sledování pracovních nabídek s pipeline managementem.

## Funkce

- ✨ **Automatická extrakce údajů** - Vložte text inzerátu a systém automaticky extrahuje název pozice, lokalitu, plat a popis
- 📊 **Pipeline management** - Přetahujte nabídky mezi fázemi (Nový → CV odesláno → Pohovor → Nabídka)
- 📝 **Detailní sledování** - Ukládejte informace o lokaci, platu, datu odeslání CV a poznámky
- 💾 **Lokální úložiště** - Všechna data se ukládají lokálně v SQLite databázi
- 🎨 **Moderní UI** - Postaveno na React, TailwindCSS a Lucide ikonách

## Požadavky

- Node.js 16 nebo novější
- npm

## Instalace a spuštění

1. Přejděte do adresáře projektu:
```bash
cd /Users/roumen/CascadeProjects/job-tracker
```

2. Nainstalujte závislosti:
```bash
npm install
```

3. Spusťte aplikaci:
```bash
npm run dev
```

Aplikace se spustí na:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Použití

### Přidání nové nabídky

1. Klikněte na tlačítko **"Přidat nabídku"**
2. Vložte text z pracovního inzerátu
3. Systém automaticky extrahuje informace:
   - Název pozice (z první řádky)
   - Lokalita (hledá města nebo "lokalita:")
   - Plat (hledá částky a měny)
   - Popis (z prvních řádků textu)
4. Klikněte na **"Přidat nabídku"**

### Správa nabídek

- **Přesun mezi fázemi**: Přetáhněte kartu nabídky do jiného sloupce
- **Detail nabídky**: Klikněte na kartu pro zobrazení detailů
- **Úprava**: V detailu klikněte na "Upravit" pro změnu údajů
- **Smazání**: V detailu klikněte na "Smazat"

### Fáze pipeline

1. **Nový** - Právě přidané nabídky
2. **CV odesláno** - Odeslali jste CV
3. **Čeká na odpověď** - Čekáte na reakci
4. **Pohovor naplánován** - Máte naplánovaný pohovor
5. **Po pohovoru** - Po uskutečnění pohovoru
6. **Nabídka** - Dostali jste pracovní nabídku
7. **Zamítnuto** - Nabídka byla zamítnuta
8. **Přijato** - Přijali jste nabídku

## Struktura projektu

```
job-tracker/
├── server/
│   ├── index.js          # Express API server
│   └── jobs.db          # SQLite databáze (vytvoří se automaticky)
├── src/
│   ├── components/
│   │   ├── JobBoard.jsx        # Kanban board s pipeline
│   │   ├── AddJobModal.jsx     # Modal pro přidání nabídky
│   │   └── JobDetailModal.jsx  # Modal s detailem nabídky
│   ├── App.jsx                 # Hlavní komponenta
│   ├── main.jsx               # Entry point
│   └── index.css              # Styly
├── package.json
└── README.md
```

## Technologie

- **Frontend**: React, TailwindCSS, Vite, Lucide React, date-fns
- **Backend**: Express.js, better-sqlite3
- **Database**: SQLite (lokální)

## Poznámky

- Data jsou uložena lokálně v `server/jobs.db`
- Aplikace běží pouze lokálně na vašem Mac
- Pro zálohování dat zálohujte soubor `server/jobs.db`
