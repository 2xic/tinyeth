import { isValueBetween } from './isBetween';
import {
	DecodingResults,
	EncodingResults,
	TypeEncoderDecoder,
} from './TypeEncoderDecoder';

export class IsNonValueEncoderDecoder implements TypeEncoderDecoder<any> {
	public encode({ input }: { input: any }): EncodingResults {
		throw new Error('Method not implemented');
	}

	public decode({
		input,
		fromIndex,
	}: {
    input: Buffer;
    fromIndex: number;
  }): DecodingResults {
		const decoding = '';

		return {
			newIndex: fromIndex + 1,
			decoding,
		};
	}

	public isDecodeType({ input }: { input: number }): boolean {
		return input == 0x80;
	}

	public isEncodeType({ input }: { input: unknown }): boolean {
		throw new Error('Method not implemented.');
	}
}
