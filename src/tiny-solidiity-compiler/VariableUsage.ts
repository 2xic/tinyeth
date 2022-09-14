/*
Just some raw thoughts on how to do the variable tracking.

Currently we use storage to store variables. This is expensive, and in general just an bad idea.

Another way of doing this is to always recall the method to fetch the variable.
- I.e call the same function again and again to setup the stack.
- And if you are able to in some smart way construct the stack to sue DUP etc.
 

I mean, you just have to call the method once, and you know the stack layout, and then just run DUP 
opcodes as necessary. The only case you need to recall the method is when you don't know the stack layout.

When do you now know the stack layout ?
At the initial contract call (duh).

I other cases, you should know the stack layout based on previous calls by looking at the call graph.

-----------------------------------------------------

So the way I envision things is probably a graph.

Seems like people usually use symbols tables https://en.wikipedia.org/wiki/Symbol_table

----

So you can initialize the call, and push all arguments onto the stack (if they are used - (optimization))
Then you can just refer to the stack position further down the usage.

---


I mean is this the crucial part missing ? We could solve a lot more problems
before doing the symbols table, I think.

----

In general
- all global variables should go to storage
- all local variables should go to the stack
*/
