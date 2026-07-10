import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';

interface CreateUserProps {
  onUserCreated?: (user: { username: string; wallet: string; avatar: string }) => void;
}

const AVATARS = [
  { id: 'eagle',    emoji: '🦅', label: 'Águila' },
  { id: 'lion',     emoji: '🦁', label: 'León' },
  { id: 'wolf',     emoji: '🐺', label: 'Lobo' },
  { id: 'dragon',   emoji: '🐉', label: 'Dragón' },
  { id: 'phoenix',  emoji: '🔥', label: 'Fénix' },
  { id: 'shark',    emoji: '🦈', label: 'Tiburón' },
  { id: 'bull',     emoji: '🐂', label: 'Toro' },
  { id: 'falcon',   emoji: '🦆', label: 'Halcón' },
];

const ROLES = [
  { id: 'manager',  label: 'Manager',    desc: 'Gestiona equipos y hace apuestas estratégicas' },
  { id: 'scout',    label: 'Scout',      desc: 'Descubre talento y acumula jugadores raros' },
  { id: 'trader',   label: 'Trader',     desc: 'Opera en el mercado de derivados deportivos' },
];


export const CreateUser: React.FC<CreateUserProps> = ({ onUserCreated }) => {
  const { t } = useTranslation();
  const { setUser } = useUser();
  const { publicKey, connected } = useWallet();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('eagle');
  const [selectedRole, setSelectedRole] = useState('manager');
  const [usernameError, setUsernameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const walletAddress = publicKey?.toBase58() ?? '';
  const shortWallet = walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : '';

  const validateUsername = (v: string) => {
    if (v.length < 3) return t('create_user.username_min_length');
    if (v.length > 20) return t('create_user.username_max_length');
    if (!/^[a-zA-Z0-9_]+$/.test(v)) return t('create_user.username_invalid_chars');
    return '';
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setUsername(v);
    setUsernameError(validateUsername(v));
  };

  const selectedAvatarObj = AVATARS.find(a => a.id === selectedAvatar)!;
  const selectedRoleObj = ROLES.find(r => r.id === selectedRole)!;

  const handleSubmit = async () => {
    if (!connected) return;
    const err = validateUsername(username);
    if (err) { setUsernameError(err); return; }
    setIsSubmitting(true);

    const userData = {
      username,
      wallet: walletAddress,
      avatar: selectedAvatarObj.emoji,
      role: selectedRoleObj.label,
      joinedDate: t('create_user.joined_date'),
      bio: t('create_user.bio', { role: selectedRoleObj.label }),
      location: t('create_user.location'),
      following: [],
      accentColor: '#14f195',
    };
    setUser(userData);

    setIsSubmitting(false);
    setSuccess(true);
    onUserCreated?.({ username, wallet: walletAddress, avatar: selectedAvatar });
  };

  if (success) {
    return (
      <div className="create-user-success">
        <div className="success-glow">{selectedAvatarObj.emoji}</div>
        <h2 style={{ color: '#14f195', margin: '1rem 0 0.5rem' }}>{t('create_user.success.welcome', { username })}</h2>
        <p style={{ color: '#8b9cc8', margin: '0 0 0.5rem' }}>{t('create_user.success.role')}: <span style={{ color: '#fff' }}>{selectedRoleObj.label}</span></p>
        <p style={{ color: '#8b9cc8', fontSize: '0.85rem' }}>{t('create_user.success.wallet')}: <code style={{ color: '#14f195' }}>{shortWallet}</code></p>
        <p style={{ color: '#8b9cc8', fontSize: '0.85rem', marginTop: '1rem' }}>{t('create_user.success.initializing')}</p>
        <a href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem', textDecoration: 'none' }}>
          → {t('create_user.success.go_to_dashboard')}
        </a>
      </div>
    );
  }

  return (
    <div className="create-user-page">
      {/* Header */}
      <div className="create-user-header">
        <div className="logo-badge">⚽ GoalChain</div>
        <h1>{t('create_user.title')}</h1>
        <p>{t('create_user.subtitle')}</p>
      </div>

      {/* Step indicators */}
      <div className="step-indicators">
        {[1, 2, 3].map(s => (
          <div key={s} className={`step-dot ${step >= s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
            {step > s ? '✓' : s}
          </div>
        ))}
      </div>

      <div className="create-user-card">

        {/* STEP 1: Wallet */}
        {step === 1 && (
          <div className="step-content" id="step-wallet">
            <div className="step-icon">🔗</div>
            <h2>{t('create_user.step1.title')}</h2>
            <p>{t('create_user.step1.description')}</p>
            <div className="wallet-connect-area">
              <WalletMultiButton />
              {connected && (
                <div className="wallet-connected-badge">
                  <span className="dot-green" />
                  {t('create_user.step1.wallet_connected')}: <code>{shortWallet}</code>
                </div>
              )}
            </div>
            <button
              className="btn-primary"
              id="step1-next"
              disabled={!connected}
              onClick={() => setStep(2)}
            >
              {t('create_user.continue')}
            </button>
          </div>
        )}

        {/* STEP 2: Identity */}
        {step === 2 && (
          <div className="step-content" id="step-identity">
            <div className="step-icon">🎭</div>
            <h2>{t('create_user.step2.title')}</h2>

            <div className="form-group">
              <label htmlFor="username-input">{t('create_user.step2.username_label')}</label>
              <input
                id="username-input"
                type="text"
                className={`form-input ${usernameError ? 'input-error' : username.length >= 3 ? 'input-ok' : ''}`}
                placeholder={t('create_user.step2.username_placeholder')}
                value={username}
                onChange={handleUsernameChange}
                maxLength={20}
                autoComplete="off"
              />
              {usernameError && <span className="input-error-msg">{usernameError}</span>}
              {!usernameError && username.length >= 3 && (
                <span className="input-ok-msg">✓ {t('create_user.step2.username_available')}</span>
              )}
            </div>

            <div className="form-group">
              <label>{t('create_user.step2.avatar_label')}</label>
              <div className="avatar-grid">
                {AVATARS.map(av => (
                  <button
                    key={av.id}
                    className={`avatar-btn ${selectedAvatar === av.id ? 'selected' : ''}`}
                    id={`avatar-${av.id}`}
                    onClick={() => setSelectedAvatar(av.id)}
                    title={av.label}
                  >
                    <span className="avatar-emoji">{av.emoji}</span>
                    <span className="avatar-label">{av.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="step-nav">
              <button className="btn-secondary" onClick={() => setStep(1)}>← {t('create_user.back')}</button>
              <button
                className="btn-primary"
                id="step2-next"
                disabled={!username || !!usernameError}
                onClick={() => setStep(3)}
              >
                {t('create_user.continue')}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Role & Confirm */}
        {step === 3 && (
          <div className="step-content" id="step-role">
            <div className="step-icon">🏆</div>
            <h2>{t('create_user.step3.title')}</h2>

            <div className="role-cards">
              {ROLES.map(role => (
                <button
                  key={role.id}
                  className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                  id={`role-${role.id}`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="role-card-label">{role.label}</div>
                  <div className="role-card-desc">{role.desc}</div>
                </button>
              ))}
            </div>

            {/* Summary */}
            <div className="create-summary">
              <div className="summary-avatar">{selectedAvatarObj.emoji}</div>
              <div className="summary-info">
                <div className="summary-username">@{username}</div>
                <div className="summary-meta">{selectedRoleObj.label} · {shortWallet}</div>
              </div>
            </div>

            <div className="step-nav">
              <button className="btn-secondary" onClick={() => setStep(2)}>← {t('create_user.back')}</button>
              <button
                className="btn-primary btn-launch"
                id="create-account-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading-dots">{t('create_user.step3.creating_account')}<span>...</span></span>
                ) : (
                  <>{t('create_user.step3.create_account')}</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};