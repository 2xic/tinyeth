import crypto from 'crypto';
import { ProductionContainer, RlpDecoder, RlpEncoder } from '../dist';

function createRandomObject(count = 0): any {
    if (count >= 3) {
        return Math.floor(10 * Math.random());
    }
    if (Math.random() <= 0.25) {
        return Math.floor(5024 * Math.random());
    } else if (Math.random() <= 0.5) {
        return [
            ...new Array(Math.floor(1024 * Math.random()))
        ].map(() => {
            return createRandomObject(count++);
        })
    } else {
        return `0x${crypto.randomBytes(Math.floor(5024 * Math.random())).toString('hex')}`;
    }
}

const input = createRandomObject();
const encoded = new ProductionContainer().create().get(RlpEncoder).encode({ input })

try {
    new ProductionContainer().create().get(RlpDecoder).decode({ input: encoded })
} catch (err) {
    console.log(JSON.stringify(input, (key, value) => {
        if (typeof value === 'number') {
            return '0x' + value.toString(16)
        }
        return value
    }))
    console.log(encoded);
    throw err;
}
