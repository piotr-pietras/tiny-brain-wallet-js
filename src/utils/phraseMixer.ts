import { sha256 } from "@noble/hashes/sha256";

// Takes two parameters: `phrase`, a string, and `iteration`, a number. Here's an explanation of how this function works:

// 1. **Split the Phrase**: The input string `phrase` is split into an array of characters.

// 2. **Calculate the Key Elements**:
//    - `center`: This is calculated as the ceiling of half the length of the phrase, determining a central position in the character array.
//    - `charCenter`: The character at the center position.
//    - `charFirst`: The first character of the array.
//    - `charLast`: The last character of the array.
//    - `key`: A concatenation of `charFirst`, `charCenter`, `charLast`, and the `iteration` number.

// 3. **Hashing and Shifting**:
//    - The `sha256` hash function is used on the `key`, though it's missing in the provided code. 
//      You would need to implement or import `sha256`.
//    - The `shift` is computed by reducing the hash result (an array of numbers, presumably), summing up all its values.

// 4. **Mixing Algorithm**:
//    - The function initializes with the index set to `center`.
//    - A loop iterates over the length of the array:
//      - For each iteration, the character at the current index is added to the `mixed` array.
//      - The character is then removed from the `array`, which decreases its size.
//      - `nextIndex` is computed based on the current character's ASCII code (`charCodeAt(0)`), the current index, and the previously computed `shift`. 
//         If this index exceeds the current size of the array, it is recalculated using modulo to wrap around.

// 5. **Return Result**:
//    - The loop continues until all characters are processed and removed from the original array.
//    - The final result is the `mixed` array elements joined into a single string.

// This function essentially rearranges the characters of the input `phrase` based on a computed shift that involves a hash function, iterating over the string and removing elements as they are processed. 
// The result is a uniquely mixed version of the input string depending on the `iteration` value.

const mix = (phrase: string, iteration: number) => {
  const mixed = [];
  const array = phrase.split("");
  const length = array.length;

  const center = Math.ceil(length / 2);
  const charCenter = array[center];
  const charFirst = array[0];
  const charLast = array[length - 1];

  const key = `${charFirst}${charCenter}${charLast}${iteration}`;
  const shift = sha256(key).reduce((prv, cur) => prv + cur);

  let index = center;

  for (let i = 0; i < length; i++) {
    const char = array[index];
    const code = char.charCodeAt(0);
    const size = array.length - 1;
    const forward = code + index + shift;
    if (!size) {
      mixed.push(char);
      break;
    }

    mixed.push(char);
    array.splice(index, 1);

    const nextIndex = forward >= size ? forward % size : forward;
    index = nextIndex;
  }

  return mixed.join("");
};

export const phraseMixer = (
  phrase: string,
  iteration: number,
  progressCallback?: (i: number, iteration: number) => void
) => {
  let i = 0;
  let mixed = phrase;
  while (i < iteration) {
    mixed = mix(mixed, i);
    i++;
    if (!(i % 1000)) {
      progressCallback && progressCallback(i, iteration);
    }
  }
  return mixed;
};
