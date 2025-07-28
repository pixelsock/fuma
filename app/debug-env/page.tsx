import { getEnvironmentStatus, getDirectusConfig } from '@/lib/env-config';

export default function DebugEnvPage() {
  const envStatus = getEnvironmentStatus();
  const config = getDirectusConfig();
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Debug</h1>
      
      <h2>Environment Status</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify(envStatus, null, 2)}
      </pre>
      
      <h2>Directus Configuration</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify({
          url: config.url,
          hasToken: !!config.token,
          tokenPrefix: config.token ? config.token.substring(0, 10) + '...' : 'not set',
          hasEmail: !!config.email,
          hasPassword: !!config.password
        }, null, 2)}
      </pre>
      
      <h2>Environment Variables</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify({
          DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV,
          NODE_ENV: process.env.NODE_ENV,
          LOCAL_DIRECTUS_URL: process.env.LOCAL_DIRECTUS_URL,
          PRODUCTION_DIRECTUS_URL: process.env.PRODUCTION_DIRECTUS_URL,
          DIRECTUS_URL: process.env.DIRECTUS_URL,
        }, null, 2)}
      </pre>
    </div>
  );
}