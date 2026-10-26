import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { api } from '../api';
import { formatMoneyFull } from '../utils/format';

const Card = styled.div`
  background: #fff; border: 1px solid var(--color-line); border-radius: 14px; padding: 1rem 1.1rem; margin-bottom: 0.75rem;
  h3 { margin: 0 0 0.25rem; font-size: 1.05rem; }
  .m { color: var(--color-ink-muted); font-size: 0.88rem; line-height: 1.5; }
`;
const Btn = styled.button`
  border: 0; border-radius: 8px; padding: 0.45rem 0.75rem; font-weight: 700; font-size: 0.82rem; cursor: pointer; margin-right: 0.4rem;
  background: var(--color-green-deep); color: #fff;
`;
const Err = styled.p`color: #b91c1c;`;

const PRODUCT = { bank: 'Bank mortgage', nhf: 'NHF', unsure: 'Not sure' };

export default function AdminMortgages({ adminKey }) {
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLeads(await api.admin.mortgageLeads(adminKey));
      setError('');
    } catch (e) {
      setError(e.message || 'Could not load mortgage leads.');
    }
  }, [adminKey]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    try {
      await api.admin.updateMortgageLead(id, adminKey, status);
      load();
    } catch (e) {
      setError(e.message || 'Could not update that request.');
    }
  };

  if (error && !leads.length) return <Err>{error}</Err>;

  return (
    <>
      {error && <Err>{error}</Err>}
      {!leads.length && <Card><p className="m">No mortgage requests yet.</p></Card>}
      {leads.map((l) => (
        <Card key={l.id}>
          <h3>{l.ref} · {PRODUCT[l.product] || l.product}</h3>
          <div className="m">
            {l.name} · {l.email}{l.phone ? ` · ${l.phone}` : ''}
            <br />
            {[l.city, l.employment, l.income_band].filter(Boolean).join(' · ') || 'No extra details'}
            {Number(l.price) > 0 ? ` · ${formatMoneyFull(l.price, 'NGN')}` : ''}
            <br />
            {l.notes || 'No note.'}
            <br />
            {l.status}
          </div>
          <div style={{ marginTop: '0.7rem' }}>
            {l.status !== 'contacted' && <Btn type="button" onClick={() => setStatus(l.id, 'contacted')}>Mark contacted</Btn>}
            {l.status !== 'closed' && <Btn type="button" onClick={() => setStatus(l.id, 'closed')}>Close</Btn>}
            {l.status !== 'new' && <Btn type="button" onClick={() => setStatus(l.id, 'new')}>Reopen</Btn>}
          </div>
        </Card>
      ))}
    </>
  );
}
