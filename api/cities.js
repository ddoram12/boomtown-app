import axios from 'axios';

const NAVER_ID = process.env.NAVER_CLIENT_ID;
const NAVER_SECRET = process.env.NAVER_CLIENT_SECRET;
const DATA_GO_KEY = process.env.VITE_DATA_GO_KR_API_KEY;
const KOSIS_KEY = process.env.VITE_KOSIS_API_KEY;

const targetCities = [
  { id: 1, name: '수원시', lawdCd: '41110', pop: 1190000, lat: 37.2636, lng: 127.0286 },
  { id: 2, name: '용인시', lawdCd: '41460', pop: 1070000, lat: 37.2410, lng: 127.1775 },
  { id: 3, name: '고양시', lawdCd: '41280', pop: 1070000, lat: 37.6583, lng: 126.8320 },
  { id: 4, name: '창원시', lawdCd: '48120', pop: 1010000, lat: 35.2279, lng: 128.6811 },
  { id: 5, name: '성남시', lawdCd: '41130', pop: 920000, lat: 37.4200, lng: 127.1265 },
  { id: 6, name: '화성시', lawdCd: '41590', pop: 940000, lat: 37.1995, lng: 126.8315 },
  { id: 7, name: '청주시', lawdCd: '43110', pop: 850000, lat: 36.6424, lng: 127.4890 },
  { id: 8, name: '부천시', lawdCd: '41190', pop: 780000, lat: 37.5034, lng: 126.7660 },
  { id: 9, name: '남양주시', lawdCd: '41360', pop: 730000, lat: 37.6360, lng: 127.2165 },
  { id: 10, name: '천안시', lawdCd: '44130', pop: 650000, lat: 36.8151, lng: 127.1138 },
  { id: 11, name: '전주시', lawdCd: '45110', pop: 640000, lat: 35.8242, lng: 127.1480 },
  { id: 12, name: '안산시', lawdCd: '41270', pop: 630000, lat: 37.3218, lng: 126.8308 },
  { id: 13, name: '안양시', lawdCd: '41170', pop: 540000, lat: 37.3943, lng: 126.9568 },
  { id: 14, name: '김해시', lawdCd: '48250', pop: 530000, lat: 35.2285, lng: 128.8894 },
  { id: 15, name: '평택시', lawdCd: '41220', pop: 580000, lat: 36.9921, lng: 127.1122 },
  { id: 16, name: '포항시', lawdCd: '47110', pop: 490000, lat: 36.0190, lng: 129.3434 },
  { id: 17, name: '제주시', lawdCd: '50110', pop: 490000, lat: 33.4996, lng: 126.5311 },
  { id: 18, name: '파주시', lawdCd: '41480', pop: 490000, lat: 37.7600, lng: 126.7799 },
  { id: 19, name: '의정부시', lawdCd: '41150', pop: 460000, lat: 37.7380, lng: 127.0336 },
  { id: 20, name: '구미시', lawdCd: '47190', pop: 400000, lat: 36.1194, lng: 128.3445 },
  { id: 21, name: '광명시', lawdCd: '41210', pop: 280000, lat: 37.4785, lng: 126.8642 },
  { id: 22, name: '진주시', lawdCd: '48170', pop: 340000, lat: 35.1803, lng: 128.1076 },
  { id: 23, name: '원주시', lawdCd: '42130', pop: 360000, lat: 37.3422, lng: 127.9201 },
  { id: 24, name: '아산시', lawdCd: '44200', pop: 330000, lat: 36.7898, lng: 127.0018 },
  { id: 25, name: '여수시', lawdCd: '46130', pop: 270000, lat: 34.7603, lng: 127.6622 },
  { id: 26, name: '익산시', lawdCd: '45140', pop: 270000, lat: 35.9482, lng: 126.9575 },
  { id: 27, name: '춘천시', lawdCd: '42110', pop: 280000, lat: 37.8813, lng: 127.7298 },
  { id: 28, name: '경산시', lawdCd: '47290', pop: 260000, lat: 35.8250, lng: 128.7358 },
  { id: 29, name: '군포시', lawdCd: '41410', pop: 260000, lat: 37.3614, lng: 126.9352 },
  { id: 30, name: '군산시', lawdCd: '45130', pop: 250000, lat: 35.9676, lng: 126.7366 },
  { id: 31, name: '하남시', lawdCd: '41450', pop: 320000, lat: 37.5392, lng: 127.2148 },
  { id: 32, name: '순천시', lawdCd: '46150', pop: 270000, lat: 34.9506, lng: 127.4872 },
  { id: 33, name: '목포시', lawdCd: '46110', pop: 210000, lat: 34.8118, lng: 126.3921 },
  { id: 34, name: '강릉시', lawdCd: '42150', pop: 210000, lat: 37.7518, lng: 128.8760 },
  { id: 35, name: '오산시', lawdCd: '41370', pop: 230000, lat: 37.1499, lng: 127.0772 },
  { id: 36, name: '충주시', lawdCd: '43130', pop: 200000, lat: 36.9912, lng: 127.9258 },
  { id: 37, name: '양주시', lawdCd: '41630', pop: 240000, lat: 37.7853, lng: 127.0457 },
  { id: 38, name: '이천시', lawdCd: '41500', pop: 220000, lat: 37.2722, lng: 127.4351 },
  { id: 39, name: '구리시', lawdCd: '41310', pop: 180000, lat: 37.5943, lng: 127.1296 },
  { id: 40, name: '안성시', lawdCd: '41550', pop: 190000, lat: 37.0079, lng: 127.2797 }
];

function getRecent6MonthsDates() {
  const dates = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    dates.push(`${yyyy}${mm}`);
  }
  return dates;
}

async function fetchRealPopulation(lawdCd) {
  const history = [];
  const dates = getRecent6MonthsDates();
  for (const date of dates) {
    let pop = 0, hh = 0;
    try {
      const url = `https://apis.data.go.kr/1741000/RegistrationPopulationByRegion/getRegistrationPopulationByRegion?serviceKey=${encodeURIComponent(DATA_GO_KEY)}&pageNo=1&numOfRows=10&base_ymd=${date}&sigunguCd=${lawdCd}`;
      const res = await axios.get(url, { timeout: 5000 });
      if (res.data?.response?.body?.items?.item?.length > 0) {
        pop = parseInt(res.data.response.body.items.item[0].tot_pop_cnt || 0);
        hh = parseInt(res.data.response.body.items.item[0].hh_cnt || 0);
      }
    } catch (_) {}
    history.push({ month: `${date.substring(0,4)}년 ${parseInt(date.substring(4))}월`, population: pop, households: hh });
  }
  return history;
}

async function fetchRealPriceTrade(lawdCd) {
  const history = [];
  const dates = getRecent6MonthsDates();
  for (const date of dates) {
    let avgPrice = 0;
    try {
      const url = `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade?serviceKey=${encodeURIComponent(DATA_GO_KEY)}&pageNo=1&numOfRows=100&LAWD_CD=${lawdCd}&DEAL_YMD=${date}`;
      const res = await axios.get(url, { timeout: 5000 });
      const items = res.data?.response?.body?.items?.item;
      if (items && Array.isArray(items) && items.length > 0) {
        const total = items.reduce((sum, item) => sum + parseInt((item.dealAmount || '0').replace(/,/g, '')), 0);
        avgPrice = Math.round(total / items.length);
      }
    } catch (_) {}
    history.push({ month: `${date.substring(0,4)}년 ${parseInt(date.substring(4))}월`, saleIndex: avgPrice, jeonseIndex: Math.round(avgPrice * 0.6) });
  }
  return history;
}

async function fetchRealUnsold(lawdCd) {
  const history = [];
  const dates = getRecent6MonthsDates();
  try {
    const url = `https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=${KOSIS_KEY}&itmId=T1+&objL1=${lawdCd}&format=json&jsonVD=Y&prdSe=M&newEstPrdCnt=6&orgId=116&tblId=DT_MLTM_5498`;
    const res = await axios.get(url, { timeout: 5000 });
    if (Array.isArray(res.data)) {
      for (const item of res.data) {
        history.push({
          month: `${item.PRD_DE.substring(0,4)}년 ${parseInt(item.PRD_DE.substring(4))}월`,
          preConstruction: parseInt(item.DTVAL_CO || 0),
          postConstruction: 0
        });
      }
    }
  } catch (_) {}
  if (history.length === 0) {
    dates.forEach(date => {
      history.push({ month: `${date.substring(0,4)}년 ${parseInt(date.substring(4))}월`, preConstruction: 0, postConstruction: 0 });
    });
  }
  return history;
}

async function fetchRealNews(cityName) {
  if (!NAVER_ID || !NAVER_SECRET) return [];
  try {
    const query = encodeURIComponent(`"${cityName}" (기업유치|대규모개발|교통호재|GTX|신공항|국가산단|산단|착공)`);
    const url = `https://openapi.naver.com/v1/search/news.json?query=${query}&display=8&sort=sim`;
    const response = await axios.get(url, {
      headers: { 'X-Naver-Client-Id': NAVER_ID, 'X-Naver-Client-Secret': NAVER_SECRET },
      timeout: 5000
    });
    let items = response.data.items.filter(item => item.title.includes(cityName) || item.description.includes(cityName));
    if (items.length === 0) items = response.data.items;
    return items.slice(0, 4).map((item, idx) => ({
      title: item.title.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
      date: new Date(item.pubDate).toLocaleDateString('ko-KR'),
      importance: idx === 0 ? '최상' : (idx === 1 ? '상' : '중'),
      link: item.link
    }));
  } catch(_) { return []; }
}

export default async function handler(req, res) {
  // CORS 헤더 설정 (아무 브라우저에서나 접근 가능하도록)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = [];
    
    let applyHomeData = null;
    try {
      const aptUrl = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=300&serviceKey=${encodeURIComponent(DATA_GO_KEY)}`;
      const aptRes = await axios.get(aptUrl, { timeout: 8000 });
      applyHomeData = aptRes.data.data;
    } catch (_) {}

    for (const city of targetCities) {
      const [demandHistory, priceHistory, supplyHistory, newsData] = await Promise.all([
        fetchRealPopulation(city.lawdCd),
        fetchRealPriceTrade(city.lawdCd),
        fetchRealUnsold(city.lawdCd),
        fetchRealNews(city.name)
      ]);

      const popDiff = (demandHistory[5]?.population || 0) - (demandHistory[0]?.population || 0);
      const demandScore = popDiff > 0;
      const demandValue = popDiff === 0 ? '데이터 수집중' : (popDiff > 0 ? `+${popDiff.toLocaleString()}명 증가` : `${popDiff.toLocaleString()}명 감소`);

      const latestSupply = (supplyHistory[5]?.preConstruction || 0);
      const supplyDiff = latestSupply - (supplyHistory[0]?.preConstruction || 0);
      const supplyScore = supplyDiff <= 0;
      const supplyValue = latestSupply === 0 ? '데이터 수집중' : `현재 총 ${latestSupply.toLocaleString()}호`;

      let tableData = [];
      if (applyHomeData) {
        const cityApts = applyHomeData.filter(apt => apt.HSSPLY_ADRES?.includes(city.name));
        tableData = cityApts.map(apt => ({ projectName: apt.HOUSE_NM, date: apt.RCRIT_PBLANC_DE, rate: '집계중' }));
      }
      while (tableData.length < 3) {
        tableData.push({ projectName: `${city.name} 공공분양 ${tableData.length + 1}차`, date: '-', rate: '-' });
      }
      tableData.sort((a, b) => new Date(b.date) - new Date(a.date));
      tableData = tableData.slice(0, 5);
      const subScore = applyHomeData && tableData.filter(t => t.rate !== '-').length > 0;
      const subValue = `최근 분양 ${tableData.filter(t => t.rate !== '-').length}건`;

      const saleDiff = (priceHistory[5]?.saleIndex || 0) - (priceHistory[0]?.saleIndex || 0);
      const priceScore = saleDiff > 0;
      const priceValue = priceHistory[5]?.saleIndex === 0 ? '데이터 수집중' : (saleDiff > 0 ? `실거래 평균 +${saleDiff.toLocaleString()}만 상승` : `실거래 평균 ${Math.abs(saleDiff).toLocaleString()}만 하락`);

      const yearlySupply = [
        { year: 2023, type: '과거 공급', volume: 0 },
        { year: 2024, type: '과거 공급', volume: 0 },
        { year: 2025, type: '과거 공급', volume: 0 },
        { year: 2026, type: '미래 예정', volume: 0 },
        { year: 2027, type: '미래 예정', volume: 0 },
        { year: 2028, type: '미래 예정', volume: 0 }
      ];

      const isBoomTown = [demandScore, supplyScore, priceScore].filter(Boolean).length >= 2;

      const demandTrendText = popDiff > 0 ? "인구 및 세대수가 꾸준히 유입되며 탄탄한 실수요층을 형성하고 있습니다." : popDiff < 0 ? "최근 인구가 감소세에 있어 기반 수요가 다소 정체되어 있습니다." : "인구 데이터 수집 중입니다.";
      const supplyTrendText = latestSupply === 0 ? "미분양 데이터 수집 중입니다." : supplyDiff <= 0 ? "미분양 물량이 안정적으로 감소(소진)하며 공급 리스크가 해소 중입니다." : "최근 미분양 물량이 증가하고 있어 향후 공급 리스크가 커지고 있습니다.";
      const priceTrendText = priceHistory[5]?.saleIndex === 0 ? "매매 실거래 데이터 수집 중입니다." : saleDiff > 0 ? "매매 실거래가가 뚜렷한 상승 흐름을 보이며 자산 가치 상승 탄력을 받고 있습니다." : "현재 매매 실거래가가 보합 또는 하락세를 보이며 자산 가치 상승이 제한적인 국면입니다.";

      const aiSummary = `본 지역(${city.name})은 ${demandTrendText} ${supplyTrendText} 가격 측면에서는 ${priceTrendText}`;

      results.push({
        id: city.id, name: city.name, lat: city.lat, lng: city.lng,
        isBoomTown, aiSummary, news: newsData,
        demand: { value: demandValue, status: demandScore ? 'good' : 'bad', history: demandHistory },
        supply: { value: supplyValue, status: supplyScore ? 'good' : 'bad', history: supplyHistory },
        yearlySupply,
        subscription: { value: subValue, status: subScore ? 'good' : 'bad', tableData },
        price: { value: priceValue, status: priceScore ? 'good' : 'bad', history: priceHistory }
      });
    }

    results.sort((a, b) => (a.isBoomTown === b.isBoomTown) ? (b.pop - a.pop || 0) : (a.isBoomTown ? -1 : 1));
    
    // 캐싱 헤더 (1시간마다 갱신)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(results);
  } catch (error) {
    console.error('API Handler Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
