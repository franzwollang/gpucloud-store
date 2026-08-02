import type { MessagesShape } from '../../src/i18n/appMessages';

const messages = {
  "UI": {
    "languagePicker": {
      "placeholder": "Choisissez une langue",
      "noResults": "Aucun résultat trouvé",
      "ariaLabel": "Changer de langue"
    },
    "darkModeToggle": {
      "ariaLabel": "Basculer le mode sombre"
    },
    "plan": {
      "open": "Plan de capacité",
      "title": "Plan de Capacité",
      "empty": "Votre plan est vide",
      "emptyHint": "Ajoutez des configurations GPU pour commencer",
      "summary": "{count, plural, one {{count} article dans votre plan} other {{count} articles dans votre plan}}",
      "removeItem": "Supprimer l'article",
      "configure": "Configurer",
      "edit": "Modifier",
      "missingDetails": "Détails requis",
      "providerRegion": "{provider} · {region}",
      "providerOnly": "{provider}",
      "regionOnly": "{region}",
      "quantity": "Quantité : {count}",
      "incrementQuantity": "Augmenter la quantité",
      "decrementQuantity": "Diminuer la quantité",
      "contactButton": "Contacter un spécialiste",
      "contactHint": "Partagez votre configuration pour obtenir un devis personnalisé",
      "headerCta": "Demander un devis",
      "headerCtaLoading": "Ajout…",
      "headerCtaAdded": "Ajouté"
    },
    "navLinks": {
      "home": {
        "linkText": "Accueil",
        "anchor": "accueil"
      },
      "about": {
        "linkText": "À propos",
        "anchor": "a-propos"
      },
      "contact": {
        "linkText": "Contact",
        "anchor": "contact"
      }
    },
    "commandPalette": {
      "empty": "Aucun résultat.",
      "shortcutGroups": "Groupes de raccourcis",
      "settings": "Paramètres",
      "navigation": "Navigation",
      "theme": "Thème",
      "language": "Langue",
      "dark": "Sombre",
      "light": "Clair"
    },
    "navbar": {
      "skipNavigation": "Passer la navigation",
      "openCommandPalette": "Appuyez sur {modifier} et K pour ouvrir la palette de commandes."
    },
    "legal": {
      "privacyTitle": "Confidentialité",
      "impressumTitle": "Mentions légales",
      "privacyStub": "Politique de confidentialité à venir.",
      "impressumStub": "Mentions légales à venir."
    },
    "carouselA11y": {
      "skipCards": "Passer les cartes",
      "exitCardSection": "Quitter la section des cartes"
    },
    "consent": {
      "bannerTitleLine1": "Nous tenons à",
      "bannerTitleLine2": "votre vie privée",
      "bannerBody1": "Nous utilisons des cookies pour personnaliser le contenu et les publicités, fournir des fonctionnalités de réseaux sociaux et analyser notre trafic. Nous partageons aussi des informations sur votre utilisation de notre site avec nos partenaires sociaux, publicitaires et analytics, qui peuvent les combiner avec d’autres informations que vous leur avez fournies ou qu’ils ont collectées via leurs services.",
      "bannerBody2": "Vous pouvez accepter ou gérer vos choix ci-dessous, ou à tout moment sur la page de confidentialité.",
      "cookieAlt": "Un cookie qui s’émiette.",
      "privacyPolicy": "Politique de confidentialité",
      "acceptAll": "Accepter tous les cookies",
      "customize": "Personnaliser les paramètres",
      "necessaryOnly": "Cookies nécessaires uniquement",
      "confirmChoices": "Confirmer mes choix",
      "aboutTitle": "À propos de votre vie privée",
      "aboutBody": "Nous traitons vos données pour diffuser du contenu ou des publicités et mesurer cette diffusion afin d’obtenir des insights sur notre site. Nous partageons ces informations avec nos partenaires sur la base du consentement. Vous pouvez exercer votre droit au consentement par finalité ci-dessous ou au niveau partenaire via le lien sous chaque finalité. Ces choix seront signalés aux vendors du Transparency and Consent Framework.",
      "manageTitle": "Gérer les préférences de consentement",
      "alwaysActive": "Toujours actif",
      "categories": {
        "functional": {
          "name": "Cookies fonctionnels",
          "description": "Ces cookies permettent des fonctionnalités et une personnalisation avancées. Ils peuvent être déposés par nous ou par des tiers dont les services sont intégrés. Sans eux, certains services peuvent mal fonctionner."
        },
        "targeting": {
          "name": "Cookies de ciblage",
          "description": "Ces cookies rendent la publicité plus pertinente et peuvent être déposés par nous ou nos partenaires publicitaires. Ils peuvent établir un profil d’intérêts et afficher des publicités pertinentes sur notre site ou d’autres. Ils ne stockent pas d’informations personnelles directes, mais identifient de façon unique votre navigateur et appareil."
        },
        "performance": {
          "name": "Cookies de performance",
          "description": "Ces cookies nous permettent de compter les visites et sources de trafic pour mesurer et améliorer les performances du site. Ils aident à savoir quelles pages sont les plus ou moins populaires et comment les visiteurs naviguent. Toutes les informations sont agrégées et anonymes. Sans eux, nous ne saurons pas quand vous avez visité le site."
        },
        "necessary": {
          "name": "Cookies nécessaires",
          "description": "Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés dans nos systèmes. Ils sont généralement déposés uniquement en réponse à vos actions (préférences de confidentialité, connexion, formulaires). Vous pouvez les bloquer dans le navigateur, mais certaines parties du site peuvent alors ne plus fonctionner. Ils ne stockent pas d’informations personnelles identifiables."
        },
        "security": {
          "name": "Assurer la sécurité, prévenir et détecter la fraude, et corriger les erreurs",
          "description": "Vos données peuvent servir à surveiller et prévenir une activité inhabituelle ou frauduleuse et à assurer le bon fonctionnement sécurisé des systèmes. Elles peuvent aussi aider à corriger des problèmes de diffusion de contenu et de publicités."
        }
      }
    }
  },
  "HOME": {
    "title": "GPUcloud.store – Guichet unique pour vos besoins HPC",
    "description": "GPUcloud.store – Conseil cloud GPU, orchestration multi-cloud et mise en œuvre cloud hybride pour les charges de travail informatiques haute performance.",
    "hero": {
      "eyebrow": "Cloud Haute Performance, Sans Incertitude",
      "headline": "Guichet unique pour vos",
      "headlineHighlight": "besoins HPC.",
      "subtitle": "GPUcloud.store aide les équipes à concevoir et exploiter une infrastructure efficace axée sur GPU – de l'orchestration multi-cloud aux configurations hybrides incluant du matériel sur site. Nous éliminons le bruit, afin que vos charges de travail évoluent au lieu de vos dépenses.",
      "tags": {
        "consulting": "Conseil Cloud GPU",
        "orchestration": "Orchestration Multi-Cloud",
        "hybrid": "HPC Hybride et Sur Site",
        "sourcing": "Approvisionnement Matériel"
      },
      "cta": {
        "primary": "Réservez un appel découverte",
        "secondary": "En savoir plus"
      },
      "meta": "Basé dans l'UE. Connecté à des fournisseurs et partenaires à travers l'Europe et au-delà.",
      "card": {
        "title": "Panneau de Contrôle HPC",
        "badge": "Conseil en direct",
        "metrics": {
          "utilization": {
            "label": "Utilisation GPU",
            "value": "92%",
            "sub": "Après rééquilibrage de capacité"
          },
          "spend": {
            "label": "Dépenses Cloud",
            "value": "-34%",
            "sub": "vs. architecture précédente"
          }
        },
        "footnote": "Les configurations multi-cloud et hybrides n'ont pas à être un labyrinthe.",
        "footnoteHighlight": "Nous concevons la carte, présentons les bons fournisseurs et vous aidons à livrer."
      }
    },
    "about": {
      "eyebrow": "À propos",
      "title": "Qui est derrière GPUcloud.store ?",
      "subtitle": "GPUcloud.store est construit autour d'une idée simple : l'infrastructure haute performance doit être compréhensible, négociable et alignée sur vos objectifs commerciaux – pas seulement vos benchmarks.",
      "text": {
        "intro": "Nous sommes des consultants cloud avec un réseau mondial de centres de données indépendants alimenté par Si Exchange.",
        "mission": "Nous nous situons à l'intersection de l'infrastructure technique, de la réalité commerciale et des réseaux transfrontaliers. Cela signifie vous aider à choisir non seulement le \"matériel le plus rapide\", mais l'architecture et les partenariats qui font réellement avancer votre feuille de route.",
        "approach": "Avec accès à un vaste réseau de centres de données indépendants et de fournisseurs GPU, nous vous aidons à naviguer capacité, tarifs et fiabilité tout en gardant vos équipes concentrées sur la construction de produits — pas sur la recherche de matériel."
      },
      "pills": {
        "strategy": "Stratégie GPU et HPC",
        "design": "Conception Cloud et Hybride",
        "network": "Réseau Mondial de Centres de Données",
        "optimization": "Croissance et Optimisation des Coûts"
      },
      "card": {
        "title": "Comment nous aidons généralement",
        "items": {
          "orchestration": {
            "title": "Orchestration multi-cloud :",
            "text": "Évaluer et concevoir des configurations sur les principaux fournisseurs et clouds GPU spécialisés."
          },
          "hybrid": {
            "title": "Implémentations hybrides :",
            "text": "Combiner matériel sur site ou colocation avec capacité cloud d'une manière qui ne devient pas un enfer opérationnel."
          },
          "sourcing": {
            "title": "Approvisionnement fournisseurs et matériel :",
            "text": "Vous aider à naviguer disponibilité GPU, tarifs et partenaires de confiance dans des centres de données indépendants dans le monde entier."
          },
          "alignment": {
            "title": "Alignement coût et croissance :",
            "text": "Traduire les décisions d'infrastructure en impact KPI : débit, latence, marge et piste."
          }
        }
      }
    },
    "contact": {
      "eyebrow": "Contact",
      "title": "Parlez-nous de vos charges de travail",
      "subtitle": "Que vous luttiez contre la pénurie de GPU, des factures imprévisibles ou une configuration multi-cloud désordonnée, nous pouvons commencer par une conversation courte et ciblée.",
      "text": {
        "intro": "Utilisez le formulaire pour décrire votre situation actuelle : ce que vous exécutez, où cela s'exécute et ce qui ne fonctionne pas comme il le devrait.",
        "helpTitle": "Nous aidons généralement :",
        "helpItems": {
          "ai": "Équipes IA/ML mettant à l'échelle l'entraînement ou l'inférence",
          "startups": "Startups passant d'un cloud unique au multi-cloud",
          "companies": "Entreprises envisageant des flottes GPU hybrides ou sur site"
        },
        "response": "Vous recevrez une réponse directe — pas de séquence de vente automatisée, pas de présentation générique.",
        "email": "Préférez l'email ? Vous pouvez également nous contacter à",
        "emailAddress": "shrey@gpucloud.store"
      },
      "form": {
        "name": {
          "label": "Nom",
          "placeholder": "Ada Lovelace"
        },
        "company": {
          "label": "Entreprise",
          "placeholder": "Votre entreprise / projet"
        },
        "email": {
          "label": "Email professionnel",
          "placeholder": "vous@entreprise.com"
        },
        "role": {
          "label": "Fonction",
          "placeholder": "CTO, Directeur Tech, Fondateur…"
        },
        "message": {
          "label": "Qu'exécutez-vous aujourd'hui ?",
          "placeholder": "Décrivez brièvement vos charges de travail, fournisseurs actuels et ce que vous souhaitez améliorer (coût, fiabilité, latence, capacité, etc.)."
        },
        "hint": "Ce formulaire envoie les soumissions à un endpoint serverless sur ce site qui peut transférer vers email.",
        "submit": "Envoyer le message",
        "submitting": "Envoi en cours…",
        "success": "Merci — votre message a été envoyé.",
        "error": "Veuillez remplir nom, email et message.",
        "networkError": "Erreur réseau. Veuillez réessayer plus tard.",
        "submitError": "Échec de l'envoi. Veuillez réessayer."
      }
    },
    "footer": {
      "copyright": "© GPUcloud.store",
      "pricingDataVia": "Tarifs indicatifs via",
      "links": {
        "about": "À propos",
        "contact": "Contact",
        "email": "Email",
        "privacy": "Confidentialité"
      }
    }
  },
  "TEST": {
    "hero": {
      "title": "GPUCloud",
      "featureLabel": "Fonction",
      "carousel": {
        "cards": [
          {
            "id": "fitted",
            "feeling": "Ajusté",
            "title": "Configurations optimisées au workload",
            "text": "Chaque nœud et cluster est évalué sur le coût, la latence et la stabilité — précisément adapté à votre charge."
          },
          {
            "id": "vetted",
            "feeling": "Validé",
            "title": "Fournisseurs scorés sur le risque",
            "text": "Énergie, refroidissement, réseau et risques régionaux quantifiés et exposés — une transparence rare."
          },
          {
            "id": "stable",
            "feeling": "Fiable",
            "title": "Capacité GPU fiable",
            "text": "Nœuds sous contrat chez des fournisseurs validés — sans churn, sans volatilité, sans surprises."
          },
          {
            "id": "aligned",
            "feeling": "Aligné",
            "title": "Du matériel qui suit l’intention",
            "text": "Entraînement, inférence, batch ou expérimentation — chaque configuration reflète des rôles et profils de perf."
          },
          {
            "id": "structured",
            "feeling": "Structuré",
            "title": "Planning de cluster conscient de la topologie",
            "text": "Les groupes multi-nœuds respectent interconnects, scaling et contraintes régionales pour tenir la perf."
          },
          {
            "id": "purposeful",
            "feeling": "Intentionnel",
            "title": "Templates pour de vrais workloads",
            "text": "Formes de nœuds et motifs de cluster conçus pour débit, latence et stabilité — pas une liste arbitraire."
          },
          {
            "id": "consistent",
            "feeling": "Constant",
            "title": "Provisioning prévisible",
            "text": "Lead times clairs et fenêtres de livraison fiables. L’adéquation inclut la certitude opérationnelle."
          },
          {
            "id": "coherent",
            "feeling": "Cohérent",
            "title": "Clarté entre fournisseurs",
            "text": "Specs, terminologie et modèles de risque unifiés — pour rendre l’infra hétérogène comparable."
          },
          {
            "id": "informed",
            "feeling": "Éclairé",
            "title": "Sélection data-driven",
            "text": "Nous exposons fournisseur, région et nœud pour choisir avec des arbitrages mesurables."
          },
          {
            "id": "supported",
            "feeling": "Accompagné",
            "title": "Conseil engineering-first",
            "text": "Aide directe pour choisir nœuds, régions et profils de stabilité adaptés à votre charge."
          },
          {
            "id": "assured",
            "feeling": "Assuré",
            "title": "Coordination alignée SLA",
            "text": "Nous gérons engagements, escalades et vérifications pour provisionner le cluster correctement."
          },
          {
            "id": "steady",
            "feeling": "Serein",
            "title": "L’infra, prise en charge",
            "text": "Nous gérons sourcing, logistique et communication multi-fournisseurs — un process complexe rendu prévisible."
          }
        ]
      },
      "controls": {
        "previous": "Précédent",
        "next": "Suivant"
      },
      "subtitle": "Trouvez de la vraie capacité GPU. On s’occupe du reste."
    },
    "spotlight": {
      "eyebrow": "Et ensuite",
      "title": "Confirmez la capacité en trois étapes",
      "subtitle": "Processus rapide, réponses claires, zéro approximation.",
      "steps": [
        {
          "title": "Partagez vos besoins",
          "description": "Workload, région, délais et budget.",
          "detail": "2–3 minutes, sans engagement."
        },
        {
          "title": "Nous confirmons la capacité",
          "description": "Nous vérifions lead time, prix et adéquation chez les fournisseurs.",
          "detail": "Plusieurs régions et options de redondance."
        },
        {
          "title": "Recevez devis + plan",
          "description": "Options claires en on-demand ou réservé.",
          "detail": "Nous recommandons le chemin le plus rapide."
        }
      ]
    },
    "contact": {
      "eyebrow": "Prenez contact",
      "title": "Demander un devis",
      "subtitle": "Partagez vos besoins en configuration GPU et nous reviendrons vers vous avec un devis personnalisé."
    },
    "haloSearch": {
      "placeholder": "Rechercher des configs GPU...",
      "ariaLabel": "Rechercher GPUCloud",
      "dropdownHeader": "Configurations GPU correspondantes",
      "hourlyRate": "Tarif horaire",
      "pricingNote": "Le tarif final est confirmé dans votre devis selon la région, la durée et le volume.",
      "close": "Fermer",
      "addToPlan": "Ajouter au plan",
      "saveConfiguration": "Enregistrer la configuration",
      "sizesLabel": "Tailles : {sizes}",
      "regionsLabel": "Régions : {regions}",
      "regionsMoreSuffix": "… (+{count} de plus)",
      "gpuCluster": "Cluster {count} GPU",
      "providerDetails": "Fournisseur : {name} ({location})",
      "pricingFallback": "Prix sur demande"
    },
    "contactForm": {
      "search": {
        "title": "Rechercher des configurations GPU"
      },
      "selected": {
        "title": "Configurations sélectionnées ({count})",
        "subtitle": "Ces éléments seront ajoutés à votre demande. Vous pouvez les supprimer ou ajouter d'autres configurations ci-dessous.",
        "empty": "Aucune configuration sélectionnée pour le moment. Recherchez ci-dessus et ajoutez des configurations pour les inclure dans votre demande de devis.",
        "hint": "Ces configurations seront jointes à votre demande.",
        "confirmDuringCall": "Nous confirmerons la disponibilité du fournisseur/de la région pendant l'appel.",
        "quantity": "Qté : {quantity} × {price}",
        "remove": "Supprimer l'élément"
      },
      "help": {
        "title": "Comment nous pouvons vous aider :",
        "items": {
          "infrastructure": "Infrastructure d'entraînement et d'inférence IA",
          "cluster": "Configurations personnalisées de clusters GPU",
          "hybrid": "Solutions hybrides cloud et on-premise"
        },
        "description": "Un blocage ? Notre équipe peut vous aider à choisir la bonne combinaison de matériel, de fournisseurs cloud ou d'architecture hybride. Partagez vos obstacles ou votre liste de souhaits — nous l'intégrerons à votre devis.",
        "emailIntro": "Vous pouvez également nous écrire directement à",
        "emailAddress": "shrey@gpucloud.store"
      },
      "form": {
        "title": "Formulaire de contact",
        "subtitle": "Indiquez vos coordonnées et besoins supplémentaires. Nous vous recontacterons rapidement avec les prochaines étapes.",
        "labels": {
          "name": "Nom *",
          "company": "Entreprise",
          "email": "Email professionnel *",
          "role": "Poste",
          "message": "Exigences"
        },
        "placeholders": {
          "name": "Ada Lovelace",
          "company": "Votre entreprise / projet",
          "email": "vous@entreprise.com",
          "role": "CTO, Directeur technique, Fondateur…",
          "message": "Ajoutez tout contexte non couvert par la liste des configs GPU."
        },
        "footnote": "* Champs obligatoires. Ajoutez des configurations GPU ci-dessus OU fournissez des détails dans le champ de commentaires (au moins l'un des deux est requis). Nous répondons généralement sous 24 h."
      },
      "hint": "Ce formulaire envoie les soumissions à un endpoint serverless du site pouvant les transférer par e-mail.",
      "submit": {
        "default": "Envoyer le message",
        "sending": "Envoi en cours…"
      },
      "status": {
        "success": "Message envoyé avec succès ! Nous revenons vers vous rapidement.",
        "error": "Le message n'a pas pu être envoyé. Réessayez ou écrivez-nous directement par e-mail.",
        "networkError": "Erreur réseau. Veuillez vérifier votre connexion et réessayer."
      },
      "validation": {
        "nameRequired": "Le nom est requis",
        "emailRequired": "L'email est requis",
        "emailInvalid": "Adresse e-mail invalide",
        "messageOrConfigs": "Veuillez sélectionner des configurations GPU ci-dessus ou fournir des détails ici."
      }
    },
    "availability": {
      "anchor": "disponibilite-en-vedette",
      "title": "Disponibilité mise en avant",
      "subtitle": "Capacité GPU sélectionnée avec disponibilité live multi-fournisseurs.",
      "liveLabel": "Disponibilité live",
      "inStockLabel": "En stock",
      "limitedLabel": "Disponibilité limitée",
      "cta": "Ajouter au plan",
      "added": "Ajouté",
      "avgLabel": "Moy.",
      "memoryLabel": "{memory} VRAM",
      "perHour": "/h",
      "priceUnknown": "Prix sur demande"
    },
    "plan": {
      "tbdShort": "Détails de configuration en attente",
      "tbdDetails": "Nous confirmerons ensemble fournisseur, région et taille.",
      "tbdPrice": "Prix en attente"
    },
    "useCases": {
      "anchor": "cas-d-usage",
      "title": "Que construisez-vous ?",
      "subtitle": "Choisissez un cas d’usage pour voir des configurations adaptées à votre charge.",
      "helper": "Pas sûr de vos besoins ? Plusieurs cas d’usage ? Une config sur mesure ?",
      "helperCta": "Nous contacter",
      "configureAnchor": "Configurer le template",
      "templateCount": "{count, plural, one {# option de template} other {# options de template}}",
      "items": {
        "llmTraining": {
          "name": "Entraînement LLM",
          "description": "Entraînement et fine-tuning de grands modèles de langage.",
          "examples": [
            "Préentraînement frontier / MoE",
            "Fine-tuning Llama & Qwen",
            "Clusters multi-nœuds NVLink",
            "Entraînement long-context"
          ]
        },
        "inference": {
          "name": "Inférence IA",
          "description": "Serving et inférence à haut débit.",
          "examples": [
            "APIs chat long-context",
            "Endpoints basse latence",
            "Scoring batch / offline",
            "Serving haut QPS"
          ]
        },
        "computerVision": {
          "name": "Vision par ordinateur",
          "description": "Charges image et vidéo.",
          "examples": [
            "Détection d’objets",
            "Segmentation d’images",
            "Analytique vidéo",
            "Modèles vision multimodaux"
          ]
        },
        "dataScience": {
          "name": "Data science",
          "description": "Analytique à grande échelle et pipelines ETL.",
          "examples": [
            "Dataframes / SQL GPU",
            "Ingénierie des features",
            "ETL à grande échelle",
            "Pipelines d’embeddings"
          ]
        },
        "research": {
          "name": "Recherche",
          "description": "Charges expérimentales et académiques.",
          "examples": [
            "Nouvelles architectures",
            "Études d’ablation",
            "Sweeps d’hyperparamètres",
            "Benchmark de nouveaux SKUs"
          ]
        },
        "development": {
          "name": "Développement",
          "description": "Prototypage et itération.",
          "examples": [
            "Itération rapide",
            "Harnesses d’évaluation",
            "Tests CI / smoke",
            "Validation de prototypes"
          ]
        }
      }
    },
    "templatesModal": {
      "whyTitle": "Pourquoi c’est important",
      "considerationsTitle": "Points clés",
      "templatesTitle": "Templates prêts à déployer",
      "templatesSubtitle": "Setups préconfigurés optimisés pour {useCase}.",
      "addToQuote": "Ajouter au devis",
      "addToQuoteLoading": "Ajout…",
      "addToQuoteAdded": "Ajouté",
      "addAndConfigure": "Ajouter et configurer",
      "recommended": "Recommandé",
      "priceLabel": "Prix est.",
      "priceTbd": "Prix sur demande",
      "itemsLabel": "Configuration",
      "planDetails": "Cas d’usage : {useCase} - Niveau : {tier}",
      "close": "Fermer",
      "tiers": {
        "enterprise": "Enterprise",
        "professional": "Professional",
        "standard": "Standard",
        "highVolume": "Haut volume",
        "balanced": "Équilibré",
        "costOptimized": "Optimisé coût",
        "entry": "Entrée",
        "dataIntensive": "Data-intensive",
        "cuttingEdge": "Cutting-edge",
        "academic": "Académique",
        "team": "Équipe",
        "starter": "Starter"
      },
      "prices": {
        "llmTraining": {
          "enterprise": "$55-85/hr",
          "professional": "$35-55/hr",
          "standard": "$16-28/hr"
        },
        "inference": {
          "highVolume": "$18-30/hr",
          "balanced": "$6-10/hr",
          "costOptimized": "$1.5-3/hr"
        },
        "computerVision": {
          "professional": "$6-10/hr",
          "standard": "$3-5/hr",
          "entry": "$1.5-2.5/hr"
        },
        "dataScience": {
          "dataIntensive": "$10-16/hr",
          "balanced": "$8-14/hr",
          "standard": "$1.5-2.5/hr"
        },
        "research": {
          "cuttingEdge": "$18-30/hr",
          "professional": "$8-14/hr",
          "academic": "$1.5-2.5/hr"
        },
        "development": {
          "team": "$3-6/hr",
          "standard": "$1.5-2.5/hr",
          "starter": "$1-1.5/hr"
        }
      },
      "content": {
        "llmTraining": {
          "why": "L’entraînement LLM exige une forte bande passante mémoire et des interconnects rapides. Les nœuds Blackwell et Hopper SXM réduisent le time-to-train sur frontier et long-context.",
          "considerations": [
            "Taille du modèle et longueur de contexte fixent le HBM minimum",
            "L’entraînement multi-GPU nécessite NVLink / fabric rapide",
            "De plus gros batches gagnent en efficacité mais coûtent du VRAM",
            "La capacité HBM H200/B200 compte souvent plus que les FLOPs seuls"
          ]
        },
        "inference": {
          "why": "L’inférence priorise tokens/$ et latence de queue. GPU haute mémoire pour le serving long-context ; Ada L40S pour un débit rentable.",
          "considerations": [
            "Contexte et concurrence pilotent le VRAM",
            "Le débit scale avec réplicas et batching",
            "INT8/FP8/FP16 réduisent la mémoire et haussent les tokens/s",
            "L40S reste un fort rapport prix/perf en mid-tier"
          ]
        },
        "computerVision": {
          "why": "La vision a besoin d’un équilibre compute/mémoire pour images/vidéo haute rés. et modèles multimodaux.",
          "considerations": [
            "Résolution et batch déterminent le VRAM",
            "Vidéo et multimodal favorisent de plus gros GPU Ada",
            "Les pipelines temps réel veulent une faible latence",
            "Entraînement et inférence veulent souvent des SKUs différents"
          ]
        },
        "dataScience": {
          "why": "Dataframes GPU, SQL et pipelines d’embeddings profitent d’un gros HBM et de l’accélération CUDA/ROCm.",
          "considerations": [
            "La taille du dataset fixe la mémoire",
            "Les stacks type RAPIDS veulent des GPU CUDA",
            "Le multi-GPU aide sur les jobs plus gros que la mémoire",
            "L’I/O storage bride souvent avant le GPU"
          ]
        },
        "research": {
          "why": "La recherche a besoin d’architectures actuelles et de flexibilité pour scaler les expériences vite.",
          "considerations": [
            "Les nouveaux SKUs débloquent plus de contexte et des MoE plus denses",
            "Scalez par expérience pour contrôler le coût",
            "Le mixed precision compte d’une toolchain à l’autre",
            "L’itération rapide bat souvent la taille max de cluster"
          ]
        },
        "development": {
          "why": "Les environnements de dev ont besoin de GPU réactifs avec un coût always-on maîtrisé.",
          "considerations": [
            "L’itération rapide veut des nœuds réactifs",
            "La plupart du travail de dev n’a pas besoin de multi-GPU",
            "Always-on amplifie le coût horaire",
            "Miroitez les SKUs de prod à plus petite échelle si possible"
          ]
        }
      },
      "bestForLabel": "Idéal pour",
      "bestFor": {
        "llmTraining": {
          "enterprise": "Préentraînement frontier / MoE sur Blackwell (70B+ dense, gros MoE)",
          "professional": "Entraînement long-context et grands modèles sur H200",
          "standard": "Fine-tuning et entraînement mid-size sur H100 SXM"
        },
        "inference": {
          "highVolume": "Serving frontier / long-context",
          "balanced": "APIs haut QPS et inférence batch sur L40S",
          "costOptimized": "Endpoints faible trafic et staging"
        },
        "computerVision": {
          "professional": "Vidéo haute rés., multimodal et entraînement",
          "standard": "Détection/segmentation et pipelines temps réel",
          "entry": "Prototypage et petits datasets"
        },
        "dataScience": {
          "dataIntensive": "Jobs très HBM (working sets 100Go+)",
          "balanced": "ETL / analytics GPU sur Hopper PCIe",
          "standard": "Analyse exploratoire et transforms légers"
        },
        "research": {
          "cuttingEdge": "Expériences frontier nécessitant la mémoire H200",
          "professional": "Charges de labo sur H100 SXM",
          "academic": "Travail académique mono-GPU"
        },
        "development": {
          "team": "Environnements d’équipe partagés sur L40S",
          "standard": "Dev solo et harnesses d’eval",
          "starter": "Smoke tests légers et prototypes"
        }
      },
      "tradeoffs": {
        "performance": "Performance",
        "cost": "Coût",
        "simplicity": "Simplicité"
      }
    },
    "catalog": {
      "via": "via",
      "sourceSeparator": ", ",
      "snapshotDate": "· {date}"
    },
    "gpuModal": {
      "selectRegion": "Choisir une région",
      "selectSizeProvider": "Choisir taille et fournisseur",
      "changeRegion": "Changer de région",
      "changeSelection": "Modifier la sélection",
      "regionLabel": "Région : {region}",
      "providerColumn": "Fournisseur",
      "gpuCount": "{count, plural, one {# GPU} other {# GPUs}}",
      "configurationDetails": "Détails de configuration",
      "tabs": {
        "overview": "Aperçu",
        "risk": "Risque & performance",
        "infrastructure": "Infrastructure"
      },
      "overview": {
        "clusterTitle": "{count, plural, one {{count} × {model} GPU} other {{count} × {model} GPUs}}",
        "provider": "Fournisseur",
        "configuration": "Configuration",
        "leadTime": "Lead time : {leadTime}",
        "terms": "Conditions",
        "minTerm": "Min. {term}",
        "flexibleBilling": "Facturation flexible",
        "support": "Support",
        "supportValue": "Support technique 24/7",
        "supportHint": "SLA enterprise"
      },
      "metrics": {
        "heading": "Métriques risque & performance — {provider}, {region}",
        "unavailable": "Les scores de risque ne sont pas encore disponibles pour cette offre. Affichage n/a jusqu’à évaluation des sites.",
        "na": "n/a",
        "howEvaluated": "Comment sont-ils évalués ?",
        "labels": {
          "naturalDisaster": "Catastrophe naturelle",
          "electricityReliability": "Fiabilité électrique",
          "fireRisk": "Risque incendie",
          "securityBreach": "Violation de sécurité",
          "powerEfficiency": "Efficacité énergétique",
          "costEfficiency": "Efficacité coût",
          "networkReliability": "Fiabilité réseau",
          "coolingCapacity": "Capacité de refroidissement"
        },
        "tooltips": {
          "naturalDisaster": "Probabilité d’interruptions dues à des événements environnementaux (séismes, inondations, tempêtes, ouragans, feux) sur la durée du contrat.",
          "electricityReliability": "Stabilité de l’alimentation : réseau, génération on-site, UPS et uptime historique.",
          "fireRisk": "Efficacité de détection, prévention, extinction et compartimentage structurel.",
          "securityBreach": "Robustesse de la sécurité physique et opérationnelle contre accès non autorisés ou perturbations.",
          "powerEfficiency": "Efficacité électrique et de refroidissement sous charge GPU dense continue.",
          "costEfficiency": "Rentabilité structurelle d’exploiter des GPU sur ce site (énergie, cooling, économies d’échelle).",
          "networkReliability": "Diversité des carriers, redondance fibre, qualité de routage et perf réseau historique.",
          "coolingCapacity": "Capacité à soutenir des charges GPU denses (20–100+ kW/rack) sans throttling prolongé."
        }
      },
      "infrastructure": {
        "title": "Détails d’infrastructure",
        "regionalAvailability": "Disponibilité régionale"
      }
    }
  }
} as const satisfies MessagesShape;

export default messages;
