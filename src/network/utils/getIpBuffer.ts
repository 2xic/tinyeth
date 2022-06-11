import ip6addr from 'ip6addr';

export function getIpBuffer(ip: string) {
  const encoded = Buffer.from(ip6addr.parse(ip).toBuffer());
  const isIpv4 = ip.split('.').length === 4;

  return isIpv4 ? encoded.slice(-4) : encoded;
}
