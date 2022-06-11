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

--- Continued

Now it's time to preforme the rest of the handshake
-  https://github.com/ethereum/devp2p/blob/master/rlpx.md#initial-handshake
    - We send a auth message
    - We get an ack message
    - We get an hello message   
        - We need to implement framing https://github.com/ethereum/devp2p/blob/master/rlpx.md#framing

Goal for tomorrow, implement framing :)


#### Day x + 4
Working on framing today, and it is a bit more straight forward, or maybe it's me becoming better at reading the docs and navigating.

Okay, so I thought I had been able to implement the core idea, but having some problems with the validation of the header.
I have written some tests for the MAC part, so I think this should be good.

So to be able to replay packets, and investigate further I have written a MockSocket that replays the packets. I should also create a mock nonce fetcher to make it easier to test for the nonces. 

What I also could do is make some of the components more testable like the frame construction.

There is actually quite good test case here https://github.com/ethereum/pydevp2p/blob/b09b8a06a152f34cd7dc7950b14b04e3f01511af/devp2p/tests/test_go_handshake.py which I could reuse. 

Okay, so I setup the random nonce generator to be replayable now.

- I guess the logical thing is to make sure all logic 

Okay, I actually found the bug, and fixed it. We now are almost able to complete the handshake (yay). 

Test it a bit, and need to implement the ping / pong part, and the handling of the other packets. Before that however, I think we should implement a container setup to make testing easier, and the logic of the app.

----
Setting up container + cleaning up the code
- All encoder / decoders should be split into own code files
- KeyPair should be globally set in the container ? 

### Day x + 5
Today most of the day has been spent cleaning up a lot of the code, and moving to use containers more.

The nice thing with containers is that it allows better testing, and cleans up the general interface of the code.


### Day x + 6
Did not code on this last few days.

Back again today. Found out I had confused part of the message codes between https://github.com/ethereum/devp2p/blob/master/discv4.md#ping-packet-0x01  and https://github.com/ethereum/devp2p/blob/master/rlpx.md . Fun !

Anyways, continued work on trying to get message communication to work.

Having some problems with the decoding after sending the hello message. I send a ping packet, and after that the frame communication stops working.

After a bit of testing I think the problem is the order the message appeared in, can easily test this by switching up the way the peer handles new messages. So I will try to make it into a message queue. 

### Day x + 7
Decided that best way to debug the problems is to be able to rerun all the logic deterministically. Adding a custom interactor to generate deterministic random bytes, and will be using that, and rerun the packets and debug to find the bug.

### Day x + 8
So to solve the last few problems, the easiest way is to make the code in a way that it can verify itself.

So the plan is to make the eip8 communication happen in memory between two "peers", and we should then easily see if there are any obvious problems in the communication state. 

### Day x + 9
I think RLPX should be more or less implemented now.

Will implement logic for the wire protocol tomorrow, and then I think things should be "nice". 

### Day x + 10
Set up the scaffolding for the wire protocol. Most of the packet code was already written, but have to setup the code for sending the udp datagrams. To handle this we updated to use node 18, and use the built in logic.

Tried to send a ping packet to a bootstrap node, but looks like there is some logic we are missing.

### Day x + 11
Got the wire protocol to somewhat work :) So I have sent a few pings, and got response back. 

Will make FindNode command work, and then we should not be far from being able to fetch a block through the p2p :') 

### Day x + 12
Been around a week since I worked on this project - had to do some reprioritization of stuff (being an adult is not easy !!!! ). Jokes aside.

Fixed some issues with the wire protocol, mainly a small confusion on my side that I thought I did not have to reply with a pong message if I initiated with a ping (silly bug!!!).

Now I'm able to connect with the wire protocol, and find close neighbors. This is nice, because it makes it a lot easier to test RLPx for instance.
-> Because I can find nodes more easily :D








