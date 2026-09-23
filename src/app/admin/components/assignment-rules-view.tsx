'use client';
import {useEffect, useState} from 'react';
import styles from '@/app/admin/admin.module.css';
import type {Agent} from './capacity-types';

type Page<T> = {count: number; next: string | null; previous: string | null; results: T[]};

type Rule = {
  id: string;
  departure: string | null;
  trip: string | null;
  trip_title: string | null;
  destination: string | null;
  destination_name: string | null;
  agent: {id: string; email: string; full_name: string; role: string};
  target_label: string;
  priority: number;
  is_active: boolean;
  created_at: string;
};

type TrekOption = {id: string; slug: string; title: string};

type Props = {
  api: <T>(path: string, options?: RequestInit) => Promise<T>;
  agents: Agent[];
  treks: TrekOption[];
  onMessage: (text: string) => void;
};

/**
 * Tour -> agent routing rules.
 *
 * A rule targets one thing. The backend resolves the most specific match first
 * (departure, then tour, then destination), so a tour rule and a destination
 * rule can coexist without fighting.
 */
export default function AssignmentRulesView({api, agents, treks, onMessage}: Props) {
  const [rules, setRules] = useState<Rule[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [trip, setTrip] = useState('');
  const [agentId, setAgentId] = useState('');
  const [priority, setPriority] = useState(0);

  const load = async () => {
    try {
      const page = await api<Page<Rule>>('/api/admin/assignment-rules');
      setRules(page.results);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Unable to load assignment rules.');
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function create() {
    if (!trip || !agentId) {
      onMessage('Choose both a tour and an agent.');
      return;
    }
    setBusy(true);
    try {
      await api('/api/admin/assignment-rules', {
        method: 'POST',
        body: JSON.stringify({trip, agent_id: agentId, priority})
      });
      setTrip('');
      setAgentId('');
      setPriority(0);
      onMessage('Assignment rule created. New leads for this tour will route automatically.');
      await load();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Unable to create this rule.');
    } finally {
      setBusy(false);
    }
  }

  async function toggle(rule: Rule) {
    setBusy(true);
    try {
      await api(`/api/admin/assignment-rules/${rule.id}`, {
        method: 'PATCH',
        body: JSON.stringify({is_active: !rule.is_active})
      });
      await load();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Unable to update this rule.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(rule: Rule) {
    setBusy(true);
    try {
      await api(`/api/admin/assignment-rules/${rule.id}`, {method: 'DELETE'});
      onMessage('Assignment rule removed.');
      await load();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Unable to remove this rule.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <p style={{fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.4px', color: '#74897d', fontWeight: 800, margin: '0 0 4px'}}>CRM</p>
          <h2>Lead assignment rules</h2>
        </div>
      </div>

      <div className={styles.toolbar}>
        <select value={trip} onChange={e => setTrip(e.target.value)} aria-label="Tour">
          <option value="">Choose a tour…</option>
          {treks.map(trek => (
            <option key={trek.id} value={trek.id}>{trek.title}</option>
          ))}
        </select>
        <select value={agentId} onChange={e => setAgentId(e.target.value)} aria-label="Specialist agent">
          <option value="">Choose a specialist…</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>{agent.full_name || agent.email}</option>
          ))}
        </select>
        <label>
          Priority
          <input
            type="number"
            value={priority}
            onChange={e => setPriority(Number(e.target.value) || 0)}
            style={{width: '70px'}}
            title="Tie-breaker between rules of the same specificity. Higher wins."
          />
        </label>
        <button className={styles.primary} disabled={busy} onClick={() => void create()}>
          {busy ? 'Saving…' : 'Add rule'}
        </button>
      </div>

      {!rules ? (
        <p className={styles.empty}>Loading assignment rules…</p>
      ) : !rules.length ? (
        <p className={styles.empty}>
          No routing rules yet. New leads stay unassigned until someone picks them up.
        </p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.modernTable}>
            <thead>
              <tr>
                <th>Applies to</th>
                <th>Routes to</th>
                <th>Priority</th>
                <th>State</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule.id}>
                  <td>
                    <span style={{fontWeight: 600, color: '#133e2f'}}>{rule.target_label}</span>
                    <small style={{display: 'block', fontSize: '11px', color: '#6d8276'}}>
                      {rule.departure ? 'Departure rule' : rule.trip ? 'Tour rule' : 'Destination rule'}
                    </small>
                  </td>
                  <td>{rule.agent?.full_name || rule.agent?.email}</td>
                  <td>{rule.priority}</td>
                  <td>
                    <span className={rule.is_active ? styles.statusPillActive : styles.statusPillInactive}>
                      {rule.is_active ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionBtnGroup}>
                      <button type="button" className={styles.actionBtnToggle} disabled={busy} onClick={() => void toggle(rule)}>
                        {rule.is_active ? 'Pause' : 'Activate'}
                      </button>
                      <button type="button" className={styles.actionBtnDelete} disabled={busy} onClick={() => void remove(rule)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
