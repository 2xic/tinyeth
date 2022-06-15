export function verifyPacketLength({ packet }: { packet: Buffer }) {
  const lengthBuffer = packet.slice(0, 2);
  const message = packet.slice(2);
  const length = lengthBuffer.readUInt16BE();
  //  assertEqual(length, message.length, 'Wrong length of decrypt message');

  return {
    length,
    lengthBuffer,
    message,
  };
}
