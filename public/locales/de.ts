import type { MessagesShape } from '../../src/i18n/appMessages';

const messages = {
  "UI": {
    "languagePicker": {
      "placeholder": "Sprache auswählen",
      "noResults": "Keine Ergebnisse",
      "ariaLabel": "Sprache ändern"
    },
    "darkModeToggle": {
      "ariaLabel": "Dunkelmodus umschalten"
    },
    "plan": {
      "open": "Kapazitätsplan",
      "title": "Kapazitätsplan",
      "empty": "Ihr Plan ist leer",
      "emptyHint": "Fügen Sie GPU-Konfigurationen hinzu, um zu beginnen",
      "summary": "{count, plural, one {{count} Artikel in Ihrem Plan} other {{count} Artikel in Ihrem Plan}}",
      "removeItem": "Artikel entfernen",
      "configure": "Konfigurieren",
      "edit": "Bearbeiten",
      "missingDetails": "Details erforderlich",
      "providerRegion": "{provider} · {region}",
      "providerOnly": "{provider}",
      "regionOnly": "{region}",
      "quantity": "Anzahl: {count}",
      "incrementQuantity": "Menge erhöhen",
      "decrementQuantity": "Menge verringern",
      "contactButton": "Vertrieb kontaktieren",
      "contactHint": "Teilen Sie uns Ihre Konfiguration für ein individuelles Angebot mit",
      "headerCta": "Angebot anfragen",
      "headerCtaLoading": "Wird hinzugefügt…",
      "headerCtaAdded": "Hinzugefügt"
    },
    "navLinks": {
      "home": {
        "linkText": "Startseite",
        "anchor": "start"
      },
      "about": {
        "linkText": "Über uns",
        "anchor": "uber-uns"
      },
      "contact": {
        "linkText": "Kontakt",
        "anchor": "kontakt"
      }
    },
    "commandPalette": {
      "empty": "Keine Ergebnisse gefunden.",
      "shortcutGroups": "Schnellzugriff",
      "settings": "Einstellungen",
      "navigation": "Navigation",
      "theme": "Design",
      "language": "Sprache",
      "dark": "Dunkel",
      "light": "Hell"
    },
    "navbar": {
      "skipNavigation": "Navigation überspringen",
      "openCommandPalette": "Drücken Sie {modifier} und K, um die Befehlspalette zu öffnen."
    },
    "legal": {
      "privacyTitle": "Datenschutz",
      "impressumTitle": "Impressum",
      "privacyStub": "Datenschutzerklärung folgt in Kürze.",
      "impressumStub": "Impressum folgt in Kürze."
    },
    "carouselA11y": {
      "skipCards": "Karten überspringen",
      "exitCardSection": "Kartenbereich verlassen"
    },
    "consent": {
      "bannerTitleLine1": "Uns ist wichtig",
      "bannerTitleLine2": "Ihre Privatsphäre",
      "bannerBody1": "Wir verwenden Cookies, um Inhalte und Anzeigen zu personalisieren, Social-Media-Funktionen bereitzustellen und unseren Traffic zu analysieren. Wir teilen Informationen über Ihre Nutzung unserer Website auch mit unseren Social-Media-, Werbe- und Analysepartnern, die diese mit anderen Informationen kombinieren können, die Sie ihnen bereitgestellt haben oder die sie aus Ihrer Nutzung ihrer Dienste gesammelt haben.",
      "bannerBody2": "Sie können Ihre Auswahl unten akzeptieren oder verwalten – oder jederzeit auf der Datenschutzseite.",
      "cookieAlt": "Ein zerbröckelnder Cookie.",
      "privacyPolicy": "Datenschutzerklärung",
      "acceptAll": "Alle Cookies akzeptieren",
      "customize": "Einstellungen anpassen",
      "necessaryOnly": "Nur notwendige Cookies",
      "confirmChoices": "Auswahl bestätigen",
      "aboutTitle": "Über Ihre Privatsphäre",
      "aboutBody": "Wir verarbeiten Ihre Daten, um Inhalte oder Werbung auszuspielen und die Auslieferung zu messen, um Erkenntnisse über unsere Website zu gewinnen. Wir teilen diese Informationen mit Partnern auf Basis von Einwilligung. Sie können Ihre Einwilligung je Zweck unten oder auf Partner-Ebene im Link unter jedem Zweck ausüben. Diese Entscheidungen werden an Vendors im Transparency and Consent Framework signalisiert.",
      "manageTitle": "Einwilligungs­einstellungen verwalten",
      "alwaysActive": "Immer aktiv",
      "categories": {
        "functional": {
          "name": "Funktionale Cookies",
          "description": "Diese Cookies ermöglichen erweiterte Funktionen und Personalisierung. Sie können von uns oder von Drittanbietern gesetzt werden, deren Dienste wir eingebunden haben. Wenn Sie diese Cookies nicht zulassen, funktionieren einige Dienste möglicherweise nicht richtig."
        },
        "targeting": {
          "name": "Targeting-Cookies",
          "description": "Diese Cookies machen Werbung relevanter und können von uns oder Werbepartnern gesetzt werden. Sie können ein Interessenprofil aufbauen und relevante Anzeigen auf unserer oder anderen Seiten zeigen. Sie speichern keine direkten personenbezogenen Daten, sondern basieren auf der eindeutigen Identifizierung Ihres Browsers und Geräts."
        },
        "performance": {
          "name": "Performance-Cookies",
          "description": "Diese Cookies ermöglichen uns, Besuche und Traffic-Quellen zu zählen, um die Leistung der Website zu messen und zu verbessern. Sie helfen zu verstehen, welche Seiten am beliebtesten sind und wie Besucher sich bewegen. Alle Informationen sind aggregiert und anonym. Ohne diese Cookies wissen wir nicht, wann Sie die Seite besucht haben."
        },
        "necessary": {
          "name": "Notwendige Cookies",
          "description": "Diese Cookies sind für die Funktion der Website erforderlich und können in unseren Systemen nicht abgeschaltet werden. Sie werden in der Regel nur als Reaktion auf Ihre Aktionen gesetzt, z. B. Datenschutz­einstellungen, Login oder Formulare. Sie können den Browser blockieren lassen, dann funktionieren Teile der Seite möglicherweise nicht. Sie speichern keine persönlich identifizierbaren Informationen."
        },
        "security": {
          "name": "Sicherheit gewährleisten, Betrug verhindern und Fehler beheben",
          "description": "Ihre Daten können genutzt werden, um ungewöhnliche und möglicherweise betrügerische Aktivitäten zu überwachen und zu verhindern und Systeme sicher laufen zu lassen. Sie können auch helfen, Probleme bei der Auslieferung von Inhalten und Anzeigen zu beheben."
        }
      }
    }
  },
  "HOME": {
    "title": "GPUcloud.store – Alles für Ihre HPC-Anforderungen",
    "description": "GPUcloud.store – GPU-Cloud-Beratung, Multi-Cloud-Orchestrierung und Hybrid-Cloud-Implementierung für High-Performance-Computing-Workloads.",
    "hero": {
      "eyebrow": "High-Performance Cloud ohne Vermutungen",
      "headline": "Alles für Ihre",
      "headlineHighlight": "HPC-Anforderungen.",
      "subtitle": "GPUcloud.store hilft Teams beim Entwurf und Betrieb effizienter GPU-First-Infrastruktur – von Multi-Cloud-Orchestrierung bis hin zu Hybrid-Setups mit On-Premise-Hardware. Wir beseitigen das Rauschen, damit Ihre Workloads skalieren statt Ihr Budget.",
      "tags": {
        "consulting": "GPU-Cloud-Beratung",
        "orchestration": "Multi-Cloud-Orchestrierung",
        "hybrid": "Hybrid- & On-Prem-HPC",
        "sourcing": "Hardware-Beschaffung"
      },
      "cta": {
        "primary": "Discovery-Call buchen",
        "secondary": "Mehr erfahren"
      },
      "meta": "Ansässig in der EU. Verbunden mit Anbietern und Partnern in Europa und darüber hinaus.",
      "card": {
        "title": "HPC-Kontrollpanel",
        "badge": "Live-Beratung",
        "metrics": {
          "utilization": {
            "label": "GPU-Auslastung",
            "value": "92%",
            "sub": "Nach Kapazitätsausgleich"
          },
          "spend": {
            "label": "Cloud-Ausgaben",
            "value": "-34%",
            "sub": "vs. vorherige Architektur"
          }
        },
        "footnote": "Multi-Cloud- und Hybrid-Setups müssen kein Labyrinth sein.",
        "footnoteHighlight": "Wir entwerfen die Karte, stellen die richtigen Anbieter vor und helfen Ihnen beim Versand."
      }
    },
    "about": {
      "eyebrow": "Über uns",
      "title": "Wer steckt hinter GPUcloud.store?",
      "subtitle": "GPUcloud.store basiert auf einer einfachen Idee: High-Performance-Infrastruktur sollte verständlich, verhandelbar und auf Ihre Geschäftsziele ausgerichtet sein – nicht nur auf Ihre Benchmarks.",
      "text": {
        "intro": "Wir sind Cloud-Berater mit einem globalen unabhängigen Rechenzentrum-Netzwerk, das von Si Exchange betrieben wird.",
        "mission": "Wir befinden uns an der Schnittstelle von technischer Infrastruktur, kommerzieller Realität und grenzüberschreitenden Netzwerken. Das bedeutet, Ihnen zu helfen, nicht nur die \"schnellste Hardware\" zu wählen, sondern die Architektur und Partnerschaften, die Ihre Roadmap tatsächlich voranbringen.",
        "approach": "Mit Zugang zu einem breiten Netzwerk unabhängiger Rechenzentren und GPU-Anbieter helfen wir Ihnen, Kapazität, Preisgestaltung und Zuverlässigkeit zu navigieren, während Ihre Teams sich auf den Aufbau von Produkten konzentrieren können – nicht auf die Jagd nach Hardware."
      },
      "pills": {
        "strategy": "GPU- & HPC-Strategie",
        "design": "Cloud- & Hybrid-Design",
        "network": "Globales Rechenzentrum-Netzwerk",
        "optimization": "Wachstums- & Kostenoptimierung"
      },
      "card": {
        "title": "Wie wir typischerweise helfen",
        "items": {
          "orchestration": {
            "title": "Multi-Cloud-Orchestrierung:",
            "text": "Bewerten und entwerfen Sie Setups über große Anbieter und spezialisierte GPU-Clouds hinweg."
          },
          "hybrid": {
            "title": "Hybrid-Implementierungen:",
            "text": "Kombinieren Sie On-Premise- oder Colocation-Hardware mit Cloud-Kapazität auf eine Weise, die nicht zur operativen Hölle wird."
          },
          "sourcing": {
            "title": "Anbieter- & Hardware-Beschaffung:",
            "text": "Helfen Sie bei der Navigation durch GPU-Verfügbarkeit, Preisgestaltung und vertrauenswürdige Partner in unabhängigen Rechenzentren weltweit."
          },
          "alignment": {
            "title": "Kosten- & Wachstumsabstimmung:",
            "text": "Übersetzen Sie Infrastrukturentscheidungen in KPI-Auswirkungen: Durchsatz, Latenz, Marge und Laufzeit."
          }
        }
      }
    },
    "contact": {
      "eyebrow": "Kontakt",
      "title": "Erzählen Sie uns von Ihren Workloads",
      "subtitle": "Ob Sie gegen GPU-Knappheit, unvorhersehbare Rechnungen oder ein chaotisches Multi-Cloud-Setup kämpfen, wir können mit einem kurzen, fokussierten Gespräch beginnen.",
      "text": {
        "intro": "Nutzen Sie das Formular, um Ihre aktuelle Situation zu skizzieren: was Sie ausführen, wo es läuft und was nicht so funktioniert, wie es sollte.",
        "helpTitle": "Wir helfen typischerweise:",
        "helpItems": {
          "ai": "KI / ML-Teams beim Skalieren von Training oder Inferenz",
          "startups": "Startups beim Wechsel von Single-Cloud zu Multi-Cloud",
          "companies": "Unternehmen, die Hybrid- oder On-Prem-GPU-Flotten in Betracht ziehen"
        },
        "response": "Sie erhalten eine direkte Antwort – keine automatisierte Vertriebssequenz, keine generische Präsentation.",
        "email": "Bevorzugen Sie E-Mail? Sie können uns auch erreichen unter",
        "emailAddress": "shrey@gpucloud.store"
      },
      "form": {
        "name": {
          "label": "Name",
          "placeholder": "Ada Lovelace"
        },
        "company": {
          "label": "Unternehmen",
          "placeholder": "Ihr Unternehmen / Projekt"
        },
        "email": {
          "label": "Geschäftliche E-Mail",
          "placeholder": "sie@unternehmen.de"
        },
        "role": {
          "label": "Rolle",
          "placeholder": "CTO, Leiter Technik, Gründer…"
        },
        "message": {
          "label": "Was führen Sie heute aus?",
          "placeholder": "Beschreiben Sie kurz Ihre Workloads, aktuellen Anbieter und was Sie verbessern möchten (Kosten, Zuverlässigkeit, Latenz, Kapazität usw.)."
        },
        "hint": "Dieses Formular sendet Einreichungen an einen serverlosen Endpunkt auf dieser Website, der an E-Mail weiterleiten kann.",
        "submit": "Nachricht senden",
        "submitting": "Wird gesendet…",
        "success": "Danke – Ihre Nachricht wurde gesendet.",
        "error": "Bitte füllen Sie Name, E-Mail und Nachricht aus.",
        "networkError": "Netzwerkfehler. Bitte versuchen Sie es später erneut.",
        "submitError": "Einreichung fehlgeschlagen. Bitte versuchen Sie es erneut."
      }
    },
    "footer": {
      "copyright": "© GPUcloud.store",
      "links": {
        "about": "Über uns",
        "contact": "Kontakt",
        "email": "E-Mail"
      }
    }
  },
  "TEST": {
    "hero": {
      "title": "GPUCloud",
      "featureLabel": "Merkmal",
      "carousel": {
        "cards": [
          {
            "id": "fitted",
            "feeling": "Passgenau",
            "title": "Workload-optimierte Konfigurationen",
            "text": "Jeder Node und jedes Cluster wird nach Kosten, Latenz und Stabilität bewertet — präzise auf Ihren Workload abgestimmt."
          },
          {
            "id": "vetted",
            "feeling": "Geprüft",
            "title": "Risikobewertete Anbieter",
            "text": "Strom, Kühlung, Netz und regionale Risiken werden quantifiziert und sichtbar gemacht — Transparenz, die kaum eine Plattform bietet."
          },
          {
            "id": "stable",
            "feeling": "Stabil",
            "title": "Verlässliche GPU-Kapazität",
            "text": "Vertragsgestützte Nodes von geprüften Anbietern — ohne Churn, ohne Volatilität, ohne Überraschungen."
          },
          {
            "id": "aligned",
            "feeling": "Abgestimmt",
            "title": "Hardware, die zum Ziel passt",
            "text": "Training, Inference, Batch oder Experimente — jede Konfiguration spiegelt klare Rollen und Leistungsprofile wider."
          },
          {
            "id": "structured",
            "feeling": "Strukturiert",
            "title": "Topologiebewusstes Cluster-Planning",
            "text": "Multi-Node-Gruppen berücksichtigen Interconnects, Skalierung und regionale Constraints, damit Performance hält."
          },
          {
            "id": "purposeful",
            "feeling": "Zielgerichtet",
            "title": "Vorlagen für echte Workloads",
            "text": "Node-Shapes und Cluster-Muster für Durchsatz, Latenz und Stabilität — keine willkürliche Hardwareliste."
          },
          {
            "id": "consistent",
            "feeling": "Konsistent",
            "title": "Planbare Bereitstellung",
            "text": "Klare Lead Times und verlässliche Lieferfenster. Fit umfasst auch operative Sicherheit."
          },
          {
            "id": "coherent",
            "feeling": "Kohärent",
            "title": "Klarheit über Anbieter hinweg",
            "text": "Einheitliche Specs, Terminologie und Risikomodelle — damit heterogene Infrastruktur vergleichbar wird."
          },
          {
            "id": "informed",
            "feeling": "Fundiert",
            "title": "Datengetriebene Auswahl",
            "text": "Wir zeigen Anbieter-, Regions- und Node-Eigenschaften, damit Sie Konfigurationen mit klaren Trade-offs wählen."
          },
          {
            "id": "supported",
            "feeling": "Begleitet",
            "title": "Engineering-first Beratung",
            "text": "Direkte Hilfe bei Nodes, Regionen und Stabilitätsprofilen — zugeschnitten auf Ihre Workload-Charakteristik."
          },
          {
            "id": "assured",
            "feeling": "Absichert",
            "title": "SLA-orientierte Koordination",
            "text": "Wir managen Anbieterzusagen, Eskalationen und Verifikation, damit Ihr Cluster korrekt und konsistent provisioniert wird."
          },
          {
            "id": "steady",
            "feeling": "Ruhig",
            "title": "Infrastruktur, für Sie erledigt",
            "text": "Wir übernehmen Sourcing, Logistik und Kommunikation über Anbieter hinweg — und machen den Prozess planbar."
          }
        ]
      },
      "controls": {
        "previous": "Zurück",
        "next": "Weiter"
      },
      "subtitle": "Echte GPU-Kapazität finden. Den Rest übernehmen wir."
    },
    "spotlight": {
      "eyebrow": "Wie geht es weiter",
      "title": "Kapazität in drei Schritten bestätigen",
      "subtitle": "Schnell, klar und ohne Rätselraten.",
      "steps": [
        {
          "title": "Anforderungen teilen",
          "description": "Workload, Region, Zeitplan und Budget.",
          "detail": "2–3 Minuten, unverbindlich."
        },
        {
          "title": "Wir bestätigen Kapazität",
          "description": "Wir prüfen Anbieter nach Lead Time, Preis und Eignung.",
          "detail": "Mehrere Regionen und Redundanz."
        },
        {
          "title": "Angebot + Plan erhalten",
          "description": "Klare Optionen für On-Demand oder Reserved.",
          "detail": "Wir empfehlen den schnellsten Weg."
        }
      ]
    },
    "contact": {
      "eyebrow": "Kontakt aufnehmen",
      "title": "Angebot anfordern",
      "subtitle": "Teilen Sie uns Ihre GPU-Konfigurationsanforderungen mit und wir melden uns mit einem individuellen Angebot."
    },
    "haloSearch": {
      "placeholder": "GPU-Konfigurationen suchen...",
      "ariaLabel": "GPUCloud suchen",
      "dropdownHeader": "Passende GPU-Konfigurationen",
      "hourlyRate": "Stundensatz",
      "pricingNote": "Endgültige Preise werden im Angebot anhand von Region, Laufzeit und Volumen bestätigt.",
      "close": "Schließen",
      "addToPlan": "Zum Plan hinzufügen",
      "saveConfiguration": "Konfiguration speichern",
      "sizesLabel": "Größen: {sizes}",
      "regionsLabel": "Regionen: {regions}",
      "regionsMoreSuffix": "… (+{count} weitere)",
      "gpuCluster": "{count}-GPU-Cluster",
      "providerDetails": "Anbieter: {name} ({location})",
      "pricingFallback": "Preis auf Anfrage"
    },
    "contactForm": {
      "search": {
        "title": "GPU-Konfigurationen suchen"
      },
      "selected": {
        "title": "Ausgewählte Konfigurationen ({count})",
        "subtitle": "Diese Einträge werden Ihrer Anfrage beigefügt. Sie können sie entfernen oder weitere Konfigurationen hinzufügen.",
        "empty": "Noch keine Konfigurationen ausgewählt. Suchen Sie oben und fügen Sie Konfigurationen hinzu, um sie in Ihre Angebotsanfrage aufzunehmen.",
        "hint": "Diese Konfigurationen werden in Ihrer Anfrage mitgesendet.",
        "confirmDuringCall": "Wir bestätigen die Verfügbarkeit von Anbieter und Region im Gespräch.",
        "quantity": "Menge: {quantity} × {price}",
        "remove": "Konfiguration entfernen"
      },
      "help": {
        "title": "Wobei wir unterstützen:",
        "items": {
          "infrastructure": "KI-Trainings- und Inferenzinfrastruktur",
          "cluster": "Individuelle GPU-Cluster-Konfigurationen",
          "hybrid": "Hybrid-Cloud- und On-Premise-Lösungen"
        },
        "description": "Sie hängen fest? Unser Team hilft Ihnen dabei, die richtige Mischung aus Hardware, Cloud-Anbietern oder Hybrid-Architektur zu wählen. Teilen Sie uns gerne Hürden oder Wunschlisten mit – wir berücksichtigen das in Ihrem Angebot.",
        "emailIntro": "Sie können uns auch direkt per E-Mail erreichen unter",
        "emailAddress": "shrey@gpucloud.store"
      },
      "form": {
        "title": "Kontaktformular",
        "subtitle": "Geben Sie Ihre Kontaktdaten und zusätzliche Anforderungen an. Wir melden uns zeitnah mit den nächsten Schritten.",
        "labels": {
          "name": "Name *",
          "company": "Unternehmen",
          "email": "Geschäftliche E-Mail *",
          "role": "Rolle",
          "message": "Anforderungen"
        },
        "placeholders": {
          "name": "Ada Lovelace",
          "company": "Ihr Unternehmen / Projekt",
          "email": "sie@unternehmen.de",
          "role": "CTO, Leiter Technik, Gründer…",
          "message": "Beschreiben Sie Kontext, der nicht durch die GPU-Liste abgedeckt ist."
        },
        "footnote": "* Pflichtfelder. Bitte fügen Sie oben GPU-Konfigurationen hinzu ODER geben Sie Details im Kommentarfeld an (mindestens eines ist erforderlich). Wir antworten in der Regel innerhalb von 24 Stunden."
      },
      "hint": "Dieses Formular sendet Einsendungen an einen serverlosen Endpunkt auf dieser Website, der an E-Mail weiterleiten kann.",
      "submit": {
        "default": "Nachricht senden",
        "sending": "Wird gesendet…"
      },
      "status": {
        "success": "Nachricht erfolgreich gesendet! Wir melden uns in Kürze.",
        "error": "Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt per E-Mail.",
        "networkError": "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut."
      },
      "validation": {
        "nameRequired": "Name ist erforderlich",
        "emailRequired": "E-Mail ist erforderlich",
        "emailInvalid": "Ungültige E-Mail-Adresse",
        "messageOrConfigs": "Bitte wählen Sie GPU-Konfigurationen aus oder geben Sie Details im Kommentarfeld an."
      }
    },
    "availability": {
      "anchor": "ausgewaehlte-verfuegbarkeit",
      "title": "Verfügbarkeit im Fokus",
      "subtitle": "Ausgewählte GPU-Kapazität mit Live-Verfügbarkeit über Anbieter hinweg.",
      "liveLabel": "Live-Verfügbarkeit",
      "inStockLabel": "Auf Lager",
      "limitedLabel": "Begrenzte Verfügbarkeit",
      "cta": "Zum Plan hinzufügen",
      "added": "Hinzugefügt",
      "avgLabel": "Ø",
      "memoryLabel": "{memory} VRAM",
      "perHour": "/Std.",
      "priceUnknown": "Preis auf Anfrage"
    },
    "plan": {
      "tbdShort": "Konfigurationsdetails offen",
      "tbdDetails": "Wir bestätigen Anbieter, Region und Größe gemeinsam.",
      "tbdPrice": "Preis offen"
    },
    "useCases": {
      "anchor": "anwendungsfaelle",
      "title": "Was bauen Sie?",
      "subtitle": "Wählen Sie einen Anwendungsfall, um empfohlene Konfigurationen zu sehen.",
      "helper": "Sie sind unsicher oder haben mehrere Use-Cases? Wir helfen gern mit einer individuellen Konfiguration.",
      "helperCta": "Kontaktieren Sie uns",
      "configureAnchor": "Vorlage konfigurieren",
      "templateCount": "{count, plural, one {# Vorlagenoption} other {# Vorlagenoptionen}}",
      "items": {
        "llmTraining": {
          "name": "LLM-Training",
          "description": "Training und Feinabstimmung großer Sprachmodelle.",
          "examples": [
            "Frontier-/MoE-Pretraining",
            "Llama- & Qwen-Feintuning",
            "Multi-Node-NVLink-Cluster",
            "Long-Context-Training"
          ]
        },
        "inference": {
          "name": "KI-Inferenz",
          "description": "Hochdurchsatz-Serving und Inferenz.",
          "examples": [
            "Large-Context-Chat-APIs",
            "Latenzarme Endpunkte",
            "Batch-/Offline-Scoring",
            "High-QPS-Serving"
          ]
        },
        "computerVision": {
          "name": "Computer Vision",
          "description": "Bild- und Videoverarbeitung.",
          "examples": [
            "Objekterkennung",
            "Bildsegmentierung",
            "Videoanalytik",
            "Multimodale Vision-Modelle"
          ]
        },
        "dataScience": {
          "name": "Data Science",
          "description": "Großskalige Analysen und ETL-Pipelines.",
          "examples": [
            "GPU-Dataframes / SQL",
            "Feature Engineering",
            "Großskaliges ETL",
            "Embedding-Pipelines"
          ]
        },
        "research": {
          "name": "Forschung",
          "description": "Experimentelle und akademische Workloads.",
          "examples": [
            "Neue Architekturen",
            "Ablationsstudien",
            "Hyperparameter-Sweeps",
            "Benchmark neuer SKUs"
          ]
        },
        "development": {
          "name": "Entwicklung",
          "description": "Prototyping und Iteration.",
          "examples": [
            "Schnelle Iteration",
            "Eval-Harnesses",
            "CI-/Smoke-Tests",
            "Prototyp-Validierung"
          ]
        }
      }
    },
    "templatesModal": {
      "whyTitle": "Warum das wichtig ist",
      "considerationsTitle": "Wichtige Überlegungen",
      "templatesTitle": "Einsatzbereite Vorlagen",
      "templatesSubtitle": "Vorkonfigurierte Setups, optimiert für {useCase}.",
      "addToQuote": "Zum Angebot hinzufügen",
      "addToQuoteLoading": "Wird hinzugefügt…",
      "addToQuoteAdded": "Hinzugefügt",
      "addAndConfigure": "Hinzufügen & konfigurieren",
      "recommended": "Empfohlen",
      "priceLabel": "Preis",
      "priceTbd": "Preis auf Anfrage",
      "itemsLabel": "Konfiguration",
      "planDetails": "Use-Case: {useCase} - Tier: {tier}",
      "close": "Schließen",
      "tiers": {
        "enterprise": "Enterprise",
        "professional": "Professional",
        "standard": "Standard",
        "highVolume": "Hohes Volumen",
        "balanced": "Ausgewogen",
        "costOptimized": "Kostenoptimiert",
        "entry": "Einstieg",
        "dataIntensive": "Datenintensiv",
        "cuttingEdge": "Avantgarde",
        "academic": "Akademisch",
        "team": "Team",
        "starter": "Starter"
      },
      "prices": {
        "llmTraining": {
          "enterprise": "$55-85/Std.",
          "professional": "$35-55/Std.",
          "standard": "$16-28/Std."
        },
        "inference": {
          "highVolume": "$18-30/Std.",
          "balanced": "$6-10/Std.",
          "costOptimized": "$1.5-3/Std."
        },
        "computerVision": {
          "professional": "$6-10/Std.",
          "standard": "$3-5/Std.",
          "entry": "$1.5-2.5/Std."
        },
        "dataScience": {
          "dataIntensive": "$10-16/Std.",
          "balanced": "$8-14/Std.",
          "standard": "$1.5-2.5/Std."
        },
        "research": {
          "cuttingEdge": "$18-30/Std.",
          "professional": "$8-14/Std.",
          "academic": "$1.5-2.5/Std."
        },
        "development": {
          "team": "$3-6/Std.",
          "standard": "$1.5-2.5/Std.",
          "starter": "$1-1.5/Std."
        }
      },
      "content": {
        "llmTraining": {
          "why": "LLM-Training braucht hohe Speicherbandbreite und schnelle Interconnects. Blackwell- und Hopper-SXM-Knoten verkürzen Time-to-Train bei Frontier- und Long-Context-Modellen.",
          "considerations": [
            "Modellgröße und Kontextlänge bestimmen den HBM-Bedarf",
            "Multi-GPU-Training braucht NVLink / schnelles Fabric",
            "Größere Batches steigern Effizienz, erhöhen aber VRAM",
            "H200/B200-HBM zählt oft mehr als reine FLOPs"
          ]
        },
        "inference": {
          "why": "Inference priorisiert Tokens/$ und Tail-Latenz. High-Memory-GPUs für Long-Context-Serving; Ada L40S für kosteneffizienten Durchsatz.",
          "considerations": [
            "Kontextlänge und Concurrent Requests treiben VRAM",
            "Durchsatz skaliert mit Replicas und Batching",
            "INT8/FP8/FP16 spart Speicher und hebt Tokens/s",
            "L40S bleibt starkes Preis/Leistungs-Verhältnis im Mid-Tier"
          ]
        },
        "computerVision": {
          "why": "Vision-Workloads brauchen ausgewogene Compute- und Speicherressourcen für hochauflösende Bilder, Video und multimodale Modelle.",
          "considerations": [
            "Auflösung und Batch-Größe bestimmen den VRAM-Bedarf",
            "Video und Multimodal favorisieren größere Ada-GPUs",
            "Echtzeit-Pipelines brauchen niedrige Latenz",
            "Training vs Inferenz wollen oft unterschiedliche SKUs"
          ]
        },
        "dataScience": {
          "why": "GPU-Dataframes, SQL und Embedding-Pipelines profitieren von großem HBM und CUDA/ROCm-Beschleunigung.",
          "considerations": [
            "Datensatzgröße bestimmt den Speicherbedarf",
            "RAPIDS-ähnliche Stacks brauchen CUDA-fähige GPUs",
            "Multi-GPU hilft bei Jobs größer als der Speicher",
            "Storage-I/O bremst oft vor der GPU"
          ]
        },
        "research": {
          "why": "Forschung braucht aktuelle Architekturen und die Flexibilität, Experimente schnell hoch- und runterzuskalieren.",
          "considerations": [
            "Neuere SKUs ermöglichen längeren Kontext und dichtere MoE-Läufe",
            "Pro Experiment skalieren, um Kosten zu steuern",
            "Mixed Precision bleibt toolchain-übergreifend wichtig",
            "Schnelle Iteration schlägt oft maximale Clustergröße"
          ]
        },
        "development": {
          "why": "Dev-Umgebungen brauchen responsive GPUs für Iteration bei kontrollierten Always-on-Kosten.",
          "considerations": [
            "Schnelle Iteration braucht flotte Single Nodes",
            "Die meisten Dev-Workloads brauchen kein Multi-GPU",
            "Always-on verstärkt die Stundenkosten",
            "Prod-SKUs möglichst in kleinerem Maßstab spiegeln"
          ]
        }
      },
      "bestForLabel": "Ideal für",
      "bestFor": {
        "llmTraining": {
          "enterprise": "Frontier-/MoE-Pretraining auf Blackwell (70B+ dense, große MoE)",
          "professional": "Long-Context- und Large-Model-Training auf H200",
          "standard": "Fine-Tuning und Mid-Size-Training auf H100 SXM"
        },
        "inference": {
          "highVolume": "Large-Context- / Frontier-Model-Serving",
          "balanced": "High-QPS-APIs und Batch-Inference auf L40S",
          "costOptimized": "Low-Traffic-Endpoints und Staging"
        },
        "computerVision": {
          "professional": "High-Res-Video, multimodal und Training",
          "standard": "Detection/Segmentation und Echtzeit-Pipelines",
          "entry": "Prototyping und kleine Datasets"
        },
        "dataScience": {
          "dataIntensive": "Sehr große HBM-Jobs (Working Sets 100GB+)",
          "balanced": "GPU-ETL / Analytics auf Hopper PCIe",
          "standard": "Explorative Analyse und leichte Transforms"
        },
        "research": {
          "cuttingEdge": "Frontier-Experimente mit H200-Speicherbedarf",
          "professional": "Lab-Workloads auf H100 SXM",
          "academic": "Akademische Single-GPU-Arbeit"
        },
        "development": {
          "team": "Geteilte Team-Umgebungen auf L40S",
          "standard": "Einzel-Dev und Eval-Harnesses",
          "starter": "Leichte Smoke-Tests und Prototypen"
        }
      },
      "tradeoffs": {
        "performance": "Leistung",
        "cost": "Kosten",
        "simplicity": "Einfachheit"
      }
    },
    "catalog": {
      "via": "via",
      "sourceSeparator": ", ",
      "snapshotDate": "· {date}"
    },
    "gpuModal": {
      "selectRegion": "Region wählen",
      "selectSizeProvider": "Größe & Anbieter wählen",
      "changeRegion": "Region ändern",
      "changeSelection": "Auswahl ändern",
      "regionLabel": "Region: {region}",
      "providerColumn": "Anbieter",
      "gpuCount": "{count, plural, one {# GPU} other {# GPUs}}",
      "configurationDetails": "Konfigurationsdetails",
      "tabs": {
        "overview": "Übersicht",
        "risk": "Risiko & Leistung",
        "infrastructure": "Infrastruktur"
      },
      "overview": {
        "clusterTitle": "{count, plural, one {{count} × {model} GPU} other {{count} × {model} GPUs}}",
        "provider": "Anbieter",
        "configuration": "Konfiguration",
        "leadTime": "Lead Time: {leadTime}",
        "terms": "Konditionen",
        "minTerm": "Min. {term}",
        "flexibleBilling": "Flexible Abrechnung",
        "support": "Support",
        "supportValue": "24/7 Technischer Support",
        "supportHint": "Enterprise-SLA"
      },
      "metrics": {
        "heading": "Risiko- & Leistungsmetriken — {provider}, {region}",
        "unavailable": "Risikowerte sind für dieses Angebot noch nicht verfügbar. Bis zur Bewertung der Facilities wird n/a angezeigt.",
        "na": "n/a",
        "howEvaluated": "Wie werden diese bewertet?",
        "labels": {
          "naturalDisaster": "Naturkatastrophen",
          "electricityReliability": "Stromzuverlässigkeit",
          "fireRisk": "Brandrisiko",
          "securityBreach": "Sicherheitsvorfall",
          "powerEfficiency": "Energieeffizienz",
          "costEfficiency": "Kosteneffizienz",
          "networkReliability": "Netzverlässigkeit",
          "coolingCapacity": "Kühlkapazität"
        },
        "tooltips": {
          "naturalDisaster": "Wahrscheinlichkeit von Ausfällen durch Umwelt­ereignisse (Erdbeben, Überflutung, Stürme, Hurrikane, Waldbrand) über die Vertragslaufzeit.",
          "electricityReliability": "Stabilität der Stromversorgung inkl. Netz, Eigen­erzeugung, UPS-Redundanz und historischer Uptime.",
          "fireRisk": "Wirksamkeit von Brand­erkennung, -prävention, -löschung und baulicher Abschottung.",
          "securityBreach": "Stärke physischer und operativer Sicherheit gegen unbefugten Zugriff oder Störung.",
          "powerEfficiency": "Gesamte Strom- und Kühl­effizienz, besonders unter dauerhafter High-Density-GPU-Last.",
          "costEfficiency": "Strukturelle Kosteneffizienz des GPU-Betriebs an diesem Standort (Energie, Kühlung, Skaleneffekte).",
          "networkReliability": "Carrier-Diversität, Faser­pfad-Redundanz, Routing-Hardware und historische Netz­performance.",
          "coolingCapacity": "Fähigkeit, High-Density-GPU-Lasten (20–100+ kW/Rack) dauerhaft ohne Throttling zu tragen."
        }
      },
      "infrastructure": {
        "title": "Infrastrukturdetails",
        "regionalAvailability": "Regionale Verfügbarkeit"
      }
    }
  }
} as const satisfies MessagesShape;

export default messages;
