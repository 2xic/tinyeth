import BigNumber from 'bignumber.js';
import { RlpEncoder } from './RlpEncoder';

describe('RlpEncoder', () => {
	it('should correctly encode booleans', () => {
		expect(
			new RlpEncoder().encode({
				input: true,
			})
		).toBe('0x01');

		expect(
			new RlpEncoder().encode({
				input: false,
			})
		).toBe('0x80');
	});

	it('should correctly encode falsy values', () => {
		expect(
			new RlpEncoder().encode({
				input: [],
			})
		).toBe('0xc0');

		expect(
			new RlpEncoder().encode({
				input: '',
			})
		).toBe('0x80');

		expect(
			new RlpEncoder().encode({
				input: 0,
			})
		).toBe('0x80');
	});

	it('should correctly encode numbers', () => {
		expect(
			new RlpEncoder().encode({
				input: 127,
			})
		).toBe('0x7f');

		expect(
			new RlpEncoder().encode({
				input: 128,
			})
		).toBe('0x8180');

		expect(
			new RlpEncoder().encode({
				input: 256,
			})
		).toBe('0x820100');

		expect(
			new RlpEncoder().encode({
				input: 1024,
			})
		).toBe('0x820400');

		expect(
			new RlpEncoder().encode({
				input: 0xffffff,
			})
		).toBe('0x83ffffff');

		expect(
			new RlpEncoder().encode({
				input: 0xffffffff,
			})
		).toBe('0x84ffffffff');

		expect(
			new RlpEncoder().encode({
				input: 0xffffffff,
			})
		).toBe('0x84ffffffff');

		expect(
			new RlpEncoder().encode({
				input: new BigNumber('0xFFFFFFFFFFFFFF'),
			})
		).toBe('0x87ffffffffffffff');
	});

	it('should correctly encoded strings', () => {
		expect(
			new RlpEncoder().encode({
				input: 'dog',
			})
		).toBe('0x83646f67');

		expect(
			new RlpEncoder().encode({
				input: 'hello world',
			})
		).toBe('0x8b68656c6c6f20776f726c64');

		expect(
			new RlpEncoder().encode({
				input: 'Lorem ipsum dolor sit amet, consectetur adipisicing eli',
			})
		).toBe(
			'0xB74C6F72656D20697073756D20646F6C6F722073697420616D65742C20636F6E7365637465747572206164697069736963696E6720656C69'.toLowerCase()
		);

		expect(
			new RlpEncoder().encode({
				input: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit',
			})
		).toBe(
			'0xB8384C6F72656D20697073756D20646F6C6F722073697420616D65742C20636F6E7365637465747572206164697069736963696E6720656C6974'.toLowerCase()
		);
	});

	it('should correctly encode a list of words', () => {
		expect(
			new RlpEncoder().encode({
				input: ['hello', 'world'],
			})
		).toBe('0xcc8568656c6c6f85776f726c64');
	});

	it('should correctly encode a long list', () => {
		const aEncoded = [...new Array(1024)].map(() => '61').join('');
		expect(
			new RlpEncoder().encode({
				input: [...new Array(1024)].map(() => 'a').join(''),
			})
		).toBe('0xb90400' + aEncoded);

		expect(
			new RlpEncoder().encode({
				input: [
					'aaa',
					'bbb',
					'ccc',
					'ddd',
					'eee',
					'fff',
					'ggg',
					'hhh',
					'iii',
					'jjj',
					'kkk',
					'lll',
					'mmm',
					'nnn',
					'ooo',
				],
			})
		).toBe(
			'0xF83C836161618362626283636363836464648365656583666666836767678368686883696969836A6A6A836B6B6B836C6C6C836D6D6D836E6E6E836F6F6F'.toLowerCase()
		);
	});

	it('should correctly encode a byte array', () => {
		expect(
			new RlpEncoder().encode({
				input: new Uint8Array([0x80]),
			})
		).toBe('0x8180');

		expect(
			new RlpEncoder().encode({
				input: new Uint8Array([0xff]),
			})
		).toBe('0x81ff');

		expect(
			new RlpEncoder().encode({
				input: new Uint8Array([1, 2, 3]),
			})
		).toBe('0x83010203');
	});

	it('should correctly encode a array inside a array', () => {
		expect(
			new RlpEncoder().encode({
				input: [[], [[]], [[], [[]]]],
			})
		).toBe('0xC7C0C1C0C3C0C1C0'.toLowerCase());
	});

	it('should correctly encode numbers inside a array', () => {
		expect(
			new RlpEncoder().encode({
				input: [1, 2, 3],
			})
		).toBe('0xC3010203'.toLowerCase());
	});
});
