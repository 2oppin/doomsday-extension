// tslint:disable-next-line:no-bitwise
const UUIDn = (n = 32) => Array(n).fill(0).map(() => (Math.random() * 16 | 0).toString(16)).join("");
export const UUID = () => new Date().getTime().toString(16) + UUIDn(21);

export const formatDate = (d: Date) =>
    `${d.getUTCFullYear()}-${`${d.getUTCMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;

export const formatTime = (d: Date) =>
    `${`${d.getUTCHours()}`.padStart(2, "0")}:${`${d.getUTCMinutes()}`.padStart(2, "0")}`;

export const siteBase = () => window.location.href.replace(/^(https?:\/\/[^\/]+)\/?(.*)?/, "$1");
