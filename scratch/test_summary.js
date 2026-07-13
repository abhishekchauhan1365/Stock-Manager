const YahooFinance = require('yahoo-finance2').default;
const yf = new YahooFinance();

async function test() {
  try {
    const res = await yf.quoteSummary('AAPL', {
      modules: [
        'assetProfile',
        'financialData',
        'incomeStatementHistory',
        'incomeStatementHistoryQuarterly',
        'recommendationTrend'
      ]
    });
    console.log('keys:', Object.keys(res));
    if (res.incomeStatementHistory) {
      console.log('annual income statement:', res.incomeStatementHistory.incomeStatementHistory?.slice(0, 2).map(i => ({
        endDate: i.endDate,
        totalRevenue: i.totalRevenue,
        netIncome: i.netIncome
      })));
    }
  } catch (e) {
    console.error(e);
  }
}
test();
