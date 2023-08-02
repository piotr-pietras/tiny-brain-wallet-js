import { sha256 } from "@noble/hashes/sha256";

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

    const nextIndex = forward >= size ? forward % size : code + index + shift;
    index = nextIndex;
  }

  return mixed.join("");
};

export const phraseMixer = (phrase: string, iteration: number) => {
  let i = 0;
  let mixed = phrase;
  while (i < iteration) {
    mixed = mix(mixed, i);
    i++;
  }
  return mixed;
};