import React, { useState } from 'react';
import { useTranslation } from '../i18n';

interface FantasyWorld {
  id: string;
  name: string;
  author: string;
  authorDid: string;
  genre: string;
  rank: number;
  subscribers: number;
  chaptersCount: number;
  bannerUrl: string;
  description: string;
  loreTags: string[];
  seasonPassPrice: string;
  royaltyEarned: string;
  kdpStatus: 'Published' | 'Pending Review' | 'Draft';
  web3IpId: string;
}

interface Chapter {
  id: string;
  title: string;
  chapterNumber: number;
  readTime: string;
  unlocked: boolean;
  price: string;
  content: string;
  audioTrack: string;
}

interface CharacterCard {
  id: string;
  name: string;
  role: string;
  power: string;
  loreSnippet: string;
  rarity: 'Legendary' | 'Epic' | 'Rare' | 'Common';
  imageUrl: string;
}

interface EditorialBounty {
  id: string;
  title: string;
  assignedTo: string;
  reward: string;
  status: 'Open' | 'In Progress' | 'Completed';
  type: 'Illustration' | 'Translation' | 'Lore Audit' | 'Audiobook';
}

const MOCK_WORLDS: FantasyWorld[] = [
  {
    id: 'aethelgard',
    name: 'El Reino de Aethelgard',
    author: 'Elena R. Sterling',
    authorDid: 'did:solana:8xPt...9qA2 (Verified Master Author)',
    genre: 'Alta Fantasía / Grimdark',
    rank: 1,
    subscribers: 14250,
    chaptersCount: 42,
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    description: 'Un imperio fragmentado por antiguas reliquias de sangre donde los caballeros rúnicos luchan por el trono de obsidiana.',
    loreTags: ['Espadas', 'Runas', 'Monarquía', 'Magia Oscura'],
    seasonPassPrice: '0.15 SOL',
    royaltyEarned: '$18,420 USDC',
    kdpStatus: 'Published',
    web3IpId: 'IP-AETH-88219-SOL'
  },
  {
    id: 'necrocyber',
    name: 'NecroCyber 2099',
    author: 'Kaelen Vance',
    authorDid: 'did:solana:3mK9...7xL1 (Verified Author)',
    genre: 'Cyberpunk LitRPG',
    rank: 2,
    subscribers: 9800,
    chaptersCount: 28,
    bannerUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    description: 'En las profundidades de Neo-Kyoto, nigromantes digitales clonan conciencias para venderlas en la blockchain.',
    loreTags: ['Cyberpunk', 'Nigromancia', 'IA Sentiente', 'Implantes'],
    seasonPassPrice: '0.12 SOL',
    royaltyEarned: '$12,150 USDC',
    kdpStatus: 'Published',
    web3IpId: 'IP-NECRO-99104-SOL'
  },
  {
    id: 'eldoria',
    name: 'Crónicas de Eldoria',
    author: 'Marcus Vance',
    authorDid: 'did:solana:5vR2...1pQ8 (Verified Author)',
    genre: 'Fantasía Épica & Dragones',
    rank: 3,
    subscribers: 8100,
    chaptersCount: 35,
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    description: 'La alianza entre los jinetes de wyverns y las casas nobles del norte se pone a prueba ante el retorno de las sombras.',
    loreTags: ['Dragones', 'Alianzas', 'Guerra Elemental'],
    seasonPassPrice: '0.10 SOL',
    royaltyEarned: '$9,890 USDC',
    kdpStatus: 'Pending Review',
    web3IpId: 'IP-ELDO-44120-SOL'
  }
];

const MOCK_CHAPTERS: Chapter[] = [
  {
    id: 'ch-1',
    title: 'Capítulo I: El Despertar de la Runa Encarnada',
    chapterNumber: 1,
    readTime: '12 min',
    unlocked: true,
    price: 'Gratis',
    audioTrack: 'Sinfonía de Sombras & Truenos',
    content: `La nieve caía pesada sobre las almenas de la Fortaleza de Obsidiana. El aliento de Valerius formaba nubes de vapor en el aire helado mientras sujetaba la empuñadura de su mandoble. En la hoja de acero valyrio, las runas grabadas por su padre tres siglos atrás comenzaron a destellar con un fulgor carmesí inusual.\n\n—No deberían estar vivas —susurró Lady Kaelen, ajustándose su capa de piel de lobo—. El Gran Sello de las Montañas fue roto al anochecer. Lo que yace debajo ha despertado.`
  },
  {
    id: 'ch-2',
    title: 'Capítulo II: Pactos en la Ciudad Sumergida',
    chapterNumber: 2,
    readTime: '15 min',
    unlocked: true,
    price: '0.01 SOL',
    audioTrack: 'Ecos Marinos de Cristal',
    content: `Descendieron por los peldaños de piedra coralina hacia las criptas sumergidas de Eldoria. El agua resonaba contra los muros iluminados por bioluminiscencia ancestral. Frente al altar de la Emperatriz del Abismo, Valerius desenvainó su espada y pronunció el antiguo juramento de los Guardianes del Crepúsculo.`
  },
  {
    id: 'ch-3',
    title: 'Capítulo III: El Eclipse del Trono de Sangre',
    chapterNumber: 3,
    readTime: '18 min',
    unlocked: false,
    price: '0.02 SOL',
    audioTrack: 'Tambores de Guerra Titánica',
    content: `Contenido bloqueado. Adquiere el Capítulo 3 o el Pase de Temporada para desbloquear la continuación inmediata y la carta exclusiva de Lord Valerius.`
  }
];

const MOCK_CARDS: CharacterCard[] = [
  {
    id: 'c1',
    name: 'Lord Valerius El Inmortal',
    role: 'Comandante de la Guardia Rúnica',
    power: 'Ataque Rúnico: 98 | Defensa: 92',
    loreSnippet: 'Heredero del Trono de Obsidiana, curtido en más de cien batallas contra los Titanes del Sombras.',
    rarity: 'Legendary',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'c2',
    name: 'Lady Kaelen de la Bruma',
    role: 'Hechicera Arcana & Estratega',
    power: 'Magia Arcana: 99 | Astucia: 95',
    loreSnippet: 'Última maestra de las artes del agua profunda y custodia del grimorio de las sombras.',
    rarity: 'Epic',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
  }
];

const MOCK_BOUNTIES: EditorialBounty[] = [
  {
    id: 'b1',
    title: 'Ilustrar Mapa de las Montañas de Obsidiana',
    assignedTo: 'Agent Visual Engine (Midjourney v6 API)',
    reward: '0.5 SOL',
    status: 'Completed',
    type: 'Illustration'
  },
  {
    id: 'b2',
    title: 'Traducción Editorial al Japonés (Capítulos 1-10)',
    assignedTo: 'Hermes Translator Agent',
    reward: '1.2 SOL',
    status: 'In Progress',
    type: 'Translation'
  },
  {
    id: 'b3',
    title: 'Auditoría de Inconsistencias de Lore en Cap. 3',
    assignedTo: 'Hermes Lore Guard',
    reward: '0.2 SOL',
    status: 'Completed',
    type: 'Lore Audit'
  }
];

export function GoalWorldPortal() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'nexus' | 'reader' | 'saas' | 'hermes'>('nexus');
  const [selectedWorld, setSelectedWorld] = useState<FantasyWorld>(MOCK_WORLDS[0]);
  const [activeChapter, setActiveChapter] = useState<Chapter>(MOCK_CHAPTERS[0]);
  const [fontSize, setFontSize] = useState<number>(18);
  const [playingAudio, setPlayingAudio] = useState<boolean>(false);
  const [unlockedChapters, setUnlockedChapters] = useState<Record<string, boolean>>({
    'ch-1': true,
    'ch-2': true,
    'ch-3': false
  });

  // SaaS Publishing & Tokenization state
  const [bookTitle, setBookTitle] = useState('');
  const [isbn, setIsbn] = useState('978-3-16-148410-0');
  const [kdpAutoPublish, setKdpAutoPublish] = useState(true);
  const [tokenizedShare, setTokenizedShare] = useState('85% Autor / 10% Editores / 5% Agente');
  const [publishingStep, setPublishingStep] = useState<number>(1);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  // Hermes Audit State
  const [hermesPrompt, setHermesPrompt] = useState('');
  const [hermesResponse, setHermesResponse] = useState('');
  const [hermesLoading, setHermesLoading] = useState(false);

  const handleUnlock = (chId: string) => {
    setUnlockedChapters((prev) => ({ ...prev, [chId]: true }));
    setActiveChapter((prev) => ({ ...prev, unlocked: true }));
  };

  const handlePublishSaaS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) return;
    setPublishingStep(4);
    setTimeout(() => {
      setPublishedSuccess(true);
      setTimeout(() => setPublishedSuccess(false), 5000);
      setBookTitle('');
      setPublishingStep(1);
    }, 2000);
  };

  const handleRunHermesAudit = () => {
    if (!hermesPrompt.trim()) return;
    setHermesLoading(true);
    setHermesResponse('');
    setTimeout(() => {
      setHermesLoading(false);
      setHermesResponse(
        `✨ [Hermes Agentic Co-Creation Audit]\n\n` +
        `• Simbiosis Humano-Agente: Dirección creativa validada por Autor Humano (DID verificado).\n` +
        `• Maquetación KDP: EPUB / PDF Print-ready formateado según estándares de Amazon KDP & IngramSpark.\n` +
        `• Registro IP On-Chain: Tokenizado como IP Asset en Solana & Story Protocol (Royalty Module Activo).\n` +
        `• Metadatos & Lore: Árbol genealógico de personajes sincronizado con la base de datos de gBrain y Obsidian.`
      );
    }, 1800);
  };

  return (
    <div style={{ padding: '1.5rem', color: '#e2e8f0', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header & Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(26, 16, 45, 0.95) 0%, rgba(13, 10, 28, 0.98) 100%)',
        border: '1px solid rgba(147, 51, 234, 0.4)',
        borderRadius: '20px',
        padding: '2.5rem',
        marginBottom: '2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              color: '#c084fc',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 800,
              marginBottom: '1rem'
            }}>
              🔮 GOALWORLD NEXUS • SAAS EDITORIAL & LORE LEAGUE
            </div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              margin: '0 0 0.5rem 0',
              background: 'linear-gradient(90deg, #ffffff 0%, #e9d5ff 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Nexo de Gestión Editorial Descentralizada & Universos de Fantasía
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '800px', margin: 0, lineHeight: 1.6 }}>
              Plataforma SaaS integral para autores: Auto-publicación híbrida en <strong>Amazon KDP + Tokenización de Derechos IP</strong> en Solana. Colaboración orgánica entre creadores humanos y la suite de Agentes Hermes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setActiveTab('saas')}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                border: 'none',
                color: '#fff',
                fontWeight: 900,
                padding: '12px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(168, 85, 247, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              🛠️ Publisher SaaS Studio
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.25rem',
          overflowX: 'auto'
        }}>
          {[
            { id: 'nexus', label: '🪐 Nexus de Universos', badge: 'Fantasía' },
            { id: 'reader', label: '📖 Lector Inmersivo', badge: 'E-Reader' },
            { id: 'saas', label: '🛠️ Publisher SaaS (KDP + Web3)', badge: 'Simbiosis IA' },
            { id: 'hermes', label: '🤖 Hermes Co-Writer Suite', badge: 'Agentes' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                border: activeTab === tab.id ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
                color: activeTab === tab.id ? '#fff' : '#94a3b8',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '6px',
                background: activeTab === tab.id ? '#a855f7' : 'rgba(255, 255, 255, 0.1)',
                color: activeTab === tab.id ? '#fff' : '#cbd5e1'
              }}>
                {tab.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: NEXUS DE UNIVERSOS */}
      {activeTab === 'nexus' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>🏆 Ranking de Ligas de Fantasía (Sagas Tokenizadas)</h2>
            <span style={{ color: '#a855f7', fontSize: '0.9rem', fontWeight: 600 }}>3 Universos Principales Activos</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {MOCK_WORLDS.map((world) => (
              <div
                key={world.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: selectedWorld.id === world.id ? '2px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={world.bannerUrl}
                    alt={world.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: '#a855f7',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: '0.8rem',
                    padding: '4px 10px',
                    borderRadius: '8px'
                  }}>
                    RANK #{world.rank}
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: world.kdpStatus === 'Published' ? '#22c55e' : '#f59e0b',
                    color: '#000',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    borderRadius: '6px'
                  }}>
                    Amazon KDP: {world.kdpStatus}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(4px)',
                    color: '#22c55e',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    padding: '4px 10px',
                    borderRadius: '8px'
                  }}>
                    💰 Royalties: {world.royaltyEarned}
                  </div>
                </div>

                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>{world.name}</h3>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    Por <strong style={{ color: '#e2e8f0' }}>{world.author}</strong> • {world.genre}
                  </div>
                  <div style={{ color: '#c084fc', fontSize: '0.72rem', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
                    🔑 DID Autor: {world.authorDid}
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                    {world.description}
                  </p>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    {world.loreTags.map((tag) => (
                      <span key={tag} style={{
                        background: 'rgba(168, 85, 247, 0.12)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        color: '#c084fc',
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pase de Temporada</div>
                      <div style={{ fontWeight: 800, color: '#f59e0b' }}>{world.seasonPassPrice}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedWorld(world);
                        setActiveTab('reader');
                      }}
                      style={{
                        background: 'rgba(168, 85, 247, 0.2)',
                        border: '1px solid #a855f7',
                        color: '#fff',
                        fontWeight: 700,
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      📖 Leer Saga
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cards Gallery Section */}
          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>🎴 Cartas de Personajes y Reliquias Coleccionables (NFTs en Solana)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {MOCK_CARDS.map((card) => (
                <div
                  key={card.id}
                  style={{
                    background: 'linear-gradient(145deg, rgba(30, 27, 75, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    borderRadius: '16px',
                    padding: '1rem',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px', marginBottom: '0.75rem' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{card.name}</h4>
                    <span style={{
                      background: card.rarity === 'Legendary' ? '#f59e0b' : '#a855f7',
                      color: '#000',
                      fontWeight: 900,
                      fontSize: '0.65rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {card.rarity}
                    </span>
                  </div>
                  <div style={{ color: '#c084fc', fontSize: '0.8rem', margin: '4px 0 8px 0', fontWeight: 600 }}>{card.role}</div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '8px' }}>
                    ⚡ {card.power}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>{card.loreSnippet}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LECTOR INMERSIVO */}
      {activeTab === 'reader' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
          {/* Chapter Selector Sidebar */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.25rem',
            height: 'fit-content'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#c084fc' }}>
              📚 {selectedWorld.name}
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Capítulos de la Temporada 1
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {MOCK_CHAPTERS.map((ch) => {
                const isUnlocked = unlockedChapters[ch.id];
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      if (isUnlocked) {
                        setActiveChapter(ch);
                      }
                    }}
                    style={{
                      background: activeChapter.id === ch.id ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.02)',
                      border: activeChapter.id === ch.id ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.05)',
                      color: isUnlocked ? '#fff' : '#64748b',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      textAlign: 'left',
                      cursor: isUnlocked ? 'pointer' : 'default',
                      fontSize: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>Cap. {ch.chapterNumber}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{ch.readTime}</div>
                    </div>
                    {isUnlocked ? (
                      <span style={{ color: '#22c55e', fontSize: '0.8rem' }}>✓ Abierto</span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlock(ch.id);
                        }}
                        style={{
                          background: '#f59e0b',
                          border: 'none',
                          color: '#000',
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Desbloquear ({ch.price})
                      </button>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Audio Atmosphere Controls */}
            <div style={{
              marginTop: '2rem',
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c084fc', marginBottom: '6px' }}>
                🎵 Banda Sonora de Fantasía
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '10px' }}>
                {activeChapter.audioTrack}
              </div>
              <button
                onClick={() => setPlayingAudio(!playingAudio)}
                style={{
                  width: '100%',
                  background: playingAudio ? '#ef4444' : '#a855f7',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 800,
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                {playingAudio ? '⏸️ Pausar Música de Ambiente' : '▶️ Reproducir Ambiente Sonoro'}
              </button>
            </div>
          </div>

          {/* Reader Panel */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>{activeChapter.title}</h2>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  {selectedWorld.name} • {activeChapter.readTime} de lectura
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tamaño Fuente:</span>
                <button
                  onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize(Math.min(26, fontSize + 2))}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  A+
                </button>
              </div>
            </div>

            {/* Book Chapter Text */}
            <div style={{
              fontSize: `${fontSize}px`,
              lineHeight: 1.8,
              color: '#e2e8f0',
              fontFamily: 'Georgia, serif',
              whiteSpace: 'pre-line',
              minHeight: '300px'
            }}>
              {activeChapter.content}
            </div>

            {/* Chapter Footer Actions */}
            <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                disabled
                style={{ opacity: 0.4, background: 'none', border: '1px solid #94a3b8', color: '#fff', padding: '8px 16px', borderRadius: '8px' }}
              >
                ← Capítulo Anterior
              </button>
              <button
                onClick={() => handleUnlock('ch-3')}
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 800,
                  padding: '10px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                Siguiente Capítulo →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PUBLISHER SAAS (AMAZON KDP + WEB3 TOKENIZER) */}
      {activeTab === 'saas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* SaaS Header & Step Progress */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '16px',
            padding: '1.5rem 2rem'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', fontWeight: 800, color: '#c084fc' }}>
              🛠️ GoalWorld SaaS Editorial: Pipeline de Publicación Doble Vía
            </h3>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem' }}>
              De borrador a publicación masiva en <strong>Amazon KDP (Web2)</strong> y <strong>Tokenización de IP On-Chain (Web3)</strong>.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
              {[
                { step: 1, label: '1. Credencial & Borrador' },
                { step: 2, label: '2. Formato Amazon KDP (EPUB)' },
                { step: 3, label: '3. Tokenización IP & Royalty Splits' },
                { step: 4, label: '4. Publicación en Vivo' }
              ].map((s) => (
                <div
                  key={s.step}
                  onClick={() => setPublishingStep(s.step)}
                  style={{
                    flex: 1,
                    background: publishingStep === s.step ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255,255,255,0.02)',
                    border: publishingStep === s.step ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
                    color: publishingStep === s.step ? '#fff' : '#94a3b8',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
            {/* Publisher Form */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '16px',
              padding: '2rem'
            }}>
              {publishedSuccess && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid #22c55e',
                  color: '#4ade80',
                  padding: '1rem',
                  borderRadius: '10px',
                  marginBottom: '1.5rem',
                  fontWeight: 700
                }}>
                  🎉 ¡Publicación Doble Vía Exitosa! El libro fue enviado a Amazon KDP para revisión y tokenizado como IP Asset en Solana.
                </div>
              )}

              <form onSubmit={handlePublishSaaS} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Título del Libro / Saga</label>
                  <input
                    type="text"
                    placeholder="Ej: Las Crónicas de Aethelgard: Tomo I"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#fff',
                      fontSize: '0.95rem'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Registro ISBN Digital</label>
                    <input
                      type="text"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#fff',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Reparto de Regalías IP</label>
                    <input
                      type="text"
                      value={tokenizedShare}
                      onChange={(e) => setTokenizedShare(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#fff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#e9d5ff' }}>
                    <input
                      type="checkbox"
                      checked={kdpAutoPublish}
                      onChange={(e) => setKdpAutoPublish(e.target.checked)}
                    />
                    Sincronización Automática con Amazon KDP API & IngramSpark (Tapa Blanda / EPUB)
                  </label>
                </div>

                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 900,
                    padding: '14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    boxShadow: '0 8px 20px rgba(168, 85, 247, 0.4)'
                  }}
                >
                  🚀 Ejecutar Publicación Doble Vía (Amazon KDP + Solana IP Token)
                </button>
              </form>

              {/* Task Bounties Section */}
              <div style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 800 }}>⚡ Bounties de Tareas Editoriales (Humano + Agente)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {MOCK_BOUNTIES.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{b.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Asignado a: {b.assignedTo}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#f59e0b' }}>{b.reward}</div>
                        <span style={{
                          fontSize: '0.68rem',
                          color: b.status === 'Completed' ? '#22c55e' : '#a855f7',
                          fontWeight: 800
                        }}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Author Credential & Ecosystem Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '16px',
                padding: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#c084fc' }}>
                  🛡️ Credencial Soulbound de Autor
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
                  Identidad On-Chain verificada (Proof of Authorship)
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.4)',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: '#22c55e',
                  marginBottom: '1rem'
                }}>
                  DID: did:solana:8xPt9qA2...
                  <br />
                  Reputación Editorial: 99.4/100
                </div>
                <button style={{
                  width: '100%',
                  background: 'rgba(168, 85, 247, 0.2)',
                  border: '1px solid #a855f7',
                  color: '#fff',
                  fontWeight: 700,
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}>
                  📜 Ver Certificado de Autenticidad
                </button>
              </div>

              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 800 }}>🌐 Arquitectura Doble Vía</h4>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.7 }}>
                  • <strong>Web2 (Amazon KDP)</strong>: Distribución masiva en la tienda Kindle global, tapa blanda e ISBN oficial.<br />
                  • <strong>Web3 (Solana IP)</strong>: Tokenización de regalías, venta serializada Pay-Per-Chapter y Pases de Temporada sin intermediarios.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HERMES LORE & CO-WRITER SUITE */}
      {activeTab === 'hermes' && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          borderRadius: '16px',
          padding: '2rem'
        }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#c084fc' }}>
            🤖 Hermes Co-Writer & Lore Guard Agent Suite
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Solicita a los Agentes de Hermes auditorías de consistencia cronológica, maquetación automática a EPUB/PDF o generación de cartas visuales para tus personajes.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Ingresa un extracto de tu capítulo o el nombre de un personaje para auditar..."
              value={hermesPrompt}
              onChange={(e) => setHermesPrompt(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: '0.95rem'
              }}
            />
            <button
              onClick={handleRunHermesAudit}
              disabled={hermesLoading}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                border: 'none',
                color: '#fff',
                fontWeight: 800,
                padding: '12px 24px',
                borderRadius: '10px',
                cursor: hermesLoading ? 'wait' : 'pointer'
              }}
            >
              {hermesLoading ? '⏳ Analizando Lore...' : '🔍 Auditar con Hermes'}
            </button>
          </div>

          {hermesResponse && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              color: '#e9d5ff',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              whiteSpace: 'pre-line',
              lineHeight: 1.6
            }}>
              {hermesResponse}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
