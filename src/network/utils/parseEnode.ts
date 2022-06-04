export function parseEncode(enode: string): ParsedEnode {
  const [publicKey, ip] = enode.split('@');
  const [address, port] = ip.split(':');

  return {
    publicKey: publicKey.replace('enode://', ''),
    address,
    port: Number(port),
  };
}

export interface ParsedEnode {
  publicKey: string;
  address: string;
  port: number;
}
