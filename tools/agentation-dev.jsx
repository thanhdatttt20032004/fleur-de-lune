import React from 'react';
import { createRoot } from 'react-dom/client';
import { Agentation } from 'agentation';

const params = new URLSearchParams(window.location.search);
const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
const enabled = localHosts.has(window.location.hostname);

if (enabled && !window.__FM_AGENTATION_MOUNTED__) {
  window.__FM_AGENTATION_MOUNTED__ = true;

  const mount = document.createElement('div');
  mount.id = 'fm-agentation-root';
  document.body.appendChild(mount);

  const endpoint = params.get('agentationEndpoint') || window.FM_AGENTATION_ENDPOINT || undefined;
  createRoot(mount).render(<Agentation endpoint={endpoint} />);
}
