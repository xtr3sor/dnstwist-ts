/* eslint-disable eqeqeq */
/* 
    dnstwist-ts | a DNSTwist Typescript Port
    Based on https://github.com/elceef/dnstwist

    tr3sor.win
*/

// Custom punycode implementation to reduce dependencies
import { parse, getPublicSuffix } from 'tldts';
import tlds from 'tlds';
import dictionaryEN from './dictionaryEN.json';

// Custom punycode implementation
class Punycode {
    private static readonly BASE = 36;
    private static readonly TMIN = 1;
    private static readonly TMAX = 26;
    private static readonly SKEW = 38;
    private static readonly DAMP = 700;
    private static readonly INITIAL_BIAS = 72;
    private static readonly INITIAL_N = 128;
    private static readonly DELIMITER = 0x2D; // '-'

    private static adapt(delta: number, numpoints: number, firsttime: boolean): number {
        let k = 0;
        delta = firsttime ? Math.floor(delta / this.DAMP) : Math.floor(delta / 2);
        delta += Math.floor(delta / numpoints);
        for (; delta > Math.floor((this.BASE - this.TMIN) * this.TMAX) / 2; k += this.BASE) {
            delta = Math.floor(delta / (this.BASE - this.TMIN));
        }
        return Math.floor(k + (this.BASE - this.TMIN + 1) * delta / (delta + this.SKEW));
    }

    private static digitToBasic(digit: number, flag: boolean): number {
        return digit + 22 + 75 * (digit < 26 ? 1 : 0) - ((flag ? 1 : 0) << 5);
    }

    private static basicToDigit(cp: number): number {
        if (cp - 48 < 10) return cp - 22;
        if (cp - 65 < 26) return cp - 65;
        if (cp - 97 < 26) return cp - 97;
        return this.BASE;
    }

    private static encodeDigit(d: number, flag: boolean): string {
        return String.fromCharCode(this.digitToBasic(d, flag));
    }

    private static decodeDigit(cp: number): number {
        if (cp - 48 < 10) return cp - 48;
        if (cp - 65 < 26) return cp - 65;
        if (cp - 97 < 26) return cp - 97;
        return this.BASE;
    }

    static toASCII(input: string): string {
        const output: string[] = [];
        let n = this.INITIAL_N;
        let delta = 0;
        let bias = this.INITIAL_BIAS;
        let h = 0;
        let b = 0;

        // Copy all basic code points to the output
        for (let i = 0; i < input.length; i++) {
            const c = input.charCodeAt(i);
            if (c < 0x80) {
                output.push(input[i]);
                b++;
            }
        }

        h = b;

        // Append delimiter
        if (b > 0) {
            output.push('-');
        }

        // Main encoding loop
        while (h < input.length) {
            let m = 0x10FFFF;
            for (let i = 0; i < input.length; i++) {
                const c = input.charCodeAt(i);
                if (c >= n && c < m) {
                    m = c;
                }
            }

            delta += (m - n) * (h + 1);
            n = m;

            for (let i = 0; i < input.length; i++) {
                const c = input.charCodeAt(i);
                if (c < n) {
                    delta++;
                } else if (c === n) {
                    let q = delta;
                    for (let k = this.BASE; ; k += this.BASE) {
                        let t = k <= bias ? this.TMIN : k >= bias + this.TMAX ? this.TMAX : k - bias;
                        if (q < t) break;
                        output.push(this.encodeDigit(t + (q - t) % (this.BASE - t), false));
                        q = Math.floor((q - t) / (this.BASE - t));
                    }
                    output.push(this.encodeDigit(q, false));
                    bias = this.adapt(delta, h + 1, h === b);
                    delta = 0;
                    h++;
                }
            }
            delta++;
            n++;
        }

        return output.join('');
    }

    static toUnicode(input: string): string {
        const output: number[] = [];
        let n = this.INITIAL_N;
        let i = 0;
        let bias = this.INITIAL_BIAS;

        // Find the last delimiter
        let lastDelimiter = input.lastIndexOf('-');
        if (lastDelimiter > 0) {
            for (let j = 0; j < lastDelimiter; j++) {
                const c = input.charCodeAt(j);
                if (c >= 0x80) {
                    throw new Error('Invalid input');
                }
                output.push(c);
            }
            i = lastDelimiter + 1;
        }

        // Decode the rest
        while (i < input.length) {
            let oldi = i;
            let w = 1;
            for (let k = this.BASE; ; k += this.BASE) {
                if (i >= input.length) {
                    throw new Error('Invalid input');
                }
                const digit = this.decodeDigit(input.charCodeAt(i++));
                if (digit >= this.BASE) {
                    throw new Error('Invalid input');
                }
                if (digit > Math.floor((0x10FFFF - n) / w)) {
                    throw new Error('Invalid input');
                }
                n += digit * w;
                const t = k <= bias ? this.TMIN : k >= bias + this.TMAX ? this.TMAX : k - bias;
                if (digit < t) break;
                w *= this.BASE - t;
            }
            bias = this.adapt(i - oldi, output.length + 1, oldi === 0);
            if (Math.floor(n / (output.length + 1)) > Math.floor((0x10FFFF - n) / w)) {
                throw new Error('Invalid input');
            }
            output.push(n);
            n++;
        }

        return String.fromCharCode(...output);
    }
}

// Export punycode functions
export const punycode = {
    toASCII: Punycode.toASCII,
    toUnicode: Punycode.toUnicode
};

export function removeDuplicates<T>(inputDomainArray: T[]) {
    return inputDomainArray.filter((value, index) => inputDomainArray.indexOf(value) === index);
}

function fuzzVowels(character: string) {
    let returnCharacters: string[] = [];
    switch (character) {
        case 'a':
            returnCharacters = returnCharacters.concat(['e', 'i', 'o', 'u']);
            break;
        case 'e':
            returnCharacters = returnCharacters.concat(['a', 'i', 'o', 'u']);
            break;
        case 'i':
            returnCharacters = returnCharacters.concat(['a', 'e', 'o', 'u']);
            break;
        case 'o':
            returnCharacters = returnCharacters.concat(['a', 'e', 'i', 'u']);
            break;
        case 'u':
            returnCharacters = returnCharacters.concat(['a', 'e', 'i', 'o']);
            break;
        default:
            returnCharacters = returnCharacters.concat([character]);
            break;
    }
    return returnCharacters;
}

function fuzzGlyphs(character: string) {
    let returnCharacters: string[] = [];
    switch (character) {
        case '0':
            returnCharacters = returnCharacters.concat(['o']);
            break;
        case '1':
            returnCharacters = returnCharacters.concat(['l', 'i']);
            break;
        case '3':
            returnCharacters = returnCharacters.concat(['8']);
            break;
        case '6':
            returnCharacters = returnCharacters.concat(['9']);
            break;
        case '8':
            returnCharacters = returnCharacters.concat(['3']);
            break;
        case '9':
            returnCharacters = returnCharacters.concat(['6']);
            break;
        case 'b':
            returnCharacters = returnCharacters.concat(['d', 'lb']);
            break;
        case 'c':
            returnCharacters = returnCharacters.concat(['e']);
            break;
        case 'd':
            returnCharacters = returnCharacters.concat(['b', 'cl', 'dl']);
            break;
        case 'e':
            returnCharacters = returnCharacters.concat(['c']);
            break;
        case 'g':
            returnCharacters = returnCharacters.concat(['q']);
            break;
        case 'h':
            returnCharacters = returnCharacters.concat(['lh']);
            break;
        case 'i':
            returnCharacters = returnCharacters.concat(['1', 'l']);
            break;
        case 'k':
            returnCharacters = returnCharacters.concat(['lc']);
            break;
        case 'l':
            returnCharacters = returnCharacters.concat(['1', 'i']);
            break;
        case 'm':
            returnCharacters = returnCharacters.concat(['n', 'nn', 'rn', 'rr']);
            break;
        case 'n':
            returnCharacters = returnCharacters.concat(['m', 'r']);
            break;
        case 'o':
            returnCharacters = returnCharacters.concat(['0']);
            break;
        case 'q':
            returnCharacters = returnCharacters.concat(['g']);
            break;
        case 'w':
            returnCharacters = returnCharacters.concat(['vv']);
            break;
        default:
            returnCharacters = returnCharacters.concat([character]);
            break;
    }
    return returnCharacters;
}

function fuzzUnicode(character: string) {
    let returnCharacters: string[] = [];
    switch (character) {
        case 'a':
            returnCharacters = returnCharacters.concat(['а', 'ạ', 'ă', 'ȧ', 'ɑ', 'å', 'ą', 'â', 'ǎ', 'á', 'ə', 'ä', 'ã', 'ā', 'à']);
            break;
        case 'b':
            returnCharacters = returnCharacters.concat(['ь', 'ḃ', 'ḅ', 'ƅ', 'ʙ', 'ḇ', 'ɓ', 'd', 'lb', 'ib', '1b']);
            break;
        case 'c':
            returnCharacters = returnCharacters.concat(['с', 'ç', 'ć', 'ĉ', 'č', 'ċ', 'ç', 'č', 'č', 'ç', 'č', 'ᴄ', 'ċ', 'ç', 'ć', 'ĉ', 'ƈ', 'с', 'e']);
            break;
        case 'd':
            returnCharacters = returnCharacters.concat(['ԁ', 'ď', 'đ', 'đ', 'ď', 'ḍ', 'ḋ', 'ɖ', 'ḏ', 'ɗ', 'ḓ', 'ḑ', 'đ', 'b', 'cl', 'dl', 'di']);
            break;
        case 'e':
            returnCharacters = returnCharacters.concat(['е', 'ê', 'ẹ', 'ę', 'è', 'ḛ', 'ě', 'ɇ', 'ė', 'ĕ', 'é', 'ë', 'ē', 'ȩ']);
            break;
        case 'f':
            returnCharacters = returnCharacters.concat(['ḟ', 'ƒ']);
            break;
        case 'g':
            returnCharacters = returnCharacters.concat(['ԍ', 'ǧ', 'ġ', 'ǵ', 'ğ', 'ɡ', 'ǥ', 'ĝ', 'ģ', 'ɢ']);
            break;
        case 'h':
            returnCharacters = returnCharacters.concat(['һ', 'ȟ', 'ḫ', 'ḩ', 'ḣ', 'ɦ', 'ḥ', 'ḧ', 'ħ', 'ẖ', 'ⱨ', 'ĥ']);
            break;
        case 'i':
            returnCharacters = returnCharacters.concat(['і', 'ɩ', 'ǐ', 'í', 'ɪ', 'ỉ', 'ȋ', 'ɨ', 'ï', 'ī', 'ĩ', 'ị', 'î', 'ı', 'ĭ', 'į', 'ì']);
            break;
        case 'j':
            returnCharacters = returnCharacters.concat(['ј', 'ǰ', 'ĵ', 'ʝ', 'ɉ']);
            break;
        case 'k':
            returnCharacters = returnCharacters.concat(['к', 'ĸ', 'ǩ', 'ⱪ', 'ḵ', 'ķ', 'ᴋ', 'ḳ']);
            break;
        case 'l':
            returnCharacters = returnCharacters.concat(['ӏ', 'ĺ', 'ł', 'ɫ', 'ļ', 'ľ']);
            break;
        case 'm':
            returnCharacters = returnCharacters.concat(['м', 'ᴍ', 'ṁ', 'ḿ', 'ṃ', 'ɱ']);
            break;
        case 'n':
            returnCharacters = returnCharacters.concat(['ņ', 'ǹ', 'ń', 'ň', 'ṅ', 'ṉ', 'ṇ', 'ꞑ', 'ñ', 'ŋ']);
            break;
        case 'o':
            returnCharacters = returnCharacters.concat(['о', 'ö', 'ó', 'ȯ', 'ỏ', 'ô', 'ᴏ', 'ō', 'ò', 'ŏ', 'ơ', 'ő', 'õ', 'ọ', 'ø', '0']);
            break;
        case 'p':
            returnCharacters = returnCharacters.concat(['р', 'ṗ', 'ƿ', 'ƥ', 'ṕ']);
            break;
        case 'q':
            returnCharacters = returnCharacters.concat(['ԛ', 'ʠ']);
            break;
        case 'r':
            returnCharacters = returnCharacters.concat(['ʀ', 'ȓ', 'ɍ', 'ɾ', 'ř', 'ṛ', 'ɽ', 'ȑ', 'ṙ', 'ŗ', 'ŕ', 'ɼ', 'ṟ']);
            break;
        case 's':
            returnCharacters = returnCharacters.concat(['ѕ', 'ṡ', 'ș', 'ŝ', 'ꜱ', 'ʂ', 'š', 'ś', 'ṣ', 'ş']);
            break;
        case 't':
            returnCharacters = returnCharacters.concat(['т', 'ť', 'ƫ', 'ţ', 'ṭ', 'ṫ', 'ț', 'ŧ']);
            break;
        case 'u':
            returnCharacters = returnCharacters.concat(['ᴜ', 'ų', 'ŭ', 'ū', 'ű', 'ǔ', 'ȕ', 'ư', 'ù', 'ů', 'ʉ', 'ú', 'ȗ', 'ü', 'û', 'ũ', 'ụ']);
            break;
        case 'v':
            returnCharacters = returnCharacters.concat(['ѵ', 'ᶌ', 'ṿ', 'ᴠ', 'ⱴ', 'ⱱ', 'ṽ']);
            break;
        case 'w':
            returnCharacters = returnCharacters.concat(['ԝ', 'ᴡ', 'ẇ', 'ẅ', 'ẃ', 'ẘ', 'ẉ', 'ⱳ', 'ŵ', 'ẁ']);
            break;
        case 'x':
            returnCharacters = returnCharacters.concat(['х', 'ẋ', 'ẍ']);
            break;
        case 'y':
            returnCharacters = returnCharacters.concat(['у', 'ŷ', 'ÿ', 'ʏ', 'ẏ', 'ɏ', 'ƴ', 'ȳ', 'ý', 'ỿ', 'ỵ']);
            break;
        case 'z':
            returnCharacters = returnCharacters.concat(['ž', 'ƶ', 'ẓ', 'ẕ', 'ⱬ', 'ᴢ', 'ż', 'ź', 'ʐ']);
            break;
        case '3':
            returnCharacters = returnCharacters.concat(['8']);
            break;
        default:
            returnCharacters = returnCharacters.concat([character]);
            break;
    }
    return returnCharacters;
}

function engineGlyphs(inputDomain: string) {
    const firstNewWords: string[] = [];
    const lastNewWords: string[] = [];
    for (let indexA = 0; indexA < inputDomain.length; indexA++) {
        const newCharacters: string[] = fuzzGlyphs(inputDomain[indexA]);
        for (let indexB = 0; indexB < newCharacters.length; indexB++) {
            firstNewWords.push(`${inputDomain.slice(0, indexA)}${newCharacters[indexB]}${inputDomain.slice(indexA + 1, inputDomain.length)}`);
        }
    }
    for (let indexC = 0; indexC < firstNewWords.length; indexC++) {
        for (let indexD = 0; indexD < firstNewWords[indexC].length; indexD++) {
            const newCharacters: string[] = fuzzGlyphs(firstNewWords[indexC][indexD]);
            for (let indexE = 0; indexE < newCharacters.length; indexE++) {
                if (newCharacters[indexE] != firstNewWords[indexC][indexD]) {
                    lastNewWords.push(`${firstNewWords[indexC].slice(0, indexD)}${newCharacters[indexE]}${firstNewWords[indexC].slice(indexD + 1, firstNewWords[indexC].length)}`);
                }
            }
        }
    }
    return removeDuplicates(firstNewWords.concat(lastNewWords));
}

function engineUnicode(inputDomain: string) {
    const firstNewWords: string[] = [];
    const lastNewWords: string[] = [];
    for (let indexA = 0; indexA < inputDomain.length; indexA++) {
        const newCharacters: string[] = fuzzUnicode(inputDomain[indexA]);
        for (let indexB = 0; indexB < newCharacters.length; indexB++) {
            firstNewWords.push(`${inputDomain.slice(0, indexA)}${newCharacters[indexB]}${inputDomain.slice(indexA + 1, inputDomain.length)}`);
        }
    }
    for (let indexC = 0; indexC < firstNewWords.length; indexC++) {
        for (let indexD = 0; indexD < firstNewWords[indexC].length; indexD++) {
            const newCharacters: string[] = fuzzUnicode(firstNewWords[indexC][indexD]);
            for (let indexE = 0; indexE < newCharacters.length; indexE++) {
                if (newCharacters[indexE] != firstNewWords[indexC][indexD]) {
                    lastNewWords.push(`${firstNewWords[indexC].slice(0, indexD)}${newCharacters[indexE]}${firstNewWords[indexC].slice(indexD + 1, firstNewWords[indexC].length)}`);
                }
            }
        }
    }
    // Convert all variations to punycode
    return removeDuplicates(firstNewWords.concat(lastNewWords)).map(domain => {
        try {
            return punycode.toASCII(domain);
        } catch (e) {
            console.error(`Error converting to punycode: ${domain}`, e);
            return domain;
        }
    });
}

function engineOmission(inputDomain: string) {
    const returnValue: string[] = [];
    for (let index = 0; index < inputDomain.length; index++) {
        const omissionWord: string = inputDomain.replace(inputDomain[index], '');
        returnValue.push(`${omissionWord}`);
    }
    return returnValue;
}

function engineDuplication(inputDomain: string) {
    const returnValue: string[] = [];
    for (let index = 0; index < inputDomain.length; index++) {
        const duplicationWord = inputDomain.replace(inputDomain[index], inputDomain[index] + inputDomain[index]);
        returnValue.push(`${duplicationWord}`);
    }
    return returnValue;
}

function engineAddition(inputDomain: string) {
    const returnValue: string[] = [];
    const additionCharacters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    for (let indexA = 1; indexA < inputDomain.length; indexA++) {
        for (let indexB = 0; indexB < additionCharacters.length; indexB++) {
            returnValue.push(`${inputDomain.slice(0, indexA)}${additionCharacters[indexB]}${inputDomain.slice(indexA, inputDomain.length)}`);
        }
    }
    return returnValue;
}

function engineReplacement(inputDomain: string) {
    const returnValue: string[] = [];
    const additionCharacters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    for (let indexA = 0; indexA < inputDomain.length; indexA++) {
        for (let indexB = 0; indexB < additionCharacters.length; indexB++) {
            returnValue.push(`${inputDomain.slice(0, indexA)}${additionCharacters[indexB]}${inputDomain.slice(indexA, inputDomain.length)}`);
        }
    }
    return returnValue;
}

function engineBitsquatting(inputDomain: string) {
    const returnValue: string[] = [];
    const mask: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
    for (let indexA = 0; indexA < inputDomain.length; indexA++) {
        for (let indexB = 0; indexB < mask.length; indexB++) {
            const bitShiftedPlus = String.fromCharCode(inputDomain[indexA].charCodeAt(0) + mask[indexB]);
            const bitShiftedMinus = String.fromCharCode(inputDomain[indexA].charCodeAt(0) - mask[indexB]);
            if (bitShiftedPlus.match(/[a-z0–9-]+/g)) {
                returnValue.push(`${inputDomain.slice(0, indexA)}${bitShiftedPlus}${inputDomain.slice(indexA, inputDomain.length)}`);
            }
            if (bitShiftedMinus.match(/[a-z0–9-]+/g)) {
                returnValue.push(`${inputDomain.slice(0, indexA)}${bitShiftedMinus}${inputDomain.slice(indexA, inputDomain.length)}`);
            }
        }
    }
    return returnValue;
}

function engineHyphenation(inputDomain: string) {
    const returnValue: string[] = [];
    for (let indexA = 1; indexA < inputDomain.length; indexA++) {
        returnValue.push(`${inputDomain.slice(0, indexA)}-${inputDomain.slice(indexA, inputDomain.length)}`);
    }
    return returnValue as string[];
}

function engineSubdomain(inputDomain: string) {
    const returnValue: string[] = [];
    for (let indexA = 1; indexA < inputDomain.length; indexA++) {
        returnValue.push(`${inputDomain.slice(0, indexA)}.${inputDomain.slice(indexA, inputDomain.length)}`);
    }
    return returnValue;
}

function engineVowelswap(inputDomain: string) {
    const firstNewWords: string[] = [];
    const lastNewWords: string[] = [];
    for (let indexA = 0; indexA < inputDomain.length; indexA++) {
        const newCharacters: string[] = fuzzVowels(inputDomain[indexA]);
        for (let indexB = 0; indexB < newCharacters.length; indexB++) {
            firstNewWords.push(`${inputDomain.slice(0, indexA)}${newCharacters[indexB]}${inputDomain.slice(indexA + 1, inputDomain.length)}`);
        }
    }
    for (let indexC = 0; indexC < firstNewWords.length; indexC++) {
        for (let indexD = 0; indexD < firstNewWords[indexC].length; indexD++) {
            const newCharacters: string[] = fuzzVowels(firstNewWords[indexC][indexD]);
            for (let indexE = 0; indexE < newCharacters.length; indexE++) {
                if (newCharacters[indexE] != firstNewWords[indexC][indexD]) {
                    lastNewWords.push(`${firstNewWords[indexC].slice(0, indexD)}${newCharacters[indexE]}${firstNewWords[indexC].slice(indexD + 1, firstNewWords[indexC].length)}`);
                }
            }
        }
    }
    return removeDuplicates(firstNewWords.concat(lastNewWords));
}

function enginePositionswap(inputDomain: string) {
    const returnValue: string[] = [];
    for (let stage = 0; stage < 2; stage++) {
        for (let indexA = 0; indexA < inputDomain.length; indexA++) {
            for (let indexB = 0; indexB < inputDomain.length; indexB++) {
                const generatedWord: string = `${inputDomain.slice(0, indexA)}${inputDomain[indexB]}${inputDomain.slice(indexA + stage, inputDomain.length)}`;
                if (generatedWord !== inputDomain) {
                    returnValue.push(`${generatedWord}`);
                }
            }
        }
    }
    return returnValue;
}


// Dictionary interface
export interface Dictionary {
    words?: string[];
    [key: string]: string[] | undefined;
}

// Default dictionary
const defaultDictionary: Dictionary = dictionaryEN;

function engineDictionary(baseDomain: string, inputTld: string, customDictionary?: Dictionary) {
    const returnValue: string[] = [];
    const dict = customDictionary || defaultDictionary;

    console.log(`[dnstwist] Dictionary: ${baseDomain} | TLD: ${inputTld}`);

    // Process words
    if (dict.words) {
        for (let index = 0; index < dict.words.length; index++) {
            // Generate variations with TLD
            returnValue.push(`${dict.words[index]}${baseDomain}.${inputTld}`);
            returnValue.push(`${baseDomain}${dict.words[index]}.${inputTld}`);
            returnValue.push(`${dict.words[index]}-${baseDomain}.${inputTld}`);
            returnValue.push(`${baseDomain}-${dict.words[index]}.${inputTld}`);
        }
    }

    // Process any other custom categories
    Object.keys(dict).forEach(category => {
        if (category !== 'words' && dict[category]) {
            const words = dict[category]!;
            for (let index = 0; index < words.length; index++) {
                returnValue.push(`${words[index]}${baseDomain}.${inputTld}`);
                returnValue.push(`${baseDomain}${words[index]}.${inputTld}`);
                returnValue.push(`${words[index]}-${baseDomain}.${inputTld}`);
                returnValue.push(`${baseDomain}-${words[index]}.${inputTld}`);
            }
        }
    });

    return returnValue;
}

interface NumberMap {
    [key: string]: string;
}

function engineNumberToLetter(inputDomain: string) {
    const returnValue: string[] = [];
    const numberMap: NumberMap = {
        '0': 'o',
        '1': 'l',
        '2': 'z',
        '3': 'e',
        '4': 'a',
        '5': 's',
        '6': 'b',
        '7': 't',
        '8': 'b',
        '9': 'g'
    };
    for (let i = 0; i < inputDomain.length; i++) {
        const char = inputDomain[i];
        if (char in numberMap) {
            returnValue.push(
                `${inputDomain.slice(0, i)}${numberMap[char]}${inputDomain.slice(i + 1)}`
            );
        }
    }
    return returnValue;
}

interface HomoglyphMap {
    [key: string]: string[];
}

function engineHomoglyphs(inputDomain: string) {
    const returnValue: string[] = [];
    const homoglyphMap: HomoglyphMap = {
        'a': ['α', 'а', 'ɑ'],
        'e': ['е', 'ē', 'ė', 'ę'],
        'i': ['і', 'ї', 'ı'],
        'o': ['о', 'ο', 'օ'],
        'p': ['р', 'ρ'],
        'c': ['с', 'ϲ'],
        's': ['ѕ', 'ѕ'],
        'y': ['у', 'ү', 'ʏ']
    };
    for (let i = 0; i < inputDomain.length; i++) {
        const char = inputDomain[i].toLowerCase();
        if (char in homoglyphMap) {
            for (const replacement of homoglyphMap[char]) {
                const variation = `${inputDomain.slice(0, i)}${replacement}${inputDomain.slice(i + 1)}`;
                try {
                    returnValue.push(punycode.toASCII(variation));
                } catch (e) {
                    console.error(`Error converting to punycode: ${variation}`, e);
                }
            }
        }
    }
    return returnValue;
}

function engineCommonMisspellings(inputDomain: string) {
    const returnValue: string[] = [];
    const commonMisspellings = {
        'ei': 'ie',
        'ie': 'ei',
        'th': 't',
        'nn': 'n',
        'mm': 'm',
        'cc': 'c',
        'll': 'l'
    };
    for (const [pattern, replacement] of Object.entries(commonMisspellings)) {
        if (inputDomain.includes(pattern)) {
            returnValue.push(inputDomain.replace(pattern, replacement));
        }
    }
    return returnValue;
}

function engineTldFusion(domain: string, originalTld: string): string[] {
    const results: string[] = [];
    const originalDomain = `${domain}.${originalTld}`;

    // Use a curated list of common TLDs for better performance and relevance
    const commonTlds = [
        'com', 'net', 'org', 'info', 'biz', 'co', 'io', 'me', 'us', 'uk',
        'ca', 'au', 'de', 'fr', 'it', 'es', 'nl', 'se', 'no', 'dk',
        'fi', 'pl', 'cz', 'hu', 'ro', 'bg', 'hr', 'si', 'sk', 'lt',
        'lv', 'ee', 'ie', 'pt', 'gr', 'cy', 'mt', 'lu', 'be', 'at',
        'ch', 'li', 'is', 'jp', 'cn', 'kr', 'in', 'br', 'mx', 'ar',
        'cl', 'pe', 've', 'ec', 'uy', 'py', 'bo', 'gy', 'sr', 'tv',
        'ws', 'ki', 'nr', 'fm', 'mh', 'pw', 'mp', 'gu', 'as', 'vi',
        'pr', 'do', 'ht', 'cu', 'jm', 'bb', 'tt', 'ag', 'dm', 'lc',
        'vc', 'gd', 'kn', 'ai', 'ms', 'tc', 'vg', 'ky', 'bm', 'bs',
        'bz', 'cr', 'sv', 'gt', 'hn', 'ni', 'pa', 'aw', 'an', 'cw',
        'sx', 'bq', 'bl', 'mf', 'gl', 'fo', 'sj', 'ax', 'ad', 'mc',
        'sm', 'va', 'gi', 'je', 'gg', 'im', 'io', 'ac', 'sh', 'ta',
        'gs', 'hm', 'bv', 'tf', 'aq', 'eh', 'za', 'eg', 'ly', 'tn',
        'dz', 'ma', 'sd', 'ss', 'et', 'er', 'dj', 'so', 'ke', 'ug',
        'tz', 'rw', 'bi', 'mw', 'zm', 'zw', 'bw', 'na', 'sz', 'ls',
        'mg', 'mu', 'sc', 'km', 'mz', 'ao', 'cd', 'cg', 'ga', 'gq',
        'cm', 'cf', 'td', 'ne', 'ng', 'bj', 'tg', 'bf', 'ci', 'gh',
        'lr', 'sl', 'gn', 'gw', 'gm', 'sn', 'ml', 'mr'
    ];

    const filteredTlds = commonTlds.filter((tld: string) => tld !== originalTld);
    for (const tld of filteredTlds) {
        results.push(`${domain}.${tld}`);
    }
    return results;
}

// Keyboard layout for QWERTY keyboard
interface KeyboardLayout {
    [key: string]: string[];
}

const keyboardLayout: KeyboardLayout = {
    'q': ['w', 'a', 's'],
    'w': ['q', 'e', 'a', 's', 'd'],
    'e': ['w', 'r', 's', 'd', 'f'],
    'r': ['e', 't', 'd', 'f', 'g'],
    't': ['r', 'y', 'f', 'g', 'h'],
    'y': ['t', 'u', 'g', 'h', 'j'],
    'u': ['y', 'i', 'h', 'j', 'k'],
    'i': ['u', 'o', 'j', 'k', 'l'],
    'o': ['i', 'p', 'k', 'l'],
    'p': ['o', 'l'],
    'a': ['q', 'w', 's', 'z'],
    's': ['q', 'w', 'e', 'a', 'd', 'z', 'x'],
    'd': ['w', 'e', 'r', 's', 'f', 'x', 'c'],
    'f': ['e', 'r', 't', 'd', 'g', 'c', 'v'],
    'g': ['r', 't', 'y', 'f', 'h', 'v', 'b'],
    'h': ['t', 'y', 'u', 'g', 'j', 'b', 'n'],
    'j': ['y', 'u', 'i', 'h', 'k', 'n', 'm'],
    'k': ['u', 'i', 'o', 'j', 'l', 'm'],
    'l': ['i', 'o', 'p', 'k'],
    'z': ['a', 's', 'x'],
    'x': ['s', 'd', 'z', 'c'],
    'c': ['d', 'f', 'x', 'v'],
    'v': ['f', 'g', 'c', 'b'],
    'b': ['g', 'h', 'v', 'n'],
    'n': ['h', 'j', 'b', 'm'],
    'm': ['j', 'k', 'n']
};

function engineKeyboardShift(inputDomain: string) {
    const returnValue: string[] = [];
    for (let i = 0; i < inputDomain.length; i++) {
        const char = inputDomain[i].toLowerCase();
        if (keyboardLayout[char]) {
            for (const adjacentKey of keyboardLayout[char]) {
                returnValue.push(
                    `${inputDomain.slice(0, i)}${adjacentKey}${inputDomain.slice(i + 1)}`
                );
            }
        }
    }
    return returnValue;
}

function engineLetterRepetition(inputDomain: string) {
    const returnValue: string[] = [];
    // Common letters that people often repeat by mistake
    const commonRepeats = ['s', 't', 'e', 'a', 'o', 'i', 'n', 'r', 'l'];

    for (let i = 0; i < inputDomain.length; i++) {
        const char = inputDomain[i].toLowerCase();
        if (commonRepeats.includes(char)) {
            // Add one repetition
            returnValue.push(
                `${inputDomain.slice(0, i)}${char}${char}${inputDomain.slice(i + 1)}`
            );
            // Add two repetitions (for very common mistakes)
            if (['s', 't'].includes(char)) {
                returnValue.push(
                    `${inputDomain.slice(0, i)}${char}${char}${char}${inputDomain.slice(i + 1)}`
                );
            }
        }
    }
    return returnValue;
}

function engineLetterSwap(inputDomain: string) {
    const returnValue: string[] = [];
    // Common letter pairs that people often swap
    const commonSwaps = ['ie', 'ei', 'th', 'er', 're', 'an', 'na', 'ou', 'uo'];

    for (let i = 0; i < inputDomain.length - 1; i++) {
        const pair = inputDomain.slice(i, i + 2).toLowerCase();
        if (commonSwaps.includes(pair)) {
            returnValue.push(
                `${inputDomain.slice(0, i)}${pair[1]}${pair[0]}${inputDomain.slice(i + 2)}`
            );
        }
    }
    return returnValue;
}

function engineCommonTypo(inputDomain: string) {
    const returnValue: string[] = [];
    // Common typing mistakes
    const commonTypos: { [key: string]: string[] } = {
        'tion': ['shun', 'shion'],
        'ing': ['in', 'inng'],
        'ght': ['gt', 'gth'],
        'ough': ['ow', 'o'],
        'ph': ['f'],
        'ck': ['k', 'c'],
        'qu': ['kw', 'q'],
        'ch': ['sh', 'tch'],
        'th': ['t', 'd'],
        'wh': ['w'],
        'wr': ['r'],
        'kn': ['n'],
        'mb': ['m'],
        'mn': ['m'],
        'ps': ['s'],
        'pt': ['t'],
        'rh': ['r'],
        'sc': ['s'],
        'st': ['s'],
        'sw': ['s'],
        'tw': ['t']
    };

    for (const [pattern, replacements] of Object.entries(commonTypos)) {
        if (inputDomain.toLowerCase().includes(pattern)) {
            for (const replacement of replacements) {
                const variation = inputDomain.toLowerCase().replace(pattern, replacement);
                try {
                    returnValue.push(punycode.toASCII(variation));
                } catch (e) {
                    console.error(`Error converting to punycode: ${variation}`, e);
                }
            }
        }
    }
    return returnValue;
}

export function twistDomain(domain: string, includeTldSwap: boolean = true): string[] {
    const variations = new Set<string>();
    const parsed = parse(domain);
    const baseDomain = parsed.domainWithoutSuffix || domain;
    const originalTld = parsed.publicSuffix || 'com';

    // 1. Vowel Swapping
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    for (let i = 0; i < baseDomain.length; i++) {
        if (vowels.includes(baseDomain[i].toLowerCase())) {
            for (const vowel of vowels) {
                if (vowel !== baseDomain[i].toLowerCase()) {
                    const variation = baseDomain.slice(0, i) + vowel + baseDomain.slice(i + 1);
                    variations.add(`${variation}.${originalTld}`);
                }
            }
        }
    }

    // 2. Character Substitutions
    const substitutions: { [key: string]: string[] } = {
        'a': ['4', 'a'],
        'e': ['3'],
        'i': ['1', 'i'],
        'o': ['0'],
        's': ['5', '6'],
        't': ['7'],
        'g': ['9'],
        'b': ['8']
    };

    for (let i = 0; i < baseDomain.length; i++) {
        const char = baseDomain[i].toLowerCase();
        if (substitutions[char]) {
            for (const sub of substitutions[char]) {
                const variation = baseDomain.slice(0, i) + sub + baseDomain.slice(i + 1);
                variations.add(`${variation}.${originalTld}`);
            }
        }
    }

    // 3. Subdomain Generation
    const subdomains = ['www', 'mail', 'login', 'secure', 'account'];
    for (const subdomain of subdomains) {
        variations.add(`${subdomain}.${baseDomain}.${originalTld}`);
    }

    // 4. Hyphenation
    for (let i = 1; i < baseDomain.length; i++) {
        variations.add(`${baseDomain.slice(0, i)}-${baseDomain.slice(i)}.${originalTld}`);
    }

    // 5. Character Omission
    for (let i = 0; i < baseDomain.length; i++) {
        variations.add(`${baseDomain.slice(0, i) + baseDomain.slice(i + 1)}.${originalTld}`);
    }

    // 6. Character Duplication
    for (let i = 0; i < baseDomain.length; i++) {
        variations.add(`${baseDomain.slice(0, i) + baseDomain[i] + baseDomain[i] + baseDomain.slice(i + 1)}.${originalTld}`);
    }

    // 7. TLD Variations (if requested)
    if (includeTldSwap) {
        const commonTlds = ['com', 'net', 'org', 'io', 'co', 'info', 'biz', 'us', 'uk', 'de', 'fr'];
        for (const newTld of commonTlds) {
            if (newTld !== originalTld) {
                variations.add(`${baseDomain}.${newTld}`);
            }
        }
    }

    return Array.from(variations);
}

// Main function that combines all engines
export function generateDomainVariations(domain: string, options: {
    includeVowelSwap?: boolean;
    includeGlyphs?: boolean;
    includeUnicode?: boolean;
    includeOmission?: boolean;
    includeDuplication?: boolean;
    includeAddition?: boolean;
    includeReplacement?: boolean;
    includeBitsquatting?: boolean;
    includeHyphenation?: boolean;
    includeSubdomain?: boolean;
    includePositionSwap?: boolean;
    includeDictionary?: boolean;
    includeNumberToLetter?: boolean;
    includeHomoglyphs?: boolean;
    includeCommonMisspellings?: boolean;
    includeTldFusion?: boolean;
    includeKeyboardShift?: boolean;
    includeLetterRepetition?: boolean;
    includeLetterSwap?: boolean;
    includeCommonTypo?: boolean;
    customDictionary?: Dictionary;
} = {}): string[] {
    const variations = new Set<string>();
    const parsed = parse(domain);
    const baseDomain = parsed.domainWithoutSuffix || domain;
    const originalTld = parsed.publicSuffix || 'com';

    // Default to include all engines if no options specified
    const {
        includeVowelSwap = true,
        includeGlyphs = true,
        includeUnicode = true,
        includeOmission = true,
        includeDuplication = true,
        includeAddition = true,
        includeReplacement = true,
        includeBitsquatting = true,
        includeHyphenation = true,
        includeSubdomain = true,
        includePositionSwap = true,
        includeDictionary = true,
        includeNumberToLetter = true,
        includeHomoglyphs = true,
        includeCommonMisspellings = true,
        includeTldFusion = true,
        includeKeyboardShift = true,
        includeLetterRepetition = true,
        includeLetterSwap = true,
        includeCommonTypo = true,
        customDictionary
    } = options;

    // Apply all engines with original TLD
    if (includeVowelSwap) {
        engineVowelswap(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includeGlyphs) {
        engineGlyphs(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includeUnicode) {
        engineUnicode(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includeOmission) {
        engineOmission(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includeDuplication) {
        engineDuplication(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includeAddition) {
        engineAddition(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includeReplacement) {
        engineReplacement(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includeBitsquatting) {
        engineBitsquatting(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includeHyphenation) {
        engineHyphenation(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includeSubdomain) {
        engineSubdomain(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includePositionSwap) {
        enginePositionswap(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includeDictionary) {
        engineDictionary(baseDomain, originalTld, customDictionary).forEach(v => variations.add(v));
    }
    if (includeNumberToLetter) {
        engineNumberToLetter(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includeHomoglyphs) {
        engineHomoglyphs(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includeCommonMisspellings) {
        engineCommonMisspellings(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includeKeyboardShift) {
        engineKeyboardShift(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includeLetterRepetition) {
        engineLetterRepetition(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includeLetterSwap) {
        engineLetterSwap(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }
    if (includeCommonTypo) {
        engineCommonTypo(baseDomain).forEach(v => variations.add(`${v}.${originalTld}`));
    }

    // TLD Fusion - generate variations with different TLDs
    if (includeTldFusion) {
        engineTldFusion(baseDomain, originalTld).forEach(v => variations.add(v));
    }

    return Array.from(variations);
}

// Helper function to create custom dictionaries
export function createCustomDictionary(words: string[], categories?: { [key: string]: string[] }): Dictionary {
    const dictionary: Dictionary = {
        words: words
    };

    if (categories) {
        Object.assign(dictionary, categories);
    }

    return dictionary;
}

// Helper function to load external dictionary from file
export async function loadDictionaryFromFile(filePath: string): Promise<Dictionary> {
    try {
        const fs = require('fs').promises;
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Failed to load dictionary from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Helper function to load external dictionary from URL
export async function loadDictionaryFromUrl(url: string): Promise<Dictionary> {
    try {
        const fetch = require('node-fetch');
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Failed to load dictionary from ${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Export individual engines for advanced usage
export {
    engineVowelswap,
    engineGlyphs,
    engineUnicode,
    engineOmission,
    engineDuplication,
    engineAddition,
    engineReplacement,
    engineBitsquatting,
    engineHyphenation,
    engineSubdomain,
    enginePositionswap,
    engineDictionary,
    engineNumberToLetter,
    engineHomoglyphs,
    engineCommonMisspellings,
    engineTldFusion,
    engineKeyboardShift,
    engineLetterRepetition,
    engineLetterSwap,
    engineCommonTypo
};

