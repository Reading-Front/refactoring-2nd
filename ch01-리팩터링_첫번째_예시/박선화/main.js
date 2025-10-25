import statement from './statement03.js'

const plays = {
  hamlet: { name: 'Hamlet', type: 'tragedy' },
  'as-like': { name: 'As You Like It', type: 'comedy' },
  othello: { name: 'Othello', type: 'tragedy' },
}

const invoice = {
  customer: 'BigCo',
  performances: [
    { playID: 'hamlet', audience: 55 },
    { playID: 'as-like', audience: 35 },
    { playID: 'othello', audience: 40 },
  ],
}

console.log(statement(invoice, plays))

// 청구 내역 (고객명: BigCo)
//   Hamlet: $650.00 (55석)
//   As You Like It: $580.00 (35석)
//   Othello: $500.00 (40석)
// 총액: $1,730.00
// 적립 포인트: 47점
