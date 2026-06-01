# **PRD \- Gmail Mastery App (MVP)**

## **1\. Cel**

Edukacja użytkowników w zakresie zaawansowanych funkcji Gmaila. Zwiększenie produktywności i osiągnięcie "Inbox Zero".

## **2\. Forma**

PWA / Symulator webowy. Zbieranie telemetrii: śledzenie kliknięć i wpisywanych komend.

## **3\. Metryki (KPI)**

* Procent ukończenia poszczególnych modułów.  
* Czas wykonania zadania vs. przewidywany.  
* Drop-off rate na kluczowych etapach (np. operatory wyszukiwania, tworzenie filtrów).

# **Specyfikacja techniczna i wdrożeniowa (Dla Klaudiusza)**

## **1\. Stos technologiczny (Propozycja dla MVP)**

* **Frontend:** React (Vite) lub Next.js.  
* **Styling:** Tailwind CSS.  
* **Backend / Baza:** Firebase lub Supabase (logowanie zdarzeń analitycznych).  
* **Hosting:** Vercel lub Netlify.  
* **Analityka:** PostHog.

## **2\. Architektura UI (Co mockujemy)**

* **Search Bar:** Parsowanie tekstu (np. from:, has:attachment).  
* **Lista wiadomości:** Checkboxy, widok nieprzeczytane/przeczytane, temat, nadawca, data.  
* **Pasek akcji (Action Bar):** Pojawia się po zaznaczeniu checkboxa (Archiwizuj, Usuń, Oznacz jako przeczytane, Etykiety).  
* **Sidebar:** Widok folderów i etykiet.  
* **Nakładka edukacyjna (Zadania):** Widget z celem zadania i przyciskiem "Sprawdź".

## **3\. Model danych (Struktura stanu aplikacji)**

Przykładowy JSON z danymi początkowymi (do Local Storage):

`[`  
  `{`  
    `"id": "msg-001",`  
    `"sender": "jan.kowalski@firma.pl",`  
    `"subject": "Raport Q4",`  
    `"body": "W załączniku przesyłam raport...",`  
    `"date": "2025-10-15",`  
    `"hasAttachment": true,`  
    `"labels": ["inbox", "praca"],`  
    `"isRead": false,`  
    `"isStarred": false,`  
    `"category": "primary"`  
  `},`  
  `{`  
    `"id": "msg-002",`  
    `"sender": "newsletter@sklep.pl",`  
    `"subject": "Promocja -50%",`  
    `"body": "Tylko dziś...",`  
    `"date": "2026-05-28",`  
    `"hasAttachment": false,`  
    `"labels": ["inbox"],`  
    `"isRead": true,`  
    `"isStarred": false,`  
    `"category": "promotions"`  
  `}`  
`]`

## **4\. Tracking analityczny (Wydarzenia \- PostHog)**

* tutorial\_started (wejście na stronę)  
* task\_started (parametr task\_id)  
* search\_executed (parametr użytej komendy)  
* action\_clicked (parametr przycisku, np. btn: "archive")  
* task\_failed (nieprawidłowy stan skrzynki podczas sprawdzania)  
* task\_completed (czas wykonania zadania)  
* user\_dropped (zamknięcie karty przed końcem)

# **Workflow / Zadania dla użytkownika**

## **Moduł 1: Zarządzanie szumem**

### **Zadanie 1: Szybkie czyszczenie**

**Cel:** Użycie operatorów wyszukiwania i masowa archiwizacja.  
**Akcja:** Wpisz category:promotions older\_than:1m, zaznacz wszystko i kliknij Archiwizuj (nie usuwaj).

### **Zadanie 2: Znajdowanie ciężkich załączników**

**Cel:** Zwalnianie miejsca i szybkie odnajdywanie plików.  
**Akcja:** Wpisz has:attachment larger:10M, odnajdź i otwórz odpowiedniego maila.

## **Moduł 2: Organizacja**

### **Zadanie 3: System Triage**

**Cel:** Wykorzystanie systemu gwiazdek i etykiet do nadawania priorytetów.  
**Akcja:** Oznacz wskazanego maila czerwoną gwiazdką (Pilne) i przypisz do niego etykietę "Projekty".

### **Zadanie 4: Odłóż na później (Snooze)**

**Cel:** Zarządzanie zadaniami rozłożonymi w czasie.  
**Akcja:** Zastosuj funkcję "Odłóż" na wybranym mailu, ustawiając powiadomienie na jutro na godzinę 8:00.

## **Moduł 3: Automatyzacja**

### **Zadanie 5: Auto-kategoryzacja**

**Cel:** Automatyzacja skrzynki odbiorczej za pomocą filtrów.  
**Akcja:** Utwórz filtr wyłapujący wiadomości zawierające słowo unsubscribe. Ustaw akcje: oznacz jako przeczytane i automatycznie przypisz do nowej etykiety "Newslettery".

## **Moduł 4: Power User**

### **Zadanie 6: Skróty klawiszowe**

**Cel:** Błyskawiczna nawigacja bez użycia myszki.  
**Akcja:** Włącz skróty klawiszowe w ustawieniach. Następnie użyj klawiszy j i k do nawigacji pomiędzy mailami, wciśnij e aby zarchiwizować wiadomość, a na koniec użyj / aby aktywować pole wyszukiwania.