const fs = require('fs');
const net = require('net');
const path = require('path');

const repo = 'MetaCubeX/meta-rules-dat';
const ref = 'meta';
const rawBase = `https://raw.githubusercontent.com/${repo}/refs/heads/${ref}`;
const githubBase = `https://github.com/${repo}/raw/refs/heads/${ref}`;

const clashConfigPath = path.resolve(process.env.CLASH_CONFIG_PATH || 'Clash_Config.yml');
const outputDir = path.resolve(process.env.EGERN_RULESET_DIR || 'Egern_RuleSets');
const reportPath = path.resolve(
  process.env.EGERN_RULESOURCE_REPORT || 'Egern_MetaCubeX_RuleSources.json',
);

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

const typedRuleMap = {
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

const ensureRuleSet = () => {
  const ruleSet = {};
  for (const field of allFields) {
    ruleSet[field] = [];
  }
  ruleSet.no_resolve = false;
  return ruleSet;
};

const unique = (values) => [...new Set(values)];

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

const escapeString = (value) =>
  `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

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

const fieldCounts = (ruleSet) =>
  Object.fromEntries(
    Object.entries(ruleSet)
      .filter(([key, value]) => key !== 'no_resolve' && Array.isArray(value))
      .map(([key, value]) => [key, value.length]),
  );

const addUnsupported = (unsupported, reason) => {
  unsupported[reason] = (unsupported[reason] || 0) + 1;
};

const addRule = (ruleSet, field, value) => {
  if (!value) return;
  ruleSet[field].push(value);
};

const cleanValue = (value) =>
  value
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .trim();

const isCidr = (value) => {
  const [address, prefix] = value.split('/');
  if (!address || !prefix) return false;
  return net.isIP(address) !== 0 && /^\d+$/.test(prefix);
};

const cidrField = (value) => {
  const address = value.split('/')[0];
  return net.isIP(address) === 6 ? 'ip_cidr6_set' : 'ip_cidr_set';
};

const parseCommaRule = (line, ruleSet, unsupported) => {
  const firstComma = line.indexOf(',');
  if (firstComma === -1) return false;

  const type = line.slice(0, firstComma).trim().toUpperCase();
  const field = typedRuleMap[type];
  if (!field) return false;

  const parts = line
    .slice(firstComma + 1)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const value = parts[0];
  if (!value) return true;

  addRule(ruleSet, field, value);
  if (parts.slice(1).some((part) => part.toLowerCase() === 'no-resolve')) {
    ruleSet.no_resolve = true;
  }
  return true;
};

const parsePrefixedGeositeRule = (line, ruleSet, unsupported) => {
  const separatorIndex = line.indexOf(':');
  if (separatorIndex === -1) return false;

  const prefix = line.slice(0, separatorIndex).trim().toLowerCase();
  const value = cleanValue(line.slice(separatorIndex + 1));
  if (!value) return true;

  switch (prefix) {
    case 'full':
      addRule(ruleSet, 'domain_set', value);
      return true;
    case 'domain':
    case 'suffix':
      addRule(ruleSet, 'domain_suffix_set', value.replace(/^\+\./, ''));
      return true;
    case 'keyword':
      addRule(ruleSet, 'domain_keyword_set', value);
      return true;
    case 'regexp':
    case 'regex':
      addRule(ruleSet, 'domain_regex_set', value);
      return true;
    default:
      addUnsupported(unsupported, `unsupported_prefix:${prefix}`);
      return true;
  }
};

const parsePlainRule = (line, sourceKind, ruleSet, unsupported) => {
  if (parseCommaRule(line, ruleSet, unsupported)) return;

  if (isCidr(line)) {
    addRule(ruleSet, cidrField(line), line);
    return;
  }

  if (sourceKind === 'ipcidr') {
    addUnsupported(unsupported, 'invalid_cidr');
    return;
  }

  if (line.startsWith('+.')) {
    addRule(ruleSet, 'domain_suffix_set', line.slice(2));
    return;
  }

  if (line.startsWith('*.')) {
    addRule(ruleSet, 'domain_wildcard_set', line);
    return;
  }

  if (parsePrefixedGeositeRule(line, ruleSet, unsupported)) return;

  if (line.startsWith('.')) {
    addRule(ruleSet, 'domain_suffix_set', line.slice(1));
    return;
  }

  addRule(ruleSet, 'domain_set', line);
};

const convertText = (text, sourceKind) => {
  const ruleSet = ensureRuleSet();
  const unsupported = {};

  if (sourceKind === 'ipcidr') {
    ruleSet.no_resolve = true;
  }

  for (const originalLine of text.split(/\r?\n/)) {
    const line = cleanValue(originalLine.replace(/^\uFEFF/, ''));
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;
    parsePlainRule(line, sourceKind, ruleSet, unsupported);
  }

  return { ruleSet: normalizeRuleSet(ruleSet), unsupported };
};

const fetchText = async (url, accept = 'text/plain,*/*') => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Codex MetaCubeX to Egern rule sync',
      Accept: accept,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return await response.text();
};

const parseInlineProvider = (name, body) => {
  const readProperty = (property) => {
    const pattern = new RegExp(`${property}\\s*:\\s*("[^"]+"|'[^']+'|[^,}]+)`, 'i');
    const match = body.match(pattern);
    return match ? cleanValue(match[1]) : '';
  };

  return {
    name,
    behavior: readProperty('behavior').toLowerCase(),
    url: readProperty('url'),
  };
};

const readProvidersFromClashConfig = () => {
  if (!fs.existsSync(clashConfigPath)) {
    throw new Error(`Cannot find Clash config: ${clashConfigPath}`);
  }

  const lines = fs.readFileSync(clashConfigPath, 'utf8').split(/\r?\n/);
  const providers = [];
  let insideProviders = false;

  for (const line of lines) {
    if (/^rule-providers:\s*$/.test(line)) {
      insideProviders = true;
      continue;
    }
    if (insideProviders && /^\S/.test(line) && !/^rule-providers:\s*$/.test(line)) {
      break;
    }
    if (!insideProviders) continue;

    const inlineMatch = line.match(/^\s{2}([^:\s][^:]*):\s*\{(.+)\}\s*$/);
    if (!inlineMatch) continue;

    const provider = parseInlineProvider(inlineMatch[1].trim(), inlineMatch[2]);
    if (!provider.url.includes(repo)) continue;
    providers.push(provider);
  }

  if (!providers.length) {
    throw new Error(`No ${repo} rule-providers found in ${clashConfigPath}`);
  }

  return providers;
};

const toRawListUrl = (url) => {
  if (url.startsWith(githubBase)) {
    return `${rawBase}${url.slice(githubBase.length)}`.replace(/\.mrs(\?|$)/, '.list$1');
  }
  if (url.startsWith(rawBase)) {
    return url.replace(/\.mrs(\?|$)/, '.list$1');
  }

  const githubMatch = url.match(
    /^https:\/\/github\.com\/MetaCubeX\/meta-rules-dat\/raw\/refs\/heads\/meta\/(.+)$/i,
  );
  if (githubMatch) {
    return `${rawBase}/${githubMatch[1]}`.replace(/\.mrs(\?|$)/, '.list$1');
  }

  throw new Error(`Unsupported MetaCubeX URL format: ${url}`);
};

const inferSourceKind = (provider, sourceUrl) => {
  if (provider.behavior === 'ipcidr' || sourceUrl.includes('/geo/geoip/')) {
    return 'ipcidr';
  }
  return 'domain';
};

const fetchUpstreamCommit = async () => {
  const text = await fetchText(`https://api.github.com/repos/${repo}/commits/${ref}`, 'application/json');
  const data = JSON.parse(text);
  return {
    sha: data.sha,
    date: data.commit && data.commit.committer ? data.commit.committer.date : undefined,
    html_url: data.html_url,
  };
};

const main = async () => {
  fs.mkdirSync(outputDir, { recursive: true });

  const providers = readProvidersFromClashConfig();
  const upstream = await fetchUpstreamCommit();
  const report = {
    generated_at: new Date().toISOString(),
    source: repo,
    ref,
    upstream,
    clash_config: path.relative(process.cwd(), clashConfigPath),
    output_dir: path.relative(process.cwd(), outputDir),
    providers: {},
  };

  for (const provider of providers) {
    const sourceUrl = toRawListUrl(provider.url);
    const sourceKind = inferSourceKind(provider, sourceUrl);
    const text = await fetchText(sourceUrl);
    const converted = convertText(text, sourceKind);

    if (!Object.keys(converted.ruleSet).some((key) => key !== 'no_resolve')) {
      throw new Error(`Provider ${provider.name} produced an empty Egern rule set`);
    }

    const outputPath = path.join(outputDir, `${provider.name}.yaml`);
    fs.writeFileSync(outputPath, stringifyRuleSet(converted.ruleSet), 'utf8');

    report.providers[provider.name] = {
      behavior: provider.behavior,
      source_url: sourceUrl,
      output: path.relative(process.cwd(), outputPath).replace(/\\/g, '/'),
      fields: fieldCounts(converted.ruleSet),
      no_resolve: Boolean(converted.ruleSet.no_resolve),
      unsupported: converted.unsupported,
    };
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(
    JSON.stringify(
      {
        source: `${repo}@${ref}`,
        upstream: upstream.sha,
        generatedProviders: providers.length,
        outputDir,
        reportPath,
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
