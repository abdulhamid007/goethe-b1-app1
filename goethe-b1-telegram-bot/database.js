const EINHEITEN_META = [
  { id: 1, title: "Einheit 1 — Modelltest 1", topics: "Computersucht, Festival der Kulturen, Teilzeitjobs, Schuluniformen, Auslandsjahr", ready: true, pages: "S. 6–19" },
  { id: 2, title: "Einheit 2 — Modelltest 2", topics: "Schüleraustausch Paris, Garten-Knigge, Werratal, Restaurants, Stadt vs. Land", ready: false, pages: "S. 20–33" },
  { id: 3, title: "Einheit 3 — Modelltest 3", topics: "Kinderpatenschaft, Schülerzeitung, Umwelt-Projekt, Bücher, Handy für Kinder", ready: false, pages: "S. 34–47" },
  { id: 4, title: "Einheit 4 — Modelltest 4", topics: "Tierheim-Hund, Berufsausbildung, Musikschule, Haushaltshilfe, Bio-Lebensmittel", ready: false, pages: "S. 48–61" },
  { id: 5, title: "Einheit 5 — Modelltest 5", topics: "Fahrprüfung, Deutschlandstipendium, Neue Medien, Urlaub, Führerschein mit 16", ready: false, pages: "S. 62–75" },
  { id: 6, title: "Einheit 6 — Modelltest 6", topics: "Probleme am Arbeitsplatz, Ehrenamt, Bio-Box, Kinoprogramm, Markenkleidung", ready: false, pages: "S. 76–89" },
  { id: 7, title: "Einheit 7 — Modelltest 7", topics: "Erste Liebe, Wohnen in Leipzig, Traumgarten, Freizeitseminare, Rauchverbot", ready: false, pages: "S. 90–103" },
  { id: 8, title: "Einheit 8 — Modelltest 8", topics: "Autounfall, Yoga im Kindergarten, Vorlesepreis, Möbel, Soziale Netzwerke", ready: false, pages: "S. 104–117" },
  { id: 9, title: "Einheit 9 — Modelltest 9", topics: "Aupair in Hamburg, Schrebergarten, Generationen verbinden, Vereine", ready: false, pages: "S. 118–131" },
  { id: 10, title: "Einheit 10 — Modelltest 10", topics: "Geburt im Flugzeug, Wildtiere in der Stadt, Odysseum, Feiern, Kindergarten", ready: false, pages: "S. 132–145" },
  { id: 11, title: "Einheit 11 — Modelltest 11", topics: "Zahnarzt-Alltag, Social Media für Haustiere, Herbstmarkt, Geschenke, Tempolimit", ready: false, pages: "S. 146–159" },
  { id: 12, title: "Einheit 12 — Zertifikat B1", topics: "Alleinerziehende Mutter, Bio-Erdgas, Fahrradzone München, Wohnungssuche, Dialekt", ready: false, pages: "S. 160–173" }
];

const EXAM_DATA = {
  1: {
    name: "Goethe-Zertifikat B1 — Einheit 1 (Modelltest 1)",
    subtitle: "Module B1 Testbuch • Nicolas Vlachos (S. 6–19)",
    modules: {
      lesen: {
        title: "Modul 1: Lesen",
        totalMinutes: 65,
        parts: [
          {
            partNum: 1,
            title: "Teil 1 (Arbeitszeit: 10 Minuten)",
            instruction: "Lesen Sie den Text und die Aufgaben 1 bis 6 dazu. Wählen Sie: Sind die Aussagen Richtig oder Falsch?",
            sourceTitle: "gingerblog.de — Familie, Freizeit und vieles mehr",
            text: "Wie sich Computersüchtige verhalten, wussten wir früher nicht. Bis wir einen in der Familie hatten: unseren Sohn. Irgendwann saß er nämlich nur noch vor dem Computer. Früher hatte er viele Freunde, aber plötzlich beschränkten sich seine Kontakte nur noch auf ein Minimum. In die Schule ging er nur noch mit großem inneren Widerstand und seinen Abschluss schaffte er gerade so. Nach dem Schulabschluss war er weder bereit, eine Ausbildung anzufangen noch einen Job zu suchen. Immerhin nahm er nach einiger Zeit tatsächlich einen Job an, aber nur, weil wir darauf bestanden. Wenn er nach Haus kam, war er so müde, dass er sofort einschlief. Er hielt das nicht lange aus und hörte wieder auf zu arbeiten. Er ging zur Beratungsstelle für Jugendliche. Dort bekam er die nötige Beratung und Hilfe, seine Computersucht unter Kontrolle zu bringen. Er las und unternahm viel und lernte Geige spielen. Nach einiger Zeit trat er auch einem Verein für Umweltschutz bei und fing an Fußball zu spielen. Dort lernte er viele nette Leute kennen. Heute können wir mit Sicherheit sagen, dass unser Sohn von seiner Computersucht befreit ist.",
            example: { q: "0. Der Sohn war immer schon ein Einzelgänger.", ans: "Falsch" },
            type: "rf",
            questions: [
              { id: "L1", num: 1, text: "Der Sohn hat die Schule nicht beendet.", correct: "Falsch", explanation: "seinen Abschluss schaffte er gerade so." },
              { id: "L2", num: 2, text: "Die Eltern wollten, dass der Sohn eine Arbeitsstelle findet.", correct: "Richtig", explanation: "weil wir darauf bestanden." },
              { id: "L3", num: 3, text: "Die Arbeit war zu anstrengend für den Sohn.", correct: "Richtig", explanation: "war er so müde, dass er sofort einschlief." },
              { id: "L4", num: 4, text: "In der Beratungsstelle hat der Sohn viele nette Leute kennen gelernt.", correct: "Falsch", explanation: "Im Verein für Umweltschutz und beim Fußball." },
              { id: "L5", num: 5, text: "Computer stellen für den Sohn keine Gefahr mehr dar.", correct: "Richtig", explanation: "von seiner Computersucht befreit ist." },
              { id: "L6", num: 6, text: "Der Sohn hat viel Geld ausgegeben, um sich von seiner Sucht zu befreien.", correct: "Falsch", explanation: "nicht umsonst = nicht ohne Mühe." }
            ]
          },
          {
            partNum: 2,
            title: "Teil 2 (Arbeitszeit: 20 Minuten)",
            instruction: "Lesen Sie die Texte aus der Presse und die Aufgaben 7 bis 12 dazu. Wählen Sie a, b oder c.",
            subtexts: [
              {
                sourceTitle: "Text A: Friedensstadt Augsburg — Festival der Kulturen",
                text: "Das Festival der Kulturen lädt die Augsburger/-innen und Gäste zu interkulturellen Veranstaltungen in der Augsburger Innenstadt ein. Alle Vereine sind herzlich zur Mitarbeit eingeladen. Schlagen Sie professionelle Künstler vor. Es besteht die Möglichkeit, bis zu drei Personen aus Musik, Tanz, Schauspiel und Literatur zu benennen. Insbesondere sind Künstler gefragt, die zu aktuellen Phänomenen unserer Gesellschaft arbeiten.",
                example: { q: "0. Das Festival der Kulturen ...", ans: "a) findet im Zentrum von Augsburg statt." },
                questions: [
                  { id: "L7", num: 7, text: "Das Programm des Festivals der Kulturen ...", options: { a: "soll unter anderem aus Beiträgen professioneller Künstler bestehen.", b: "können sowohl Privatleute als auch Vereine mitgestalten.", c: "enthält vor allem Beiträge, die den Frieden thematisieren." }, correct: "a", explanation: "schlagen Sie professionelle Künstler vor" },
                  { id: "L8", num: 8, text: "Wer sich an der Gestaltung des Programms beteiligen will, ...", options: { a: "soll mindestens drei Künstler aus verschiedenen Bereichen vorschlagen.", b: "kann höchstens drei Personen aus der Kunstszene vorschlagen.", c: "muss selber Künstler sein." }, correct: "b", explanation: "bis zu drei Personen" },
                  { id: "L9", num: 9, text: "Die kulturellen Beiträge der Künstler ...", options: { a: "dürfen auf keinen Fall religiöse Themen ansprechen.", b: "können auch mit gesellschaftlichen Themen zu tun haben.", c: "sollen die Bürger für soziale Probleme sensibilisieren." }, correct: "b", explanation: "zu aktuellen Phänomenen unserer Gesellschaft" }
                ]
              },
              {
                sourceTitle: "Text B: 95 Prozent deutsch",
                text: "Dalan G. kommt aus der Türkei und ist heute 38 Jahre alt. Er arbeitet als selbständiger Sounddesigner. Doch schon der Begriff Integration regt ihn auf. Namik G., Dalans Vater, lebt seit 44 Jahren in Deutschland und sagt: Ich fühle mich 100 Prozent türkisch. Dalan sagt: Aber ich bin zu 95 Prozent deutsch.",
                questions: [
                  { id: "L10", num: 10, text: "In diesem Text geht es ...", options: { a: "um einen Deutschen, der im Ausland aufgewachsen ist.", b: "um den Sohn eines Gastarbeiters in Deutschland.", c: "um die Geschichte eines Bandarbeiters." }, correct: "b", explanation: "Sohn eines türkischen Arbeiters in Deutschland." },
                  { id: "L11", num: 11, text: "Der Sounddesigner regt sich auf, ...", options: { a: "wenn man von Integration spricht.", b: "wenn sich die Leute nicht integrieren wollen.", c: "dass Einheimische keine Ausländer akzeptieren." }, correct: "a", explanation: "Doch schon der Begriff Integration regt ihn auf." },
                  { id: "L12", num: 12, text: "Dalan fühlt sich ...", options: { a: "von seinen Eltern nicht verstanden.", b: "viel mehr wie ein Deutscher als wie ein Türke.", c: "nicht wohl in Deutschland." }, correct: "b", explanation: "zu 95 Prozent deutsch." }
                ]
              }
            ]
          },
          {
            partNum: 3,
            title: "Teil 3 (Arbeitszeit: 10 Minuten)",
            instruction: "Lesen Sie die Situationen 13 bis 19 und die Anzeigen a bis j.",
            type: "matching",
            ads: [
              { id: "a", title: "Arbeiten auf dem Bauernhof", text: "Alter Bauernhof zu sanieren. Wer handwerklich geschickt ist, meldet sich." },
              { id: "b", title: "Nette Bedienung gesucht! (Beispiel)", text: "Restaurant sucht Serviceangestellte für die Sommersaison." },
              { id: "c", title: "Suche Köchin", text: "Einmal die Woche kochen und 2-3 Std. helfen." },
              { id: "d", title: "Altenhilfe", text: "Hilfskraft für Haushalt und Betreuung einer 76-jährigen Rentnerin." },
              { id: "e", title: "Hostessen gesucht", text: "Französisch sprechende Hostessen für Messe in Düsseldorf (23.-26. Juli)." },
              { id: "f", title: "Büroarbeit und anderes", text: "Zeitraum Oktober–Dezember Verkaufsstand und Büroarbeiten." },
              { id: "g", title: "Für einen guten Zweck", text: "Einsatz für DRK, WWF & Co., mindestens 4 Wochen." },
              { id: "h", title: "Lust aufs Reisen?", text: "Saisonale Reiseleiterin im Sultanat Oman (6 Monate)." },
              { id: "i", title: "Hilfskraft für Garten", text: "Schüler/-in für Gartenpflege alle 2-3 Wochen ca. 1-3 Std." },
              { id: "j", title: "Au-Pair im Ausland", text: "Gastfamilien weltweit kennen lernen." }
            ],
            questions: [
              { id: "L13", num: 13, text: "Natalie Balmain aus Marseille studiert in Köln und sucht Arbeit in den Semesterferien.", correct: "e", explanation: "Anzeige e" },
              { id: "L14", num: 14, text: "Jessica sucht einen Job, bei dem sie ihre Englischkenntnisse verbessern kann.", correct: "0", explanation: "0" },
              { id: "L15", num: 15, text: "Petra Schöning sucht eine Tätigkeit als Haushaltshilfe.", correct: "d", explanation: "Anzeige d" },
              { id: "L16", num: 16, text: "Franz möchte ein paar Stunden im Monat arbeiten.", correct: "i", explanation: "Anzeige i" },
              { id: "L17", num: 17, text: "Angelika Fischer möchte für eine Zeit in einem fremden Land arbeiten.", correct: "h", explanation: "Anzeige h" },
              { id: "L18", num: 18, text: "Julia Leupin sucht bis Jahresende einen kurzfristigen Bürojob.", correct: "f", explanation: "Anzeige f" },
              { id: "L19", num: 19, text: "Der Rentner Hugo Walther hat handwerkliche Fähigkeiten.", correct: "a", explanation: "Anzeige a" }
            ]
          },
          {
            partNum: 4,
            title: "Teil 4 (Arbeitszeit: 15 Minuten)",
            instruction: "Ist die Person für Schuluniformen? (JA oder NEIN)",
            type: "jn",
            questions: [
              { id: "L20", num: 20, person: "Gina, 20 Köln", text: "Schuluniformen finde ich gut! Weniger Stress am Kleiderschrank.", correct: "JA", explanation: "JA" },
              { id: "L21", num: 21, person: "Franziska, 16", text: "Also, ich bin gegen eine Schuluniform.", correct: "NEIN", explanation: "NEIN" },
              { id: "L22", num: 22, person: "Peter, 17", text: "Also, ich finde, das bringt rein gar nichts!", correct: "NEIN", explanation: "NEIN" },
              { id: "L23", num: 23, person: "Astrid, 16", text: "Stärkung des Gemeinschaftsgefühls durch Schuluniformen.", correct: "JA", explanation: "JA" },
              { id: "L24", num: 24, person: "Karl, 16", text: "Das geht einfach nicht.", correct: "NEIN", explanation: "NEIN" },
              { id: "L25", num: 25, person: "Max, 45", text: "Was ist mit meinen Persönlichkeitsrechten?", correct: "NEIN", explanation: "NEIN" },
              { id: "L26", num: 26, person: "Philipp, 16", text: "Ich finde Schuluniformen richtig gut!", correct: "JA", explanation: "JA" }
            ]
          },
          {
            partNum: 5,
            title: "Teil 5 (Arbeitszeit: 10 Minuten)",
            instruction: "Lesen Sie die Aufgaben 27 bis 30 und den Text dazu.",
            sourceTitle: "Education First — Austauschjahr USA oder Kanada",
            text: "Visum: Wichtig für USA oder Kanada. Flüge: Gutes Preis-Leistungsverhältnis. Ankunft: Transfer zur Gastfamilie oder ins Internat. Versicherungen: Kranken-, Unfall- und Haftpflichtversicherung muss bestehen.",
            example: { q: "0. Education First ...", ans: "b) organisiert Schulaustauschprogramme." },
            type: "abc",
            questions: [
              { id: "L27", num: 27, text: "Die Teilnehmer am Bildungsprogramm ...", options: { a: "wohnen bei einer Gastfamilie oder in einem Internat.", b: "werden am Flughafen von der Gastfamilie abgeholt.", c: "regen sich über die Flugreise auf." }, correct: "a", explanation: "a" },
              { id: "L28", num: 28, text: "Ein Visum braucht man, wenn ...", options: { a: "man sich in Kanada und den USA aufhalten will.", b: "man eine Reise nach Amerika buchen will.", c: "eine Gruppe von Schülern ins Ausland reist." }, correct: "a", explanation: "a" },
              { id: "L29", num: 29, text: "Die Teilnehmer ...", options: { a: "versichert das Gastland.", b: "werden von der Gastfamilie versichert.", c: "müssen während ihres Aufenthaltes im Gastland versichert sein." }, correct: "c", explanation: "c" },
              { id: "L30", num: 30, text: "Education First sorgt ...", options: { a: "für kostenlose Flüge.", b: "für preiswerte Flüge nach Kanada und in die USA.", c: "für Ehemaligentreffen." }, correct: "b", explanation: "b" }
            ]
          }
        ]
      },
      horen: {
        title: "Modul 2: Hören",
        totalMinutes: 40,
        parts: [
          {
            partNum: 1,
            title: "Teil 1 (2x hören)",
            instruction: "Sie hören nun fünf kurze Texte.",
            maxPlays: 2,
            tracks: [
              {
                trackId: "H1_T1",
                label: "Text 1 (Polizei)",
                script: "Am Hauptbahnhof blieb der Mantel einer 78-jährigen Dame in der Zugtür hängen. Sie konnte sich nur mit großer Mühe befreien. Die Polizei bittet Zeugen, sich zu melden.",
                questions: [
                  { id: "H1", num: 1, type: "rf", text: "Die Polizei sucht Leute, die den Unfall gesehen haben.", correct: "Richtig", explanation: "Richtig" },
                  { id: "H2", num: 2, type: "abc", text: "Die alte Frau ...", options: { a: "konnte sich nur schwer aus der Zugtür befreien.", b: "ist auf den Bahnsteig gefallen.", c: "hat eine schwere Verletzung." }, correct: "a", explanation: "a" }
                ]
              },
              {
                trackId: "H1_T2",
                label: "Text 2 (Anrufbeantworter)",
                script: "Hallo Iris, hier ist Ulli. Wegen Beas Hochzeit nächsten Samstag: Ich habe noch keine Ahnung, was ich ihr schenken soll!",
                questions: [
                  { id: "H3", num: 3, type: "rf", text: "Bea will heiraten.", correct: "Richtig", explanation: "Richtig" },
                  { id: "H4", num: 4, type: "abc", text: "Ulli ruft an, weil sie ...", options: { a: "Iris einladen will.", b: "zusammen kaufen will.", c: "nicht weiß, was sie Bea schenken soll." }, correct: "c", explanation: "c" }
                ]
              },
              {
                trackId: "H1_T3",
                label: "Text 3 (Sprachschule)",
                script: "Guten Tag Frau Scherwinkel, hier Hanke. Der Französischkurs am Dienstag fällt aus. Wir haben nur noch am Samstag einen Platz. Bitte rufen Sie uns an.",
                questions: [
                  { id: "H5", num: 5, type: "rf", text: "Frau Scherwinkel hat die Wahl zwischen zwei Französischkursen.", correct: "Falsch", explanation: "Falsch" },
                  { id: "H6", num: 6, type: "abc", text: "Herr Hanke möchte, dass Frau Scherwinkel ...", options: { a: "den Kurs besucht.", b: "andere anruft.", c: "sich bei ihm meldet." }, correct: "c", explanation: "c" }
                ]
              },
              {
                trackId: "H1_T4",
                label: "Text 4 (Supermarkt)",
                script: "Italienische Salami heute für 1 Euro 99 statt 2 Euro 99! Bei jedem Einkauf ab 10 Euro ein Los für unser Gewinnspiel!",
                questions: [
                  { id: "H7", num: 7, type: "rf", text: "Wer an dem Gewinnspiel teilnehmen will, muss für mindestens 10 Euro einkaufen.", correct: "Richtig", explanation: "Richtig" },
                  { id: "H8", num: 8, type: "abc", text: "Welches Produkt ist einen Euro billiger als sonst?", options: { a: "der Sekt", b: "der Ketchup", c: "die Salami" }, correct: "c", explanation: "c" }
                ]
              },
              {
                trackId: "H1_T5",
                label: "Text 5 (Sport)",
                script: "Im Eröffnungsspiel der neuen Saison gewann Mainz gegen Koblenz, weil die Spieler in sehr guter Form waren.",
                questions: [
                  { id: "H9", num: 9, type: "rf", text: "Mit dem Spiel Mainz gegen Koblenz wurde die Saison eröffnet.", correct: "Richtig", explanation: "Richtig" },
                  { id: "H10", num: 10, type: "abc", text: "Die Mannschaft aus Mainz hat gewonnen, weil ...", options: { a: "die Spieler in sehr guter Form waren.", b: "sie den besseren Trainer hat.", c: "Gegner verletzt waren." }, correct: "a", explanation: "a" }
                ]
              }
            ]
          },
          {
            partNum: 2,
            title: "Teil 2 (1x hören)",
            instruction: "Busreise nach Mainz.",
            maxPlays: 1,
            tracks: [
              {
                trackId: "H1_P2",
                label: "Stadtführung Mainz",
                script: "Das Eisgrub-Bräu ist auch für Leute geeignet, die kein Bier trinken. Die Bücherbar Lomo ist ein Café. In St. Stephan sind die kunstvollen blauen Fenster von Marc Chagall besonders. In der Altstadt kann man gut einkaufen und alle Wege in Mainz sind kurz.",
                questions: [
                  { id: "H11", num: 11, type: "abc", text: "Das Eisgrub-Bräu ist für Leute geeignet, die ...", options: { a: "mehr an Qualität interessiert sind.", b: "kein Bier mögen.", c: "morgens Hunger haben." }, correct: "b", explanation: "b" },
                  { id: "H12", num: 12, type: "abc", text: "Die Bücherbar Lomo ist ...", options: { a: "ein Café.", b: "eine Buchhandlung.", c: "eine Bibliothek." }, correct: "a", explanation: "a" },
                  { id: "H13", num: 13, type: "abc", text: "Was ist das Besondere an St. Stephan?", options: { a: "ein Gemälde", b: "die kunstvollen Fenster", c: "der Innenraum" }, correct: "b", explanation: "b" },
                  { id: "H14", num: 14, type: "abc", text: "In der Altstadt gibt es ...", options: { a: "viele Kirchen.", b: "viel Kultur.", c: "die Gelegenheit zum Einkaufen." }, correct: "c", explanation: "c" },
                  { id: "H15", num: 15, type: "abc", text: "In Mainz ...", options: { a: "kann man sich nur nachts unterhalten.", b: "gibt es zwei Nachtclubs.", c: "sind die Wege kurz." }, correct: "c", explanation: "c" }
                ]
              }
            ]
          },
          {
            partNum: 3,
            title: "Teil 3 (1x hören)",
            instruction: "Gespräch über einen Kochkurs.",
            maxPlays: 1,
            tracks: [
              {
                trackId: "H1_P3",
                label: "Gespräch im Café",
                script: "Christina hat abends Zeit zum Kochen. Im Kurs gibt es Tipps für den Einkauf. Jede Gruppe kocht ein anderes Gericht und jeder sagt seine Meinung dazu. Man lernt es nicht so schnell, aber alle Teilnehmer lieben es, gut zu essen. Christina meldet sich wieder an.",
                questions: [
                  { id: "H16", num: 16, type: "rf", text: "Christina hat nach der Arbeit keine Zeit zum Kochen.", correct: "Falsch", explanation: "Falsch" },
                  { id: "H17", num: 17, type: "rf", text: "Die Kursteilnehmer bekommen auch Tipps für den Kauf von Lebensmitteln.", correct: "Richtig", explanation: "Richtig" },
                  { id: "H18", num: 18, type: "rf", text: "Alle kochen dasselbe Gericht.", correct: "Falsch", explanation: "Falsch" },
                  { id: "H19", num: 19, type: "rf", text: "Jeder sagt seine Meinung zu den Gerichten der anderen.", correct: "Richtig", explanation: "Richtig" },
                  { id: "H20", num: 20, type: "rf", text: "Man lernt schnell, was richtiges und gutes Kochen bedeutet.", correct: "Falsch", explanation: "Falsch" },
                  { id: "H21", num: 21, type: "rf", text: "Alle Teilnehmer lieben es gut zu essen.", correct: "Richtig", explanation: "Richtig" },
                  { id: "H22", num: 22, type: "rf", text: "Christina will sich beim nächsten Kochkurs anmelden.", correct: "Richtig", explanation: "Richtig" }
                ]
              }
            ]
          },
          {
            partNum: 4,
            title: "Teil 4 (2x hören)",
            instruction: "A = Moderator, B = Breitner, C = Wild",
            maxPlays: 2,
            tracks: [
              {
                trackId: "H1_P4",
                label: "Diskussion: Studium oder Ausbildung",
                script: "Breitner (B) sagt: Studium entwickelt die Persönlichkeit, Schiffbauingenieur ist interessanter, Eltern waren einverstanden. Wild (C) sagt: Verdienst ist nicht so wichtig, Karriere allein macht nicht glücklich, gute Noten allein reichen nicht, Theorie und Praxis sind positiv, Job soll Herausforderung sein.",
                questions: [
                  { id: "H23", num: 23, type: "abc3", text: "Das Studium trägt auch zur Entwicklung der Persönlichkeit bei.", correct: "B", explanation: "B" },
                  { id: "H24", num: 24, type: "abc3", text: "Schiffbauingenieur ist ein interessanterer Beruf als Bootsbauer.", correct: "B", explanation: "B" },
                  { id: "H25", num: 25, type: "abc3", text: "Wie viel man verdient, ist nicht so wichtig.", correct: "C", explanation: "C" },
                  { id: "H26", num: 26, type: "abc3", text: "Die Karriere allein macht nicht glücklich.", correct: "C", explanation: "C" },
                  { id: "H27", num: 27, type: "abc3", text: "Gute Noten allein reichen nicht, um die Ausbildung zu schaffen.", correct: "C", explanation: "C" },
                  { id: "H28", num: 28, type: "abc3", text: "Es ist positiv, dass man theoretisch und praktisch ausgebildet wird.", correct: "C", explanation: "C" },
                  { id: "H29", num: 29, type: "abc3", text: "Die Eltern waren mit dem Berufswunsch ihres Kindes gleich einverstanden.", correct: "B", explanation: "B" },
                  { id: "H30", num: 30, type: "abc3", text: "Der Job sollte interessant sein und eine Herausforderung darstellen.", correct: "C", explanation: "C" }
                ]
              }
            ]
          }
        ]
      },
      schreiben: {
        title: "Modul 3: Schreiben",
        totalMinutes: 60,
        tasks: [
          {
            id: "S1", num: 1, title: "Aufgabe 1 (20 Min • ca. 80 Wörter)",
            prompt: "Sie sind aus den Ferien zurückgekehrt. Schreiben Sie einer Freundin / einem Freund davon.",
            bullets: ["Wo haben Sie Ihre Ferien verbracht? Warum?", "Wie haben Sie Ihre Ferien verbracht?", "Wann passt es ihr/ihm, dass Sie sich treffen."],
            targetWords: 80, keywords: ["ferien", "urlaub", "weil", "treffen", "wann", "zeit", "liebe", "lieber", "grüße"]
          },
          {
            id: "S2", num: 2, title: "Aufgabe 2 (25 Min • ca. 80 Wörter)",
            prompt: "Diskussionssendung zum Thema „Frauenfußball und Damentennis“.",
            quoteText: "PETER, 18: Damentennis ist ästhetisch, während Fußball die unweiblichste Sportart ist.",
            bullets: ["Schreiben Sie nun Ihre Meinung (ca. 80 Wörter)."],
            targetWords: 80, keywords: ["meinung", "denke", "finde", "peter", "frauen", "sport", "fußball", "gleichberechtigung"]
          },
          {
            id: "S3", num: 3, title: "Aufgabe 3 (15 Min • ca. 40 Wörter)",
            prompt: "Sie haben eine blaue Jeanshose (Größe 42) bestellt, aber eine schwarze (Größe 44) erhalten.",
            bullets: ["Erklären Sie der Firma, warum die Hose umgetauscht werden muss (ca. 40 Wörter)."],
            targetWords: 40, keywords: ["sehr geehrte", "bestellt", "jeans", "42", "44", "umtauschen", "mit freundlichen grüßen"]
          }
        ]
      },
      sprechen: {
        title: "Modul 4: Sprechen",
        totalMinutes: 15,
        parts: [
          { partNum: 1, title: "Teil 1: Gemeinsam etwas planen", situation: "3-tägiges Rock-Festival besuchen (Tage, Uhrzeit, Karten, Treffpunkt).", examinerPrompt: "Hallo! Hast du Lust, nächstes Wochenende auf das Rock-Festival zu gehen?" },
          { partNum: 2, title: "Teil 2: Ein Thema präsentieren", situation: "Thema A (Papierloser Unterricht) oder Thema B (Soziale Netzwerke) präsentieren.", examinerPrompt: "Bitte beginnen Sie jetzt mit Ihrer Präsentation." },
          { partNum: 3, title: "Teil 3: Über ein Thema sprechen", situation: "Rückmeldung geben und Fragen beantworten.", examinerPrompt: "Vielen Dank! Glauben Sie, dass es in Zukunft keine gedruckten Bücher mehr gibt?" }
        ]
      }
    }
  }
};

const VOCAB_DATABASE = [
  { einheit: 1, topic: "Medien & Alltag", de: "die Computersucht", uz: "kompyuterga qaramlik", example: "Er brauchte Hilfe, um seine Computersucht unter Kontrolle zu bringen." },
  { einheit: 1, topic: "Medien & Alltag", de: "die Beratungsstelle", uz: "maslahat markazi", example: "Er ging zur Beratungsstelle für Jugendliche." },
  { einheit: 1, topic: "Kultur & Gesellschaft", de: "die Gleichberechtigung", uz: "teng huquqlilik", example: "Gleichberechtigung im Sport ist wichtig." },
  { einheit: 2, topic: "Nachbarschaft & Wohnen", de: "die Rücksichtnahme", uz: "e'tiborlilik, hurmat", example: "In der Nachbarschaft sind Rücksichtnahme und Toleranz gefordert." },
  { einheit: 3, topic: "Soziales & Umwelt", de: "die Patenschaft", uz: "homiylik, vasiylik", example: "Sie hat die Patenschaft für ein Kind übernommen." },
  { einheit: 4, topic: "Behörden & Leben", de: "die Aufenthaltsgenehmigung", uz: "yashash ruxsatnomasi", example: "Ausländer benötigen eine Aufenthaltsgenehmigung." },
  { einheit: 5, topic: "Verkehr & Studium", de: "das Stipendium", uz: "stipendiya", example: "Das Deutschlandstipendium unterstützt Studenten." },
  { einheit: 6, topic: "Arbeit & Engagement", de: "ehrenamtlich", uz: "ko'ngilli ravishda", example: "Viele Jugendliche engagieren sich ehrenamtlich." },
  { einheit: 7, topic: "Beziehungen & Gesundheit", de: "das Nichtraucherschutzgesetz", uz: "chekmaydiganlarni himoya qilish qonuni", example: "Viele finden das Gesetz positiv." },
  { einheit: 8, topic: "Unfall & Recht", de: "die fristlose Kündigung", uz: "shartnomani zudlik bilan bekor qilish", example: "Wer keine Miete zahlt, riskiert eine Kündigung." },
  { einheit: 9, topic: "Alltag & Reisen", de: "die Reisegepäckversicherung", uz: "sayohat yukini sug'urtalash", example: "Eine Reisegepäckversicherung schützt bei Verlust." },
  { einheit: 10, topic: "Natur & Technik", de: "die Artenvielfalt", uz: "bioxilma-xillik", example: "Städte sind Inseln der Artenvielfalt." },
  { einheit: 11, topic: "Verkehr & Umwelt", de: "das Tempolimit", uz: "tezlik cheklovi", example: "Auf Autobahnen wird über ein Tempolimit diskutiert." },
  { einheit: 12, topic: "Umwelt & Verkehr", de: "das Warndreieck", uz: "avariya to'xtash belgisi", example: "Nach einem Unfall muss man das Warndreieck aufstellen." }
];

const REDEMITTEL_CATEGORIES = [
  {
    id: "schreiben_email",
    title: "Schreiben — Aufgabe 1: Do'stga xat",
    phrases: [
      { de: "Lieber [Name], / Liebe [Name],", uz: "Qadrli [Ism]," },
      { de: "Ich schreibe dir heute, weil ich dir von ... erzählen möchte.", uz: "Bugun senga ... haqida aytib bermoqchi bo'lganim uchun yozyapman." },
      { de: "Wann hast du Zeit, damit wir uns treffen können?", uz: "Uchrashishimiz uchun qachon vaqting bor?" }
    ]
  },
  {
    id: "schreiben_meinung",
    title: "Schreiben — Aufgabe 2: Fikr bildirish",
    phrases: [
      { de: "Meiner Meinung nach hat [Name] recht / nicht recht, wenn er sagt, dass...", uz: "Mening fikrimcha, [Ism] ... deganida haq / nohaq." },
      { de: "Zusammenfassend möchte ich sagen, dass ...", uz: "Xulosa qilib aytmoqchimanki, ..." }
    ]
  },
  {
    id: "sprechen_teil1",
    title: "Sprechen — Teil 1: Birgalikda rejalashtirish",
    phrases: [
      { de: "Ich schlage vor, dass wir uns um 15 Uhr treffen.", uz: "Men soat 15:00 da uchrashishimizni taklif qilaman." },
      { de: "Abgemacht! Dann machen wir das genau so.", uz: "Kelishdik! Unda xuddi shunday qilamiz." }
    ]
  }
];