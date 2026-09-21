const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳';

// 목업 a7의 원숫자(①②③…). 20을 넘으면 원숫자가 없어 일반 숫자로 돌려준다.
export function circled(n) {
  return n >= 1 && n <= CIRCLED.length ? CIRCLED[n - 1] : String(n);
}
