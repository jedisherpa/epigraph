function sieve(limit: number): number[] {
  const comp = new Uint8Array(limit + 1);
  const primes: number[] = [];
  for (let i = 2; i <= limit; i++) {
    if (comp[i]) continue;
    primes.push(i);
    if (i * i > limit) continue;
    for (let j = i * i; j <= limit; j += i) comp[j] = 1;
  }
  return primes;
}

export const PRIMES = sieve(20000);
