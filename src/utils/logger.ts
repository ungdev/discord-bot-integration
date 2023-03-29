export function log(message: string) {
	const timestamp = new Date().toLocaleString();
	console.log(`[${timestamp}] ${message}`);
}

export function error(message: string) {
	log(`[ERROR] ${message}`);
}