import Link from 'next/link';
import { FileText, ShieldCheck } from 'lucide-react';

export type InformationalLegalLocale = 'en' | 'sk';
export type LegalDocument = 'terms' | 'privacy' | 'cookies' | 'imprint';

type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type LegalContent = {
  eyebrow: string;
  title: string;
  lead: string;
  updated: string;
  sections: LegalSection[];
};

const documentPaths: Record<LegalDocument, string> = {
  terms: 'aszf',
  privacy: 'adatkezeles',
  cookies: 'cookie-tajekoztato',
  imprint: 'impresszum',
};

const documents: Record<InformationalLegalLocale, Record<LegalDocument, LegalContent>> = {
  en: {
    terms: {
      eyebrow: 'Legal information',
      title: 'Terms and Conditions',
      lead: 'The main conditions for appointment requests, dental care and use of Crown Dental’s online services.',
      updated: 'Last updated: 20 July 2026',
      sections: [
        {
          title: '1. Service provider and scope',
          items: [
            'Provider: Crown Dental Praxis és Labor Fogászati Kft.',
            'Registered office and Esztergom clinic: Petőfi Sándor utca 11, 2500 Esztergom, Hungary.',
            'Budapest clinic: Királyok útja 55, 1039 Budapest, Hungary.',
            'Company registration number: 11-09-026431. Tax number: 26537353-2-11.',
            'Contact: info@crowndental.hu, +36 70 564 6837.',
          ],
          paragraphs: ['These terms cover appointment requests, dental services and the public functions of crowndental.hu. Mandatory patient and consumer rights under applicable law remain unaffected.'],
        },
        {
          title: '2. Appointment requests and confirmation',
          paragraphs: ['Submitting a form on the website creates an appointment request, not a confirmed appointment. A date becomes binding only after Crown Dental confirms the date, time and clinic by telephone or email. Patients are responsible for providing accurate contact details and relevant information needed to arrange care safely.'],
        },
        {
          title: '3. Examination, treatment plan and consent',
          paragraphs: ['Website content and preliminary correspondence provide general information only. Diagnosis, treatment options, expected benefits, material risks, alternatives, timing and estimated costs are discussed individually after an appropriate examination. Treatment begins only after the information and consent required by Hungarian healthcare law have been provided.'],
        },
        {
          title: '4. Prices, quotations and payment',
          paragraphs: ['Website prices are indicative unless Crown Dental issues a written, binding quotation. The final treatment plan may change after examination or if previously unknown clinical circumstances arise. Prices are settled in Hungarian forints; the available payment methods are confirmed by the clinic. Any euro conversion shown online is an estimate and may vary with the exchange rate.'],
        },
        {
          title: '5. Cancellation and non-attendance',
          paragraphs: ['If a confirmed appointment cannot be attended, please notify the clinic as early as possible and, where practicable, at least 24 hours before treatment. Repeated non-attendance without notice may result in future appointments being offered only after individual agreement. This does not limit rights that cannot lawfully be restricted.'],
        },
        {
          title: '6. Patient cooperation and urgent symptoms',
          paragraphs: ['Please disclose relevant illnesses, medicines, allergies, pregnancy and previous dental records, and follow the agreed aftercare instructions. Online forms and website messages are not emergency channels. Severe bleeding, breathing difficulty, major facial swelling or another urgent condition requires immediate local emergency or medical assistance.'],
        },
        {
          title: '7. AI-assisted quotation comparison',
          paragraphs: ['The automated quotation comparison is an initial aid only. It does not provide a diagnosis, medical advice, a treatment plan or a binding price. Uploaded documents may be incomplete or interpreted incorrectly; Crown Dental can confirm suitability and cost only after a personal dental examination.'],
        },
        {
          title: '8. Liability and website availability',
          paragraphs: ['Crown Dental provides care in accordance with applicable professional and legal requirements. Treatment outcomes may be affected by individual biology, existing conditions and patient cooperation, so a particular medical result cannot be guaranteed. Nothing in these terms excludes liability where exclusion is prohibited by law. Temporary website interruptions may occur because of maintenance, network failures or third-party services.'],
        },
        {
          title: '9. Complaints and dispute resolution',
          paragraphs: ['Complaints may be submitted at the clinic, by post to the registered office or by email to info@crowndental.hu. Please include your contact details, a description of the issue and the requested resolution. Consumer disputes that cannot be settled directly may be referred to the competent conciliation body; for the provider’s registered office this is the Fejér County Conciliation Board, Hosszúsétatér 4–6, 8000 Székesfehérvár, Hungary, bekeltetes@fmkik.hu, +36 22 510 310.'],
        },
      ],
    },
    privacy: {
      eyebrow: 'Data protection',
      title: 'Privacy Notice',
      lead: 'How Crown Dental collects, uses, protects and retains personal data in connection with its clinics and website.',
      updated: 'Last updated: 20 July 2026',
      sections: [
        {
          title: '1. Data controller',
          items: [
            'Crown Dental Praxis és Labor Fogászati Kft.',
            'Registered office: Petőfi Sándor utca 11, 2500 Esztergom, Hungary.',
            'Company registration number: 11-09-026431. Tax number: 26537353-2-11.',
            'Privacy contact: info@crowndental.hu, +36 70 564 6837.',
          ],
        },
        {
          title: '2. Data we process and why',
          items: [
            'Appointment requests: name, preferred form of address, email address, telephone number, selected clinic, requested treatment and message, so that we can contact you and arrange care.',
            'Dental care: identification, health, diagnostic, treatment and billing records required for safe care and statutory medical documentation.',
            'AI quotation comparison: contact details, the uploaded quotation or image, extracted treatment items and the generated comparison, so that we can prepare the requested preliminary analysis.',
            'Careers: contact details, professional information and any documents voluntarily submitted with an application.',
            'Marketing: contact details, preferred clinic, language, consent source and consent time only where separate marketing consent has been given.',
            'Website security and operation: IP address, request logs, consent settings and other necessary technical information.',
          ],
        },
        {
          title: '3. Legal bases',
          paragraphs: ['Depending on the purpose, processing is necessary for steps requested before a contract, performance of the treatment agreement, compliance with healthcare, accounting and other legal duties, a legitimate interest such as service security or claim handling, or your consent. Health data is processed only where an applicable healthcare basis or another condition for special-category data is available. Marketing consent may be withdrawn at any time.'],
        },
        {
          title: '4. Automated tools and patient communication',
          paragraphs: ['The quotation analyser uses automated technology to extract and compare information, but it does not make a legally or medically binding decision. A dentist must examine the patient before confirming a diagnosis, treatment plan or price. Following treatment, Crown Dental may send service-related review or check-up reminders where this is connected to patient care or otherwise permitted by law. Promotional newsletters are sent only with separate consent.'],
        },
        {
          title: '5. Recipients and service providers',
          items: [
            'Supabase provides protected database services.',
            'Vercel provides website hosting and delivery infrastructure.',
            'Resend provides transactional email delivery.',
            'Google provides the AI analysis service and, subject to the relevant consent, analytics and advertising measurement.',
            'Meta provides campaign measurement only where marketing consent has been given.',
            'Sanity provides management of public website and blog content.',
          ],
          paragraphs: ['Service providers receive only the data needed for their role and act under applicable contractual and security safeguards. Where data is processed outside the European Economic Area, Crown Dental relies on a valid transfer mechanism such as an adequacy decision or standard contractual clauses where required.'],
        },
        {
          title: '6. Retention and security',
          paragraphs: ['Medical records are retained for the periods required by Hungarian law. Contract, billing and complaint records are kept for the applicable statutory limitation and retention periods. Unsuccessful career applications and preliminary enquiries are deleted or anonymised when no longer needed, subject to legal claims. Marketing data is retained until consent is withdrawn or the contact is otherwise removed. Crown Dental uses access controls, encrypted transmission and other proportionate organisational and technical measures.'],
        },
        {
          title: '7. Your rights',
          items: [
            'Request access to and correction of your personal data.',
            'Request deletion or restriction where the legal conditions are met.',
            'Object to processing based on legitimate interests and request data portability where applicable.',
            'Withdraw consent at any time without affecting processing carried out before withdrawal.',
            'Complain to the Hungarian National Authority for Data Protection and Freedom of Information (NAIH), 1055 Budapest, Falk Miksa utca 9–11, ugyfelszolgalat@naih.hu, or to the competent authority in your country of residence where permitted by the GDPR.',
          ],
        },
        {
          title: '8. Contact and updates',
          paragraphs: ['Questions and data-protection requests can be sent to info@crowndental.hu. We may update this notice when our services, providers or legal obligations change; the current version and update date are published on this page.'],
        },
      ],
    },
    cookies: {
      eyebrow: 'Cookie settings',
      title: 'Cookie Notice',
      lead: 'The cookies and similar browser technologies used on crowndental.hu, their purposes and the choices available to you.',
      updated: 'Last updated: 20 July 2026',
      sections: [
        {
          title: '1. What are cookies and similar technologies?',
          paragraphs: ['Cookies are small files stored by your browser. The website also uses local storage and session storage for similar purposes. Some technologies are necessary for the site to work; analytics and advertising technologies are activated only after the corresponding consent.'],
        },
        {
          title: '2. Necessary storage',
          items: [
            'crown_cookie_consent stores your cookie choice until you clear browser data or change the setting.',
            'Necessary session storage keeps short-lived booking confirmation and form state for the current browser session.',
            'Security and routing information supports safe requests, language-specific pages and basic website functions.',
          ],
          paragraphs: ['Necessary technologies do not require optional cookie consent because the requested service could not operate reliably without them.'],
        },
        {
          title: '3. Analytics and advertising',
          items: [
            'Google Analytics helps us understand aggregated website use after analytics consent.',
            'Google Ads measures campaign and appointment conversions after marketing consent.',
            'Meta Pixel measures and optimises campaigns after marketing consent.',
          ],
          paragraphs: ['Consent is denied by default for optional categories. Selecting one category does not automatically enable the other.'],
        },
        {
          title: '4. Embedded maps and external content',
          paragraphs: ['Clinic location pages may include Google Maps. Loading an embedded map establishes a connection with Google and may transmit technical information such as your IP address. Links to social networks open the external provider’s own website, where that provider’s privacy and cookie rules apply.'],
        },
        {
          title: '5. Typical storage periods and providers',
          items: [
            '_ga and _ga_* (Google Analytics): commonly retained for up to two years, subject to the active Google configuration.',
            '_gcl_au and _gcl_aw_* (Google Ads): commonly retained for up to 90 days.',
            '_fbp (Meta): commonly retained for up to 90 days.',
            'Google Ireland Limited / Google LLC and Meta Platforms Ireland Limited provide the optional measurement services.',
          ],
        },
        {
          title: '6. Change or withdraw your choice',
          paragraphs: ['Use “Cookie settings” in the website footer to change or withdraw optional consent at any time. You can also delete or block browser storage in your browser settings. Withdrawal does not make earlier consent-based processing unlawful. Blocking necessary storage may prevent some forms or preferences from working correctly.'],
        },
      ],
    },
    imprint: {
      eyebrow: 'Company information',
      title: 'Legal Notice',
      lead: 'Official information about the operator of crowndental.hu, its clinics and technical hosting.',
      updated: 'Last updated: 20 July 2026',
      sections: [
        {
          title: '1. Website operator',
          items: [
            'Company: Crown Dental Praxis és Labor Fogászati Kft.',
            'Registered office and Esztergom clinic: Petőfi Sándor utca 11, 2500 Esztergom, Hungary.',
            'Budapest clinic: Királyok útja 55, 1039 Budapest, Hungary.',
            'Company registration number: 11-09-026431.',
            'Tax number: 26537353-2-11.',
            'Email: info@crowndental.hu. Telephone: +36 70 564 6837.',
          ],
        },
        {
          title: '2. Hosting provider',
          paragraphs: ['The website is hosted and delivered using the cloud infrastructure of Vercel Inc., United States.'],
        },
        {
          title: '3. Copyright and permitted use',
          paragraphs: ['Unless stated otherwise, the text, design, graphics, photographs and other original material on this website are protected and belong to Crown Dental or are used with permission. Reproduction, adaptation or commercial reuse requires prior written permission unless applicable law expressly allows it.'],
        },
        {
          title: '4. Medical and website disclaimer',
          paragraphs: ['Website information is provided for general education and does not replace an examination, diagnosis, individual treatment advice or emergency care. Crown Dental works to keep the site accurate and available but may correct content and cannot guarantee uninterrupted access. Mandatory liability rules remain unaffected.'],
        },
        {
          title: '5. Complaints and conciliation',
          paragraphs: ['Contact Crown Dental first at info@crowndental.hu if you have a complaint. The regional conciliation body for the provider’s registered office is the Fejér County Conciliation Board, Hosszúsétatér 4–6, 8000 Székesfehérvár, Hungary; bekeltetes@fmkik.hu; +36 22 510 310.'],
        },
      ],
    },
  },
  sk: {
    terms: {
      eyebrow: 'Právne informácie',
      title: 'Všeobecné obchodné podmienky',
      lead: 'Hlavné podmienky žiadostí o termín, poskytovania zubnej starostlivosti a používania online služieb Crown Dental.',
      updated: 'Aktualizované: 20. júla 2026',
      sections: [
        {
          title: '1. Poskytovateľ a rozsah podmienok',
          items: [
            'Poskytovateľ: Crown Dental Praxis és Labor Fogászati Kft.',
            'Sídlo a ambulancia v Ostrihome: Petőfi Sándor utca 11, 2500 Esztergom, Maďarsko.',
            'Ambulancia v Budapešti: Királyok útja 55, 1039 Budapest, Maďarsko.',
            'Registračné číslo spoločnosti: 11-09-026431. Daňové číslo: 26537353-2-11.',
            'Kontakt: info@crowndental.hu, +36 70 564 6837.',
          ],
          paragraphs: ['Tieto podmienky sa vzťahujú na žiadosti o termín, zubné služby a verejné funkcie stránky crowndental.hu. Povinné práva pacientov a spotrebiteľov podľa platných právnych predpisov zostávajú nedotknuté.'],
        },
        {
          title: '2. Žiadosť o termín a potvrdenie',
          paragraphs: ['Odoslanie formulára na webovej stránke je žiadosťou o termín, nie potvrdeným termínom. Termín je záväzný až po tom, ako Crown Dental telefonicky alebo e-mailom potvrdí dátum, čas a ambulanciu. Pacient má uviesť správne kontaktné údaje a informácie potrebné na bezpečné naplánovanie starostlivosti.'],
        },
        {
          title: '3. Vyšetrenie, liečebný plán a súhlas',
          paragraphs: ['Obsah stránky a predbežná komunikácia majú iba všeobecný informačný charakter. Diagnóza, možnosti liečby, očakávané prínosy, podstatné riziká, alternatívy, časový plán a predpokladané náklady sa určujú individuálne po primeranom vyšetrení. Ošetrenie sa začne až po poskytnutí informácií a súhlasu vyžadovaného maďarskými zdravotníckymi predpismi.'],
        },
        {
          title: '4. Ceny, cenové ponuky a platba',
          paragraphs: ['Ceny na webovej stránke sú orientačné, pokiaľ Crown Dental nevydá písomnú záväznú cenovú ponuku. Konečný plán sa môže po vyšetrení alebo pri zistení dovtedy neznámych klinických okolností zmeniť. Ceny sa uhrádzajú v maďarských forintoch; dostupný spôsob platby potvrdí ambulancia. Prepočet na eurá zobrazený na stránke je iba odhad a môže sa meniť podľa kurzu.'],
        },
        {
          title: '5. Zrušenie termínu a nedostavenie sa',
          paragraphs: ['Ak sa nemôžete dostaviť na potvrdený termín, informujte ambulanciu čo najskôr, podľa možnosti aspoň 24 hodín pred ošetrením. Pri opakovanom nedostavení sa bez oznámenia môžu byť ďalšie termíny ponúknuté iba po individuálnej dohode. Tým nie sú obmedzené práva, ktoré podľa zákona nemožno obmedziť.'],
        },
        {
          title: '6. Súčinnosť pacienta a naliehavé príznaky',
          paragraphs: ['Oznámte dôležité ochorenia, lieky, alergie, tehotenstvo a dostupnú zubnú dokumentáciu a dodržiavajte dohodnuté pokyny po ošetrení. Webové formuláre a správy nie sú určené na urgentnú pomoc. Silné krvácanie, ťažkosti s dýchaním, výrazný opuch tváre alebo iný naliehavý stav si vyžadujú okamžitú miestnu pohotovostnú alebo lekársku pomoc.'],
        },
        {
          title: '7. Porovnanie cenovej ponuky pomocou AI',
          paragraphs: ['Automatizované porovnanie cenovej ponuky slúži iba na prvotnú orientáciu. Nie je diagnózou, lekárskou radou, liečebným plánom ani záväznou cenou. Nahraté dokumenty môžu byť neúplné alebo nesprávne vyhodnotené; vhodnosť liečby a cenu môže Crown Dental potvrdiť až po osobnom zubnom vyšetrení.'],
        },
        {
          title: '8. Zodpovednosť a dostupnosť stránky',
          paragraphs: ['Crown Dental poskytuje starostlivosť podľa platných odborných a právnych požiadaviek. Výsledok liečby ovplyvňujú individuálne biologické vlastnosti, existujúce ochorenia a spolupráca pacienta, preto nemožno zaručiť konkrétny medicínsky výsledok. Tieto podmienky nevylučujú zodpovednosť tam, kde to zákon zakazuje. Pri údržbe, výpadku siete alebo služby tretej strany môže byť web dočasne nedostupný.'],
        },
        {
          title: '9. Sťažnosti a riešenie sporov',
          paragraphs: ['Sťažnosť možno podať v ambulancii, poštou na adresu sídla alebo e-mailom na info@crowndental.hu. Uveďte svoje kontaktné údaje, opis problému a požadovaný spôsob riešenia. Spotrebiteľský spor, ktorý sa nepodarí vyriešiť priamo, možno predložiť príslušnému zmierovaciemu orgánu; podľa sídla poskytovateľa je ním Fejér Vármegyei Békéltető Testület, Hosszúsétatér 4–6, 8000 Székesfehérvár, Maďarsko, bekeltetes@fmkik.hu, +36 22 510 310.'],
        },
      ],
    },
    privacy: {
      eyebrow: 'Ochrana osobných údajov',
      title: 'Oznámenie o ochrane osobných údajov',
      lead: 'Ako Crown Dental zhromažďuje, používa, chráni a uchováva osobné údaje v súvislosti s ambulanciami a webovou stránkou.',
      updated: 'Aktualizované: 20. júla 2026',
      sections: [
        {
          title: '1. Prevádzkovateľ',
          items: [
            'Crown Dental Praxis és Labor Fogászati Kft.',
            'Sídlo: Petőfi Sándor utca 11, 2500 Esztergom, Maďarsko.',
            'Registračné číslo spoločnosti: 11-09-026431. Daňové číslo: 26537353-2-11.',
            'Kontakt pre ochranu údajov: info@crowndental.hu, +36 70 564 6837.',
          ],
        },
        {
          title: '2. Aké údaje spracúvame a na aký účel',
          items: [
            'Žiadosti o termín: meno, oslovenie, e-mail, telefón, zvolená ambulancia, požadované ošetrenie a správa, aby sme vás mohli kontaktovať a dohodnúť starostlivosť.',
            'Zubná starostlivosť: identifikačné, zdravotné, diagnostické, liečebné a platobné údaje potrebné na bezpečné ošetrenie a zákonnú zdravotnú dokumentáciu.',
            'Porovnanie ponuky pomocou AI: kontaktné údaje, nahratá ponuka alebo obrázok, rozpoznané položky ošetrenia a vytvorené porovnanie, aby sme mohli pripraviť požadovanú predbežnú analýzu.',
            'Kariéra: kontaktné a profesijné údaje a dokumenty, ktoré dobrovoľne priložíte k žiadosti.',
            'Marketing: kontaktné údaje, preferovaná ambulancia, jazyk, zdroj a čas súhlasu iba po udelení osobitného marketingového súhlasu.',
            'Bezpečnosť a prevádzka webu: IP adresa, protokoly požiadaviek, nastavenia súhlasu a ďalšie nevyhnutné technické údaje.',
          ],
        },
        {
          title: '3. Právne základy',
          paragraphs: ['Podľa účelu je spracúvanie potrebné na kroky vykonané na vašu žiadosť pred uzatvorením zmluvy, plnenie dohody o ošetrení, splnenie zdravotníckych, účtovných a iných zákonných povinností, oprávnený záujem, napríklad bezpečnosť služby alebo vybavenie nároku, alebo na základe súhlasu. Údaje o zdraví sa spracúvajú iba vtedy, ak existuje príslušný zdravotnícky právny základ alebo iná podmienka pre osobitnú kategóriu údajov. Marketingový súhlas môžete kedykoľvek odvolať.'],
        },
        {
          title: '4. Automatizované nástroje a komunikácia s pacientom',
          paragraphs: ['Analyzátor ponuky používa automatizovanú technológiu na rozpoznanie a porovnanie informácií, nevydáva však právne ani medicínsky záväzné rozhodnutie. Diagnózu, plán liečby a cenu možno potvrdiť až po vyšetrení zubným lekárom. Po ošetrení môže Crown Dental posielať servisné žiadosti o hodnotenie alebo pripomienky kontroly, ak súvisia so starostlivosťou o pacienta alebo ich umožňuje zákon. Reklamné newslettery sa posielajú iba s osobitným súhlasom.'],
        },
        {
          title: '5. Príjemcovia a poskytovatelia služieb',
          items: [
            'Supabase poskytuje chránené databázové služby.',
            'Vercel zabezpečuje hosting a doručovanie webovej stránky.',
            'Resend zabezpečuje odosielanie transakčných e-mailov.',
            'Google poskytuje službu AI analýzy a po príslušnom súhlase analytiku a meranie reklamy.',
            'Meta poskytuje meranie kampaní iba po udelení marketingového súhlasu.',
            'Sanity zabezpečuje správu verejného obsahu webu a blogu.',
          ],
          paragraphs: ['Poskytovatelia dostávajú iba údaje potrebné pre svoju úlohu a uplatňujú sa na nich príslušné zmluvné a bezpečnostné záruky. Pri spracúvaní mimo Európskeho hospodárskeho priestoru Crown Dental používa platný mechanizmus prenosu, napríklad rozhodnutie o primeranosti alebo štandardné zmluvné doložky, ak sa vyžadujú.'],
        },
        {
          title: '6. Doba uchovávania a bezpečnosť',
          paragraphs: ['Zdravotná dokumentácia sa uchováva počas lehôt stanovených maďarským právom. Zmluvné, účtovné a reklamačné záznamy sa uchovávajú počas príslušných zákonných lehôt. Neúspešné žiadosti o zamestnanie a predbežné dopyty sa vymažú alebo anonymizujú, keď už nie sú potrebné, s ohľadom na možné právne nároky. Marketingové údaje sa uchovávajú do odvolania súhlasu alebo iného odstránenia kontaktu. Crown Dental používa riadenie prístupov, šifrovaný prenos a primerané organizačné a technické opatrenia.'],
        },
        {
          title: '7. Vaše práva',
          items: [
            'Požiadať o prístup k osobným údajom a ich opravu.',
            'Požiadať o vymazanie alebo obmedzenie spracúvania, ak sú splnené zákonné podmienky.',
            'Namietať proti spracúvaniu založenému na oprávnenom záujme a požiadať o prenosnosť údajov, ak sa uplatňuje.',
            'Kedykoľvek odvolať súhlas bez vplyvu na zákonnosť spracúvania pred odvolaním.',
            'Podať sťažnosť maďarskému úradu NAIH, 1055 Budapest, Falk Miksa utca 9–11, ugyfelszolgalat@naih.hu, alebo príslušnému dozornému orgánu v krajine vášho obvyklého pobytu, ak to GDPR umožňuje.',
          ],
        },
        {
          title: '8. Kontakt a zmeny oznámenia',
          paragraphs: ['Otázky a žiadosti týkajúce sa ochrany údajov posielajte na info@crowndental.hu. Toto oznámenie môžeme aktualizovať pri zmene služieb, poskytovateľov alebo zákonných povinností; aktuálna verzia a dátum aktualizácie sú vždy uvedené na tejto stránke.'],
        },
      ],
    },
    cookies: {
      eyebrow: 'Nastavenia cookies',
      title: 'Oznámenie o používaní cookies',
      lead: 'Cookies a podobné technológie prehliadača používané na crowndental.hu, ich účel a možnosti vášho výberu.',
      updated: 'Aktualizované: 20. júla 2026',
      sections: [
        {
          title: '1. Čo sú cookies a podobné technológie?',
          paragraphs: ['Cookies sú malé súbory, ktoré ukladá váš prehliadač. Web používa na podobné účely aj lokálne úložisko a úložisko relácie. Niektoré technológie sú nevyhnutné na fungovanie stránky; analytické a reklamné technológie sa aktivujú až po udelení príslušného súhlasu.'],
        },
        {
          title: '2. Nevyhnutné úložisko',
          items: [
            'crown_cookie_consent uchováva váš výber, kým nevymažete údaje prehliadača alebo nezmeníte nastavenie.',
            'Nevyhnutné úložisko relácie krátkodobo uchováva potvrdenie rezervácie a stav formulára počas aktuálnej relácie prehliadača.',
            'Bezpečnostné a smerovacie informácie podporujú bezpečné požiadavky, jazykové verzie stránok a základné funkcie webu.',
          ],
          paragraphs: ['Nevyhnutné technológie nevyžadujú voliteľný súhlas s cookies, pretože bez nich by požadovaná služba nemohla spoľahlivo fungovať.'],
        },
        {
          title: '3. Analytika a reklama',
          items: [
            'Google Analytics nám po analytickom súhlase pomáha porozumieť súhrnnému používaniu stránky.',
            'Google Ads po marketingovom súhlase meria kampane a konverzie žiadostí o termín.',
            'Meta Pixel po marketingovom súhlase meria a optimalizuje kampane.',
          ],
          paragraphs: ['Voliteľné kategórie sú predvolene odmietnuté. Výber jednej kategórie automaticky nepovoľuje druhú.'],
        },
        {
          title: '4. Vložené mapy a externý obsah',
          paragraphs: ['Stránky ambulancií môžu obsahovať Google Maps. Načítaním vloženej mapy vzniká spojenie so spoločnosťou Google a môžu sa preniesť technické údaje, napríklad IP adresa. Odkazy na sociálne siete otvárajú web externého poskytovateľa, kde platia jeho vlastné pravidlá ochrany údajov a cookies.'],
        },
        {
          title: '5. Typické doby uchovávania a poskytovatelia',
          items: [
            '_ga a _ga_* (Google Analytics): bežne najviac dva roky podľa aktívnej konfigurácie Google.',
            '_gcl_au a _gcl_aw_* (Google Ads): bežne najviac 90 dní.',
            '_fbp (Meta): bežne najviac 90 dní.',
            'Voliteľné meracie služby poskytujú Google Ireland Limited / Google LLC a Meta Platforms Ireland Limited.',
          ],
        },
        {
          title: '6. Zmena alebo odvolanie výberu',
          paragraphs: ['Voliteľný súhlas môžete kedykoľvek zmeniť alebo odvolať cez položku „Nastavenia cookies“ v päte stránky. Úložisko môžete tiež vymazať alebo blokovať v nastaveniach prehliadača. Odvolanie nemá vplyv na zákonnosť predchádzajúceho spracúvania na základe súhlasu. Blokovanie nevyhnutného úložiska môže zabrániť správnemu fungovaniu niektorých formulárov alebo nastavení.'],
        },
      ],
    },
    imprint: {
      eyebrow: 'Údaje o spoločnosti',
      title: 'Právne informácie o prevádzkovateľovi',
      lead: 'Oficiálne údaje o prevádzkovateľovi crowndental.hu, jeho ambulanciách a technickom hostingu.',
      updated: 'Aktualizované: 20. júla 2026',
      sections: [
        {
          title: '1. Prevádzkovateľ webovej stránky',
          items: [
            'Spoločnosť: Crown Dental Praxis és Labor Fogászati Kft.',
            'Sídlo a ambulancia v Ostrihome: Petőfi Sándor utca 11, 2500 Esztergom, Maďarsko.',
            'Ambulancia v Budapešti: Királyok útja 55, 1039 Budapest, Maďarsko.',
            'Registračné číslo spoločnosti: 11-09-026431.',
            'Daňové číslo: 26537353-2-11.',
            'E-mail: info@crowndental.hu. Telefón: +36 70 564 6837.',
          ],
        },
        {
          title: '2. Poskytovateľ hostingu',
          paragraphs: ['Webová stránka je hosťovaná a doručovaná prostredníctvom cloudovej infraštruktúry spoločnosti Vercel Inc., USA.'],
        },
        {
          title: '3. Autorské práva a povolené použitie',
          paragraphs: ['Ak nie je uvedené inak, texty, dizajn, grafika, fotografie a ďalší pôvodný obsah tejto stránky sú chránené a patria Crown Dental alebo sa používajú so súhlasom. Rozmnožovanie, úprava alebo komerčné použitie vyžaduje predchádzajúci písomný súhlas, pokiaľ ho výslovne nepovoľuje zákon.'],
        },
        {
          title: '4. Medicínske a webové upozornenie',
          paragraphs: ['Informácie na stránke slúžia na všeobecné vzdelávanie a nenahrádzajú vyšetrenie, diagnózu, individuálne odporúčanie liečby ani urgentnú starostlivosť. Crown Dental sa usiluje o presnosť a dostupnosť webu, môže však obsah opraviť a nemôže zaručiť nepretržitý prístup. Povinné pravidlá zodpovednosti zostávajú nedotknuté.'],
        },
        {
          title: '5. Sťažnosti a zmierovacie konanie',
          paragraphs: ['V prípade sťažnosti najprv kontaktujte Crown Dental na info@crowndental.hu. Regionálnym zmierovacím orgánom podľa sídla poskytovateľa je Fejér Vármegyei Békéltető Testület, Hosszúsétatér 4–6, 8000 Székesfehérvár, Maďarsko; bekeltetes@fmkik.hu; +36 22 510 310.'],
        },
      ],
    },
  },
};

const noticeCopy: Record<InformationalLegalLocale, { before: string; link: string; after: string }> = {
  en: {
    before: 'This English version is provided to make the information easier to understand. If wording or interpretation differs, the ',
    link: 'Hungarian original',
    after: ' is the controlling version.',
  },
  sk: {
    before: 'Táto slovenská verzia slúži na zrozumiteľné informovanie. Ak sa znenie alebo výklad líši, rozhodujúce je ',
    link: 'maďarské pôvodné znenie',
    after: '.',
  },
};

export default function LocalizedLegalPage({
  document,
  locale,
}: {
  document: LegalDocument;
  locale: InformationalLegalLocale;
}) {
  const content = documents[locale][document];
  const notice = noticeCopy[locale];

  return (
    <main lang={locale} className="min-h-screen bg-slate-50 pb-20 pt-28 md:pt-36">
      <section className="mx-auto max-w-5xl px-4">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <header className="bg-slate-950 px-6 py-12 text-white md:px-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky-300">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> {content.eyebrow}
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">{content.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">{content.lead}</p>
            <p className="mt-5 text-sm font-bold text-slate-400">{content.updated}</p>
          </header>

          <div className="space-y-10 px-6 py-10 md:px-12 md:py-14">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
              <FileText className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <p>
                {notice.before}
                <Link href={`/${documentPaths[document]}`} hrefLang="hu-HU" className="font-black underline">
                  {notice.link}
                </Link>
                {notice.after}
              </p>
            </div>

            {content.sections.map((section) => (
              <section key={section.title} className="border-b border-slate-100 pb-9 last:border-0 last:pb-0">
                <h2 className="text-2xl font-black tracking-tight text-slate-950">{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-4 leading-8 text-slate-600">{paragraph}</p>
                ))}
                {section.items && (
                  <ul className="mt-5 space-y-3">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3 leading-7 text-slate-600">
                        <span aria-hidden="true" className="mt-2.5 h-2 w-2 flex-shrink-0 rounded-full bg-sky-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
