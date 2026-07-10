import React, { useState, useEffect, useRef } from 'react';
import { SimulationBadge } from '../components/SimulationBadge';
import { useTranslation } from 'react-i18next';

interface Allocation {
    name: string;
    share: number;
    color: string;
}

interface VaultStrategyRaw {
    id: 'sentinel' | 'arbitrageur' | 'orchestrator';
    nameKey: string;
    descriptionKey: string;
    apy: string;
    color: string;
    allocations: Allocation[];
    logKeys: string[];
}

const VAULT_STRATEGIES_RAW: VaultStrategyRaw[] = [
    {
        id: 'sentinel',
        nameKey: 'vault_sentinel_name',
        descriptionKey: 'vault_sentinel_desc',
        apy: '7.5%',
        color: 'var(--primary-neon)',
        allocations: [
            { name: 'Drift Hedging', share: 40, color: 'var(--primary-neon)' },
            { name: 'Treasury Yield', share: 50, color: 'var(--secondary-neon)' },
            { name: 'Cash', share: 10, color: '#64748b' }
        ],
        logKeys: [
            'vault_log_sentinel_1',
            'vault_log_sentinel_2',
            'vault_log_sentinel_3',
            'vault_log_sentinel_4',
            'vault_log_sentinel_5',
        ]
    },
    {
        id: 'arbitrageur',
        nameKey: 'vault_arb_name',
        descriptionKey: 'vault_arb_desc',
        apy: '9.5%',
        color: 'var(--secondary-neon)',
        allocations: [
            { name: 'Jupiter LP Pools', share: 60, color: 'var(--secondary-neon)' },
            { name: 'Drift Hedging', share: 20, color: 'var(--primary-neon)' },
            { name: 'Treasury Yield', share: 15, color: '#f59e0b' },
            { name: 'Cash', share: 5, color: '#64748b' }
        ],
        logKeys: [
            'vault_log_arb_1',
            'vault_log_arb_2',
            'vault_log_arb_3',
            'vault_log_arb_4',
            'vault_log_arb_5',
        ]
    },
    {
        id: 'orchestrator',
        nameKey: 'vault_orch_name',
        descriptionKey: 'vault_orch_desc',
        apy: '14.5%',
        color: 'var(--accent-red)',
        allocations: [
            { name: 'Drift Speculation', share: 75, color: 'var(--accent-red)' },
            { name: 'Jupiter LP Pools', share: 15, color: 'var(--secondary-neon)' },
            { name: 'Cash', share: 10, color: '#64748b' }
        ],
        logKeys: [
            'vault_log_orch_1',
            'vault_log_orch_2',
            'vault_log_orch_3',
            'vault_log_orch_4',
            'vault_log_orch_5',
        ]
    }
];

export const SwarmVaults: React.FC = () => {
    const { t } = useTranslation();
    const [activeVaultId, setActiveVaultId] = useState<'sentinel' | 'arbitrageur' | 'orchestrator'>('sentinel');
    const [walletGch, setWalletGch] = useState<number>(2500);
    const [vaultBalances, setVaultBalances] = useState<Record<string, number>>({
        sentinel: 0,
        arbitrageur: 0,
        orchestrator: 0
    });
    const [inputValue, setInputValue] = useState<string>('');
    const [consoleLogs, setConsoleLogs] = useState<string[]>([
        t('swarm_vaults_system_initializing'),
        t('swarm_vaults_connection_established'),
        t('swarm_vaults_ready_for_allocation')
    ]);

    // Build resolved vault data from raw + translations
    const [vaultStrategies, setVaultStrategies] = useState(() =>
        VAULT_STRATEGIES_RAW.map(raw => ({
            ...raw,
            name: t(raw.nameKey),
            description: t(raw.descriptionKey),
            mockLogs: raw.logKeys.map(k => t(k)),
        }))
    );

    // Resync vault data when language changes
    useEffect(() => {
        setVaultStrategies(VAULT_STRATEGIES_RAW.map(raw => ({
            ...raw,
            name: t(raw.nameKey),
            description: t(raw.descriptionKey),
            mockLogs: raw.logKeys.map(k => t(k)),
        })));
    }, [t]);

    const activeVault = vaultStrategies.find(v => v.id === activeVaultId) || vaultStrategies[0];
    const consoleEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll for the console
    useEffect(() => {
        if (consoleEndRef.current) {
            consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [consoleLogs]);

    // Simulate background logs periodically
    useEffect(() => {
        const interval = setInterval(() => {
            const currentVault = vaultStrategies.find(v => v.id === activeVaultId) || vaultStrategies[0];
            const randomIndex = Math.floor(Math.random() * currentVault.mockLogs.length);
            const randomLog = currentVault.mockLogs[randomIndex];
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            const prefix = activeVaultId === 'sentinel'
                ? t('swarm_vaults_sentinel_prefix')
                : activeVaultId === 'arbitrageur'
                    ? t('swarm_vaults_arbitrageur_prefix')
                    : t('swarm_vaults_orchestrator_prefix');

            setConsoleLogs(prev => [
                ...prev,
                `[${timestamp}] ${prefix} ${randomLog}`
            ]);
        }, 6000);

        return () => clearInterval(interval);
    }, [activeVaultId, vaultStrategies, t]);

    // Handle deposit (delegation)
    const handleDeposit = () => {
        const amount = parseFloat(inputValue);
        if (isNaN(amount) || amount <= 0) {
            alert(t('swarm_vaults_invalid_amount'));
            return;
        }

        if (amount > walletGch) {
            alert(t('swarm_vaults_insufficient_funds'));
            return;
        }

        // Simulate transaction
        setWalletGch(prev => Number((prev - amount).toFixed(2)));
        setVaultBalances(prev => ({
            ...prev,
            [activeVaultId]: Number((prev[activeVaultId] + amount).toFixed(2))
        }));

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const prefix = activeVaultId === 'sentinel'
            ? t('swarm_vaults_sentinel_prefix')
            : activeVaultId === 'arbitrageur'
                ? t('swarm_vaults_arbitrageur_prefix')
                : t('swarm_vaults_orchestrator_prefix');

        setConsoleLogs(prev => [
            ...prev,
            `[${timestamp}] ${prefix} ${t('swarm_vaults_delegation_success').replace('{amount}', String(amount))}`
        ]);

        setInputValue('');
    };

    const handleWithdraw = () => {
        const balance = vaultBalances[activeVaultId];
        if (balance <= 0) return;

        setWalletGch(prev => Number((prev + balance).toFixed(2)));
        setVaultBalances(prev => ({
            ...prev,
            [activeVaultId]: 0
        }));

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const prefix = activeVaultId === 'sentinel'
            ? t('swarm_vaults_sentinel_prefix')
            : activeVaultId === 'arbitrageur'
                ? t('swarm_vaults_arbitrageur_prefix')
                : t('swarm_vaults_orchestrator_prefix');

        setConsoleLogs(prev => [
            ...prev,
            `[${timestamp}] ${prefix} ${t('swarm_vaults_withdrawal_success').replace('{amount}', String(balance))}`
        ]);
    };

    const handlePercentShortcut = (percent: number) => {
        const amount = Number((walletGch * percent).toFixed(2));
        setInputValue(String(amount));
    };

    return (
        <div style={{ padding: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', background: 'rgba(153,69,255,0.15)', border: '1px solid #9945ff', color: '#9945ff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    🤖 SWARM AI VAULTS
                </span>
                <SimulationBadge />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
                {/* Left: Vault Selection */}
                <div>
                    {/* Vault Tabs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {vaultStrategies.map(vault => (
                            <button
                                key={vault.id}
                                onClick={() => setActiveVaultId(vault.id)}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    textAlign: 'left',
                                    background: activeVaultId === vault.id ? `${vault.color}22` : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${activeVaultId === vault.id ? vault.color : 'rgba(255,255,255,0.05)'}`,
                                    color: activeVaultId === vault.id ? '#fff' : '#94a3b8',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{vault.name}</span>
                                    <span style={{ color: vault.color, fontWeight: 900 }}>{vault.apy} APY</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Vault Details */}
                    <div className="glass-card" style={{ padding: '16px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{activeVault.name}</span>
                            <span style={{ fontSize: '1rem', fontWeight: 900, color: activeVault.color }}>{activeVault.apy} APY</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '12px', lineHeight: '1.4' }}>{activeVault.description}</p>

                        {/* Allocations */}
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                                {t('swarm_vaults_allocations')}
                            </div>
                            {activeVault.allocations.map((alloc, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: alloc.color }} />
                                        <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>{alloc.name}</span>
                                    </div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>{alloc.share}%</span>
                                </div>
                            ))}
                            {/* Allocation bar */}
                            <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)', marginTop: '6px', overflow: 'hidden', display: 'flex' }}>
                                {activeVault.allocations.map((alloc, idx) => (
                                    <div key={idx} style={{ width: `${alloc.share}%`, background: alloc.color, height: '100%' }} />
                                ))}
                            </div>
                        </div>

                        {/* Current Balance */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{t('swarm_vaults_your_balance')}</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#14f195' }}>{vaultBalances[activeVaultId]} $GCH</span>
                        </div>

                        {/* Amount Input */}
                        <div>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>
                                {t('swarm_vaults_amount_to_delegate')}
                            </label>
                            <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="form-select"
                                    placeholder="0.00"
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        fontSize: '0.88rem',
                                        borderRadius: '8px',
                                        background: 'rgba(0, 0, 0, 0.4)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        color: '#ffffff',
                                        outline: 'none',
                                        WebkitAppearance: 'none'
                                    }}
                                />
                                <button
                                    onClick={handleDeposit}
                                    className="btn-neon-green"
                                    style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
                                >
                                    {t('swarm_vaults_delegate')}
                                </button>
                            </div>
                        </div>

                        {/* Percentage shortcuts */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handlePercentShortcut(0.25)} style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '4px', fontSize: '0.72rem', color: '#cbd5e1', cursor: 'pointer', transition: 'all 0.2s' }}>
                                25%
                            </button>
                            <button onClick={() => handlePercentShortcut(0.50)} style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '4px', fontSize: '0.72rem', color: '#cbd5e1', cursor: 'pointer', transition: 'all 0.2s' }}>
                                50%
                            </button>
                            <button onClick={() => handlePercentShortcut(1.00)} style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '4px', fontSize: '0.72rem', color: '#cbd5e1', cursor: 'pointer', transition: 'all 0.2s' }}>
                                MAX
                            </button>
                        </div>

                        {/* Withdraw Button */}
                        {vaultBalances[activeVaultId] > 0 && (
                            <button
                                onClick={handleWithdraw}
                                className="btn-outline-red"
                                style={{ width: '100%', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', marginTop: '4px' }}
                            >
                                {t('swarm_vaults_withdraw')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Swarm Live Console Log */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {t('swarm_vaults_operation_log')}
                    </span>
                    <div className="terminal-console">
                        {consoleLogs.map((log, index) => (
                            <div key={index} style={{ wordBreak: 'break-all', lineHeight: '1.3' }}>
                                {log}
                            </div>
                        ))}
                        <div ref={consoleEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
};