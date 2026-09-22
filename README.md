# Wstęp

Robot kancelaryjny Algorek to narzędzie dedykowane do integracji EZD w jednostkach samorządu terytorialnego.
Repozytorium, zbudowane jako monorepo, zawiera kod przeglądarki dokumentów i pomocniczych serwisów, z których budowane są konkretne integracje [link](https://www.algor.com.pl/algorone/scenariusze-integracji). Komponety serwisów wykorzystywane są w innych produktach.

## Komponenty

| Nazwa | Opis|
| :-: | :-: |
| bus-srv | Prosta szyna wysylania (1:n) i odbioru wiadomosci tesktowych |
| lpd-srv |  Niepełeny minimalstyczny server LPD  |
| pki-srv |  Minimalistyczny serwer wpsierającay podpisy PADES z NextU na bazie DSS (eIDAS) |
| przegladarka |  Przeglądarka dokumnetów |
| state-srv |  Dynamiczna struktura danych opisująca pożądany stan systemu |
| store-srv |  Minimalistyczny file object store |

