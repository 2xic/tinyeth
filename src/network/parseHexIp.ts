import { InputOutlined } from '@mui/icons-material';

export function parseHexIp(input: Buffer) {
  if (input.length == 4) {
    return `${input[0]}.${input[1]}.${input[2]}.${input[3]}`;
  } else if (input.length === 16) {
    const ipv6 = `${input[0]}${input[1]}.${input[2]}${input[3]}.${input[4]}${input[5]}.${input[6]}${input[7]}.${input[8]}${input[9]}`;
    if (ipv6 === '0000.0000.0000.0000.0000.0000.0000.0001') {
      return '::1';
    }

    return ipv6;
  } else {
    throw new Error('Invalid ip');
  }
}

export function convertToHexIp(input: string): string {
  const ipParts = input.split('.').map((item) => Number(item));
  const bufferHex = Buffer.from(ipParts).toString('hex');

  return `0x${bufferHex}`;
}
