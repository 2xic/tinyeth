/*
Idea for simplifying the way the jump table is constructed.

You don't set a direct index, but it's build when the buffer is constructed.

Basically you set it to a function call, and the input is the buffer index when building.

I think this should make things nice.

Some things to note

function1
    -> function2 

By building function1 first, you know the location to fall through to function2.

It's the length of function1 + 1

Function 2 will handle the revert, and it will just jump to some defined global index.

-------------

So this is actually relevant multiple places, currently I solved this by using the PC instruction, 
but it should be easier to declare an + - offset based on the last PC.

Maybe the most efficient solution is to use the PC instruction, but this should be investigated.
*/
