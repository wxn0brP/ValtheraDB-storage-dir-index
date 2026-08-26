export function decodeKey(key: { type: number; data: Buffer }) {
	if (key.type === 1) return key.data.readDoubleLE(0);
	return key.data.toString("utf-8");
}

export function cloneKey(key: { type: number; data: Buffer }) {
	return {
		type: key.type,
		data: Buffer.from(key.data),
	};
}
