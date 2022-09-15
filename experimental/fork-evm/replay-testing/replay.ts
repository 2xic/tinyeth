import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import { Network, ExposedEvm, Address, getBufferFromHex, getClassFromTestContainer, ReplayContractTestUtils, UnitTestContainer } from "../../../dist";
import { Wei } from "../../../dist/evm/eth-units/Wei";

(async () => {
    const gasLimit = new BigNumber(0xffffffffffff);

    const contract = getBufferFromHex(
        '608060405234801561001057600080fd5b50600436106100415760003560e01c80630f28c97d146100465780631749e1e3146100645780634d2301cc14610085575b600080fd5b61004e610098565b60405161005b919061041f565b60405180910390f35b6100776100723660046102a7565b61009c565b60405161005b929190610428565b61004e610093366004610286565b610220565b4290565b8051439060609067ffffffffffffffff811180156100b957600080fd5b506040519080825280602002602001820160405280156100f357816020015b6100e061023a565b8152602001906001900390816100d85790505b50905060005b835181101561021a57600080600086848151811061011357fe5b60200260200101516000015187858151811061012b57fe5b60200260200101516020015188868151811061014357fe5b60200260200101516040015192509250925060005a90506000808573ffffffffffffffffffffffffffffffffffffffff1685856040516101839190610403565b60006040518083038160008787f1925050503d80600081146101c1576040519150601f19603f3d011682016040523d82523d6000602084013e6101c6565b606091505b509150915060005a8403905060405180606001604052808415158152602001828152602001838152508989815181106101fb57fe5b60200260200101819052505050505050505080806001019150506100f9565b50915091565b73ffffffffffffffffffffffffffffffffffffffff163190565b604051806060016040528060001515815260200160008152602001606081525090565b803573ffffffffffffffffffffffffffffffffffffffff8116811461028157600080fd5b919050565b600060208284031215610297578081fd5b6102a08261025d565b9392505050565b600060208083850312156102b9578182fd5b823567ffffffffffffffff808211156102d0578384fd5b818501915085601f8301126102e3578384fd5b8135818111156102ef57fe5b6102fc8485830201610506565b81815284810190848601875b848110156103f457813587017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0606081838f03011215610346578a8bfd5b60408051606081018181108b8211171561035c57fe5b8252610369848d0161025d565b8152818401358c82015260608401358a811115610384578d8efd5b8085019450508e603f850112610398578c8dfd5b8b8401358a8111156103a657fe5b6103b68d85601f84011601610506565b93508084528f838287010111156103cb578d8efd5b808386018e86013783018c018d9052908101919091528552509287019290870190600101610308565b50909998505050505050505050565b6000825161041581846020870161052a565b9190910192915050565b90815260200190565b600060408083018584526020828186015281865180845260609350838701915083838202880101838901875b838110156104f6578983037fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa001855281518051151584528681015187850152880151888401889052805188850181905260806104b582828801858c0161052a565b96880196601f919091017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01694909401909301925090850190600101610454565b50909a9950505050505050505050565b60405181810167ffffffffffffffff8111828210171561052257fe5b604052919050565b60005b8381101561054557818101518382015260200161052d565b83811115610554576000848401525b5050505056fea164736f6c6343000706000a'
    );
    const container = new UnitTestContainer().create()
    container.get(Network).setBlock({
        block: {
            blockHash:
                '29045A592007D0C246EF02C2223570DA9522D0CF0F73282C79A1BC8F0BB2C238',
            timeStamp: dayjs('2022-01-01'),
            height: 0,
            coinbase: new Address('5B38Da6a701c568545dCfcB03FcB875f56beddC4'),
            gasLimit: 0xffffffffffff,
            difficulty: new BigNumber('10995000000000000'),
            chainId: 1,
            gasPrice: 0xff,
            baseFee: 1024,
        },
    });

    const evm = container.get(ExposedEvm).boot({
        program: contract,
        context: {
            nonce: 1,
            sender: new Address('0xbe862ad9abfe6f22bcb087716c7d89a26051f74c'),
            gasLimit,
            value: new Wei(new BigNumber(0)),
            receiver: new Address(),
            data: getBufferFromHex(
                '0x1749e1e300000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000009000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000360000000000000000000000000000000000000000000000000000000000000042000000000000000000000000000000000000000000000000000000000000004e000000000000000000000000000000000000000000000000000000000000005a000000000000000000000000000000000000000000000000000000000000006600000000000000000000000000000000000000000000000000000000000000720000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000b47e3cd837ddf8e4c57f05d70ab865de6e193bbb00000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000002458178168000000000000000000000000000000000000000000000000000000000000000900000000000000000000000000000000000000000000000000000000'
            ),
        },
    });
    await container.get(ReplayContractTestUtils).replayFile(evm, 'replay-test-file.json', {});
})()