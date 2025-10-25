/**
 * @description 공연료 계산기 클래스
 */
class PerformanceCalculator {
  constructor(aPerformance, aPlay) {
    this.performance = aPerformance
    this.play = aPlay
  }

  // amountFor 함수를 계산기 클래스로 복사
  get amount() {
    let result = 0

    switch (
      this.play.type // amountFor() 함수가 매개변수로 받던 정보를 계산기 필드에서 바로 얻음
    ) {
      case 'tragedy': // 비극
        result = 40000
        if (this.performance.audience > 30) {
          result += 1000 * (this.performance.audience - 30)
        }
        break
      case 'comedy': // 희극
        result = 30000
        if (this.performance.audience > 20) {
          result += 10000 + 500 * (this.performance.audience - 20)
        }
        result += 300 * this.performance.audience
        break
      default:
        throw new Error(`알 수 없는 장르: ${this.play.type}`)
    }

    return result
  }

  // volumeCreditsFor 함수를 계산기 클래스로 복사
  get volumeCredits() {
    let result = 0
    // 포인트를 적립한다.
    result += Math.max(this.performance.audience - 30, 0)
    // 희극 관객 5명마다 추가 포인트를 제공한다.
    if ('comedy' === this.play.type)
      result += Math.floor(this.performance.audience / 5)
    return result
  }
}

// ------------------------------------------------------------------------

// createStatementData.js
function createStatementData(invoice, plays) {
  const result = {}
  result.customer = invoice.customer
  result.performances = invoice.performances.map(enrichPerformance)
  result.totalAmount = totalAmount()
  result.totalVolumeCredits = totalVolumeCredits()
  return result

  /**
   * @description 공연 정보 추가 함수
   */
  function enrichPerformance(aPerformance) {
    // ✏️ 공연료 계산기 생성
    const calculator = new PerformanceCalculator(
      aPerformance,
      playFor(aPerformance)
    )

    const result = Object.assign({}, aPerformance)
    result.play = calculator.play // ✏️ playFor() 함수 대신 계산기 클래스의 play 필드 사용
    result.amount = calculator.amount // ✏️ amountFor() 함수 대신 계산기 클래스의 amount 게터 사용
    result.volumeCredits = calculator.volumeCredits // ✏️ volumeCreditsFor() 함수 대신 계산기 클래스의 volumeCredits 게터 사용

    return result
  }

  function playFor(aPerformance) {
    return plays[aPerformance.playID]
  }

  function totalAmount() {
    return result.performances.reduce((total, p) => total + p.amount, 0)
  }

  function totalVolumeCredits() {
    return result.performances.reduce((total, p) => total + p.volumeCredits, 0)
  }
}

// ------------------------------------------------------------------------
// statement.js
function statement(invoice, plays) {
  return renderPlainText(createStatementData(invoice, plays))
}

function renderPlainText(data, plays) {
  let result = `청구 내역 (고객명: ${data.customer})\n`

  for (let perf of data.performances) {
    // 청구 내역을 출력한다.
    result += `  ${perf.play.name}: ${usd(perf.amount)} (${perf.audience}석)\n`
  }

  result += `총액: ${usd(data.totalAmount)}\n`
  result += `적립 포인트: ${data.totalVolumeCredits}점\n`

  return result
}

function htmlStatement(data, plays) {
  let result = `<h1>청구 내역 (고객명: ${data.customer})</h1>\n`
  result += '<table>\n'
  result += '<tr><th>연극</th><th>좌석 수</th><th>금액</th></tr>'

  for (let perf of data.performances) {
    result += `  <tr><td>${perf.play.name}</td><td>${
      perf.audience
    }</td><td>${usd(perf.amount)}</td></tr>\n`
  }

  result += '</table>\n'
  result += `<p>총액: <em>${usd(data.totalAmount)}</em></p>\n`
  result += `<p>적립 포인트: <em>${data.totalVolumeCredits}</em>점</p>\n`

  return result
}

// 임시 변수 format 제거 -> 함수를 직접 선언해 사용하도록 바꿈
function usd(aNumber) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(aNumber / 100)
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
