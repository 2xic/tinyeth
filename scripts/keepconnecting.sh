#jsfuzz ./fuzz-rlp.js
run=0
while    true; do
    echo $run
    timeout 10 ts-node connectToPeerRlpx.ts
    sleep 1
    run=$(expr $run + 1)
done
