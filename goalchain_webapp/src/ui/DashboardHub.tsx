import React from 'react';
import { Link } from 'react-router-dom';
import { PLAY_SECTIONS } from '../config/playNav';
import { OpsStatusPanel } from './OpsStatusPanel';
import { useTranslation } from '../i18n/index';

export function DashboardHub() {
  const { t } = useTranslation();
  const cards = PLAY_SECTIONS.filter((s) => s.to && s.to !== '/');

  return (
    <div className="play-page">
      <div className="play-page-hero">
        <h1>{t('dashboard_hub_title')}</h1>
        <p className="play-page-sub">
          {t('dashboard_hub_subtitle')}
        </p>
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <OpsStatusPanel />
      </div>
      <div className="play-hub-grid">
        {cards.map((section) => (
          <Link key={section.id} to={section.to!} className="play-hub-card">
            <h3>{(t as any)(`dashboard_hub_section_${section.id}_label`)}</h3>
            <p>{(t as any)(`dashboard_hub_section_${section.id}_description`)}</p>
            <span className="play-hub-card-cta">{t('dashboard_hub_open')} →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}