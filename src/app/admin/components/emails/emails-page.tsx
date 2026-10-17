'use client';

import {useState} from 'react';
import Compose from './compose';
import SentLog from './sent-log';
import TemplateEditor from './template-editor';
import styles from './emails.module.css';

type Section = 'sent' | 'compose' | 'templates';
const sections: {id: Section; label: string}[] = [
  {id: 'sent', label: 'Sent'},
  {id: 'compose', label: 'Compose'},
  {id: 'templates', label: 'Templates'},
];

export default function EmailsPage() {
  const [section, setSection] = useState<Section>('sent');
  const [refreshKey, setRefreshKey] = useState(0);
  return <div>
    <div className={styles.tabs} role="tablist">
      {sections.map(item => <button key={item.id} type="button" role="tab" aria-selected={section === item.id}
        className={`${styles.tab} ${section === item.id ? styles.tabActive : ''}`} onClick={() => setSection(item.id)}>{item.label}</button>)}
    </div>
    {section === 'sent' && <SentLog refreshKey={refreshKey} />}
    {section === 'compose' && <Compose onSent={() => setRefreshKey(key => key + 1)} />}
    {section === 'templates' && <TemplateEditor />}
  </div>;
}
