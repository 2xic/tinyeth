export function parseEncode(enode: string): {
  publicKey: string;
  address: string;
  port: number;
} {
  const [publicKey, ip] = enode.split('@');
  const [address, port] = ip.split(':');

  return {
    publicKey: publicKey.replace('enode://', ''),
    address,
    port: Number(port),
  };
}
