## Patricia Tree

Been so long since I looked at this, so I will take some notes this time, and rewrite the code to a "nice" implementation.


## Compressed readings from the eth-wiki + arxiv
https://github.com/ethereum/wiki/wiki/Patricia-Tree/eb67aed3dd751a25aa94704de22f6bd8850d345b

https://arxiv.org/pdf/2108.05513.pdf

### merkle patricia tree are cool
- they are fast o(log(n))
- deterministic !
- 

### basics of the trie
Okay, so we all know a radix tree right ? 
            m
        /       \
    ax              ix
^ it's just a compressed suffix tree basically.

It can be represented as an array!

[
    *pointer to next node,
    [key, value],

    value <- terminal value at the node
]

So you do quires using a key, and encode it, and then go down that tree.

#### so what about this db ? 
The database stores the root hash of the trie!

### putting it together

Using the same example as in the blog, we want to look up "dog" in the trie.

We run the encode function on dog -> it returns 6|4 6|f 6|7

-> we first look up the BLANK_ROOT hash for the trie to retrieve the root trie from the database
->get the key at index 6 -> look up that hash key in the database
->new trie -> look up value 4 in the array -> get key -> go to database
...
-> you look up value 7 in the array, and get the value (not the key!)

Traveling the tries requirers db lookups.

-----

### what are those keys and values ?  
-> key = sha3(rlp(value))
-> value -> value of node

### node types
- NULL
  - Empty string
- Branch
  - 17-item node [v0,  ...., v15, value]
    - Used then the values start to differ in the path
    - 
- Leaf
  - [path, value]
    - Node terminator
- extension
  - [prefix + path, key]
    - Used to compress common paths
    - 


-----

### Reading from 
https://medium.com/@chiqing/merkle-patricia-trie-explained-ae3ac6a7e123

This was pretty good actually, it has visualized the key value updates. Nice.

