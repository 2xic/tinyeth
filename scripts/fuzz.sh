#jsfuzz ./fuzz-rlp.js
while true; do
    ts-node custom-fuzz-rlp.ts 
    [ $? -gt 0 ] && break
    sleep 1
done
