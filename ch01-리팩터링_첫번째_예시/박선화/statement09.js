/**
 * @description 공연료 계산기 클래스
 */
class PerformanceCalculator {
  constructor(aPerformance, aPlay) {
    this.performance = aPerformance
    this.play = aPlay
  }

  // 서브클래스에서 모두 오버라이드 하였으므로, 슈퍼클래스의 amount() 메서드는 호출할 일이 없으니 삭제해도 된다. 그래도 미래의 나에게 한 마디 남겨 둔다.
  //
  get amount() {
    throw new Error('서브클래스에서 처리하도록 설계되었습니다.')
  }

  // volumeCreditsFor 함수를 계산기 클래스로 복사
  // 일반적인 경우를 기본으로 삼아 슈퍼클래스에 나겨두고, 장르마다 달라지는 부분은 필요할 때 오버라이드 하게 만드는 것이 좋다.
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

// 메서드를 서브클래스에 정의하기만 해도 슈퍼 글래스의 조건부 로직이 오버라이드 된다.

/**
 * @description 비극 장르용 공연료 계산기 클래스
 */
class TragedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 40000
    if (this.performance.audience > 30) {
      result += 1000 * (this.performance.audience - 30)
    }
    return result
  }
}

/**
 * @description 희극 장르용 공연료 계산기 클래스
 */
class ComedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 30000
    if (this.performance.audience > 20) {
      result += 10000 + 500 * (this.performance.audience - 20)
    }
    result += 300 * this.performance.audience
    return result
  }

  get volumeCredits() {
    let result = super.volumeCredits

    result += Math.floor(this.performance.audience / 5)
    return result
  }
}

// 다형성을 지원하기 위한 구조 - 조건부 로직을 다형성으로 바꾸기
function createPerformanceCalculator(aPerformance, aPlay) {
  switch (aPlay.type) {
    case 'tragedy':
      return new TragedyCalculator(aPerformance, aPlay)
    case 'comedy':
      return new ComedyCalculator(aPerformance, aPlay)
    default:
      throw new Error(`알 수 없는 장르: ${aPlay.type}`)
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
    // ✏️ 공연료 계산기 생성 - PerformanceCalculator 생성자 대신 팩터리 함수 이용
    const calculator = createPerformanceCalculator(
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
