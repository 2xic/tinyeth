# Trying to auth tinyeth and geth

So make it easier for me to know the state of things I guess I should write a notebook. Been working on the networking stuff on and off for a few weeks, so we are starting on day x, and tomorrow will be day x + 1 :).

### Day x
I have written a basic node server that listens on port 3000, and able to get geth to communicate with the node using the addNode command in the geht console.

Challenge now is that i'm not able to decrypt the message. Looks the like logic for doing the key exchange is not the same...

Will investigate this further tomorrow.


### Day x + 1
Added test to verify echd works based on two KeyPair() objects. 

Looked at https://crypto.stackexchange.com/a/57727 , maybe it's just an implementation difference.

Okay, I took a new look at the test vectors and I think when I originally looked at them I forgot to remove the two first bytes. Therefore the test always failed, but now I know better. Since i'm here given the keys I should be able to decrypt the message, but I keep getting the "Incorrect MAC" error.
I also tried the ecies-parity, and eth-ecies. None of them helped.

I assume the problem is somewhere inside ecies, so I guess I should look at how other libraries have solved it tomorrow, and look at how ecies work in more detail..

#### Day x + 2
Did not work on this the last few days, but back at it today.

So what we know is that something is wrong when we try to decrypt the message. The message is supposed to be encrypted based on the recipient public key ( ref . https://github.com/ethereum/EIPs/blob/master/EIPS/eip-8.md )

So I tried to get the test vectors to work, and also read through the geth code for this ( https://github.com/ethereum/go-ethereum/blob/7194c847b6e7f545f2aad57d8eae0a046e08d7a4/crypto/ecies/ecies.go#L214 )

I also tested some with pyecies, but it has the same problem as here. Not sure why. 

Tested with vaporyjs-devp2p, and they do not accept the packet either. Looks like they are doing some modifications. So I guess my plan for tomorrow is to dissemble how they do it to understand what is wrong. I think it's just a problem with how the shared secret is constructed.

#### Day x + 3
Was able to replicate the test with vaporjs-devpp2p, looks like the problem is the construction of the echdX key.

Been able to implement the test vectors, progress is looking good now.




