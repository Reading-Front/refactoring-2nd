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
    const result = Object.assign({}, aPerformance)
    result.play = playFor(result)
    result.amount = amountFor(result)
    result.volumeCredits = volumeCreditsFor(result)
    return result
  }

  function playFor(aPerformance) {
    return plays[aPerformance.playID]
  }

  /**
   * @description 공연료 계산 함수
   */
  function amountFor(aPerformance) {
    let result = 0
    switch (aPerformance.play.type) {
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
        throw new Error(`알 수 없는 장르: ${aPerformance.play.type}`)
    }
    return result
  }

  /**
   * @description 포인트 적립 함수
   */
  function volumeCreditsFor(aPerformance) {
    let result = 0
    // 포인트를 적립한다.
    result += Math.max(aPerformance.audience - 30, 0)
    // 희극 관객 5명마다 추가 포인트를 제공한다.
    if ('comedy' === aPerformance.play.type)
      result += Math.floor(aPerformance.audience / 5)
    return result
  }

  function totalAmount() {
    return result.performances.reduce((total, p) => total + p.amount, 0)
  }

  function totalVolumeCredits() {
    return result.performances.reduce((total, p) => total + p.volumeCredits, 0)
  }
}

// statement.js
function statement(invoice, plays) {
  // 단계 쪼개기 첫 단계 - 로직을 두 단계로 나눔

  // // (1) 중간 데이터 구조를 생성한다.
  // const statementData = {}
  // return renderPlainText(statementData, invoice, plays)

  // // (2) 앞서 생성한 중간 데이터 구조를 출력한다.
  // function renderPlainText(data, invoice, plays) {
  //   let result = `청구 내역 (고객명: ${invoice.customer})\n`

  //   for (let perf of invoice.performances) {
  //     // 청구 내역을 출력한다.
  //     result += `  ${playFor(perf).name}: ${usd(amountFor(perf))} (${
  //       perf.audience
  //     }석)\n`
  //   }

  //   result += `총액: ${usd(totalAmount())}\n`
  //   result += `적립 포인트: ${totalVolumeCredits()}점\n`

  //   return result
  // }

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
