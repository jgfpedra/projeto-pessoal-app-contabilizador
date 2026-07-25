import React from 'react';
import { Screen } from '../App';

interface Props {
  active: 'home' | 'stats';
  onSwitch: (tab: 'home' | 'stats') => void;
  navigate: (s: Screen) => void;
}

export default function BottomNav({ active, onSwitch, navigate }: Props) {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center',
      background: 'var(--surface)', borderTop: '1px solid var(--border)',
      padding: '8px 0 calcc(20px + env(safe-area-inset-bottom))',
    }}>
      <NavBtn label="Today" icon={active === 'home' ? '✦' : '○'} active={active === 'home'} onClick={() => onSwitch('home')} />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => navigate({ name: 'addTask' })}
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--accent)', color: '#000',
            fontSize: 28, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px #C8FF0060',
          }}
        >+</button>
      </div>
      <NavBtn label="Stats" icon={active === 'stats' ? '▪' : '□'} active={active === 'stats'} onClick={() => onSwitch('stats')} />
    </nav>
  );
}

function NavBtn({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        background: 'none', padding: '4px 0',
        color: active ? 'var(--accent)' : 'var(--muted)',
        fontSize: 11, fontWeight: active ? 700 : 400,
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </button>
  );
}
