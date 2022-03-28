describe('Packets', () => {
  // from https://github.com/ethereum/go-ethereum/pull/2091/files#diff-a2488b7a37555bfb5c64327072acdbbf703ab127176956f6b6558067950f8f73R455
  it('should correctly decode packet', () => {
    const exmaplePacket = `
      e9614ccfd9fc3e74360018522d30e1419a143407ffcce748de3e22116b7e8dc92ff74788c0b6663a
      aa3d67d641936511c8f8d6ad8698b820a7cf9e1be7155e9a241f556658c55428ec0563514365799a
      4be2be5a685a80971ddcfa80cb422cdd0101ec04cb847f000001820cfa8215a8d790000000000000
      000000000000000000018208ae820d058443b9a3550102
      `
      .split('\n')
      .join();
  });
});
