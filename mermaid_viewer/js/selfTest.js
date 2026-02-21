export function runSelfTest({ setStatus, statusEl, SAMPLES, encodeCode, decodeCode, isSandboxed }) {
  const tests = [];
  const add = (name, fn) => {
    try {
      tests.push({ name, ok: !!fn() });
    } catch (e) {
      tests.push({ name, ok: false, e });
    }
  };

  add('encode/decode ASCII', () => {
    const s = 'flowchart TD\nA-->B';
    return decodeCode(encodeCode(s)) === s;
  });
  add('encode/decode JP', () => {
    const s = '開始→承認?';
    return decodeCode(encodeCode(s)) === s;
  });
  add('sandbox detect', () => typeof isSandboxed() === 'boolean');
  add('gitGraph v10 parse', () => { window.mermaid.parse(SAMPLES.git); return true; });
  add('flowchart parse', () => { window.mermaid.parse(SAMPLES.flow); return true; });
  add('gantt parse', () => { window.mermaid.parse(SAMPLES.gantt); return true; });
  add('git dev/shishi cp parse', () => { window.mermaid.parse(SAMPLES.git_dev_shishi_cp); return true; });
  add('env_flow parse', () => { window.mermaid.parse(SAMPLES.env_flow); return true; });
  add('env_gantt parse', () => { window.mermaid.parse(SAMPLES.env_gantt); return true; });

  console.table(tests);
  const okAll = tests.every((t) => t.ok);
  setStatus(statusEl, `自己テスト: ${okAll ? 'OK' : '一部NG（コンソールを確認）'}`);
  return tests;
}
