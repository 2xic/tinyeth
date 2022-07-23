pragma solidity ^0.8.0;

/**
// Deployment
608060405234801561001057600080fd5b5060008060006101000a81548160ff021916908360ff16021790555060f08061003a6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80638d52d75b146037578063
ef5fb05b146051575b600080fd5b603d6059565b6040516048919060a1565b60405180910390f35b6057606a565b005b60008054906101000a900460ff1681565b60016000806101000a81548160ff021916908360ff160217905550565b600060ff82169050919050565b609b816087565b82525050565b600060208201905060b460008301846094565b9291505056fea26469706673582212208550cf09d3360807e9959aecc8a36b797a18075d0c9e7ec10cc9c98e61ee27cc64736f6c634300080f0033

// Deployed
6080604052348015600f57600080fd5b506004361060325760003560e01c8063
8d52d75b146037578063
ef5fb05b146051575b600080fd5b603d6059565b6040516048919060a1565b60405180910390f35b6057606a565b005b60008054906101000a900460ff1681565b60016000806101000a81548160ff021916908360ff160217905550565b600060ff82169050919050565b609b816087565b82525050565b600060208201905060b460008301846094565b9291505056fea26469706673582212208550cf09d3360807e9959aecc8a36b797a18075d0c9e7ec10cc9c98e61ee27cc64736f6c634300080f003300000000000000000000000000000000
*/

contract SetterGetterContract {
    uint8 public saidHello;

    constructor() {
        saidHello = 0;
    }

    function sayHello() public {
        saidHello = 1;
    }
}