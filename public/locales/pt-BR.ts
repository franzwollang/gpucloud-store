import type { MessagesShape } from '../../src/i18n/appMessages';

const messages = {
  "UI": {
    "languagePicker": {
      "placeholder": "Escolha um idioma",
      "noResults": "Nenhum resultado encontrado",
      "ariaLabel": "Alterar idioma"
    },
    "darkModeToggle": {
      "ariaLabel": "Alternar modo escuro"
    },
    "plan": {
      "open": "Plano de capacidade",
      "title": "Plano de Capacidade",
      "empty": "Seu plano está vazio",
      "emptyHint": "Adicione configurações de GPU para começar",
      "summary": "{count, plural, one {{count} item no plano} other {{count} itens no plano}}",
      "removeItem": "Remover item",
      "configure": "Configurar",
      "edit": "Editar",
      "missingDetails": "Detalhes pendentes",
      "quantity": "Quantidade: {count}",
      "incrementQuantity": "Aumentar quantidade",
      "decrementQuantity": "Diminuir quantidade",
      "contactButton": "Contactar um representante",
      "contactHint": "Compartilhe sua configuração para receber um orçamento personalizado",
      "headerCta": "Solicitar orçamento",
      "headerCtaLoading": "Adicionando…",
      "headerCtaAdded": "Adicionado"
    },
    "navLinks": {
      "home": {
        "linkText": "Início",
        "anchor": "inicio"
      },
      "about": {
        "linkText": "Sobre",
        "anchor": "sobre"
      },
      "contact": {
        "linkText": "Contato",
        "anchor": "contato"
      }
    },
    "commandPalette": {
      "empty": "Nenhum resultado encontrado.",
      "shortcutGroups": "Grupos de atalhos",
      "settings": "Configurações",
      "navigation": "Navegação",
      "theme": "Tema",
      "language": "Idioma",
      "dark": "Escuro",
      "light": "Claro"
    },
    "navbar": {
      "skipNavigation": "Pular navegação",
      "openCommandPalette": "Pressione {modifier} e K para abrir a paleta de comandos."
    },
    "legal": {
      "privacyTitle": "Privacidade",
      "impressumTitle": "Aviso legal",
      "privacyStub": "Política de privacidade em breve.",
      "impressumStub": "Aviso legal em breve."
    },
    "carouselA11y": {
      "skipCards": "Pular cards",
      "exitCardSection": "Sair da seção de cards"
    },
    "consent": {
      "bannerTitleLine1": "Nos importamos com",
      "bannerTitleLine2": "sua privacidade",
      "bannerBody1": "Usamos cookies para personalizar conteúdo e anúncios, fornecer recursos de redes sociais e analisar nosso tráfego. Também compartilhamos informações sobre o uso do nosso site com parceiros de redes sociais, publicidade e analytics, que podem combiná-las com outras informações que você forneceu ou que eles coletaram do uso dos serviços deles.",
      "bannerBody2": "Você pode aceitar ou gerenciar suas escolhas abaixo ou a qualquer momento na página de privacidade.",
      "cookieAlt": "Um cookie esfarelando.",
      "privacyPolicy": "Política de privacidade",
      "acceptAll": "Aceitar todos os cookies",
      "customize": "Personalizar configurações",
      "necessaryOnly": "Apenas cookies necessários",
      "confirmChoices": "Confirmar minhas escolhas",
      "aboutTitle": "Sobre sua privacidade",
      "aboutBody": "Processamos seus dados para entregar conteúdo ou anúncios e medir essa entrega, obtendo insights sobre nosso site. Compartilhamos essas informações com parceiros com base em consentimento. Você pode exercer seu direito de consentimento por finalidade abaixo ou no nível do parceiro no link sob cada finalidade. Essas escolhas serão sinalizadas aos vendors do Transparency and Consent Framework.",
      "manageTitle": "Gerenciar preferências de consentimento",
      "alwaysActive": "Sempre ativo",
      "categories": {
        "functional": {
          "name": "Cookies funcionais",
          "description": "Esses cookies permitem funcionalidade e personalização aprimoradas. Podem ser definidos por nós ou por terceiros cujos serviços adicionamos. Se você não permitir, alguns serviços podem não funcionar corretamente."
        },
        "targeting": {
          "name": "Cookies de segmentação",
          "description": "Esses cookies tornam a publicidade mais relevante e podem ser definidos por nós ou parceiros de anúncios. Podem criar um perfil de interesses e mostrar anúncios relevantes em nosso site ou em outros. Não armazenam informações pessoais diretas, mas identificam de forma única seu navegador e dispositivo."
        },
        "performance": {
          "name": "Cookies de desempenho",
          "description": "Esses cookies permitem contar visitas e fontes de tráfego para medir e melhorar o desempenho do site. Ajudam a saber quais páginas são mais e menos populares e como os visitantes navegam. Todas as informações são agregadas e anônimas. Sem eles, não saberemos quando você visitou o site."
        },
        "necessary": {
          "name": "Cookies necessários",
          "description": "Esses cookies são necessários para o site funcionar e não podem ser desativados em nossos sistemas. Geralmente são definidos apenas em resposta a ações suas, como preferências de privacidade, login ou formulários. Você pode bloqueá-los no navegador, mas partes do site podem deixar de funcionar. Eles não armazenam informações pessoais identificáveis."
        },
        "security": {
          "name": "Garantir segurança, prevenir e detectar fraude e corrigir erros",
          "description": "Seus dados podem ser usados para monitorar e prevenir atividade incomum ou fraudulenta e garantir que sistemas funcionem de forma segura. Também podem ajudar a corrigir problemas na entrega de conteúdo e anúncios."
        }
      }
    }
  },
  "HOME": {
    "title": "GPUcloud.store – Balcão único para suas necessidades de HPC",
    "description": "GPUcloud.store – Consultoria em nuvem GPU, orquestração multi-nuvem e implementação de nuvem híbrida para cargas de trabalho de computação de alto desempenho.",
    "hero": {
      "eyebrow": "Nuvem de Alto Desempenho, Sem Adivinhação",
      "headline": "Balcão único para suas",
      "headlineHighlight": "necessidades de HPC.",
      "subtitle": "GPUcloud.store ajuda equipes a projetar e operar infraestrutura eficiente focada em GPU – desde orquestração multi-nuvem até configurações híbridas que incluem hardware on-premise. Eliminamos o ruído, para que suas cargas de trabalho escalem em vez do seu gasto.",
      "tags": {
        "consulting": "Consultoria em Nuvem GPU",
        "orchestration": "Orquestração Multi-Nuvem",
        "hybrid": "HPC Híbrido e On-Prem",
        "sourcing": "Fornecimento de Hardware"
      },
      "cta": {
        "primary": "Agende uma chamada de descoberta",
        "secondary": "Saiba mais"
      },
      "meta": "Baseado na UE. Conectado a provedores e parceiros em toda a Europa e além.",
      "card": {
        "title": "Painel de Controle HPC",
        "badge": "Consultoria ao vivo",
        "metrics": {
          "utilization": {
            "label": "Utilização de GPU",
            "value": "92%",
            "sub": "Após rebalanceamento de capacidade"
          },
          "spend": {
            "label": "Gasto em Nuvem",
            "value": "-34%",
            "sub": "vs. arquitetura anterior"
          }
        },
        "footnote": "Configurações multi-nuvem e híbridas não precisam ser um labirinto.",
        "footnoteHighlight": "Nós projetamos o mapa, apresentamos os provedores certos e ajudamos você a entregar."
      }
    },
    "about": {
      "eyebrow": "Sobre",
      "title": "Quem está por trás da GPUcloud.store?",
      "subtitle": "GPUcloud.store é construída em torno de uma ideia simples: infraestrutura de alto desempenho deve ser compreensível, negociável e alinhada com seus objetivos de negócios – não apenas seus benchmarks.",
      "text": {
        "intro": "Somos consultores de nuvem com uma rede global de Datacenter Independente alimentada por Si Exchange.",
        "mission": "Estamos na interseção de infraestrutura técnica, realidade comercial e redes transfronteiriças. Isso significa ajudá-lo a escolher não apenas o \"hardware mais rápido\", mas a arquitetura e parcerias que realmente movem seu roteiro adiante.",
        "approach": "Com acesso a uma ampla rede de datacenters independentes e provedores de GPU, ajudamos você a navegar capacidade, preços e confiabilidade enquanto mantém suas equipes focadas em construir produtos — não em perseguir hardware."
      },
      "pills": {
        "strategy": "Estratégia GPU e HPC",
        "design": "Design de Nuvem e Híbrido",
        "network": "Rede Global de Datacenters",
        "optimization": "Crescimento e Otimização de Custos"
      },
      "card": {
        "title": "Como geralmente ajudamos",
        "items": {
          "orchestration": {
            "title": "Orquestração multi-nuvem:",
            "text": "Avaliar e projetar configurações em principais provedores e nuvens GPU especializadas."
          },
          "hybrid": {
            "title": "Implementações híbridas:",
            "text": "Combinar hardware on-prem ou colocação com capacidade de nuvem de uma forma que não se torne um inferno operacional."
          },
          "sourcing": {
            "title": "Fornecimento de fornecedores e hardware:",
            "text": "Ajudá-lo a navegar disponibilidade de GPU, preços e parceiros confiáveis em datacenters independentes em todo o mundo."
          },
          "alignment": {
            "title": "Alinhamento de custos e crescimento:",
            "text": "Traduzir decisões de infraestrutura em impacto de KPI: throughput, latência, margem e runway."
          }
        }
      }
    },
    "contact": {
      "eyebrow": "Contato",
      "title": "Conte-nos sobre suas cargas de trabalho",
      "subtitle": "Seja lutando contra escassez de GPU, faturas imprevisíveis ou uma configuração multi-nuvem confusa, podemos começar com uma conversa curta e focada.",
      "text": {
        "intro": "Use o formulário para descrever sua situação atual: o que você está executando, onde está executando e o que não está funcionando como deveria.",
        "helpTitle": "Geralmente ajudamos:",
        "helpItems": {
          "ai": "Equipes de IA/ML escalando treinamento ou inferência",
          "startups": "Startups migrando de nuvem única para multi-nuvem",
          "companies": "Empresas considerando frotas GPU híbridas ou on-prem"
        },
        "response": "Você receberá uma resposta direta — sem sequência de vendas automatizada, sem deck genérico.",
        "email": "Prefere e-mail? Você também pode entrar em contato em",
        "emailAddress": "shrey@gpucloud.store"
      },
      "form": {
        "name": {
          "label": "Nome",
          "placeholder": "Ada Lovelace"
        },
        "company": {
          "label": "Empresa",
          "placeholder": "Sua empresa / projeto"
        },
        "email": {
          "label": "E-mail corporativo",
          "placeholder": "voce@empresa.com"
        },
        "role": {
          "label": "Função",
          "placeholder": "CTO, Chefe de Eng, Fundador…"
        },
        "message": {
          "label": "O que você está executando hoje?",
          "placeholder": "Descreva brevemente suas cargas de trabalho, provedores atuais e o que você quer melhorar (custo, confiabilidade, latência, capacidade, etc.)."
        },
        "hint": "Este formulário envia submissões para um endpoint serverless neste site que pode encaminhar para e-mail.",
        "submit": "Enviar mensagem",
        "submitting": "Enviando…",
        "success": "Obrigado — sua mensagem foi enviada.",
        "error": "Por favor, preencha nome, e-mail e mensagem.",
        "networkError": "Erro de rede. Por favor, tente novamente mais tarde.",
        "submitError": "Falha no envio. Por favor, tente novamente."
      }
    },
    "footer": {
      "copyright": "© GPUcloud.store",
      "links": {
        "about": "Sobre",
        "contact": "Contato",
        "email": "E-mail"
      }
    }
  },
  "TEST": {
    "hero": {
      "title": "GPUCloud",
      "featureLabel": "Recurso",
      "carousel": {
        "cards": [
          {
            "id": "fitted",
            "feeling": "Ajustado",
            "title": "Configurações otimizadas ao workload",
            "text": "Cada nó e cluster é avaliado por custo, latência e estabilidade — alinhado ao que seu workload precisa."
          },
          {
            "id": "vetted",
            "feeling": "Vistoriado",
            "title": "Provedores com score de risco",
            "text": "Energia, refrigeração, rede e riscos regionais quantificados e visíveis — transparência rara no mercado."
          },
          {
            "id": "stable",
            "feeling": "Estável",
            "title": "Capacidade de GPU confiável",
            "text": "Nós com contrato de provedores vistoriados — sem churn, sem volatilidade, sem surpresas."
          },
          {
            "id": "aligned",
            "feeling": "Alinhado",
            "title": "Hardware que combina com a intenção",
            "text": "Treino, inferência, batch ou experimentação — cada configuração reflete papéis e perfis de desempenho."
          },
          {
            "id": "structured",
            "feeling": "Estruturado",
            "title": "Planejamento de cluster com topologia",
            "text": "Grupos multi-nó respeitam interconnects, escala e restrições regionais para sustentar performance."
          },
          {
            "id": "purposeful",
            "feeling": "Intencional",
            "title": "Templates para workloads reais",
            "text": "Formatos de nó e padrões de cluster para throughput, latência e estabilidade — não listas arbitrárias."
          },
          {
            "id": "consistent",
            "feeling": "Consistente",
            "title": "Provisionamento previsível",
            "text": "Lead times claros e janelas de entrega confiáveis. O encaixe inclui certeza operacional."
          },
          {
            "id": "coherent",
            "feeling": "Coerente",
            "title": "Clareza entre provedores",
            "text": "Specs, terminologia e modelos de risco unificados — para tornar a infra heterogênea comparável."
          },
          {
            "id": "informed",
            "feeling": "Informado",
            "title": "Seleção orientada a dados",
            "text": "Mostramos provedor, região e nó para você escolher com trade-offs mensuráveis."
          },
          {
            "id": "supported",
            "feeling": "Apoiado",
            "title": "Orientação engineering-first",
            "text": "Ajuda direta para escolher nós, regiões e perfis de estabilidade alinhados ao seu workload."
          },
          {
            "id": "assured",
            "feeling": "Assegurado",
            "title": "Coordenação alinhada ao SLA",
            "text": "Gerenciamos compromissos, escalonamentos e verificação para provisionar o cluster corretamente."
          },
          {
            "id": "steady",
            "feeling": "Firme",
            "title": "Infraestrutura cuidada por você",
            "text": "Cuidamos de sourcing, logística e comunicação entre provedores — um processo complexo feito previsível."
          }
        ]
      },
      "controls": {
        "previous": "Anterior",
        "next": "Próximo"
      },
      "subtitle": "Encontre capacidade real de GPU. Nós cuidamos do resto."
    },
    "spotlight": {
      "eyebrow": "O que acontece depois",
      "title": "Confirme capacidade em três passos",
      "subtitle": "Processo rápido, respostas claras e sem achismo.",
      "steps": [
        {
          "title": "Compartilhe requisitos",
          "description": "Workload, região, prazo e orçamento.",
          "detail": "2–3 minutos, sem compromisso."
        },
        {
          "title": "Confirmamos a capacidade",
          "description": "Checamos provedores por lead time, preço e encaixe.",
          "detail": "Várias regiões e opções de redundância."
        },
        {
          "title": "Receba cotação + plano",
          "description": "Opções claras de capacidade on-demand ou reservada.",
          "detail": "Recomendamos o caminho mais rápido."
        }
      ]
    },
    "contact": {
      "eyebrow": "Entre em contato",
      "title": "Solicite um orçamento",
      "subtitle": "Compartilhe suas necessidades de configuração de GPU e retornaremos com um orçamento personalizado."
    },
    "haloSearch": {
      "placeholder": "Buscar configs de GPU...",
      "ariaLabel": "Buscar GPUCloud",
      "dropdownHeader": "Configurações de GPU correspondentes",
      "hourlyRate": "Tarifa por hora",
      "pricingNote": "O preço final é confirmado na sua cotação com base em região, prazo e volume.",
      "close": "Fechar",
      "addToPlan": "Adicionar ao plano",
      "saveConfiguration": "Salvar configuração",
      "sizesLabel": "Tamanhos: {sizes}",
      "regionsLabel": "Regiões: {regions}",
      "gpuCluster": "Cluster de {count} GPU",
      "providerDetails": "Provedor: {name} ({location})",
      "pricingFallback": "Preço sob consulta"
    },
    "contactForm": {
      "search": {
        "title": "Pesquisar configurações de GPU"
      },
      "selected": {
        "title": "Configurações selecionadas ({count})",
        "subtitle": "Esses itens serão incluídos na sua solicitação. Você pode removê-los ou adicionar mais configurações abaixo.",
        "empty": "Nenhuma configuração selecionada ainda. Pesquise acima e adicione configurações para incluí-las no seu pedido de orçamento.",
        "hint": "Essas configurações serão enviadas junto com sua solicitação.",
        "confirmDuringCall": "Vamos confirmar a disponibilidade de provedor/região durante a chamada.",
        "quantity": "Qtd.: {quantity} × {price}",
        "remove": "Remover item"
      },
      "help": {
        "title": "Como podemos ajudar:",
        "items": {
          "infrastructure": "Infraestrutura para treinamento e inferência de IA",
          "cluster": "Configurações personalizadas de cluster GPU",
          "hybrid": "Soluções híbridas em nuvem e on-premise"
        },
        "description": "Com alguma dificuldade? Nossa equipe pode ajudar você a escolher a melhor combinação de hardware, provedores de nuvem ou arquitetura híbrida. Compartilhe obstáculos ou itens de desejo — vamos considerá-los no seu orçamento.",
        "emailIntro": "Você também pode nos enviar um e-mail em",
        "emailAddress": "shrey@gpucloud.store"
      },
      "form": {
        "title": "Formulário de contato",
        "subtitle": "Informe seus dados e requisitos adicionais. Entraremos em contato com os próximos passos em breve.",
        "labels": {
          "name": "Nome *",
          "company": "Empresa",
          "email": "E-mail corporativo *",
          "role": "Cargo",
          "message": "Requisitos"
        },
        "placeholders": {
          "name": "Ada Lovelace",
          "company": "Sua empresa / projeto",
          "email": "voce@empresa.com",
          "role": "CTO, Head de Eng, Fundador…",
          "message": "Traga qualquer contexto que não esteja coberto pela lista de configs de GPU."
        },
        "footnote": "* Campos obrigatórios. Adicione configurações de GPU acima OU forneça detalhes no campo de comentários (é necessário pelo menos um). Normalmente respondemos em até 24 horas."
      },
      "hint": "Este formulário envia envios para um endpoint serverless neste site que pode encaminhar para o e-mail.",
      "submit": {
        "default": "Enviar mensagem",
        "sending": "Enviando…"
      },
      "status": {
        "success": "Mensagem enviada com sucesso! Entraremos em contato em breve.",
        "error": "Não foi possível enviar a mensagem. Tente novamente ou nos envie um e-mail diretamente.",
        "networkError": "Erro de rede. Verifique sua conexão e tente novamente."
      },
      "validation": {
        "nameRequired": "Nome é obrigatório",
        "emailRequired": "E-mail é obrigatório",
        "emailInvalid": "Endereço de e-mail inválido",
        "messageOrConfigs": "Selecione configurações de GPU acima ou forneça detalhes aqui."
      }
    },
    "availability": {
      "anchor": "disponibilidade-em-destaque",
      "title": "Disponibilidade em destaque",
      "subtitle": "Capacidade de GPU em destaque com disponibilidade ao vivo entre provedores.",
      "liveLabel": "Disponibilidade ao vivo",
      "inStockLabel": "Em estoque",
      "limitedLabel": "Disponibilidade limitada",
      "cta": "Adicionar ao plano",
      "added": "Adicionado",
      "fromLabel": "A partir de",
      "memoryLabel": "{memory} VRAM",
      "perHour": "/h",
      "priceUnknown": "Preço sob consulta"
    },
    "plan": {
      "tbdShort": "Detalhes de configuração pendentes",
      "tbdDetails": "Confirmaremos provedor, região e tamanho juntos.",
      "tbdPrice": "Preço pendente"
    },
    "useCases": {
      "anchor": "casos-de-uso",
      "title": "O que você está construindo?",
      "subtitle": "Escolha um caso de uso para ver configurações recomendadas para o seu workload.",
      "helper": "Não tem certeza do que precisa? Vários casos de uso? Quer uma configuração sob medida?",
      "helperCta": "Fale conosco",
      "configureAnchor": "Configurar template",
      "templateCount": "{count, plural, one {# opção de template} other {# opções de template}}",
      "items": {
        "llmTraining": {
          "name": "Treino de LLM",
          "description": "Treino e fine-tuning de grandes modelos de linguagem.",
          "examples": [
            "Pré-treino frontier / MoE",
            "Fine-tuning Llama e Qwen",
            "Clusters multi-nó NVLink",
            "Treino long-context"
          ]
        },
        "inference": {
          "name": "Inferência de IA",
          "description": "Serving e inferência de alto throughput.",
          "examples": [
            "APIs de chat long-context",
            "Endpoints de baixa latência",
            "Scoring batch / offline",
            "Serving de alto QPS"
          ]
        },
        "computerVision": {
          "name": "Visão computacional",
          "description": "Workloads de imagem e vídeo.",
          "examples": [
            "Detecção de objetos",
            "Segmentação de imagens",
            "Analítica de vídeo",
            "Modelos de visão multimodal"
          ]
        },
        "dataScience": {
          "name": "Ciência de dados",
          "description": "Analítica em larga escala e pipelines ETL.",
          "examples": [
            "Dataframes / SQL em GPU",
            "Engenharia de features",
            "ETL em larga escala",
            "Pipelines de embeddings"
          ]
        },
        "research": {
          "name": "Pesquisa",
          "description": "Workloads experimentais e acadêmicos.",
          "examples": [
            "Novas arquiteturas",
            "Estudos de ablação",
            "Varreduras de hiperparâmetros",
            "Benchmark de novos SKUs"
          ]
        },
        "development": {
          "name": "Desenvolvimento",
          "description": "Prototipagem e iteração.",
          "examples": [
            "Iteração rápida",
            "Harnesses de avaliação",
            "Testes CI / smoke",
            "Validação de protótipos"
          ]
        }
      }
    },
    "templatesModal": {
      "whyTitle": "Por que isso importa",
      "considerationsTitle": "Considerações principais",
      "templatesTitle": "Templates prontos para implantar",
      "templatesSubtitle": "Setups pré-configurados otimizados para {useCase}.",
      "addToQuote": "Adicionar à cotação",
      "addToQuoteLoading": "Adicionando…",
      "addToQuoteAdded": "Adicionado",
      "addAndConfigure": "Adicionar e configurar",
      "recommended": "Recomendado",
      "priceLabel": "Preço est.",
      "priceTbd": "Preço sob consulta",
      "itemsLabel": "Configuração",
      "planDetails": "Caso de uso: {useCase} - Nível: {tier}",
      "close": "Fechar",
      "tiers": {
        "enterprise": "Enterprise",
        "professional": "Professional",
        "standard": "Standard",
        "highVolume": "Alto volume",
        "balanced": "Equilibrado",
        "costOptimized": "Otimizado em custo",
        "entry": "Entrada",
        "dataIntensive": "Intensivo em dados",
        "cuttingEdge": "Ponta",
        "academic": "Acadêmico",
        "team": "Equipe",
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
          "why": "Treino de LLM precisa de alta largura de banda de memória e interconnects rápidos. Nós Blackwell e Hopper SXM reduzem o time-to-train em frontier e long-context.",
          "considerations": [
            "Tamanho do modelo e contexto definem o HBM mínimo",
            "Treino multi-GPU precisa de NVLink / fabric rápida",
            "Batches maiores melhoram eficiência, mas aumentam VRAM",
            "Capacidade HBM de H200/B200 muitas vezes importa mais que FLOPs isolados"
          ]
        },
        "inference": {
          "why": "Inferência prioriza tokens/$ e latência de cauda. Use GPUs de muita memória para serving long-context; Ada L40S para throughput econômico.",
          "considerations": [
            "Contexto e concorrência impulsionam VRAM",
            "Throughput escala com réplicas e batching",
            "INT8/FP8/FP16 cortam memória e sobem tokens/s",
            "L40S continua forte em preço/desempenho no mid-tier"
          ]
        },
        "computerVision": {
          "why": "Visão precisa de compute e memória equilibrados para imagens/vídeo de alta resolução e modelos multimodais.",
          "considerations": [
            "Resolução e batch definem o VRAM",
            "Vídeo e multimodal favorecem GPUs Ada maiores",
            "Pipelines em tempo real querem baixa latência",
            "Treino e inferência muitas vezes pedem SKUs diferentes"
          ]
        },
        "dataScience": {
          "why": "Dataframes GPU, SQL e pipelines de embeddings se beneficiam de muito HBM e aceleração CUDA/ROCm.",
          "considerations": [
            "Tamanho do dataset define a memória",
            "Stacks tipo RAPIDS querem GPUs CUDA",
            "Multi-GPU ajuda em jobs maiores que a memória",
            "I/O de storage costuma engarrafar antes da GPU"
          ]
        },
        "research": {
          "why": "Pesquisa precisa de arquiteturas atuais e flexibilidade para escalar experimentos rápido.",
          "considerations": [
            "SKUs novos liberam mais contexto e MoE mais densos",
            "Escale por experimento para controlar custo",
            "Mixed precision importa entre toolchains",
            "Iteração rápida costuma vencer o tamanho máximo de cluster"
          ]
        },
        "development": {
          "why": "Ambientes de desenvolvimento precisam de GPUs responsivas com custo always-on controlado.",
          "considerations": [
            "Iteração rápida precisa de nós ágeis",
            "A maior parte do trabalho de dev não precisa de multi-GPU",
            "Always-on amplifica o custo horário",
            "Espelhe SKUs de produção em escala menor quando puder"
          ]
        }
      },
      "bestForLabel": "Ideal para",
      "bestFor": {
        "llmTraining": {
          "enterprise": "Pré-treino frontier / MoE em Blackwell (70B+ dense, MoE grande)",
          "professional": "Treino long-context e modelos grandes em H200",
          "standard": "Fine-tuning e treino mid-size em H100 SXM"
        },
        "inference": {
          "highVolume": "Serving frontier / long-context",
          "balanced": "APIs de alto QPS e inferência batch em L40S",
          "costOptimized": "Endpoints de baixo tráfego e staging"
        },
        "computerVision": {
          "professional": "Vídeo alta res., multimodal e treino",
          "standard": "Detecção/segmentação e pipelines em tempo real",
          "entry": "Prototipagem e datasets pequenos"
        },
        "dataScience": {
          "dataIntensive": "Jobs com muito HBM (working sets 100GB+)",
          "balanced": "ETL / analytics GPU em Hopper PCIe",
          "standard": "Análise exploratória e transforms leves"
        },
        "research": {
          "cuttingEdge": "Experimentos frontier que precisam de memória H200",
          "professional": "Workloads de lab em H100 SXM",
          "academic": "Trabalho acadêmico de uma GPU"
        },
        "development": {
          "team": "Ambientes de equipe compartilhados em L40S",
          "standard": "Dev individual e harnesses de eval",
          "starter": "Smoke tests leves e protótipos"
        }
      },
      "tradeoffs": {
        "performance": "Desempenho",
        "cost": "Custo",
        "simplicity": "Simplicidade"
      }
    },
    "catalog": {
      "via": "via",
      "sourceSeparator": ", ",
      "snapshotDate": "· {date}"
    },
    "gpuModal": {
      "selectRegion": "Selecionar região",
      "selectSizeProvider": "Selecionar tamanho e provedor",
      "changeRegion": "Alterar região",
      "changeSelection": "Alterar seleção",
      "regionLabel": "Região: {region}",
      "providerColumn": "Provedor",
      "gpuCount": "{count, plural, one {# GPU} other {# GPUs}}",
      "configurationDetails": "Detalhes da configuração",
      "tabs": {
        "overview": "Visão geral",
        "risk": "Risco e desempenho",
        "infrastructure": "Infraestrutura"
      },
      "overview": {
        "clusterTitle": "{count, plural, one {{count} × {model} GPU} other {{count} × {model} GPUs}}",
        "provider": "Provedor",
        "configuration": "Configuração",
        "leadTime": "Lead time: {leadTime}",
        "terms": "Termos",
        "minTerm": "Mín. {term}",
        "flexibleBilling": "Cobrança flexível",
        "support": "Suporte",
        "supportValue": "Suporte técnico 24/7",
        "supportHint": "SLA enterprise"
      },
      "metrics": {
        "heading": "Métricas de risco e desempenho — {provider}, {region}",
        "unavailable": "Ainda não há scores de risco para este anúncio. Valores aparecem como n/a até as facilities serem avaliadas.",
        "na": "n/a",
        "howEvaluated": "Como isso é avaliado?",
        "labels": {
          "naturalDisaster": "Desastre natural",
          "electricityReliability": "Confiabilidade elétrica",
          "fireRisk": "Risco de incêndio",
          "securityBreach": "Violação de segurança",
          "powerEfficiency": "Eficiência energética",
          "costEfficiency": "Eficiência de custo",
          "networkReliability": "Confiabilidade de rede",
          "coolingCapacity": "Capacidade de refrigeração"
        },
        "tooltips": {
          "naturalDisaster": "Probabilidade de interrupções por eventos ambientais (terremotos, inundações, tempestades, furacões, incêndios) durante o contrato.",
          "electricityReliability": "Estabilidade do fornecimento elétrico: rede, geração on-site, UPS e uptime histórico.",
          "fireRisk": "Eficácia de detecção, prevenção, extinção e compartimentação estrutural.",
          "securityBreach": "Força da segurança física e operacional contra acesso não autorizado ou interrupção.",
          "powerEfficiency": "Eficiência elétrica e de refrigeração sob carga GPU densa contínua.",
          "costEfficiency": "Custo-efetividade estrutural de operar GPUs neste site (energia, cooling, escala).",
          "networkReliability": "Diversidade de carriers, redundância de fibra, qualidade de roteamento e desempenho histórico de rede.",
          "coolingCapacity": "Capacidade de sustentar cargas GPU densas (20–100+ kW/rack) sem throttling contínuo."
        }
      },
      "infrastructure": {
        "title": "Detalhes de infraestrutura",
        "regionalAvailability": "Disponibilidade regional"
      }
    }
  }
} as const satisfies MessagesShape;

export default messages;
