# Wstęp

Robot kancelaryjny Algorek to narzędzie dedykowane do integracji EZD w jednostkach samorządu terytorialnego.
Repozytorium, zbudowane jako monorepo, zawiera kod przeglądarki dokumentów i pomocniczych serwisów, z których budowane są konkretne integracje [link](https://www.algor.com.pl/algorone/scenariusze-integracji). Komponenty serwisów wykorzystywane są w innych produktach.

## Komponenty

| Nazwa | Opis|
| :-: | :-: |
| bus-srv | Prosta szyna wysyłania (1:n) i odbioru wiadomości tekstowych |
| lpd-srv |  Niepełeny minimalistyczny serwer LPD  |
| pki-srv |  Minimalistyczny serwer wspierającay podpisy PADES z NextU na bazie DSS (eIDAS) |
| przegladarka |  Przeglądarka dokumentów |
| state-srv |  Dynamiczna struktura danych opisująca pożądany stan systemu |
| store-srv |  Minimalistyczny file object store |

