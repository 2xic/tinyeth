import { parseEncode } from './parseEnode';

// from https://www.ethernodes.org/nodes
export const randomEnodes = [
  'enode://0022a79728874e918165bedacb2af2ffb5afe80d575a10ada68739b3fb5e40ad2987e3e1936e74641dd3a7f3c9b638e2411a13dd5875c4e6db29d29a7c0ac779@35.227.75.9:29888',
  'enode://009ab88f5b6a322df3f284381b71a1ba817f39c4244b8dc296f85fd263fa7b9b680b37f24145e18cc0b46992f84b23fdbde1bba45e789c4a4bb9faf31ac3b915@115.194.88.166:30303',
  'enode://01ad04224423cdf29b3226b3f68cc07954b838ea282979f58017266824468d30b58f89ff0618c4a6b875eab2b46cfe1ee1c3eb71ee04536e1e1714bcaf9b0d1f@18.139.208.86:30303',
  'enode://22a5785c04f8e01670da51aaa8920e91bdba73414548b717817056dc76dae07846f8ae934d3174b19182a2f267843f932a3c5a7047fb1e13be1d3e329a587917@82.11.186.248:30303',
  'enode://39a2b61f920a35457a3db02da174a56e05497e4c837fc602897176ff4fd4b16c7a7b35845b5475c2ab49e42bff1f121193aba9ca87eb6e0d26328646b79dee41@23.20.92.25:30303',
];

// from geth https://github.com/ethereum/go-ethereum/blob/master/params/bootnodes.go
export const gethEnodes = [
  'enode://d860a01f9722d78051619d1e2351aba3f43f943f6f00718d1b9baa4101932a1f5011f16bb2b1bb35db20d6fe28fa0bf09636d26a87d31de9ec6203eeedb1f666@18.138.108.67:30303', // bootnode-aws-ap-southeast-1-001
  'enode://22a8232c3abc76a16ae9d6c3b164f98775fe226f0917b0ca871128a74a8e9630b458460865bab457221f1d448dd9791d24c4e5d88786180ac185df813a68d4de@3.209.45.79:30303', // bootnode-aws-us-east-1-001
  'enode://8499da03c47d637b20eee24eec3c356c9a2e6148d6fe25ca195c7949ab8ec2c03e3556126b0d7ed644675e78c4318b08691b7b57de10e5f0d40d05b09238fa0a@52.187.207.27:30303', // bootnode-azure-australiaeast-001
  'enode://103858bdb88756c71f15e9b5e09b56dc1be52f0a5021d46301dbbfb7e130029cc9d0d6f73f693bc29b665770fff7da4d34f3c6379fe12721b5d7a0bcb5ca1fc1@191.234.162.198:30303', // bootnode-azure-brazilsouth-001
  'enode://715171f50508aba88aecd1250af392a45a330af91d7b90701c436b618c86aaa1589c9184561907bebbb56439b8f8787bc01f49a7c77276c58c1b09822d75e8e8@52.231.165.108:30303', // bootnode-azure-koreasouth-001
  'enode://5d6d7cd20d6da4bb83a1d28cadb5d409b64edf314c0335df658c1a54e32c7c4a7ab7823d57c39b6a757556e68ff1df17c748b698544a55cb488b52479a92b60f@104.42.217.25:30303', // bootnode-azure-westus-001
  'enode://2b252ab6a1d0f971d9722cb839a42cb81db019ba44c08754628ab4a823487071b5695317c8ccd085219c3a03af063495b2f1da8d18218da2d6a82981b45e6ffc@65.108.70.101:30303', // bootnode-hetzner-hel
  'enode://4aeb4ab6c14b23e2c4cfdce879c04b0748a20d8e9b59e25ded2a08143e265c6c25936e74cbc8e641e3312ca288673d91f2f93f8e277de3cfa444ecdaaf982052@157.90.35.166:30303', // bootnode-hetzner-fsn
];

const combinedEnodes = gethEnodes.concat(randomEnodes);

export function getRandomPeer() {
  return parseEncode(
    combinedEnodes[Math.floor(Math.random() * combinedEnodes.length)]
  );
}

export function getRandomGethPeer() {
  return parseEncode(gethEnodes[Math.floor(Math.random() * gethEnodes.length)]);
}
