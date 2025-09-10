export default function extractStateFromAddress(address) {
  const match = address.match(/\b[A-Z]{2}\b/);
  return match ? match[0] : 'DC';
}
