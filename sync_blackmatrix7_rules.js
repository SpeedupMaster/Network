const fs = require('fs');
const path = require('path');

const outputDir = path.resolve('Egern_RuleSets');
const sourceMapPath = path.resolve('Egern_RuleSources.json');

const base = 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master';

const sourceMap = {
  'category-ads-all': [{ path: 'rule/Surge/Advertising/Advertising.list', mode: 'all' }],
  private: [{ path: 'rule/Surge/Lan/Lan.list', mode: 'all' }],
  'private-ip': [{ path: 'rule/Surge/Lan/Lan.list', mode: 'ip' }],
  'geolocation-cn': [{ path: 'rule/Surge/China/China_Domain.list', mode: 'non_ip' }],
  'cn-ip': [{ path: 'rule/Surge/ChinaIPs/ChinaIPs.list', mode: 'ip' }],
  'geolocation-!cn': [{ path: 'rule/Surge/Global/Global_Domain.list', mode: 'non_ip' }],
  'category-ai-chat-!cn': [
    { path: 'rule/Surge/OpenAI/OpenAI.list', mode: 'all' },
    { path: 'rule/Surge/Anthropic/Anthropic.list', mode: 'all' },
    { path: 'rule/Surge/Claude/Claude.list', mode: 'all' },
    { path: 'rule/Surge/Gemini/Gemini.list', mode: 'all' },
    { path: 'rule/Surge/BardAI/BardAI.list', mode: 'all' },
    { path: 'rule/Surge/Copilot/Copilot.list', mode: 'all' },
  ],
  openai: [{ path: 'rule/Surge/OpenAI/OpenAI.list', mode: 'all' }],
  anthropic: [{ path: 'rule/Surge/Anthropic/Anthropic.list', mode: 'all' }],
  'google-gemini': [{ path: 'rule/Surge/Gemini/Gemini.list', mode: 'all' }],
  youtube: [{ path: 'rule/Surge/YouTube/YouTube.list', mode: 'all' }],
  google: [{ path: 'rule/Surge/Google/Google.list', mode: 'non_ip' }],
  'google-ip': [{ path: 'rule/Surge/Google/Google.list', mode: 'ip' }],
  microsoft: [{ path: 'rule/Surge/Microsoft/Microsoft.list', mode: 'all' }],
  onedrive: [{ path: 'rule/Surge/OneDrive/OneDrive.list', mode: 'all' }],
  apple: [{ path: 'rule/Surge/Apple/Apple.list', mode: 'all' }],
  icloud: [{ path: 'rule/Surge/iCloud/iCloud.list', mode: 'all' }],
  telegram: [{ path: 'rule/Surge/Telegram/Telegram.list', mode: 'non_ip' }],
  'telegram-ip': [{ path: 'rule/Surge/Telegram/Telegram.list', mode: 'ip' }],
  twitter: [{ path: 'rule/Surge/Twitter/Twitter.list', mode: 'non_ip' }],
  'twitter-ip': [{ path: 'rule/Surge/Twitter/Twitter.list', mode: 'ip' }],
  facebook: [{ path: 'rule/Surge/Facebook/Facebook.list', mode: 'non_ip' }],
  instagram: [{ path: 'rule/Surge/Instagram/Instagram.list', mode: 'all' }],
  whatsapp: [{ path: 'rule/Surge/Whatsapp/Whatsapp.list', mode: 'all' }],
  'facebook-ip': [{ path: 'rule/Surge/Facebook/Facebook.list', mode: 'ip' }],
  discord: [{ path: 'rule/Surge/Discord/Discord.list', mode: 'all' }],
  tiktok: [{ path: 'rule/Surge/TikTok/TikTok.list', mode: 'all' }],
  line: [{ path: 'rule/Surge/Line/Line.list', mode: 'all' }],
  reddit: [{ path: 'rule/Surge/Reddit/Reddit.list', mode: 'all' }],
  linkedin: [{ path: 'rule/Surge/LinkedIn/LinkedIn.list', mode: 'all' }],
  snap: [{ path: 'rule/Surge/Snap/Snap.list', mode: 'all' }],
  pinterest: [{ path: 'rule/Surge/Pinterest/Pinterest.list', mode: 'all' }],
  tumblr: [{ path: 'rule/Surge/Tumblr/Tumblr.list', mode: 'all' }],
  netflix: [{ path: 'rule/Surge/Netflix/Netflix.list', mode: 'non_ip' }],
  'netflix-ip': [{ path: 'rule/Surge/Netflix/Netflix.list', mode: 'ip' }],
  disney: [{ path: 'rule/Surge/Disney/Disney.list', mode: 'all' }],
  hbo: [{ path: 'rule/Surge/HBO/HBO.list', mode: 'all' }],
  hulu: [{ path: 'rule/Surge/Hulu/Hulu.list', mode: 'all' }],
  primevideo: [{ path: 'rule/Surge/PrimeVideo/PrimeVideo.list', mode: 'all' }],
  'apple-tvplus': [{ path: 'rule/Surge/AppleTV/AppleTV.list', mode: 'all' }],
  spotify: [{ path: 'rule/Surge/Spotify/Spotify.list', mode: 'all' }],
  twitch: [{ path: 'rule/Surge/Twitch/Twitch.list', mode: 'all' }],
  dazn: [{ path: 'rule/Surge/DAZN/DAZN.list', mode: 'all' }],
  bahamut: [{ path: 'rule/Surge/Bahamut/Bahamut.list', mode: 'all' }],
  biliintl: [{ path: 'rule/Surge/BiliBiliIntl/BiliBiliIntl.list', mode: 'all' }],
  niconico: [{ path: 'rule/Surge/Niconico/Niconico.list', mode: 'all' }],
  abema: [{ path: 'rule/Surge/Abema/Abema.list', mode: 'all' }],
  viu: [{ path: 'rule/Surge/ViuTV/ViuTV.list', mode: 'all' }],
  kktv: [{ path: 'rule/Surge/KKTV/KKTV.list', mode: 'all' }],
  steam: [{ path: 'rule/Surge/Steam/Steam.list', mode: 'all' }],
  epicgames: [{ path: 'rule/Surge/Epic/Epic.list', mode: 'all' }],
  ea: [{ path: 'rule/Surge/EA/EA.list', mode: 'all' }],
  ubisoft: [{ path: 'rule/Surge/Ubisoft/Ubisoft.list', mode: 'all' }],
  blizzard: [{ path: 'rule/Surge/Blizzard/Blizzard.list', mode: 'all' }],
  gog: [{ path: 'rule/Surge/Gog/Gog.list', mode: 'all' }],
  riot: [{ path: 'rule/Surge/Riot/Riot.list', mode: 'all' }],
  playstation: [{ path: 'rule/Surge/PlayStation/PlayStation.list', mode: 'all' }],
  xbox: [{ path: 'rule/Surge/Xbox/Xbox.list', mode: 'all' }],
  nintendo: [{ path: 'rule/Surge/Nintendo/Nintendo.list', mode: 'all' }],
  github: [{ path: 'rule/Surge/GitHub/GitHub.list', mode: 'all' }],
  gitlab: [{ path: 'rule/Surge/GitLab/GitLab.list', mode: 'all' }],
  atlassian: [{ path: 'rule/Surge/Atlassian/Atlassian.list', mode: 'all' }],
  aws: [{ path: 'rule/Surge/Cloud/AmazonCloud/AmazonCloud.list', mode: 'all' }],
  azure: [{ path: 'rule/Surge/Cloud/CloudGlobal/CloudGlobal.list', mode: 'all' }],
  cloudflare: [{ path: 'rule/Surge/Cloudflare/Cloudflare.list', mode: 'non_ip' }],
  digitalocean: [{ path: 'rule/Surge/DigitalOcean/DigitalOcean.list', mode: 'all' }],
  vercel: [{ path: 'rule/Surge/Vercel/Vercel.list', mode: 'all' }],
  netlify: [{ path: 'rule/Surge/Cloud/CloudGlobal/CloudGlobal.list', mode: 'all' }],
  'cloudflare-ip': [{ path: 'rule/Surge/Cloudflare/Cloudflare.list', mode: 'ip' }],
  docker: [{ path: 'rule/Surge/Docker/Docker.list', mode: 'all' }],
  npmjs: [{ path: 'rule/Surge/Npmjs/Npmjs.list', mode: 'all' }],
  jetbrains: [{ path: 'rule/Surge/Jetbrains/Jetbrains.list', mode: 'all' }],
  stackexchange: [{ path: 'rule/Surge/Stackexchange/Stackexchange.list', mode: 'all' }],
  dropbox: [{ path: 'rule/Surge/Dropbox/Dropbox.list', mode: 'all' }],
  notion: [{ path: 'rule/Surge/Notion/Notion.list', mode: 'all' }],
  paypal: [{ path: 'rule/Surge/PayPal/PayPal.list', mode: 'all' }],
  stripe: [{ path: 'rule/Surge/Stripe/Stripe.list', mode: 'all' }],
  binance: [{ path: 'rule/Surge/Binance/Binance.list', mode: 'all' }],
  'category-scholar-!cn': [
    { path: 'rule/Surge/GlobalScholar/GlobalScholar.list', mode: 'all' },
    { path: 'rule/Surge/Scholar/Scholar.list', mode: 'all' },
  ],
  coursera: [{ path: 'rule/Surge/GlobalScholar/GlobalScholar.list', mode: 'all' }],
  udemy: [{ path: 'rule/Surge/GlobalScholar/GlobalScholar.list', mode: 'all' }],
  edx: [{ path: 'rule/Surge/GlobalScholar/GlobalScholar.list', mode: 'all' }],
  khanacademy: [{ path: 'rule/Surge/GlobalScholar/GlobalScholar.list', mode: 'all' }],
  wikimedia: [{ path: 'rule/Surge/Wikimedia/Wikimedia.list', mode: 'all' }],
  bbc: [{ path: 'rule/Surge/BBC/BBC.list', mode: 'all' }],
  cnn: [{ path: 'rule/Surge/CNN/CNN.list', mode: 'all' }],
  nytimes: [{ path: 'rule/Surge/NYTimes/NYTimes.list', mode: 'all' }],
  wsj: [{ path: 'rule/Surge/USMedia/USMedia.list', mode: 'all' }],
  bloomberg: [{ path: 'rule/Surge/Bloomberg/Bloomberg.list', mode: 'all' }],
  amazon: [{ path: 'rule/Surge/Amazon/Amazon.list', mode: 'all' }],
  ebay: [{ path: 'rule/Surge/eBay/eBay.list', mode: 'all' }],
  cn: [{ path: 'rule/Surge/China/China_Domain.list', mode: 'non_ip' }],
};

const fallbackExisting = new Set(['wise']);

const fieldMap = {
  DOMAIN: 'domain_set',
  'DOMAIN-SUFFIX': 'domain_suffix_set',
  'DOMAIN-KEYWORD': 'domain_keyword_set',
  'DOMAIN-REGEX': 'domain_regex_set',
  'DOMAIN-WILDCARD': 'domain_wildcard_set',
  'IP-CIDR': 'ip_cidr_set',
  'IP-CIDR6': 'ip_cidr6_set',
  'IP-ASN': 'asn_set',
  GEOIP: 'geoip_set',
  'URL-REGEX': 'url_regex_set',
  'USER-AGENT': 'user_agent_set',
  'DEST-PORT': 'dest_port_set',
  PROTOCOL: 'protocol_set',
  SSID: 'ssid_set',
  BSSID: 'bssid_set',
  CELLULAR: 'cellular_set',
};

const allFields = [
  'domain_set',
  'domain_keyword_set',
  'domain_suffix_set',
  'domain_regex_set',
  'domain_wildcard_set',
  'geoip_set',
  'ip_cidr_set',
  'ip_cidr6_set',
  'asn_set',
  'url_regex_set',
  'user_agent_set',
  'dest_port_set',
  'protocol_set',
  'ssid_set',
  'bssid_set',
  'cellular_set',
];

const escapeString = (value) =>
  `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

const unique = (values) => [...new Set(values)];

const ensureRuleSet = () => {
  const ruleSet = {};
  for (const field of allFields) {
    ruleSet[field] = [];
  }
  ruleSet.no_resolve = false;
  return ruleSet;
};

const mergeRuleSet = (target, source) => {
  for (const field of allFields) {
    target[field].push(...source[field]);
  }
  target.no_resolve = target.no_resolve || source.no_resolve;
};

const normalizeRuleSet = (ruleSet) => {
  const normalized = {};
  if (ruleSet.no_resolve) {
    normalized.no_resolve = true;
  }
  for (const field of allFields) {
    const values = unique(ruleSet[field]);
    if (values.length) {
      normalized[field] = values;
    }
  }
  return normalized;
};

const stringifyRuleSet = (ruleSet) => {
  const lines = [];
  if (ruleSet.no_resolve) {
    lines.push('no_resolve: true');
  }
  for (const field of allFields) {
    const values = ruleSet[field];
    if (!values || values.length === 0) continue;
    lines.push(`${field}:`);
    for (const value of values) {
      lines.push(`  - ${escapeString(value)}`);
    }
  }
  return `${lines.join('\n')}\n`;
};

const parseLine = (line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  if (!trimmed.includes(',')) {
    if (trimmed.startsWith('*.')) {
      return { type: 'DOMAIN-WILDCARD', value: trimmed, noResolve: false };
    }
    if (trimmed.startsWith('.')) {
      return { type: 'DOMAIN-SUFFIX', value: trimmed.slice(1), noResolve: false };
    }
    return { type: 'DOMAIN', value: trimmed, noResolve: false };
  }
  const firstComma = trimmed.indexOf(',');
  if (firstComma === -1) return null;
  const type = trimmed.slice(0, firstComma).trim().toUpperCase();
  const rest = trimmed.slice(firstComma + 1);
  if (type === 'IP-CIDR' || type === 'IP-CIDR6' || type === 'GEOIP' || type === 'IP-ASN') {
    const parts = rest.split(',');
    return {
      type,
      value: parts[0].trim(),
      noResolve: parts.slice(1).some((item) => item.trim().toLowerCase() === 'no-resolve'),
    };
  }
  return { type, value: rest.trim(), noResolve: false };
};

const shouldIncludeType = (mode, type) => {
  const isIp =
    type === 'IP-CIDR' || type === 'IP-CIDR6' || type === 'GEOIP' || type === 'IP-ASN';
  if (mode === 'ip') return isIp;
  if (mode === 'non_ip') return !isIp;
  return true;
};

const convertText = (text, mode) => {
  const ruleSet = ensureRuleSet();
  const unsupported = {};
  for (const line of text.split(/\r?\n/)) {
    const parsed = parseLine(line);
    if (!parsed) continue;
    if (!shouldIncludeType(mode, parsed.type)) continue;
    const field = fieldMap[parsed.type];
    if (!field) {
      unsupported[parsed.type] = (unsupported[parsed.type] || 0) + 1;
      continue;
    }
    if (!parsed.value) continue;
    ruleSet[field].push(parsed.value);
    if (parsed.noResolve) {
      ruleSet.no_resolve = true;
    }
  }
  return { ruleSet, unsupported };
};

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Codex blackmatrix7 rule sync',
      Accept: 'text/plain,*/*',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return await response.text();
};

const main = async () => {
  fs.mkdirSync(outputDir, { recursive: true });

  const report = {
    generated_at: new Date().toISOString(),
    source: 'blackmatrix7/ios_rule_script',
    providers: {},
    fallback_existing: Array.from(fallbackExisting),
  };

  for (const [provider, entries] of Object.entries(sourceMap)) {
    const merged = ensureRuleSet();
    const unsupported = {};
    const sources = [];

    for (const entry of entries) {
      const url = `${base}/${entry.path}`;
      const text = await fetchText(url);
      const converted = convertText(text, entry.mode);
      mergeRuleSet(merged, converted.ruleSet);
      for (const [type, count] of Object.entries(converted.unsupported)) {
        unsupported[type] = (unsupported[type] || 0) + count;
      }
      sources.push({ url, mode: entry.mode });
    }

    const normalized = normalizeRuleSet(merged);
    if (!Object.keys(normalized).length) {
      throw new Error(`Provider ${provider} produced an empty rule set`);
    }

    const outputPath = path.join(outputDir, `${provider}.yaml`);
    fs.writeFileSync(outputPath, stringifyRuleSet(normalized), 'utf8');

    report.providers[provider] = {
      sources,
      fields: Object.fromEntries(
        Object.entries(normalized)
          .filter(([key]) => key !== 'no_resolve')
          .map(([key, values]) => [key, values.length]),
      ),
      no_resolve: Boolean(normalized.no_resolve),
      unsupported,
    };
  }

  fs.writeFileSync(sourceMapPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(
    JSON.stringify(
      {
        generatedProviders: Object.keys(sourceMap).length,
        fallbackExisting: Array.from(fallbackExisting),
        outputDir,
        sourceMapPath,
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
