import { useEffect, useMemo, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';

type BackendFixture = {
  match_id: string;
  team_a: string;
  team_b: string;
  start_timestamp: number;
  pubkey: string;
};

function getBackendBaseUrl() {
  return import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8787';
}

export function FixturesPanel() {
  const { connection } = useConnection();
  const [fixtures, setFixtures] = useState<BackendFixture[]>([]);
  const [loading, setLoading] = useState(false);
  const backend = useMemo(() => getBackendBaseUrl(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backend}/api/fixtures`);
        const json = (await res.json()) as BackendFixture[];
        if (!cancelled) setFixtures(json);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [backend]);

  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ marginBottom: 8 }}>Fixtures</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ opacity: 0.8 }}>Backend:</span> <code>{backend}</code>
        <span style={{ opacity: 0.8 }}>RPC status:</span>
        <RpcStatus connection={connection} />
      </div>

      {loading && <p>Loading…</p>}
      {!loading && fixtures.length === 0 && <p>No fixtures.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12, marginTop: 16 }}>
        {fixtures.map((f) => (
          <div key={f.pubkey} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <strong>
                {f.team_a} vs {f.team_b}
              </strong>
              <span style={{ opacity: 0.7, fontSize: 12 }}>{f.match_id}</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
              Start: {new Date(f.start_timestamp * 1000).toLocaleString()}
            </div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              Fixture PDA: <code>{f.pubkey}</code>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RpcStatus({ connection }: { connection: any }) {
  const [slot, setSlot] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await connection.getSlot();
        if (!cancelled) setSlot(s);
      } catch {
        if (!cancelled) setSlot(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connection]);

  return <code>{slot === null ? 'offline' : `slot ${slot}`}</code>;
}
