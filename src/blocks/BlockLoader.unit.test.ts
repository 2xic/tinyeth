import { getClassFromTestContainer } from '../container/getClassFromTestContainer';
import { BlockLoader } from './BlockLoader';
import { Address } from '../evm/Address';

describe('Block', () => {
  // Based on test from geth https://github.com/ethereum/go-ethereum/blob/4766b1107fadcd5f31c96b0744a2a788c6e4a01c/core/types/block_test.go#L35
  it('should decode a block', async () => {
    const interactor = getClassFromTestContainer(BlockLoader);
    const block =
      'f90260f901f9a083cafc574e1f51ba9dc0568fc617a08ea2429fb384059c972f13b19fa1c8dd55a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347948888f1f195afa192cfee860698584c030f4c9db1a0ef1552a40b7165c3cd773806b9e0c165b75356e0314bf0706f279c729f51e017a05fe50b260da6308036625b850b5d6ced6d0a9f814c0688bc91ffb7b7a3a54b67a0bc37d79753ad738a6dac4921e57392f145d8887476de3f783dfa7edae9283e52b90100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008302000001832fefd8825208845506eb0780a0bd4472abb6659ebe3ee06ee4d7b72a00a9f4d001caca51342001075469aff49888a13a5a8c8f2bb1c4f861f85f800a82c35094095e7baea6a6c7c4c2dfeb977efac326af552d870a801ba09bea4c4daac7c7c52e093e6a4c35dbbcf8856f1af7b059ba20253e70848d094fa08a8fae537ce25ed8cb5af9adac3f141af69bd515bd2ba031522df09b97dd72b1c0';
    const parsed = interactor.load({
      block,
    });

    expect(parsed.coinbase).toBe('8888f1f195afa192cfee860698584c030f4c9db1');
    expect(parsed.root).toBe(
      'ef1552a40b7165c3cd773806b9e0c165b75356e0314bf0706f279c729f51e017'
    );
    expect(parsed.difficultly).toBe(131072);
    expect(parsed.gasLimit).toBe(3141592);
    expect(parsed.gasUsed).toBe(21000);
    expect(parsed.timestamp).toBe(1426516743);
    expect(parsed.mixDigest).toBe(
      'bd4472abb6659ebe3ee06ee4d7b72a00a9f4d001caca51342001075469aff498'
    );
    expect(parsed.nonce).toBe('a13a5a8c8f2bb1c4');
    expect(parsed.transaction).toHaveLength(1);

    const transaction = parsed.transaction[0];
    expect(transaction.to.toString()).toBe(
      new Address('0x095e7baea6a6c7c4c2dfeb977efac326af552d87').toString()
    );
    expect(transaction.value.toNumber()).toBe(10);
  });
});
