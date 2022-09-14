# tiny solidity compiler
It's a tiny solidity compiler to better match the mental mapping between solidity and the evm opcodes, and also a excuse for me to write a "real" compiler.

## Status
The compiler is very rough around the edges, and does not compile any real contracts yet.

The basic structure is there for making it more serious, and i'm working towards that gradually. 

End goal is to be able to actually compile some real contracts, and have a structure to make it possible to implement the entire solidity language.

I think I will only do a partial implementation with the core keywords, and functionality of solidity.


### Recourses

Never written a serious compiler, and even if this is a tiny compiler, we want to be serious.

Some good recourses to have in mind

- https://www.cs.cmu.edu/~aplatzer/course/Compilers/waitegoos.pdf
- https://www.youtube.com/watch?v=eIA4nN9KxXk&list=PLOech0kWpH8-njQpmSNGSiQBPUvl8v3IM
    - Watch a few videos from norswap, quite good.
- https://norasandler.com/2018/04/10/Write-a-Compiler-8.html
  - This was some nice blogposts for writing a c compiler.
  - 