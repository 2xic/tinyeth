/**
 * 
{
  address: '146.190.233.190',
  port: 30300,
  publicKey: '70147261807397c434f2351f83ae9be6b33c39e8fab47647692b500e4999f3d3df74a6ee6056e47de2faf04030e3446240ae27d223862ebd5df323d3cede2ee5'
}
Connected
Ready
[Sending AUTH8 message]
nonce used : bb0c542897a94e1f3aac9cbdcb7510cb53423ea1fecd69fc3f1f90cedca1e34e
Got data of length 364
[Received ACK message]
016a040f1cd42ee07d26d37757a0e0e1d79af63f2ea3d6a47b4441467fe0463905b3015ae9c99a2159893a22361189101bdd45bf8ca6ea42bbadaf902372869a6a402e544e7a124912493453e3ed9c02776c40415680b81a9ee8e915079eb714a339453bd8bb346d8a6c90c7a355c72c409192074aa956f370ffdf9f5f63293f35386e2af276096de5c98c4bf0d5fce03a1bc86ccda8910d1c2a9767172b77d0e2befb3976641a035ee618ce6aa9e6c79d9ee4384153cdf6a97f17b211c440aaf6c027b1b4183297b483058f8fdff512ffd0c5effe6f45b1f1065298376971c37c9965af8a4f45fcdbd2593a35f81b634a4446c7391f64218b3628c0412eb8ca33f41bc5fb490fd6aac90f437e6e1c924a82bcfdc7892d9a0303a64bb0a17a0a5fb69f8a09b2716a022144d31593cc136fd1bd5c507ba3458e631df43e6c25657569832371c7c7ed86cca1a53fc46e489be574142331a01f186eeefdc06ad029e8ba132b011b5a1449703203
Setup frame communication
[Sending an hello message]
Got data of length 256
[Received a packet?]
Error: Bad value, fa65585fdfd17da8a5cbc98c07252c46 != de92404fc6843dbba3f6de364a0aee86
    at assertEqual (/home/brage/Desktop/tinyeth/dist/utils/enforce.js:16:19)
    at DecodeFrame.parseHeader (/home/brage/Desktop/tinyeth/dist/network/auth/frameing/DecodeFrame.js:40:35)
    at FrameCommunication.decode (/home/brage/Desktop/tinyeth/dist/network/auth/frameing/FrameCommunication.js:75:39)
    at DebugCommunicationState.<anonymous> (/home/brage/Desktop/tinyeth/dist/network/rlpx/CommunicationState.js:252:56)
    at step (/home/brage/Desktop/tinyeth/dist/network/rlpx/CommunicationState.js:42:23)
    at Object.next (/home/brage/Desktop/tinyeth/dist/network/rlpx/CommunicationState.js:23:53)
    at /home/brage/Desktop/tinyeth/dist/network/rlpx/CommunicationState.js:17:71
    at new Promise (<anonymous>)
    at __awaiter (/home/brage/Desktop/tinyeth/dist/network/rlpx/CommunicationState.js:13:12)
    at DebugCommunicationState.CommunicationState.parsePacket (/home/brage/Desktop/tinyeth/dist/network/rlpx/CommunicationState.js:245:16)
Error
Error: read ECONNRESET
    at TCP.onStreamRead (node:internal/stream_base_commons:217:20) {
  errno: -104,
  code: 'ECONNRESET',
  syscall: 'read'
}
Connection closed
^CExiting 2
 */
import fs from 'fs';
import { parse } from 'buffer-json';

import { ProductionContainer, DebugCommunicationState, Communication, LocalStateChange } from '../dist';
import { CommunicationState } from '../dist/network/rlpx/CommunicationState';


(async () => {
    const container = new ProductionContainer()
        .create({
            privateKey:
                '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
            ephemeralPrivateKey:
                '0a04fa0107c51d2b9fa4504e220537f1a3aaf287cfcd5a66b8c2c8272fd8029a',
            loggingEnabled: true,
        })
    const node = container.get(CommunicationState) as DebugCommunicationState;

    const state = parse(fs.readFileSync('dump.json').toString('ascii'));
    const remotePublicKey: Buffer = state.find((item: Communication | LocalStateChange) => {
        return 'key' in item ? item.key === '_remotePublicKey' : false;
    }).value;
    const authState: { header: any; authMessage: Buffer } = state.find((item: Communication | LocalStateChange) => {
        return 'key' in item ? item.key === 'createAuthMessageHeader' : false;
    }).value;
    node.setRemotePublicKey({
        publicKey: remotePublicKey.toString('hex')
    })
    node.setSenderNonceState({
        header: authState.header,
        authMessage: authState.authMessage
    });
    const messages: Communication[] = state.filter((item: Communication | LocalStateChange) => 'direction' in item ? true : false)
    for (const message of messages) {
        console.log('Replaying message')
        console.log(message);
        if (message.direction == 'from') {
            await node.parseMessage(message.message, async (message) => {
                console.log(message)
            })
        } else {
            throw new Error('not implemented')
        }
    }
})();

