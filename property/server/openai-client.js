const { OpenAI, AzureOpenAI } = require('openai');

let cachedClient;

/** Resource root for AzureOpenAI SDK (no /openai or /openai/v1 suffix). */
function normalizeAzureResourceEndpoint(raw) {
  let e = String(raw || '')
    .trim()
    .replace(/\/$/, '');
  if (e.endsWith('/openai/v1')) e = e.slice(0, -'/openai/v1'.length);
  else if (e.endsWith('/openai')) e = e.slice(0, -'/openai'.length);
  return e.replace(/\/$/, '');
}

function getAzureApiVersion() {
  return (
    process.env.AZURE_OPENAI_API_VERSION ||
    process.env.OPENAI_API_VERSION ||
    '2024-10-21'
  ).trim();
}

/**
 * Resolve credentials without caching the HTTP client (reads latest process.env).
 * Azure: set AZURE_OPENAI_ENDPOINT + AZURE_OPENAI_KEY (or AZURE_OPENAI_API_KEY).
 *   Use AzureOpenAI SDK (deployments path + api-version + api-key header). Set AZURE_OPENAI_API_VERSION if needed.
 * Standard OpenAI: set OPENAI_API_KEY (optional OPENAI_BASE_URL for proxies).
 */
function getAiConfig() {
  let azureEndpoint = (process.env.AZURE_OPENAI_ENDPOINT || '').trim().replace(/\/$/, '');
  const azureKey = (
    process.env.AZURE_OPENAI_KEY ||
    process.env.AZURE_OPENAI_API_KEY ||
    ''
  ).trim();
  const openaiKey = (process.env.OPENAI_API_KEY || '').trim();
  const openaiBase =
    (process.env.OPENAI_BASE_URL || '').trim().replace(/\/$/, '') || 'https://api.openai.com/v1';

  if (azureEndpoint && azureKey) {
    const resourceRoot = normalizeAzureResourceEndpoint(azureEndpoint);
    const openAiCompatibleBase = resourceRoot
      ? `${resourceRoot}/openai/v1`
      : '';
    return {
      baseURL: openAiCompatibleBase,
      apiKey: azureKey,
      mode: 'azure',
      azureResourceEndpoint: resourceRoot,
    };
  }

  if (openaiKey) {
    return { baseURL: openaiBase, apiKey: openaiKey, mode: 'openai', azureResourceEndpoint: '' };
  }

  return { baseURL: '', apiKey: '', mode: 'none', azureResourceEndpoint: '' };
}

function getClient() {
  if (!cachedClient) {
    const { baseURL, apiKey, mode, azureResourceEndpoint } = getAiConfig();
    if (!apiKey || mode === 'none') {
      throw new Error('No AI credentials configured (Azure or OPENAI_API_KEY)');
    }
    if (mode === 'azure') {
      if (!azureResourceEndpoint) {
        throw new Error('AZURE_OPENAI_ENDPOINT is empty');
      }
      const apiVersion = getAzureApiVersion();
      console.log(
        `[AI] Client ready — mode=azure, endpoint=${azureResourceEndpoint}, apiVersion=${apiVersion}`
      );
      cachedClient = new AzureOpenAI({
        endpoint: azureResourceEndpoint,
        apiKey,
        apiVersion,
      });
    } else {
      if (!baseURL) {
        throw new Error('No AI base URL configured');
      }
      console.log(`[AI] Client ready — mode=openai, baseURL=${baseURL}`);
      cachedClient = new OpenAI({ apiKey, baseURL });
    }
  }
  return cachedClient;
}

/** Call after editing .env so the next request picks up new keys/endpoints without restarting… actually still need restart to clear module cache; exposed for tests. */
function resetAiClientCache() {
  cachedClient = undefined;
}

function resolveModel(kind = 'default') {
  if (kind === 'analysis') {
    return (
      process.env.AZURE_OPENAI_ANALYSIS_DEPLOYMENT ||
      process.env.AZURE_OPENAI_CHAT_DEPLOYMENT ||
      process.env.AZURE_OPENAI_DEPLOYMENT ||
      process.env.OPENAI_ANALYSIS_MODEL ||
      process.env.OPENAI_MODEL ||
      'gpt-4o-mini'
    );
  }
  if (kind === 'chat') {
    return (
      process.env.AZURE_OPENAI_CHAT_DEPLOYMENT ||
      process.env.AZURE_OPENAI_DEPLOYMENT ||
      process.env.OPENAI_CHAT_MODEL ||
      process.env.OPENAI_MODEL ||
      'gpt-4o-mini'
    );
  }
  return (
    process.env.AZURE_OPENAI_DEPLOYMENT ||
    process.env.AZURE_OPENAI_CHAT_DEPLOYMENT ||
    process.env.OPENAI_MODEL ||
    'gpt-4o-mini'
  );
}

function hasAiCredentials() {
  const { apiKey, baseURL, mode, azureResourceEndpoint } = getAiConfig();
  if (!apiKey) return false;
  if (mode === 'azure') return Boolean(azureResourceEndpoint);
  return Boolean(baseURL);
}

function getClientMode() {
  return getAiConfig().mode;
}

/** Startup diagnostics (no secrets). */
function logAiConfigSummary() {
  const { baseURL, mode, azureResourceEndpoint } = getAiConfig();
  if (mode === 'none') {
    console.warn(
      '[AI] No credentials: set AZURE_OPENAI_ENDPOINT + AZURE_OPENAI_KEY, or OPENAI_API_KEY. Deep analysis and chat will fall back or fail.'
    );
    return;
  }
  if (mode === 'azure') {
    console.log(
      `[AI] Config: mode=azure, endpoint=${azureResourceEndpoint}, apiVersion=${getAzureApiVersion()}`
    );
    return;
  }
  console.log(`[AI] Config: mode=openai, endpoint=${baseURL}`);
}

async function createChatCompletion(params) {
  const client = getClient();
  const { max_tokens, max_completion_tokens, ...rest } = params;
  const tokenLimit = max_completion_tokens ?? max_tokens ?? 800;
  const modes = [
    { ...rest, max_completion_tokens: tokenLimit },
    { ...rest, max_tokens: tokenLimit },
  ];
  let lastErr;
  for (const attempt of modes) {
    try {
      return await client.chat.completions.create(attempt);
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message || '');
      if (!msg.includes('max_tokens') && !msg.includes('max_completion_tokens')) throw err;
    }
  }
  throw lastErr;
}

const getOpenAiClient = getClient;

module.exports = {
  getOpenAiClient,
  createChatCompletion,
  hasAiCredentials,
  resolveModel,
  getClientMode,
  getAiConfig,
  resetAiClientCache,
  logAiConfigSummary,
  OpenAI,
};
