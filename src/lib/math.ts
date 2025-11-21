export function mod(n: number, m: number) {
	return ((n % m) + m) % m;
}

export function sampleGaussian(mean: number, stdDev: number) {
	let u = 0,
		v = 0;
	while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
	while (v === 0) v = Math.random();
	let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
	num = num * stdDev + mean; // Translate to desired mean and standard deviation
	return num;
}
