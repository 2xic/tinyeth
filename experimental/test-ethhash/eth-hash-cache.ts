import BigNumber from "bignumber.js";
import 'reflect-metadata';
import { getClassFromTestContainer } from "../../dist/container/getClassFromTestContainer";
import { EthHashCache } from "../../dist/consensus/eth-hash/EthHashCache";
import { EthHashHelper } from "../../dist/consensus/eth-hash/EthHashHelpers";

// Testcase from https://github.com/QuarkChain/pyquarkchain/blob/2068153c9386a1eacb5eccb8cf93d98f87537203/ethereum/pow/tests/test_ethash.py
const blockNumber = new BigNumber(0);
const ethHashHelper = getClassFromTestContainer(EthHashHelper);
const seed = ethHashHelper.getSeedHash({
    blockNumber,
});

console.log(seed)
console.log('got sed')

const cache = getClassFromTestContainer(EthHashCache).makeCache({
    cacheSize: new BigNumber(1024),
    seed,
});
const cacheSerialized = cache
    .map((item) =>
        ethHashHelper
            .serialize({
                buffer: item,
            })
            .toString('hex')
    )
    .join('');

console.log(cacheSerialized)
console.log(cacheSerialized.startsWith('7ce2991c951f7bf4c4c1bb11'))
