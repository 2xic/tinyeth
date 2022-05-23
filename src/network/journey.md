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



