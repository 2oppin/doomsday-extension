const UUID = (n = 32) => Array(n).fill(0).map(() => (Math.random() * 16 | 0).toString(16)).join("");
const UUIDt = () => new Date().getTime().toString(16) + UUID(21);
export default {
  UUID: UUIDt
}
