import React, { useState, useEffect, useRef } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { fetchUserChainStats } from '../lib/goalchainClient';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from '../i18n';
// Mock profiles dictionary for fallback stats
const MOCK_PROFILES = {
    demo_user: {
        avatar: '🦅',
        role: 'Manager',
        wallet: 'GoAL...c4in',
        joinedDate: 'Mayo 2026',
        bio: 'GoalChain Manager apasionado por la analítica de fútbol y las finanzas descentralizadas.',
        location: 'España',
        accentColor: '#14f195',
        followersCount: 84,
        stats: { balance: 2340.50, totalBets: 47, winRate: 68.1, nftsOwned: 12, upgradesDone: 3, totalVolume: 18920.00, rank: 'Gold', xp: 4210 },
        recentActivity: [
            { type: 'BET', desc: 'ARG vs FRA — Long x5', amount: '+320 USDC', date: '23 May', positive: true },
            { type: 'NFT', desc: 'Enzo Bit Gold — Adquirido', amount: '-180 USDC', date: '22 May', positive: false },
            { type: 'UPGRADE', desc: 'Enzo Bit → Platinum', amount: '-50 USDC', date: '21 May', positive: false },
            { type: 'BET', desc: 'BRA vs ESP — Short x3', amount: '+150 USDC', date: '20 May', positive: true },
        ],
        nfts: [
            { name: 'Enzo Bit', rarity: 'Gold', emoji: '⚽', level: 3 },
            { name: 'Julian Satoshi', rarity: 'Silver', emoji: '🥈', level: 2 },
            { name: 'Lucas Zero', rarity: 'Bronze', emoji: '🥉', level: 1 },
        ],
    },
    lionelmessi: {
        avatar: '🐐',
        role: 'Manager',
        wallet: 'LeO5...mEsS',
        joinedDate: 'Enero 2026',
        bio: 'El diez en la cancha y en la gobernanza. ⚽✨',
        location: 'Argentina',
        accentColor: '#ffd700',
        followersCount: 1250452,
        stats: { balance: 99420.00, totalBets: 154, winRate: 88.5, nftsOwned: 35, upgradesDone: 15, totalVolume: 992450.00, rank: 'Gold', xp: 48900 },
        recentActivity: [
            { type: 'BET', desc: 'MIA vs NYC — Long x10', amount: '+5,000 USDC', date: '25 May', positive: true },
            { type: 'NFT', desc: 'Messi Satoshi Mythic — Minted', amount: '+0 USDC', date: '20 May', positive: true },
        ],
        nfts: [
            { name: 'Messi Satoshi', rarity: 'Gold', emoji: '👑', level: 5 },
            { name: 'Enzo Bit', rarity: 'Gold', emoji: '⚽', level: 4 },
        ],
    },
};
const getProfileData = (username) => {
    const normalized = username.toLowerCase();
    if (MOCK_PROFILES[normalized]) {
        return { ...MOCK_PROFILES[normalized], username };
    }
    return {
        avatar: '👤',
        role: 'Manager',
        wallet: 'Cx72...99ab',
        joinedDate: 'Junio 2026',
        bio: 'Nuevo Manager listo para competir.',
        location: 'Latam',
        accentColor: '#14f195',
        followersCount: 12,
        stats: { balance: 50.00, totalBets: 2, winRate: 50.0, nftsOwned: 0, upgradesDone: 0, totalVolume: 100.00, rank: 'Bronze', xp: 120 },
        recentActivity: [
            { type: 'BET', desc: 'LP vs SP — Long x1', amount: '+10 USDC', date: '25 Jun', positive: true },
        ],
        nfts: [],
    };
};
const RARITY_COLORS = {
    Gold: '#ffd700',
    Silver: '#c0c0c0',
    Bronze: '#cd7f32',
    Platinum: '#14f195',
};
const ACTIVITY_COLORS = {
    BET: '#9945ff',
    NFT: '#14f195',
    UPGRADE: '#f7b731',
};
const ACCENT_PRESETS = [
    { color: '#14f195', name: 'Neon Green' },
    { color: '#9945ff', name: 'Neon Purple' },
    { color: '#00e0ff', name: 'Cyan' },
    { color: '#fbbf24', name: 'Gold' },
    { color: '#ef4444', name: 'Vibrant Red' },
];
export const UserProfile = ({ username: propUsername }) => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const { user: currentUser, setUser } = useUser();
    const { language } = useTranslation();
    const fileInputRef = useRef(null);
    const urlUsername = window.location.pathname.split('/perfil/')[1];
    const rawUsername = propUsername || urlUsername || 'demo_user';
    // Keep username formatted but match key safely
    const username = rawUsername.trim();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [chainStats, setChainStats] = useState(null);
    // Form states for editing
    const [editBio, setEditBio] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editTwitter, setEditTwitter] = useState('');
    const [editTelegram, setEditTelegram] = useState('');
    const [editDiscord, setEditDiscord] = useState('');
    const [editGithub, setEditGithub] = useState('');
    const [editForwardingEmail, setEditForwardingEmail] = useState('');
    const [editAccentColor, setEditAccentColor] = useState('#14f195');
    const [editPhotoUrl, setEditPhotoUrl] = useState('');
    // Social feed states
    const [feed, setFeed] = useState([]);
    const [newPostText, setNewPostText] = useState('');
    const isMyProfile = currentUser && currentUser.username.toLowerCase() === username.toLowerCase();
    // Resolve base profile data
    const profile = getProfileData(username);
    // If it's my profile, merge currentUser reactive changes
    if (isMyProfile && currentUser) {
        profile.avatar = currentUser.avatar || profile.avatar;
        profile.role = currentUser.role || profile.role;
        if (currentUser.wallet) {
            profile.wallet = `${currentUser.wallet.slice(0, 4)}...${currentUser.wallet.slice(-4)}`;
        }
        profile.bio = currentUser.bio !== undefined ? currentUser.bio : profile.bio;
        profile.location = currentUser.location !== undefined ? currentUser.location : profile.location;
        profile.twitter = currentUser.twitter || '';
        profile.telegram = currentUser.telegram || '';
        profile.discord = currentUser.discord || '';
        profile.github = currentUser.github || '';
        profile.forwardingEmail = currentUser.forwardingEmail || '';
        profile.accentColor = currentUser.accentColor || '#14f195';
        profile.customPhotoUrl = currentUser.customPhotoUrl || '';
    }
    const accentColor = profile.accentColor || '#14f195';
    // Load social feed and initialize edit form fields
    useEffect(() => {
        // Sync edit fields
        if (isMyProfile && currentUser) {
            setEditBio(profile.bio);
            setEditLocation(profile.location);
            setEditTwitter(profile.twitter || '');
            setEditTelegram(profile.telegram || '');
            setEditDiscord(profile.discord || '');
            setEditGithub(profile.github || '');
            setEditForwardingEmail(profile.forwardingEmail || '');
            setEditAccentColor(profile.accentColor || '#14f195');
            setEditPhotoUrl(profile.customPhotoUrl || '');
        }
        // Load social feed
        const cachedFeed = localStorage.getItem('goalchain_public_feed');
        if (cachedFeed) {
            try {
                setFeed(JSON.parse(cachedFeed));
            }
            catch {
                initializeSeedFeed();
            }
        }
        else {
            initializeSeedFeed();
        }
    }, [username, isMyProfile, currentUser]);
    // Load Solana chain stats dynamically if connected
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!publicKey) {
                if (mounted)
                    setChainStats(null);
                return;
            }
            try {
                const stats = await fetchUserChainStats(connection, publicKey);
                if (mounted)
                    setChainStats(stats);
            }
            catch (e) {
                console.error('Error fetching chain stats:', e);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [connection, publicKey?.toBase58()]);
    const initializeSeedFeed = () => {
        const seed = [
            {
                id: '1',
                username: 'LionelMessi',
                avatar: '🐐',
                role: 'Manager',
                content: 'Preparando el análisis para el próximo partido. El Cronista IA tiene unas predicciones muy interesantes sobre el rendimiento físico del plantel. 📊⚽',
                timestamp: 'Hace 2 horas',
                likes: 342,
            },
            {
                id: '2',
                username: 'demo_user',
                avatar: '🦅',
                role: 'Manager',
                content: 'NemoClaw me acaba de auditar un comando de alto riesgo en la terminal de derivados. La seguridad con la firma del Genesis Squad es impecable. ¡Por fin utilidad real para mis NFTs! ⚖️🛡️',
                timestamp: 'Hace 4 horas',
                likes: 128,
                likedByMe: true,
            },
            {
                id: '3',
                username: 'scout_master',
                avatar: '🐺',
                role: 'Scout',
                content: '¿Alguien tiene un delantero legendario con stats de tiro > 90 en el Transfer Market? Pago en SOL o Cash directos. Ofertas al inbox. 🛒',
                timestamp: 'Hace 1 día',
                likes: 45,
            }
        ];
        setFeed(seed);
        localStorage.setItem('goalchain_public_feed', JSON.stringify(seed));
    };
    const handleSaveProfile = () => {
        if (!currentUser)
            return;
        const updated = {
            ...currentUser,
            bio: editBio,
            location: editLocation,
            twitter: editTwitter,
            telegram: editTelegram,
            discord: editDiscord,
            github: editGithub,
            forwardingEmail: editForwardingEmail,
            accentColor: editAccentColor,
            customPhotoUrl: editPhotoUrl,
        };
        setUser(updated);
        setIsEditing(false);
    };
    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        // Validate size (< 1.5MB to stay safe in localStorage)
        if (file.size > 1.5 * 1024 * 1024) {
            alert(language === 'es' ? 'La imagen debe pesar menos de 1.5MB' : 'Image size must be under 1.5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setEditPhotoUrl(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };
    // Follow mechanic
    const isFollowing = currentUser?.following?.includes(username) || false;
    const handleFollowToggle = () => {
        if (!currentUser)
            return;
        let followingList = currentUser.following ? [...currentUser.following] : [];
        if (isFollowing) {
            followingList = followingList.filter(u => u.toLowerCase() !== username.toLowerCase());
        }
        else {
            followingList.push(username);
        }
        setUser({
            ...currentUser,
            following: followingList,
        });
    };
    // Publish a new post
    const handlePublishPost = () => {
        if (!newPostText.trim())
            return;
        const newPost = {
            id: `post_${Date.now()}`,
            username: currentUser?.username || 'Guest',
            avatar: currentUser?.avatar || '👤',
            customPhotoUrl: currentUser?.customPhotoUrl,
            role: currentUser?.role || 'Manager',
            content: newPostText,
            timestamp: language === 'es' ? 'Hace unos instantes' : 'Just now',
            likes: 0,
        };
        const updated = [newPost, ...feed];
        setFeed(updated);
        localStorage.setItem('goalchain_public_feed', JSON.stringify(updated));
        setNewPostText('');
    };
    // Like a post
    const handleLikePost = (postId) => {
        const updated = feed.map(post => {
            if (post.id === postId) {
                const liked = !post.likedByMe;
                return {
                    ...post,
                    likedByMe: liked,
                    likes: liked ? post.likes + 1 : Math.max(0, post.likes - 1),
                };
            }
            return post;
        });
        setFeed(updated);
        localStorage.setItem('goalchain_public_feed', JSON.stringify(updated));
    };
    // Resolved dynamic followers
    const followersCount = profile.followersCount + (isFollowing ? 1 : 0);
    const effectiveTotalBets = chainStats?.totalBets ?? profile.stats.totalBets;
    const effectiveVolume = chainStats?.totalVolumeBaseUnits ?? profile.stats.totalVolume;
    const effectiveBalance = chainStats ? chainStats.unclaimedRewardsBaseUnits : profile.stats.balance;
    const effectiveStaked = chainStats ? chainStats.stakedAmountBaseUnits : 0;
    const effectiveOpenBets = chainStats?.openBets ?? Math.round(profile.stats.totalBets * (1 - profile.stats.winRate / 100));
    const effectiveClaimedBets = chainStats?.claimedBets ?? Math.round(profile.stats.totalBets * profile.stats.winRate / 100);
    const tText = (en, es) => (language === 'es' ? es : en);
    return (<div className="profile-page" style={{ '--accent-theme': accentColor }}>
      
      {/* ── PROFILE HERO (GLASSMORPHIC) ── */}
      <div className="profile-hero-glass">
        <div className="profile-hero-top">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-large-circle">
              {profile.customPhotoUrl ? (<img src={profile.customPhotoUrl} alt={profile.username}/>) : (<span>{profile.avatar}</span>)}
            </div>
          </div>

          <div className="profile-hero-details">
            <div className="profile-header-name-row">
              <h1 className="profile-username-title">@{profile.username}</h1>
              <div className="action-buttons-wrap">
                {isMyProfile ? (<button className="profile-follow-btn" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }} onClick={() => setIsEditing(prev => !prev)}>
                    {isEditing ? tText('✕ Close', '✕ Cerrar') : tText('⚙️ Edit Profile', '⚙️ Editar Perfil')}
                  </button>) : (currentUser && (<button className={`profile-follow-btn ${isFollowing ? 'following-active' : ''}`} onClick={handleFollowToggle}>
                      {isFollowing ? tText('✓ Following', '✓ Siguiendo') : tText('＋ Follow', '＋ Seguir')}
                    </button>))}
              </div>
            </div>

            <div className="profile-meta-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.78rem', color: '#64748b' }}>
              <span className="profile-role-badge" style={{ color: accentColor, fontWeight: 800 }}>{profile.role}</span>
              <span className="profile-rank-badge" style={{ color: '#fbbf24', fontWeight: 800 }}>⭐ {profile.stats.rank}</span>
              <span>{tText(`Joined ${profile.joinedDate}`, `Desde ${profile.joinedDate}`)}</span>
            </div>

            <p className="profile-bio-text">{profile.bio}</p>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              {profile.location && (<span className="profile-location-tag">📍 {profile.location}</span>)}
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                <strong>{followersCount.toLocaleString()}</strong> {tText('followers', 'seguidores')}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                <strong>{currentUser?.following?.length || 0}</strong> {tText('following', 'siguiendo')}
              </span>
            </div>

            {/* Social links row */}
            {(profile.twitter || profile.telegram || profile.discord || profile.github) && (<div className="profile-socials-row">
                {profile.twitter && (<a href={`https://x.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="profile-social-link" title="Twitter">
                    <span className="profile-social-link-mock">𝕏</span>
                  </a>)}
                {profile.telegram && (<a href={`https://t.me/${profile.telegram}`} target="_blank" rel="noopener noreferrer" className="profile-social-link" title="Telegram">
                    <span className="profile-social-link-mock">TG</span>
                  </a>)}
                {profile.discord && (<a href={`https://discord.gg/${profile.discord}`} target="_blank" rel="noopener noreferrer" className="profile-social-link" title="Discord">
                    <span className="profile-social-link-mock">DC</span>
                  </a>)}
                {profile.github && (<a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="profile-social-link" title="GitHub">
                    <span className="profile-social-link-mock">GH</span>
                  </a>)}
              </div>)}
          </div>
        </div>

        {/* Experience point progress bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>
            <span>XP LEVEL PROGRESS</span>
            <span>{profile.stats.xp.toLocaleString()} XP</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(profile.stats.xp % 5000) / 50}%`, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}aa)`, borderRadius: 3 }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.62rem', color: '#64748b', marginTop: '4px' }}>
            {tText(`Next level in ${5000 - (profile.stats.xp % 5000)} XP`, `Próximo nivel en ${5000 - (profile.stats.xp % 5000)} XP`)}
          </div>
        </div>
      </div>

      {/* ── EDIT PROFILE SECTION (CONDITIONAL) ── */}
      {isMyProfile && isEditing && (<div className="profile-hero-glass" style={{ borderStyle: 'dashed', borderColor: accentColor }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 1rem', color: accentColor }}>
            ⚙️ {tText('Edit Profile Settings', 'Configuración del Perfil')}
          </h2>

          <div className="profile-edit-grid">
            
            {/* Left Column: Avatar & Basic Details */}
            <div className="edit-section-card">
              <h3>🎨 {tText('Identity & Customization', 'Identidad y Personalización')}</h3>
              
              {/* Photo Uploader */}
              <div className="avatar-upload-container">
                <div className="avatar-upload-preview">
                  {editPhotoUrl ? <img src={editPhotoUrl} alt="Preview"/> : <span>{profile.avatar}</span>}
                </div>
                <div className="avatar-upload-btn-wrap">
                  <input type="file" id="avatar-upload-file" style={{ display: 'none' }} ref={fileInputRef} accept="image/*" onChange={handlePhotoUpload}/>
                  <label htmlFor="avatar-upload-file" className="avatar-file-label">
                    {tText('Upload Photo', 'Subir Foto')}
                  </label>
                  {editPhotoUrl && (<button className="avatar-file-label" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.25)', color: '#ef4444', marginTop: '4px' }} onClick={() => setEditPhotoUrl('')}>
                      {tText('Remove', 'Remover')}
                    </button>)}
                  <span>{tText('Max size 1.5MB (PNG/JPG)', 'Peso máx 1.5MB (PNG/JPG)')}</span>
                </div>
              </div>

              {/* Accent Color picker */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>{tText('Accent Theme Color', 'Color de Acento')}</label>
                <div className="color-picker-row">
                  {ACCENT_PRESETS.map(p => (<button key={p.color} className={`color-picker-dot ${editAccentColor === p.color ? 'active' : ''}`} style={{ background: p.color }} onClick={() => setEditAccentColor(p.color)} title={p.name}/>))}
                </div>
              </div>

              {/* Location Input */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="edit-location-input" style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>{tText('Location', 'Ubicación')}</label>
                <input id="edit-location-input" type="text" className="social-input-wrapper" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10, color: '#fff', fontSize: '0.8rem', outline: 'none' }} placeholder="ej: Argentina" value={editLocation} onChange={e => setEditLocation(e.target.value)}/>
              </div>

              {/* Bio Textarea */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="edit-bio-input" style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>Bio</label>
                <textarea id="edit-bio-input" rows={3} className="social-input-wrapper" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10, color: '#fff', fontSize: '0.8rem', outline: 'none', resize: 'none', fontFamily: 'inherit' }} placeholder={tText('Tell us about yourself...', 'Cuéntanos sobre ti...')} value={editBio} onChange={e => setEditBio(e.target.value)}/>
              </div>
            </div>

            {/* Right Column: Socials & Email Forwarder */}
            <div className="edit-section-card">
              <h3>🔗 {tText('Social Links & Integrations', 'Redes Sociales e Integraciones')}</h3>
              
              <div className="socials-edit-inputs">
                <div className="social-input-wrapper">
                  <span className="social-input-icon">𝕏</span>
                  <input type="text" placeholder="Twitter username" value={editTwitter} onChange={e => setEditTwitter(e.target.value)}/>
                </div>
                <div className="social-input-wrapper">
                  <span className="social-input-icon">TG</span>
                  <input type="text" placeholder="Telegram username" value={editTelegram} onChange={e => setEditTelegram(e.target.value)}/>
                </div>
                <div className="social-input-wrapper">
                  <span className="social-input-icon">DC</span>
                  <input type="text" placeholder="Discord invite code" value={editDiscord} onChange={e => setEditDiscord(e.target.value)}/>
                </div>
                <div className="social-input-wrapper">
                  <span className="social-input-icon">GH</span>
                  <input type="text" placeholder="GitHub username" value={editGithub} onChange={e => setEditGithub(e.target.value)}/>
                </div>
              </div>

              {/* Email Forwarding setup */}
              <div className="email-setup-box">
                <h4>📬 GoalChain Mail Box</h4>
                <p>
                  {tText('Obtain a custom forwarding inbox. Any emails sent here will automatically forward to your destination email address.', 'Obtén una casilla de reenvío personalizada. Todos los correos enviados aquí se reenviarán automáticamente a tu email destino.')}
                </p>
                
                <div className="email-address-preview">
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{tText('Your mailbox:', 'Tu casilla:')}</span>
                  <code>{profile.username.toLowerCase()}@goalchain.fun</code>
                </div>

                <div className="email-input-line">
                  <input type="email" placeholder={tText('Your destination email (e.g. gmail)', 'Tu email destino (ej. gmail)')} value={editForwardingEmail} onChange={e => setEditForwardingEmail(e.target.value)}/>
                </div>
                <span style={{ fontSize: '0.62rem', color: editForwardingEmail ? '#14f195' : '#64748b', fontWeight: 700 }}>
                  {editForwardingEmail ? '🟢 Reenvío Activo' : '🔴 Reenvío Inactivo (Email vacío)'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
            <button className="profile-follow-btn" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }} onClick={() => setIsEditing(false)}>
              {tText('Cancel', 'Cancelar')}
            </button>
            <button className="profile-follow-btn" onClick={handleSaveProfile}>
              💾 {tText('Save Changes', 'Guardar Cambios')}
            </button>
          </div>
        </div>)}

      {/* ── QUICK STATS ROW ── */}
      <div className="profile-stats-bar-glass">
        <div className="profile-stat-box-vertical">
          <span className="icon">💰</span>
          <span className="value">
            {chainStats ? `${effectiveBalance.toLocaleString()} base` : `$${profile.stats.balance.toLocaleString('es', { minimumFractionDigits: 2 })}`}
          </span>
          <span className="label">{tText('Balance', 'Balance')}</span>
        </div>
        <div className="profile-stat-box-vertical">
          <span className="icon">🎯</span>
          <span className="value">{profile.stats.winRate}%</span>
          <span className="label">Win Rate</span>
        </div>
        <div className="profile-stat-box-vertical">
          <span className="icon">📊</span>
          <span className="value">{effectiveTotalBets}</span>
          <span className="label">Total Bets</span>
        </div>
        <div className="profile-stat-box-vertical">
          <span className="icon">🃏</span>
          <span className="value">{profile.stats.nftsOwned}</span>
          <span className="label">NFTs</span>
        </div>
        <div className="profile-stat-box-vertical">
          <span className="icon">📈</span>
          <span className="value">
            {chainStats ? `${effectiveVolume.toLocaleString()} u` : `$${(profile.stats.totalVolume / 1000).toFixed(1)}K`}
          </span>
          <span className="label">Volume</span>
        </div>
        <div className="profile-stat-box-vertical">
          <span className="icon">⚡</span>
          <span className="value">{profile.stats.upgradesDone}</span>
          <span className="label">Upgrades</span>
        </div>
      </div>

      {/* ── TAB NAV ── */}
      <div className="profile-tabs">
        {['overview', 'nfts', 'activity', 'feed'].map(tab => (<button key={tab} id={`tab-${tab}`} className={`profile-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)} style={{ borderColor: activeTab === tab ? accentColor : 'transparent', color: activeTab === tab ? accentColor : '#64748b' }}>
            {{
                overview: tText('📋 Overview', '📋 Descripción'),
                nfts: tText('🃏 NFTs', '🃏 NFTs'),
                activity: tText('⚡ Activity', '⚡ Actividad'),
                feed: tText('💬 Social Feed', '💬 Feed Social')
            }[tab]}
          </button>))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="profile-tab-content" style={{ marginTop: '1.2rem' }}>
        
        {activeTab === 'overview' && (<div className="tab-overview">
            <div className="overview-grid">
              
              <div className="overview-card">
                <h3>💰 {tText('Current Balance', 'Balance Actual')}</h3>
                <div className="big-number" style={{ color: '#14f195', fontSize: '1.8rem', fontWeight: 900, marginTop: '8px' }}>
                  {chainStats ? `${effectiveBalance.toLocaleString()} base units` : `$${profile.stats.balance.toLocaleString('es', { minimumFractionDigits: 2 })} USDC`}
                </div>
                {chainStats && (<div style={{ marginTop: 6, fontSize: '0.75rem', opacity: 0.8, color: '#64748b' }}>
                    Stake: {effectiveStaked.toLocaleString()} base units
                  </div>)}
              </div>

              <div className="overview-card">
                <h3>🎯 Performance</h3>
                <div className="perf-ring-wrap" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '8px' }}>
                  <svg viewBox="0 0 80 80" className="perf-ring" style={{ width: 64, height: 64 }}>
                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6"/>
                    <circle cx="40" cy="40" r="32" fill="none" stroke={profile.stats.winRate >= 60 ? '#14f195' : '#f7b731'} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(profile.stats.winRate / 100) * 201} 201`} transform="rotate(-90 40 40)"/>
                    <text x="40" y="45" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
                      {profile.stats.winRate}%
                    </text>
                  </svg>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Win Rate</span>
                </div>
              </div>

              <div className="overview-card">
                <h3>📊 {tText('Operation Stats', 'Estadísticas')}</h3>
                <div className="ops-breakdown" style={{ marginTop: '8px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px', color: '#94a3b8' }}>
                  <div>{tText('Total bets:', 'Total apuestas:')} <strong style={{ color: '#fff' }}>{effectiveTotalBets}</strong></div>
                  <div>{tText('Won:', 'Ganadas:')} <strong style={{ color: '#14f195' }}>{effectiveClaimedBets}</strong></div>
                  <div>{tText('Open:', 'Abiertas:')} <strong style={{ color: '#f35d7b' }}>{effectiveOpenBets}</strong></div>
                </div>
              </div>

            </div>
          </div>)}

        {activeTab === 'nfts' && (<div className="tab-nfts">
            <div className="nfts-grid">
              {profile.nfts.map((nft, i) => (<div key={i} className="nft-profile-card" style={{ borderColor: RARITY_COLORS[nft.rarity], background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', textAlign: 'center', transition: 'all 0.3s' }}>
                  <div className="nft-emoji" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{nft.emoji}</div>
                  <div className="nft-name" style={{ fontWeight: 800, color: '#fff' }}>{nft.name}</div>
                  <div className="nft-rarity" style={{ color: RARITY_COLORS[nft.rarity], fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' }}>{nft.rarity}</div>
                  <div className="nft-level" style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>Level {nft.level}</div>
                </div>))}
              
              {/* Empty placeholder card slots */}
              {Array.from({ length: Math.max(0, 6 - profile.nfts.length) }).map((_, i) => (<div key={`empty-${i}`} className="nft-profile-card nft-empty" style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
                  <div className="nft-emoji" style={{ opacity: 0.15, fontSize: '2rem' }}>🃏</div>
                  <div style={{ opacity: 0.3, fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>{tText('Empty slot', 'Casilla vacía')}</div>
                </div>))}
            </div>
          </div>)}

        {activeTab === 'activity' && (<div className="tab-activity">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {profile.recentActivity.map((act, i) => (<div key={i} className="activity-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <span className="activity-badge" style={{ background: ACTIVITY_COLORS[act.type] + '18', color: ACTIVITY_COLORS[act.type], fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
                    {act.type}
                  </span>
                  <span className="activity-desc" style={{ flex: 1, marginLeft: '12px', fontSize: '0.82rem', color: '#e2e8f0' }}>{act.desc}</span>
                  <span className="activity-date" style={{ fontSize: '0.72rem', color: '#64748b', marginRight: '15px' }}>{act.date}</span>
                  <span className={`activity-amount ${act.positive ? 'positive' : 'negative'}`} style={{ fontWeight: 800, fontSize: '0.85rem', color: act.positive ? '#14f195' : '#f35d7b' }}>
                    {act.amount}
                  </span>
                </div>))}
            </div>
          </div>)}

        {activeTab === 'feed' && (<div className="tab-feed">
            <div className="public-feed-container">
              
              {/* Write new post */}
              {currentUser && (<div className="feed-new-post">
                  <textarea rows={3} placeholder={tText("Share your thoughts about current matches or agent tasks...", "Comparte tus opiniones sobre partidos o tareas de agentes...")} value={newPostText} onChange={e => setNewPostText(e.target.value)} maxLength={280}/>
                  <div className="feed-new-post-footer">
                    <button className="btn-post-publish" disabled={!newPostText.trim()} onClick={handlePublishPost}>
                      📣 {tText('Post Update', 'Publicar')}
                    </button>
                  </div>
                </div>)}

              {/* Feed Timeline */}
              <div className="feed-timeline">
                {feed.map(post => (<div key={post.id} className="feed-post-card">
                    <div className="feed-post-header">
                      <div className="feed-post-author-info">
                        <div className="feed-post-avatar">
                          {post.customPhotoUrl ? (<img src={post.customPhotoUrl} alt={post.username}/>) : (<span>{post.avatar}</span>)}
                        </div>
                        <div className="feed-post-meta">
                          <a href={`/perfil/${post.username}`} className="feed-post-username">@{post.username}</a>
                          <span className="feed-post-role-badge">{post.role}</span>
                        </div>
                      </div>
                      <span className="feed-post-date">{post.timestamp}</span>
                    </div>

                    <p className="feed-post-body">{post.content}</p>

                    <div className="feed-post-actions">
                      <button className={`feed-post-action-btn ${post.likedByMe ? 'liked' : ''}`} onClick={() => handleLikePost(post.id)}>
                        ❤️ {post.likes}
                      </button>
                    </div>
                  </div>))}
              </div>

            </div>
          </div>)}

      </div>
    </div>);
};
