const TOTAL = 24;
const A = 1103515245 % 1e9, C = 12345, M = 2147483647 % 1e9;
const hexv = c => { const i = "0123456789abcdef".indexOf(c.toLowerCase()); return i < 0 ? 0 : i; };

// Naive: ordinary JS numbers.
function rotateNumber(day, sot) {
  let sum = 0; for (const c of sot.slice(0,64)) sum += hexv(c);
  let s = (Number(day) + sum) % M; if (s === 0) s = 1;
  const p = Array.from({length: TOTAL}, (_, k) => k + 1);
  for (let i = TOTAL; i >= 2; i--) {
    s = (s * A + C) % M;
    const j = (s % i) + 1;
    [p[i-1], p[j-1]] = [p[j-1], p[i-1]];
  }
  return p;
}

// BigInt: exact integer arithmetic.
function rotateBigInt(day, sot) {
  const Ab = BigInt(A), Cb = BigInt(C), Mb = BigInt(M);
  let sum = 0; for (const c of sot.slice(0,64)) sum += hexv(c);
  let s = (BigInt(day) + BigInt(sum)) % Mb; if (s === 0n) s = 1n;
  const p = Array.from({length: TOTAL}, (_, k) => k + 1);
  for (let i = TOTAL; i >= 2; i--) {
    s = (s * Ab + Cb) % Mb;
    const j = Number(s % BigInt(i)) + 1;
    [p[i-1], p[j-1]] = [p[j-1], p[i-1]];
  }
  return p;
}

const fmt = p => p.map((v,i)=>`${String(i+1).padStart(2,'0')},${String(v).padStart(2,'0')}`).join('\n')+'\n';
const day = process.argv[2], sot = process.argv[3];
console.log('NUMBER:'); process.stdout.write(fmt(rotateNumber(day,sot)));
console.log('BIGINT:'); process.stdout.write(fmt(rotateBigInt(day,sot)));
console.log('max product needs', (147483646*103515245).toExponential(3), 'vs MAX_SAFE_INTEGER', Number.MAX_SAFE_INTEGER.toExponential(3));
