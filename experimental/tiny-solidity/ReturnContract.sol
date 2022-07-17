pragma solidity ^0.8.0;

/**
// Deployment
608060405234801561001057600080fd5b5060b98061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063c9d3c6a614602d575b600080fd5b60336047565b604051603e9190606a565b60405180910390f35b60006001905090565b600060ff82169050919050565b6064816050565b82525050565b6000602082019050607d6000830184605d565b9291505056fea2646970667358221220ce3640086d2d1849105f59a2dbf5418d2dd11faed45816b1ad75f9792261416c64736f6c634300080f0033

// Deployed
6080604052348015600f57600080fd5b506004361060285760003560e01c8063c9d3c6a614602d575b600080fd5b60336047565b604051603e9190606a565b60405180910390f35b60006001905090565b600060ff82169050919050565b6064816050565b82525050565b6000602082019050607d6000830184605d565b9291505056fea2646970667358221220ce3640086d2d1849105f59a2dbf5418d2dd11faed45816b1ad75f9792261416c64736f6c634300080f0033

// ASM

	PUSH1	80
	PUSH1	40
	MSTORE	
	CALLVALUE	
	DUP1	
	ISZERO	
	PUSH1	0f
	JUMPI	        // Function is not payable, logic to handle it is done here.
	PUSH1	00
	DUP1	
	REVERT	
	JUMPDEST	
	POP	
	PUSH1	04
	CALLDATASIZE	
	LT	
	PUSH1	28      // verify that the call data size is in range
	JUMPI	
	PUSH1	00      // load entire calldata
	CALLDATALOAD	// -> Used to know the function to call
	PUSH1	e0
	SHR	            // move calldata value to correct range
	DUP1	        // 
	PUSH4	c9d3c6a6 // -> The function c9d3c6a6 -> return1
	EQ	
	PUSH1	2d  //      Location to jump for the return the 1
	JUMPI	
	JUMPDEST	
	PUSH1	00
	DUP1	
	REVERT	        // OPS, invalid function.
	JUMPDEST	
	PUSH1	33
	PUSH1	47
	JUMP	
	JUMPDEST	
	PUSH1	40
	MLOAD	
	PUSH1	3e
	SWAP2	
	SWAP1	
	PUSH1	6a
	JUMP	
	JUMPDEST	
	PUSH1	40
	MLOAD	
	DUP1	
	SWAP2	
	SUB	
	SWAP1	
	RETURN	
	JUMPDEST	
	PUSH1	00
	PUSH1	01
	SWAP1	
	POP	
	SWAP1	
	JUMP	
	JUMPDEST	
	PUSH1	00
	PUSH1	ff
	DUP3	
	AND	
	SWAP1	
	POP	
	SWAP2	
	SWAP1	
	POP	
	JUMP	
	JUMPDEST	
	PUSH1	64
	DUP2	
	PUSH1	50
	JUMP	
	JUMPDEST	
	DUP3	
	MSTORE	
	POP	
	POP	
	JUMP	
	JUMPDEST	
	PUSH1	00
	PUSH1	20
	DUP3	
	ADD	
	SWAP1	
	POP	
	PUSH1	7d
	PUSH1	00
	DUP4	
	ADD	
	DUP5	
	PUSH1	5d
	JUMP	
	JUMPDEST	
	SWAP3	
	SWAP2	
	POP	
	POP	
	JUMP	
	INVALID	
	LOG2	
	PUSH5	6970667358
	INVALID	
	SLT	
	SHA3	
	INVALID	
	CALLDATASIZE	
	BLOCKHASH	
	ADDMOD	
	PUSH14	2d1849105f59a2dbf5418d2dd11f
	INVALID	
	INVALID	
	PC	
	AND	
	INVALID	
	INVALID	
    PUSH22	f9792261416c64736f6c634300080f0033
*/

contract ReturnContract {
    function return1() public pure returns (uint8) {
        return 1;
    }
}
