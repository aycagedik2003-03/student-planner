import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useTranslation } from '../i18n/useTranslation';

export const TermsOfServiceScreen = () => {
  const { t } = useTranslation();

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        {t('auth.termsOfService')}
      </Text>

      <Section title="1. Zakreś usług">
        Roomski to platforma do łączenia osób poszukujących wspólnego wynajmu
        mieszkań i pokojów. Nie jesteśmy wynajmującymi ani pośrednikami handlowymi,
        tylko połączeniem między użytkownikami.
      </Section>

      <Section title="2. Warunki korzystania">
        Muszą być spełnione:{'\n'}
        • Wiek minimum 18 lat{'\n'}
        • Godzenie się z polskim prawem{'\n'}
        • Posiadanie ważnego adresu email{'\n'}
        • Bycie osobą fizyczną (nie firma bez pozwolenia){'\n'}
        • Zgodność z Polityką Prywatności
      </Section>

      <Section title="3. Twoja odpowiedzialność">
        Odpowiadasz za:{'\n'}
        • Dokładność informacji w profilu{'\n'}
        • Bezpieczeństwo hasła i konta{'\n'}
        • Wszystkie działania na swoim koncie{'\n'}
        • Poszanowanie prywatności innych użytkowników{'\n'}
        • Niepublikowanie danych osobowych trzecich osób
      </Section>

      <Section title="4. Zabronione zachowania">
        Zabronione jest:{'\n'}
        • Publikowanie fałszywych lub wprowadzających informacji{'\n'}
        • Molestowanie, groźby, mowa nienawiści{'\n'}
        • Oszustwa lub wyłudzanie{'\n'}
        • Spamowanie lub phishing{'\n'}
        • Naruszanie praw autorskich{'\n'}
        • Handel narkotykami lub przedmiotami nielegalnymi{'\n'}
        • Dyskryminacja ze względu na rasę, płeć, religię itp.{'\n'}
        • Publikowanie treści dla dorosłych (porno, przemoc)
      </Section>

      <Section title="5. Odpowiedzialność Roomski">
        Roomski nie jest odpowiedzialny za:{'\n'}
        • Transakcje między użytkownikami{'\n'}
        • Oszustwa lub kradzieże popełnione przez użytkowników{'\n'}
        • Uszkodzenia mienia lub osobowe{'\n'}
        • Pogubione klucze lub pieniądze{'\n'}
        • Konflikty między wspólnikami{'\n'}
        • Niedotrzymanie warunków najmu{'\n\n'}
        Maksymalna odpowiedzialność: zwrot opłaty za usługę.
      </Section>

      <Section title="6. Wiadomości i komunikacja">
        • Wiadomości między użytkownikami nie są moderowane{'\n'}
        • Roomski nie kontroluje zawartości rozmów{'\n'}
        • Jeśli otrzymasz zagrażające wiadomości, zgłoś nas{'\n'}
        • Nie udostępniamy numerów telefonów bez zgody
      </Section>

      <Section title="7. Zmiany lub usunięcie konta">
        Możesz:{'\n'}
        • Zmienić dane w profilu w każdej chwili{'\n'}
        • Usunąć konto - dane zostaną skasowane w 30 dni{'\n'}
        • Wznowić konto w ciągu 30 dni od usunięcia{'\n\n'}
        Możemy:{'\n'}
        • Zawiesić konto za naruszenie regulaminu{'\n'}
        • Usunąć konto bez ostrzeżenia w razie oszustwa{'\n'}
        • Zaarchiwizować dane na potrzeby prawne
      </Section>

      <Section title="8. Opłaty i rozliczenia">
        Roomski jest bezpłatna dla wszystkich użytkowników.{'\n'}
        W przyszłości możemy wprowadzić opłaty za premium - zawsze
        z ostrzeżeniem z wyprzedzeniem.
      </Section>

      <Section title="9. Własność intelektualna">
        • Roomski, logo, kod źródłowy - własność Roomski Sp. z o.o.{'\n'}
        • Twoje zdjęcia i tekst profilu - Twoja własność{'\n'}
        • Przyznajemy prawo do używania Twojej zawartości do
          poprawy naszych usług
      </Section>

      <Section title="10. Modyfikacja regulaminu">
        Możemy zmienić warunki w każdej chwili.{'\n'}
        Powiadomimy Cię mailowo 30 dni przed zmianą.{'\n'}
        Dalsze korzystanie = akceptacja nowych warunków.
      </Section>

      <Section title="11. Rozwiązywanie sporów">
        • Najpierw spróbuj rozwiązać problem z drugą osobą{'\n'}
        • Jeśli się nie powiedzie, skontaktuj się z nami: support@roomski.app{'\n'}
        • Ostatecznym forum jest sąd właściwy dla Poznania{'\n'}
        • Prawo polskie (Kodeks cywilny)
      </Section>

      <Section title="12. Kontakt">
        Roomski Sp. z o.o.{'\n'}
        ul. [ADRES], 61-000 Poznań, Polska{'\n'}
        Email: support@roomski.app{'\n'}
        Tel: +48 [NUMER]
      </Section>

      <Section title="13. Rękojmia">
        USŁUGA JEST ŚWIADCZONA "TAK JAK JEST" BEZ GWARANCJI.{'\n'}
        Nie gwarantujemy bezprzerwowego dostępu do platformy.
      </Section>

      <Text style={{ fontSize: 12, color: '#888', marginTop: 24, marginBottom: 32 }}>
        Akceptując warunki, potwierdzasz, że je przeczytałeś i rozumiesz.{'\n'}
        Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
      </Text>
    </ScrollView>
  );
};

const Section = ({ title, children }: any) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#1D9E75' }}>
      {title}
    </Text>
    <Text style={{ fontSize: 12, color: '#555', lineHeight: 20 }}>
      {children}
    </Text>
  </View>
);

export default TermsOfServiceScreen;
