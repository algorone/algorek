# 🤝 Współpraca i Umowa Licencyjna Autora (Contributor License Agreement - CLA)

Dziękujemy za zainteresowanie rozwojem naszego projektu! Aby móc bezpiecznie przyjmować Twój kod do głównego monorepo, prosimy o zapoznanie się z poniższymi zasadami.

## 📌 Dlaczego potrzebujemy CLA?
Nasz projekt rozwijany jest w modelu **Dual-Licensing** (Podwójnego Licencjonowania):
1. Publiczne repozytorium udostępniane jest na licencji **GNU GPLv3**.
2. Podmioty komercyjne i integratorzy mogą zakupić licencję zamkniętą (komercyjną).

Abyśmy mogli legalnie oferować wersje komercyjne, musimy posiadać pełne i nieograniczone prawa do relikencjonowania całego kodu w monorepo. Przekazując swój kod (poprzez Pull Request), akceptujesz poniższe warunki umowy CLA.

---

## 📝 Treść Umowy CLA

Wysyłając wkład (Contribution) do tego repozytorium (w formie kodu, dokumentacji, skryptów lub poprawek), Ty (jako "Licencjodawca") udzielasz [TWÓJ PODMIOT / NAZWA PROJEKTU] (jako "Licencjobiorcy") następujących praw:

### 1. Przekazanie Praw i Licencji
*   **Licencja na Prawa Autorskie:** Niniejszym udzielasz Licencjobiorcy wieczystej, ogólnoświatowej, nieekskluzywnej, bezpłatnej, nieodwołalnej licencji na prawa autorskie do powielania, przygotowywania dzieł zależnych, publicznego wyświetlania, sublicencjonowania oraz dystrybucji Twojego Wkładu i takich dzieł zależnych.
*   **Uprawnienie do Relikencjonowania:** Jasno potwierdzasz, że Licencjobiorca ma prawo dystrybuować Twój Wkład na dowolnych wybranych przez siebie warunkach licencyjnych, w tym na licencjach open-source (np. GPL) oraz komercyjnych (zamkniętych).

### 2. Oświadczenie o Autorstwie
Oświadczasz, że:
*   Jesteś pierwotnym autorem przekazywanego kodu i posiadasz do niego pełne prawa majątkowe.
*   Twój Wkład nie narusza praw autorskich, patentów ani tajemnic handlowych osób trzecich.
*   Jeśli Twój kod powstał w ramach obowiązków służbowych u Twojego pracodawcy, posiadasz pisemną zgodę pracodawcy na przekazanie tego kodu do projektów open-source.

### 3. Brak Gwarancji (As-Is)
Twój Wkład jest przekazywany w stanie, w jakim się znajduje ("as-is"), bez żadnych wyraźnych ani dorozumianych gwarancji, w tym gwarancji przydatności handlowej lub sprawności do określonego celu.

---

## 🚀 Jak zaakceptować CLA?

Nie musisz podpisywać papierowych dokumentów. Akceptacja CLA odbywa się w sposób cyfrowy poprzez mechanizm Git. 

**Wymóg formalny:** Każdy commit wysłany w ramach Pull Requesta **musi być podpisany dewelopersko** za pomocą flagi `-s` (Developer Certificate of Origin). 

Podczas robienia commita użyj polecenia:
```bash
git commit -s -m "Twój opis zmian w kodzie"
```
Spowoduje to automatyczne dodanie na końcu opisu commita linijki: `Signed-off-by: Imię Nazwisko <email@example.com>`, co stanowi Twoją cyfrową akceptację niniejszych warunków CLA. Commitów bez tego podpisu system CI/CD nie pozwoli scalić z główną gałęzią kodu.
