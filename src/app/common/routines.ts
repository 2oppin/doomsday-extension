// tslint:disable-next-line:no-bitwise
const UUIDn = (n = 32) => Array(n).fill(0).map(() => (Math.random() * 16 | 0).toString(16)).join("");
export const UUID = () => new Date().getTime().toString(16) + UUIDn(21);
