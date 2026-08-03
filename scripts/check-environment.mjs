import { execFileSync } from 'node:child_process';

const checks = [
  { name: 'Node.js', command: 'node', args: ['--version'], required: true },
  { name: 'pnpm', command: 'pnpm', args: ['--version'], required: true },
  { name: 'Git', command: 'git', args: ['--version'], required: true },
  {
    name: 'Docker',
    command: 'docker',
    args: ['--version'],
    required: false,
    purpose: 'opcional; necessário somente para executar o Supabase local',
  },
];

let hasMissingRequirement = false;

for (const check of checks) {
  try {
    const executable = process.platform === 'win32' ? 'cmd.exe' : check.command;
    const args =
      process.platform === 'win32'
        ? ['/d', '/s', '/c', [check.command, ...check.args].join(' ')]
        : check.args;

    const output = execFileSync(executable, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    console.log(`OK  ${check.name}: ${output}`);
  } catch {
    const level = check.required ? 'ERRO' : 'AVISO';
    const purpose = check.purpose ? ` (${check.purpose})` : '';
    console.error(`${level} ${check.name}: não encontrado ou indisponível${purpose}`);
    hasMissingRequirement ||= check.required;
  }
}

if (Number.parseInt(process.versions.node.split('.')[0], 10) !== 24) {
  console.error(`ERRO Node.js: esperado 24.x, encontrado ${process.version}`);
  hasMissingRequirement = true;
}

if (hasMissingRequirement) {
  console.error('\nInstale/corrija os itens acima antes de ligar todo o ambiente local.');
  process.exitCode = 1;
} else {
  console.log('\nAmbiente pronto para desenvolvimento com os serviços selecionados.');
}
