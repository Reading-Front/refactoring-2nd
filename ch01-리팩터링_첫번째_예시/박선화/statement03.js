function playFor(aPerformance) {
  return plays[aPerformance.playID]
}

// function statement(invoice, plays) {
// plays 매개변수 제거
function statement(invoice) {
  let totalAmount = 0
  let volumeCredits = 0
  let result = `청구 내역 (고객명: ${invoice.customer})\n`

  const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format

  for (let perf of invoice.performances) {
    // const play = playFor(perf) // 우변을 함수로 추출
    // let thisAmount = amountFor(perf, play) // 추출한 함수를 이용한다.
    // -- 인라인된 변수는 제거
    // let thisAmount = amountFor(perf, playFor(perf)) // 추출한 함수를 이용한다.
    // -- 변수 인라인하기 - thisAmount -> amountFor(perf, playFor(perf))

    // 포인트를 적립한다.
    volumeCredits += Math.max(perf.audience - 30, 0)
    // 희극 관객 5명마다 추가 포인트를 제공한다.
    if ('comedy' === playFor(perf).type)
      volumeCredits += Math.floor(perf.audience / 5)

    // 청구 내역을 출력한다.
    result += `  ${playFor(perf).name}: ${format(
      amountFor(perf, playFor(perf)) / 100
    )} (${perf.audience}석)\n`
    totalAmount += amountFor(perf, playFor(perf))
  }
  result += `총액: ${format(totalAmount / 100)}\n`
  result += `적립 포인트: ${volumeCredits}점\n`
  return result
}

// function amountFor(aPerformance, play) {
// play 매개변수 삭제
function amountFor(aPerformance) {
  let result = 0
  switch (
    playFor(aPerformance).type // {play.type} -> {playFor(aPerformance).type}
  ) {
    case 'tragedy': // 비극
      result = 40000
      if (aPerformance.audience > 30) {
        result += 1000 * (aPerformance.audience - 30)
      }
      break
    case 'comedy': // 희극
      result = 30000
      if (aPerformance.audience > 20) {
        result += 10000 + 500 * (aPerformance.audience - 20)
      }
      result += 300 * aPerformance.audience
      break
    default:
      throw new Error(`알 수 없는 장르: ${playFor(aPerformance).type}`)
    // {play.type} -> {playFor(aPerformance).type}
  }
  return result
}

export default statement

// --------------------------------------------------------
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
