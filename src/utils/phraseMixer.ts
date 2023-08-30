import { sha256 } from "@noble/hashes/sha256";

//It shuffle chars in string to rise entropy
//Process:
// - hash char[0] + char[center] + char[last] + iteration
// - sum up bytes of sha256 to get shift
// - search for char in string via index charCode() + index + shift
// - pop char from string & push it to new string

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
