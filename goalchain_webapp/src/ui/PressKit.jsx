import React, { useState } from 'react';
import { useTranslation } from '../i18n';
export function PressKit() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('all');
    const logos = [
        { name: 'GoalChain 3D Logo Clean', path: 'https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/logo_3d_clean.png', desc: 'Transparent 3D render logo' },
        { name: 'GoalChain Standard SVG', path: 'https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/logo.svg', desc: 'Vector logo format' },
        { name: 'Solana Logo', path: 'https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/solana_logo.png', desc: 'Official Solana partner badge' }
    ];
    const players = [
        { name: 'Lionel Satoshi', path: 'https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/nfts/transparent/001_lionel_satoshi.png', rarity: 'MYTHIC' },
        { name: 'Cristiano Holdaldo', path: 'https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/nfts/transparent/157_cristiano_holdaldo.png', rarity: 'MYTHIC' },
        { name: 'Dibu De-Fi', path: 'https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/nfts/transparent/002_dibu_de_fi.png', rarity: 'LEGENDARY' },
        { name: 'Pedri Protocol', path: 'https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/nfts/transparent/106_pedri_p2p.png', rarity: 'RARE' },
        { name: 'Neymar NFT', path: 'https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/nfts/transparent/034_neymar_nft.png', rarity: 'LEGENDARY' },
        { name: 'Angel Di Merkle', path: 'https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/nfts/transparent/006_angel_di_merkle.png', rarity: 'RARE' }
    ];
    const backgrounds = [
        { name: 'Mythic Lunar Loop', path: 'https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/nfts/bg/bg_mythic_lunar.mp4', type: 'Video (.mp4)' },
        { name: 'Legendary Hologram Loop', path: 'https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/nfts/bg/bg_legendary_hologram.mp4', type: 'Video (.mp4)' },
        { name: 'Epic Aurora Loop', path: 'https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/nfts/bg/bg_epic_aurora.mp4', type: 'Video (.mp4)' },
        { name: 'Rare Sunset Loop', path: 'https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/nfts/bg/bg_rare_sunset.mp4', type: 'Video (.mp4)' },
        { name: 'Dome Kronos (Vertical)', path: 'https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/video/stadiums/dome_kronos_vertical.mp4', type: 'Stadium Loop' },
        { name: 'Neo Olympus (Vertical)', path: 'https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/video/stadiums/neo_olympus_vertical.mp4', type: 'Stadium Loop' }
    ];
    return (<div className="press-kit-container" style={{ padding: '2rem 1.5rem', color: '#f8fafc' }}>
      
      {/* 🚀 Header Program Section */}
      <section className="press-kit-hero" style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '2.5rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(12px)',
            position: 'relative',
            overflow: 'hidden'
        }}>
        {/* Decorative background glow */}
        <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(153, 69, 255, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
        }}/>

        <div style={{ maxWidth: '750px' }}>
          <span style={{
            background: 'linear-gradient(90deg, #9945FF 0%, #14F195 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '0.9rem',
            fontWeight: '700',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '0.75rem'
        }}>
            Creator economy & UGC
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.2' }}>
            Clipper & Creator Resources
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Get all the high-quality assets you need to create viral clips, slideshows, and TikToks. Overlay custom characters on stadium loops, showcase pack openings, and share prediction streaks.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="/PressKit_GoalChain.zip" download="PressKit_GoalChain.zip" className="press-kit-download-btn" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'linear-gradient(90deg, #9945ff 0%, #7c3aed 100%)',
            color: '#fff',
            padding: '0.85rem 1.75rem',
            borderRadius: '8px',
            fontWeight: '700',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(153, 69, 255, 0.3)',
            transition: 'all 0.2s ease',
            border: 'none',
            cursor: 'pointer'
        }} onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(153, 69, 255, 0.45)';
        }} onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(153, 69, 255, 0.3)';
        }}>
              📥 Download Full Kit (64 MB)
            </a>
            <a href="#guide" style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#e2e8f0',
            padding: '0.85rem 1.75rem',
            borderRadius: '8px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'background 0.2s ease',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}>
              📖 Creator Guide & Hooks
            </a>
          </div>
        </div>
      </section>

      {/* 🧭 Category Navigation Tabs */}
      <div style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '1rem',
            marginBottom: '2rem'
        }}>
        {['all', 'players', 'backgrounds', 'logos'].map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} style={{
                background: activeTab === tab ? 'rgba(153, 69, 255, 0.15)' : 'transparent',
                border: '1px solid ' + (activeTab === tab ? 'rgba(153, 69, 255, 0.3)' : 'transparent'),
                color: activeTab === tab ? '#c084fc' : '#94a3b8',
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease'
            }}>
            {tab === 'all' ? 'All Assets' : tab}
          </button>))}
      </div>

      {/* 📦 Assets Display Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* LOGOS */}
        {(activeTab === 'all' || activeTab === 'logos') && logos.map((logo, idx) => (<div key={idx} style={{
                background: 'rgba(30, 41, 59, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '1.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
            <div style={{
                height: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '8px',
                marginBottom: '1rem',
                padding: '1rem'
            }}>
              <img src={logo.path} alt={logo.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}/>
            </div>
            <div style={{ width: '100%', textAlign: 'left' }}>
              <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>{logo.name}</h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>{logo.desc}</p>
              <a href={logo.path} target="_blank" rel="noreferrer" download style={{
                display: 'block',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#e2e8f0',
                padding: '0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
                💾 Download Asset
              </a>
            </div>
          </div>))}

        {/* TRANSPARENT PLAYERS */}
        {(activeTab === 'all' || activeTab === 'players') && players.map((player, idx) => (<div key={idx} style={{
                background: 'rgba(30, 41, 59, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '1.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
            <div style={{
                height: '140px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                width: '100%',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '8px',
                marginBottom: '1rem',
                overflow: 'hidden'
            }}>
              <img src={player.path} alt={player.name} style={{ maxHeight: '110%', maxWidth: '100%', objectFit: 'contain' }}/>
            </div>
            <div style={{ width: '100%', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>{player.name}</h4>
                <span style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                background: player.rarity === 'MYTHIC' ? '#f59e0b' : player.rarity === 'LEGENDARY' ? '#a855f7' : '#3b82f6',
                color: '#fff'
            }}>{player.rarity}</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Transparent custom character render</p>
              <a href={player.path} target="_blank" rel="noreferrer" download style={{
                display: 'block',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#e2e8f0',
                padding: '0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
                💾 Download Character
              </a>
            </div>
          </div>))}

        {/* BACKGROUND LOOPS */}
        {(activeTab === 'all' || activeTab === 'backgrounds') && backgrounds.map((bg, idx) => (<div key={idx} style={{
                background: 'rgba(30, 41, 59, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '1.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
            <div style={{
                height: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '8px',
                marginBottom: '1rem',
                overflow: 'hidden'
            }}>
              {/* Video Preview */}
              <video src={bg.path} autoPlay loop muted playsInline style={{ height: '100%', width: '100%', objectFit: 'cover' }}/>
            </div>
            <div style={{ width: '100%', textAlign: 'left' }}>
              <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>{bg.name}</h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>{bg.type}</p>
              <a href={bg.path} target="_blank" rel="noreferrer" download style={{
                display: 'block',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#e2e8f0',
                padding: '0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
                💾 Download Loop
              </a>
            </div>
          </div>))}

      </div>

      {/* 📖 Creator & Clipper Strategy Guide */}
      <section id="guide" style={{
            background: 'rgba(30, 41, 59, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '2rem'
        }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📖 Clipper Playbook: How to go Viral
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.2)', padding: '1.25rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>🎯</span>
            <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>1. The Hook (First 3 Seconds)</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Grab attention immediately. Use screen recordings of the **Pack Opener** or high streaks on the **Penalty Game**. People love watching pack opening luck and interactive gameplay.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.2)', padding: '1.25rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>🎬</span>
            <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>2. Editing for Retention</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Keep it short (10 to 15 seconds max). Use the stadium loops (vertical format) as the background, place the transparent player in the middle, and add quick text captions or sound effects.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.2)', padding: '1.25rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>📢</span>
            <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>3. The Call to Action</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Always direct viewers to try it themselves: *"Play for free at http://goalchain.fun"*. You can place this in the comments, bio, or as a caption overlay inside the video.
            </p>
          </div>

        </div>

        <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(20, 241, 149, 0.08)',
            border: '1px solid rgba(20, 241, 149, 0.2)',
            borderRadius: '8px',
            color: '#22c55e',
            fontSize: '0.9rem',
            fontWeight: '500'
        }}>
          💡 **Recommended Hashtags**: `#GoalChain #Solana #SportsFi #WorldCup2026 #Gaming #Crypto #UGC`
        </div>
      </section>

    </div>);
}
