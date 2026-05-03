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
    dates.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return dates;
}

// 실거래가 최근 1개월만 먼저 빠르게 가져오기 (타임아웃 방지)
async function fetchPopulation(lawdCd) {
  const dates = getRecent6MonthsDates();
  const history = dates.map(d => ({ month: `${d.substring(0,4)}년 ${parseInt(d.substring(4))}월`, population: 0, households: 0 }));
  try {
    // 최근 2달치만 가져오기 (속도 최적화)
    const recentDates = dates.slice(-2);
    await Promise.all(recentDates.map(async (date, idx) => {
      const url = `https://apis.data.go.kr/1741000/RegistrationPopulationByRegion/getRegistrationPopulationByRegion?serviceKey=${encodeURIComponent(DATA_GO_KEY)}&pageNo=1&numOfRows=10&base_ymd=${date}&sigunguCd=${lawdCd}`;
      const res = await axios.get(url, { timeout: 4000 });
      const item = res.data?.response?.body?.items?.item?.[0];
      if (item) {
        const histIdx = history.length - 2 + idx;
        history[histIdx].population = parseInt(item.tot_pop_cnt || 0);
        history[histIdx].households = parseInt(item.hh_cnt || 0);
      }
    }));
  } catch (_) {}
  return history;
}

async function fetchPriceTrade(lawdCd) {
  const dates = getRecent6MonthsDates();
  const history = dates.map(d => ({ month: `${d.substring(0,4)}년 ${parseInt(d.substring(4))}월`, saleIndex: 0, jeonseIndex: 0 }));
  try {
    // 최근 2달치만 (속도 최적화)
    const recentDates = dates.slice(-2);
    await Promise.all(recentDates.map(async (date, idx) => {
      const url = `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade?serviceKey=${encodeURIComponent(DATA_GO_KEY)}&pageNo=1&numOfRows=50&LAWD_CD=${lawdCd}&DEAL_YMD=${date}`;
      const res = await axios.get(url, { timeout: 4000 });
      const items = res.data?.response?.body?.items?.item;
      if (items && Array.isArray(items) && items.length > 0) {
        const total = items.reduce((sum, item) => sum + parseInt((item.dealAmount || '0').replace(/,/g, '')), 0);
        const histIdx = history.length - 2 + idx;
        history[histIdx].saleIndex = Math.round(total / items.length);
        history[histIdx].jeonseIndex = Math.round(history[histIdx].saleIndex * 0.6);
      }
    }));
  } catch (_) {}
  return history;
}

async function fetchUnsold(lawdCd) {
  const dates = getRecent6MonthsDates();
  const history = dates.map(d => ({ month: `${d.substring(0,4)}년 ${parseInt(d.substring(4))}월`, preConstruction: 0, postConstruction: 0 }));
  try {
    const url = `https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=${KOSIS_KEY}&itmId=T1+&objL1=${lawdCd}&format=json&jsonVD=Y&prdSe=M&newEstPrdCnt=6&orgId=116&tblId=DT_MLTM_5498`;
    const res = await axios.get(url, { timeout: 4000 });
    if (Array.isArray(res.data) && res.data.length > 0) {
      res.data.forEach((item, i) => {
        if (i < history.length) {
          history[i].preConstruction = parseInt(item.DTVAL_CO || 0);
        }
      });
    }
  } catch (_) {}
  return history;
}

async function fetchNews(cityName) {
  if (!NAVER_ID || !NAVER_SECRET) return [];
  try {
    const query = encodeURIComponent(`"${cityName}" (기업유치 OR 개발 OR GTX OR 교통 OR 착공)`);
    const url = `https://openapi.naver.com/v1/search/news.json?query=${query}&display=5&sort=sim`;
    const res = await axios.get(url, {
      headers: { 'X-Naver-Client-Id': NAVER_ID, 'X-Naver-Client-Secret': NAVER_SECRET },
      timeout: 4000
    });
    // 해당 도시명이 제목에 포함된 것 우선 필터링
    let items = res.data.items.filter(i => i.title.includes(cityName) || i.description.includes(cityName));
    if (items.length === 0) items = res.data.items;
    return items.slice(0, 4).map((item, idx) => ({
      title: item.title.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
      description: item.description.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
      date: new Date(item.pubDate).toLocaleDateString('ko-KR'),
      importance: idx === 0 ? '최상' : idx === 1 ? '상' : '중',
      link: item.link
    }));
  } catch (_) { return []; }
}

// GET /api/cities - 도시 목록 (기본 정보만, 빠름)
// GET /api/cities?name=수원시 - 특정 도시 상세 (느림, 상세 클릭 시 호출)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { name } = req.query;

  try {
    // 특정 도시 상세 요청
    if (name) {
      const city = targetCities.find(c => c.name === name);
      if (!city) return res.status(404).json({ error: 'City not found' });

      const [demandHistory, priceHistory, supplyHistory, newsData] = await Promise.all([
        fetchPopulation(city.lawdCd),
        fetchPriceTrade(city.lawdCd),
        fetchUnsold(city.lawdCd),
        fetchNews(city.name)
      ]);

      const popDiff = (demandHistory[5]?.population || 0) - (demandHistory[4]?.population || 0);
      const saleDiff = (priceHistory[5]?.saleIndex || 0) - (priceHistory[4]?.saleIndex || 0);
      const latestUnsold = supplyHistory[5]?.preConstruction || 0;
      const unsoldDiff = latestUnsold - (supplyHistory[4]?.preConstruction || 0);

      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
      return res.status(200).json({
        demand: { history: demandHistory },
        price: { history: priceHistory },
        supply: { history: supplyHistory },
        news: newsData,
        popDiff,
        saleDiff,
        latestUnsold,
        unsoldDiff
      });
    }

    // 전체 도시 목록 (기본 정보만 - 빠름)
    // 청약 데이터만 한 번 호출
    let applyHomeData = null;
    try {
      const aptUrl = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=300&serviceKey=${encodeURIComponent(DATA_GO_KEY)}`;
      const aptRes = await axios.get(aptUrl, { timeout: 6000 });
      applyHomeData = aptRes.data?.data;
    } catch (_) {}

    const results = targetCities.map(city => {
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

      const yearlySupply = [
        { year: 2023, type: '과거 공급', volume: 0 },
        { year: 2024, type: '과거 공급', volume: 0 },
        { year: 2025, type: '과거 공급', volume: 0 },
        { year: 2026, type: '미래 예정', volume: 0 },
        { year: 2027, type: '미래 예정', volume: 0 },
        { year: 2028, type: '미래 예정', volume: 0 }
      ];

      return {
        id: city.id, name: city.name, lat: city.lat, lng: city.lng,
        pop: city.pop,
        // 상세 데이터는 도시 클릭 시 /api/cities?name=xxx 에서 가져옴
        isBoomTown: false,
        aiSummary: '도시를 클릭하면 AI 분석 결과를 확인할 수 있습니다.',
        news: [],
        demand: { value: '클릭하여 확인', status: 'neutral', history: [] },
        supply: { value: '클릭하여 확인', status: 'neutral', history: [] },
        yearlySupply,
        subscription: {
          value: `분양 ${tableData.filter(t => t.date !== '-').length}건`,
          status: tableData.filter(t => t.date !== '-').length > 0 ? 'good' : 'bad',
          tableData
        },
        price: { value: '클릭하여 확인', status: 'neutral', history: [] }
      };
    });

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
    return res.status(200).json(results);

  } catch (error) {
    console.error('API Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
