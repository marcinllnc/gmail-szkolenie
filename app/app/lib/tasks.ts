import { AppState } from '../types';

export interface TaskDefinition {
  id: number;
  moduleId: number;
  moduleName: string;
  title: string;
  goal: string;
  instruction: string;
  hints: string[];
  validate: (state: AppState) => { ok: boolean; message: string };
}

export const TASKS: TaskDefinition[] = [
  // ── Module 1: Zarządzanie szumem ────────────────────────────────────────
  {
    id: 0,
    moduleId: 1,
    moduleName: 'Moduł 1: Zarządzanie szumem',
    title: 'Szybkie czyszczenie promocji',
    goal: 'Użycie operatorów wyszukiwania i masowej archiwizacji.',
    instruction: 'Wpisz: category:promotions older_than:1m\nZaznacz wszystkie wyniki → kliknij Archiwizuj.',
    hints: [
      'Wpisz dokładnie: category:promotions older_than:1m',
      'Kliknij checkbox "Zaznacz wszystko" nad listą',
      'Kliknij "Archiwizuj" w pasku akcji',
    ],
    validate: (state) => {
      const archived = state.emails.filter(e => e.category === 'promotions' && e.isArchived).length;
      const total = state.emails.filter(e => e.category === 'promotions').length;
      if (archived === 0) return { ok: false, message: 'Nie zarchiwizowano jeszcze żadnych maili promocyjnych.' };
      if (archived < total * 0.5) return { ok: false, message: `Zarchiwizowano ${archived}/${total}. Zaznacz wszystkie i kliknij Archiwizuj.` };
      return { ok: true, message: `Brawo! Zarchiwizowano ${archived} maili promocyjnych.` };
    },
  },
  {
    id: 1,
    moduleId: 1,
    moduleName: 'Moduł 1: Zarządzanie szumem',
    title: 'Znajdowanie ciężkich załączników',
    goal: 'Zwalnianie miejsca — szybkie odnajdywanie dużych plików.',
    instruction: 'Wpisz: has:attachment larger:10M\nOtwórz jeden z odnalezionych maili.',
    hints: [
      'Wpisz: has:attachment larger:10M',
      'Zobaczysz maile z załącznikami > 10 MB',
      'Kliknij mail aby go otworzyć',
    ],
    validate: (state) => {
      const q = state.searchQuery.toLowerCase();
      if (!q.includes('has:attachment') || !q.includes('larger:')) {
        return { ok: false, message: 'Wpisz w wyszukiwarkę: has:attachment larger:10M' };
      }
      const open = state.emails.find(e => e.id === state.openEmailId);
      if (!open) return { ok: false, message: 'Otwórz jeden z maili z wyników.' };
      if (!open.hasAttachment || (open.attachmentSize ?? 0) < 10 * 1024 * 1024) {
        return { ok: false, message: 'Otwórz mail z dużym załącznikiem (> 10 MB).' };
      }
      return { ok: true, message: `Świetnie! Otworzyłeś mail z plikiem ${((open.attachmentSize ?? 0) / (1024 * 1024)).toFixed(1)} MB.` };
    },
  },
  // ── Module 2: Zaawansowane wyszukiwanie ─────────────────────────────────
  {
    id: 2,
    moduleId: 2,
    moduleName: 'Moduł 2: Zaawansowane wyszukiwanie',
    title: 'Najstarszy mail od Artura',
    goal: 'Zawężenie wyników do starych maili od konkretnego nadawcy operatorem older_than:.',
    instruction: 'Wpisz: from:artur older_than:12m\nZobaczysz tylko maile od Artura starsze niż rok.\nOtwórz dowolny z wyników.',
    hints: [
      'from:artur — filtruje po imieniu i adresie',
      'older_than:12m — tylko maile starsze niż 12 miesięcy',
      'Można też użyć: older_than:1y (rok), older_than:6m (pół roku)',
      'Żeby zawęzić jeszcze bardziej: from:artur older_than:18m',
    ],
    validate: (state) => {
      const q = state.searchQuery.toLowerCase();
      if (!q.includes('from:artur')) {
        return { ok: false, message: 'Dodaj do zapytania: from:artur' };
      }
      if (!q.includes('older_than:')) {
        return { ok: false, message: 'Dodaj operator older_than: np. older_than:12m' };
      }
      if (!state.openEmailId) {
        return { ok: false, message: 'Otwórz jeden z maili z wyników.' };
      }
      const open = state.emails.find(e => e.id === state.openEmailId);
      if (!open) return { ok: false, message: 'Błąd wewnętrzny.' };
      const isArtur = open.sender.toLowerCase().includes('artur') || open.senderName.toLowerCase().includes('artur');
      if (!isArtur) {
        return { ok: false, message: 'Otwórz mail od Artura z listy wyników.' };
      }
      return { ok: true, message: `from: + older_than: to klasyczne combo — znajdziesz archiwalne maile od konkretnej osoby bez przekopywania całej skrzynki.` };
    },
  },
  {
    id: 3,
    moduleId: 2,
    moduleName: 'Moduł 2: Zaawansowane wyszukiwanie',
    title: 'Wyszukiwanie w przedziale czasowym',
    goal: 'Filtrowanie poczty po zakresie dat operatorami after: i before:.',
    instruction: 'Wpisz: after:2026/02/01 before:2026/03/01\nPowinieneś zobaczyć 5 maili z samego lutego 2026.\nMożesz też spróbować: after:2026/01/01 before:2026/02/01',
    hints: [
      'Format: after:RRRR/MM/DD  (też działa z myślnikiem: after:2026-02-01)',
      'Wpisz: after:2026/02/01 before:2026/03/01',
      'Zobaczysz maile z: Dostawca IT, Jan Kowalski, Anna Nowak, Branżowy Newsletter i Dział Księgowości',
      'Użyj przycisku sortowania "Najstarsze" żeby widzieć je chronologicznie',
    ],
    validate: (state) => {
      const q = state.searchQuery.toLowerCase();
      if (!q.includes('after:') || !q.includes('before:')) {
        return { ok: false, message: 'Użyj obu operatorów: after: i before: w jednym zapytaniu.' };
      }
      // Accept any valid after/before combination
      const hasAfter = /after:\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/i.test(state.searchQuery);
      const hasBefore = /before:\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/i.test(state.searchQuery);
      if (!hasAfter || !hasBefore) {
        return { ok: false, message: 'Podaj daty w formacie: after:2026/02/01 before:2026/03/01' };
      }
      return { ok: true, message: 'Perfekcyjnie! Operatory after: i before: pozwalają zawęzić wyniki do dokładnego przedziału dat.' };
    },
  },
  {
    id: 12,
    moduleId: 2,
    moduleName: 'Moduł 2: Zaawansowane wyszukiwanie',
    title: 'Szukaj tylko w temacie — subject:',
    goal: 'Operator subject: ogranicza wyszukiwanie wyłącznie do tematu wiadomości.',
    instruction: 'Wpisz: subject:PILNE\nZobaczysz tylko maile, które mają "PILNE" w temacie — a nie w treści.',
    hints: [
      'subject: szuka tylko w temacie, nie w treści ani nadawcy',
      'Wpisz: subject:PILNE  (wielkość liter nie ma znaczenia)',
      'Masz dwa maile z PILNE w temacie — od CEO i od Marty Liś',
      'Spróbuj też: subject:raport  albo  subject:faktura',
    ],
    validate: (state) => {
      const q = state.searchQuery.toLowerCase();
      if (!q.includes('subject:')) {
        return { ok: false, message: 'Użyj operatora subject: np. subject:PILNE' };
      }
      const term = q.match(/subject:(\S+)/)?.[1] ?? '';
      if (!term) return { ok: false, message: 'Wpisz coś po subject: np. subject:PILNE' };
      return { ok: true, message: `Operator subject:"${term}" znalazł tylko maile z tym słowem w temacie — żadnych false-positives z treści.` };
    },
  },
  {
    id: 13,
    moduleId: 2,
    moduleName: 'Moduł 2: Zaawansowane wyszukiwanie',
    title: 'Szukaj po nazwie pliku — filename:',
    goal: 'Operator filename: znajduje maile z konkretnym typem lub nazwą załącznika.',
    instruction: 'Wpisz: filename:pdf\nZobaczysz wszystkie maile z załącznikami PDF.\nSpróbuj też: filename:xlsx  albo  filename:umowa',
    hints: [
      'filename:pdf  — wszystkie PDFy',
      'filename:xlsx  — arkusze Excel',
      'filename:umowa  — pliki z "umowa" w nazwie (niezależnie od rozszerzenia)',
      'Można łączyć: has:attachment filename:pdf larger:100K',
    ],
    validate: (state) => {
      const q = state.searchQuery.toLowerCase();
      if (!q.includes('filename:')) {
        return { ok: false, message: 'Użyj operatora filename: np. filename:pdf' };
      }
      const term = q.match(/filename:(\S+)/)?.[1] ?? '';
      if (!term) return { ok: false, message: 'Wpisz rozszerzenie lub nazwę po filename:' };
      return { ok: true, message: `filename:"${term}" — znajdziesz wszystkie maile z pasującym plikiem, bez przeglądania każdego z osobna.` };
    },
  },
  {
    id: 14,
    moduleId: 2,
    moduleName: 'Moduł 2: Zaawansowane wyszukiwanie',
    title: 'Operator OR — wyniki z wielu źródeł',
    goal: 'Wyszukiwanie maili od dowolnej z kilku osób jednocześnie.',
    instruction: 'Wpisz: from:jan OR from:anna\nZobaczysz maile od Jana Kowalskiego i Anny Nowak razem.\nMożna też: subject:raport OR subject:wyniki',
    hints: [
      'OR musi być WIELKIMI literami',
      'Wpisz: from:jan OR from:anna',
      'Otrzymasz maile od obu osób w jednej liście wyników',
      'Działa też z innymi operatorami: has:attachment OR larger:5M',
    ],
    validate: (state) => {
      if (!/ OR /i.test(state.searchQuery)) {
        return { ok: false, message: 'Użyj operatora OR (wielkimi literami) np. from:jan OR from:anna' };
      }
      return { ok: true, message: 'OR łączy wyniki z obu warunków — jak suma zbiorów. Bardzo przydatne gdy szukasz maili od kilku osób.' };
    },
  },
  {
    id: 15,
    moduleId: 2,
    moduleName: 'Moduł 2: Zaawansowane wyszukiwanie',
    title: 'Negacja — wykluczaj niepotrzebne wyniki',
    goal: 'Operator minus (-) wyklucza maile pasujące do warunku.',
    instruction: 'Wpisz: has:attachment -filename:pdf\nZnajdzie maile z załącznikami, ale bez PDFów.\nAlbo: from:@firma.pl -from:newsletter',
    hints: [
      'Minus (-) bezpośrednio przed operatorem wyklucza go',
      'Wpisz: has:attachment -filename:pdf',
      'Zobaczysz załączniki .xlsx, .zip, .docx — ale nie .pdf',
      'Inne przykłady: subject:pilne -from:newsletter  lub  is:unread -category:promotions',
    ],
    validate: (state) => {
      const q = state.searchQuery;
      // Must contain a negation operator (word starting with -)
      const hasNegation = /\s-\w/.test(' ' + q) || q.startsWith('-');
      if (!hasNegation) {
        return { ok: false, message: 'Użyj minusa (-) przed operatorem żeby wykluczyć wyniki, np. has:attachment -filename:pdf' };
      }
      return { ok: true, message: 'Negacja to supermoc wyszukiwania — pozwala filtrować "wszystko POZA tym".' };
    },
  },
  {
    id: 16,
    moduleId: 2,
    moduleName: 'Moduł 2: Zaawansowane wyszukiwanie',
    title: 'Wyszukiwanie po domenie — from:@domena',
    goal: 'Znajdź wszystkie maile z konkretnej firmy/domeny.',
    instruction: 'Wpisz: from:@firma.pl\nZobaczysz wszystkie maile od dowolnej osoby z firmy.pl.\nSpróbuj też połączyć: from:@firma.pl is:unread',
    hints: [
      'from:@firma.pl  — @ przed domeną to wildcard dla wszystkich z tej domeny',
      'Przydatne gdy nie pamiętasz imienia, ale wiesz skąd mail',
      'Możesz zawęzić: from:@firma.pl subject:PILNE',
      'Albo odwrotnie wykluczyć: -from:@newsletter.com',
    ],
    validate: (state) => {
      const q = state.searchQuery.toLowerCase();
      // Check for domain pattern: from:@something
      if (!q.match(/from:@[\w.]+/)) {
        return { ok: false, message: 'Wpisz from:@domena.pl np. from:@firma.pl' };
      }
      return { ok: true, message: 'from:@domena.pl to jeden z najczęściej używanych operatorów w firmach — odfiltrujesz całą domenę jednym zapytaniem.' };
    },
  },
  {
    id: 17,
    moduleId: 2,
    moduleName: 'Moduł 2: Zaawansowane wyszukiwanie',
    title: 'Zakres rozmiaru — larger: i smaller:',
    goal: 'Precyzyjne filtrowanie po rozmiarze załączników.',
    instruction: 'Wpisz: has:attachment larger:1M smaller:10M\nZnajdzie maile z załącznikami od 1 MB do 10 MB.',
    hints: [
      'larger:1M  — powyżej 1 megabajta',
      'smaller:10M  — poniżej 10 megabajtów',
      'Razem tworzą zakres: has:attachment larger:1M smaller:10M',
      'Możesz też używać K (kilobajty) i G (gigabajty)',
    ],
    validate: (state) => {
      const q = state.searchQuery.toLowerCase();
      const hasLarger  = /larger:\d+[kmg]?/i.test(q);
      const hasSmaller = /smaller:\d+[kmg]?/i.test(q);
      if (!hasLarger || !hasSmaller) {
        return { ok: false, message: 'Użyj obu: larger: i smaller: jednocześnie, np. larger:1M smaller:10M' };
      }
      return { ok: true, message: 'Zakres rozmiaru to idealne narzędzie do audytu skrzynki — znajdź "ciężkie, ale nie za ciężkie" pliki.' };
    },
  },
  {
    id: 18,
    moduleId: 2,
    moduleName: 'Moduł 2: Zaawansowane wyszukiwanie',
    title: 'Kombinowane zapytanie — mistrz wyszukiwania',
    goal: 'Połącz minimum 3 operatory w jednym zapytaniu.',
    instruction: 'Skomponuj złożone zapytanie używając co najmniej 3 operatorów.\nPrzykład: from:@firma.pl has:attachment -filename:pdf newer_than:30d',
    hints: [
      'Możesz dowolnie łączyć operatory: from: subject: has: is: larger: after: itp.',
      'Przykład 1: from:jan subject:raport has:attachment',
      'Przykład 2: from:@firma.pl is:unread -category:updates',
      'Przykład 3: has:attachment larger:500K smaller:20M newer_than:7d',
      'Im więcej operatorów, tym bardziej precyzyjny wynik',
    ],
    validate: (state) => {
      const q = state.searchQuery.toLowerCase();
      const operators = [
        /from:/i, /to:/i, /subject:/i, /has:/i, /is:/i, /filename:/i,
        /label:/i, /category:/i, /larger:/i, /smaller:/i,
        /older_than:/i, /newer_than:/i, /after:/i, /before:/i,
      ];
      const used = operators.filter(op => op.test(q));
      if (used.length < 3) {
        return { ok: false, message: `Używasz ${used.length} ${used.length === 1 ? 'operatora' : 'operatorów'}. Dodaj więcej — cel to minimum 3.` };
      }
      return { ok: true, message: `Kombajn wyszukiwania! ${used.length} operatory naraz — właśnie tak wyszukują prawdziwi Power Users.` };
    },
  },
  // ── Module 3: Organizacja ────────────────────────────────────────────────
  {
    id: 4,
    moduleId: 3,
    moduleName: 'Moduł 3: Organizacja',
    title: 'System Triage — gwiazdka i etykieta',
    goal: 'Gwiazdki i etykiety do nadawania priorytetów.',
    instruction: 'Znajdź mail od CEO (Adam Zieliński) "PILNE".\nOznacz czerwoną gwiazdką i przypisz etykietę "Projekty".',
    hints: [
      'Znajdź mail od Adam Zieliński (CEO) "PILNE: Decyzja strategiczna..."',
      'Klikaj gwiazdkę przy mailu aż zmieni się na czerwoną (★)',
      'Kliknij ikonę etykiety i zaznacz "Projekty"',
    ],
    validate: (state) => {
      const email = state.emails.find(e => e.id === 'msg-008');
      if (!email) return { ok: false, message: 'Błąd wewnętrzny.' };
      if (email.starColor !== 'red') return { ok: false, message: 'Oznacz mail czerwoną gwiazdką (kliknij gwiazdkę dwukrotnie).' };
      if (!email.labels.some(l => l.toLowerCase() === 'projekty')) return { ok: false, message: 'Teraz przypisz etykietę "Projekty".' };
      return { ok: true, message: 'Doskonale! Mail oznaczony jako pilny z etykietą "Projekty".' };
    },
  },
  {
    id: 5,
    moduleId: 3,
    moduleName: 'Moduł 3: Organizacja',
    title: 'Odłóż na później (Snooze)',
    goal: 'Zarządzanie zadaniami rozłożonymi w czasie.',
    instruction: 'Znajdź mail od HR "Przegląd roczny".\nKliknij ikonę zegara i odłóż na jutro o 8:00.',
    hints: [
      'Znajdź: "Przegląd roczny - proszę umówić termin" od HR',
      'Najedź na mail i kliknij ikonę zegara, lub otwórz i kliknij ⏰',
      'Wybierz "Jutro (8:00)" lub ustaw datę ręcznie',
    ],
    validate: (state) => {
      const email = state.emails.find(e => e.id === 'msg-009');
      if (!email) return { ok: false, message: 'Błąd wewnętrzny.' };
      if (!email.snoozeUntil) return { ok: false, message: 'Odłóż mail od HR — kliknij ikonę zegara.' };
      const d = new Date(email.snoozeUntil);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = d.toDateString() === tomorrow.toDateString();
      if (!isTomorrow || d.getHours() !== 8) return { ok: false, message: 'Ustaw odłożenie na jutro o godzinie 8:00.' };
      return { ok: true, message: 'Świetnie! Mail wróci jutro o 8:00.' };
    },
  },
  {
    id: 6,
    moduleId: 3,
    moduleName: 'Moduł 3: Organizacja',
    title: 'Wycisz irytujący wątek',
    goal: 'Mute — ukrywanie wątku który generuje spam w skrzynce.',
    instruction: 'Znajdź mail "Kto zabrał kubek z kuchni?".\nKliknij ⋮ (menu) i wybierz "Wycisz wątek".',
    hints: [
      'Znajdź mail "Odp: Odp: Odp: Kto zabrał kubek z kuchni?"',
      'Otwórz mail lub najedź na niego',
      'Kliknij menu ⋮ i wybierz "Wycisz wątek" (Mute)',
    ],
    validate: (state) => {
      const email = state.emails.find(e => e.id === 'msg-022');
      if (!email) return { ok: false, message: 'Błąd wewnętrzny.' };
      if (!email.isMuted) return { ok: false, message: 'Wycisz wątek klikając menu ⋮ → "Wycisz wątek".' };
      return { ok: true, message: 'Spokój! Wątek został wyciszony i nie będzie już pojawiał się w skrzynce.' };
    },
  },
  // ── Module 4: Automatyzacja ──────────────────────────────────────────────
  {
    id: 7,
    moduleId: 4,
    moduleName: 'Moduł 4: Automatyzacja',
    title: 'Auto-kategoryzacja filtrami',
    goal: 'Automatyczne sortowanie poczty za pomocą filtrów.',
    instruction: 'Utwórz filtr dla "unsubscribe".\nAkcje: Oznacz jako przeczytane + etykieta "Newslettery".',
    hints: [
      'Kliknij "Utwórz filtr" na dole listy lub w Ustawieniach',
      'Słowo kluczowe: unsubscribe',
      'Zaznacz: Oznacz jako przeczytane + etykieta "Newslettery"',
    ],
    validate: (state) => {
      const filter = state.filters.find(f => f.keyword.toLowerCase().includes('unsubscribe'));
      if (!filter) return { ok: false, message: 'Utwórz filtr ze słowem kluczowym "unsubscribe".' };
      if (!filter.actions.some(a => a.type === 'markAsRead')) return { ok: false, message: 'Dodaj akcję "Oznacz jako przeczytane".' };
      if (!filter.actions.some(a => a.type === 'addLabel' && a.label?.toLowerCase() === 'newslettery')) return { ok: false, message: 'Dodaj akcję z etykietą "Newslettery".' };
      return { ok: true, message: 'Filtr działa! Nowe newslettery będą automatycznie kategoryzowane.' };
    },
  },
  {
    id: 8,
    moduleId: 4,
    moduleName: 'Moduł 4: Automatyzacja',
    title: 'Ustaw auto-responder (urlop)',
    goal: 'Automatyczna odpowiedź gdy jesteś niedostępny.',
    instruction: 'Otwórz Ustawienia → Włącz auto-responder.\nUstaw temat i treść wiadomości, zapisz.',
    hints: [
      'Kliknij ikonę ⚙️ Ustawienia',
      'Wybierz zakładkę "Auto-responder"',
      'Włącz przełącznik, wpisz temat i treść, kliknij Zapisz',
    ],
    validate: (state) => {
      if (!state.autoResponder.enabled) return { ok: false, message: 'Włącz auto-responder w Ustawieniach (⚙️).' };
      if (!state.autoResponder.subject.trim()) return { ok: false, message: 'Wpisz temat automatycznej odpowiedzi.' };
      if (!state.autoResponder.body.trim()) return { ok: false, message: 'Wpisz treść automatycznej odpowiedzi.' };
      return { ok: true, message: `Auto-responder aktywny! Temat: "${state.autoResponder.subject}"` };
    },
  },
  {
    id: 9,
    moduleId: 4,
    moduleName: 'Moduł 4: Automatyzacja',
    title: 'Stwórz stopkę e-mail',
    goal: 'Profesjonalna stopka dodawana do każdej wiadomości.',
    instruction: 'Otwórz Ustawienia → Zakładka "Stopka".\nWpisz swoje imię, stanowisko i kontakt, zapisz.',
    hints: [
      'Kliknij ⚙️ Ustawienia → zakładka "Stopka"',
      'Włącz stopkę i wpisz treść (imię, stanowisko, tel.)',
      'Kliknij Zapisz',
    ],
    validate: (state) => {
      if (!state.signature.enabled) return { ok: false, message: 'Włącz stopkę w Ustawieniach → zakładka "Stopka".' };
      if (state.signature.content.trim().length < 10) return { ok: false, message: 'Wpisz treść stopki (minimum 10 znaków).' };
      return { ok: true, message: 'Stopka skonfigurowana! Będzie dodawana do każdej nowej wiadomości.' };
    },
  },
  // ── Module 5: Power User ─────────────────────────────────────────────────
  {
    id: 10,
    moduleId: 5,
    moduleName: 'Moduł 5: Power User',
    title: 'Szablon odpowiedzi',
    goal: 'Szablony (canned responses) do szybkich odpowiedzi.',
    instruction: 'Otwórz Ustawienia → "Szablony".\nUtwórz szablon z treścią podziękowania, zapisz.',
    hints: [
      'Kliknij ⚙️ Ustawienia → zakładka "Szablony"',
      'Kliknij "Nowy szablon", nadaj nazwę i wpisz treść',
      'Np. "Dziękuję za wiadomość, odpiszę w ciągu 24h."',
      'Kliknij Zapisz',
    ],
    validate: (state) => {
      if (state.templates.length === 0) return { ok: false, message: 'Utwórz co najmniej jeden szablon w Ustawieniach → "Szablony".' };
      const t = state.templates[0];
      if (!t.name.trim() || !t.body.trim()) return { ok: false, message: 'Szablon musi mieć nazwę i treść.' };
      return { ok: true, message: `Szablon "${t.name}" gotowy do użycia!` };
    },
  },
  {
    id: 11,
    moduleId: 5,
    moduleName: 'Moduł 5: Power User',
    title: 'Skróty klawiszowe',
    goal: 'Błyskawiczna nawigacja bez myszki.',
    instruction: 'Włącz skróty w ⚙️ Ustawieniach.\nUżyj: J/K (nawigacja), E (archiwizuj), / (szukaj).',
    hints: [
      'Kliknij ⚙️ Ustawienia → włącz "Skróty klawiszowe"',
      'J = następny mail, K = poprzedni mail',
      'E = archiwizuj zaznaczony, / = aktywuje wyszukiwarkę',
    ],
    validate: (state) => {
      if (!state.keyboardShortcutsEnabled) return { ok: false, message: 'Włącz skróty klawiszowe w Ustawieniach (⚙️).' };
      const used = state.keyboardActionsUsed;
      const missing: string[] = [];
      if (!used.includes('j') && !used.includes('k')) missing.push('J lub K');
      if (!used.includes('e')) missing.push('E');
      if (!used.includes('/')) missing.push('/');
      if (missing.length > 0) return { ok: false, message: `Użyj jeszcze: ${missing.join(', ')}` };
      return { ok: true, message: 'Brawo! Jesteś Gmail Power User! 🚀' };
    },
  },
];
