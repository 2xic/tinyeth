import 'dotenv/config';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

export class Alchemy {
    private blockNumber = 'latest';

    public async getContractCode({ address }: { address: string }) {
        const textResults = await this.sendRequestsIfNotCached<{
            result: string;
        }>({
            method: 'eth_getCode',
            params: [address, this.blockNumber]
        })

        return textResults;
    }


    private async sendRequestsIfNotCached<Response>({
        method,
        params
    }: {
        method: string;
        params: string[]
    }): Promise<Response> {
        const endpoint = this.endpoint;
        const body = JSON.stringify(
            { "id": 1, "jsonrpc": "2.0", "params": params, "method": method }
        );
        const hash = crypto.createHash('md5').update(body).digest('hex');
        const cachePath = path.join(__dirname, 'cache', `${hash}.txt`)
        const exists = await new Promise((resolve) => fs.exists(cachePath, resolve));
        if (exists) {
            return JSON.parse(fs.readFileSync(cachePath).toString('utf-8')) as unknown as Response;
        } else {
            console.log('Sending requests...')
            const results = await fetch(endpoint, {
                method: 'POST',
                body
            })
            const textResults = await results.text();
            fs.writeFileSync(cachePath, textResults);
            return JSON.parse(textResults) as unknown as Response;
        }
    }

    private get endpoint() {
        return `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
    }
}
