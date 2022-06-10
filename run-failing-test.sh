while true; do
    node 'node_modules/.bin/jest' '/home/brage/Desktop/tinyeth/src/network/rlpx/CommunicationState.unit.test.ts' -t 'CommunicationState should correctly preform a handshake';
    [ $? -gt 0 ] && break
    sleep 1
done
