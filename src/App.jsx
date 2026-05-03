import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import './index.css';

// 카카오맵 동적 로드 (환경변수 직접 주입)
function loadKakaoMap(callback) {
  const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
  if (!KAKAO_KEY) { console.warn('카카오맵 키 없음'); return; }
  if (window.kakao && window.kakao.maps) { window.kakao.maps.load(callback); return; }
  const script = document.createElement('script');
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`;
  script.onload = () => window.kakao.maps.load(callback);
  document.head.appendChild(script);
}

function App() {
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  // 1단계: 목록 로드 (빠름 - 청약 데이터만)
  useEffect(() => {
    fetch('/api/cities')
      .then(r => r.ok ? r.json() : fetch('/boomtown_data.json').then(r2 => r2.json()))
      .then(data => setCities(data))
      .catch(() => fetch('/boomtown_data.json').then(r => r.json()).then(d => setCities(d)))
      .finally(() => setLoading(false));
  }, []);

  // 카카오맵 초기화
  useEffect(() => {
    if (cities.length === 0) return;
    loadKakaoMap(() => {
      const container = document.getElementById('kakao-map');
      if (!container) return;
      const map = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(36.1, 127.5),
        level: 13
      });
      setMapInstance(map);
      cities.forEach(city => {
        if (!city.lat || !city.lng) return;
        const el = document.createElement('div');
        el.className = city.isBoomTown ? 'marker-boom' : 'marker-normal';
        el.innerHTML = `<div class="marker-label">${city.name}</div>`;
        el.onclick = () => handleCityClick(city);
        new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(city.lat, city.lng),
          content: el, yAnchor: 1
        }).setMap(map);
      });
    });
  }, [cities]);

  // 2단계: 도시 클릭 시 상세 데이터 로드
  const handleCityClick = async (city) => {
    setSelectedCity(city);
    setDetailData(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/cities?name=${encodeURIComponent(city.name)}`);
      if (res.ok) {
        const data = await res.json();
        setDetailData(data);
      }
    } catch (e) { console.error('상세 데이터 로드 실패:', e); }
    finally { setDetailLoading(false); }
  };

  const exportPDF = async (elementId, filename) => {
    setPdfLoading(true);
    const element = document.getElementById(elementId);
    if (!element) { setPdfLoading(false); return; }
    const origHeight = element.style.height;
    const origOverflow = element.style.overflow;
    element.style.height = 'auto';
    element.style.overflow = 'visible';
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0b0f19', useCORS: true });
      const pdf = new jsPDF('p', 'mm', [210, (canvas.height * 210) / canvas.width]);
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
      pdf.save(`${filename}.pdf`);
    } catch (e) { alert('PDF 생성 실패'); }
    finally {
      element.style.height = origHeight;
      element.style.overflow = origOverflow;
      setPdfLoading(false);
    }
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <h2 style={{ color: 'var(--accent-color)', letterSpacing: '2px' }}>🔍 BOOMTOWN AI</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>전국 40개 주요 도시 데이터를 불러오는 중...</p>
    </div>
  );

  const boomTowns = cities.filter(c => c.isBoomTown);
  const otherTowns = cities.filter(c => !c.isBoomTown);

  // 상세 팝업용 데이터 (API 로드 or city 기본값)
  const demandHistory = detailData?.demand?.history || selectedCity?.demand?.history || [];
  const priceHistory = detailData?.price?.history || selectedCity?.price?.history || [];
  const supplyHistory = detailData?.supply?.history || selectedCity?.supply?.history || [];
  const newsData = detailData?.news || selectedCity?.news || [];

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* 지도 */}
      <main className="map-section" style={{ position: 'relative', flex: 1, height: '100%' }}>
        <div id="kakao-map" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, background: '#0d1117' }}></div>
        <div style={{ position: 'absolute', top: 30, left: 30, zIndex: 10, background: 'rgba(0,0,0,0.75)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.3rem', color: 'var(--accent-color)' }}>KOREA REAL ESTATE AI</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>전국 10만 이상 도시 40개 실시간 분석</p>
          <div style={{ marginTop: '0.8rem', display: 'flex', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#fff' }}>
              <span className="marker-boom" style={{ width: 10, height: 10, display: 'inline-block', position: 'static', animation: 'none' }}></span>활황 예상
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#fff' }}>
              <span className="marker-normal" style={{ width: 10, height: 10, display: 'inline-block', position: 'static' }}></span>관망
            </span>
          </div>
        </div>
      </main>

      {/* 대시보드 */}
      <aside className="dashboard-section" id="dashboard-content" style={{ width: '550px', height: '100%', overflowY: 'auto' }}>
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="dashboard-title">BOOMTOWN</h1>
            <p className="dashboard-subtitle">분위기 좋은 지역 TOP 및 전체 목록</p>
          </div>
          <button className="action-btn" onClick={() => exportPDF('dashboard-content', 'BoomTown_Dashboard')}>📄 PDF</button>
        </div>

        <h2 style={{ color: 'var(--accent-color)', fontSize: '1.1rem', margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🔥 활황 예상 지역 ({boomTowns.length})
        </h2>
        <div className="city-list" style={{ marginBottom: '2rem' }}>
          {boomTowns.length === 0
            ? <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>데이터 수집 후 표시됩니다.</p>
            : boomTowns.map(city => (
              <div key={city.id} className="city-card boomtown" onClick={() => handleCityClick(city)}>
                <div className="city-header" style={{ marginBottom: '0.3rem' }}>
                  <span className="city-name">{city.name}</span>
                  <span className="boom-badge">투자가망 1순위</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{city.subscription?.value}</p>
              </div>
            ))
          }
        </div>

        <h2 style={{ color: '#a0aec0', fontSize: '1rem', marginBottom: '1rem' }}>📊 전체 모니터링 ({otherTowns.length})</h2>
        <div className="city-list">
          {otherTowns.map(city => (
            <div key={city.id} className="city-card" onClick={() => handleCityClick(city)}>
              <div className="city-header" style={{ marginBottom: '0.3rem' }}>
                <span className="city-name">{city.name}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{city.subscription?.value}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* 도시 상세 모달 */}
      {selectedCity && (
        <div className="modal-overlay" onClick={() => { setSelectedCity(null); setDetailData(null); }}>
          <div className="modal-content" id="city-detail-content" onClick={e => e.stopPropagation()} style={{ width: '900px' }}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '2rem', color: 'var(--accent-color)', marginBottom: '0.3rem' }}>
                  {selectedCity.name} 심층 분석 리포트
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>{new Date().getFullYear()}년 {new Date().getMonth()+1}월 기준 최신 데이터</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="action-btn" onClick={() => exportPDF('city-detail-content', `${selectedCity.name}_Report`)}>
                  📄 {pdfLoading ? '생성중...' : 'PDF 저장'}
                </button>
                <button className="close-btn" onClick={() => { setSelectedCity(null); setDetailData(null); }}>✕</button>
              </div>
            </div>

            {detailLoading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--accent-color)' }}>
                <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                <p>정부 API에서 실시간 데이터를 수집하는 중... (최대 10초)</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '2rem' }}>

                {/* 뉴스 */}
                <div className="detail-section">
                  <h3 style={{ color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    📰 개발사업 및 주요 일자리 현황 (제목 클릭 시 기사 이동)
                  </h3>
                  {newsData.length > 0 ? newsData.map((n, i) => (
                    <a key={i} href={n.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: '0.8rem' }}>
                      <div style={{ padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', borderLeft: `4px solid ${n.importance === '최상' ? 'var(--danger)' : n.importance === '상' ? 'var(--accent-color)' : '#a0aec0'}`, cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '1rem', lineHeight: '1.4', flex: 1 }}>{n.title}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '1rem', marginTop: '2px' }}>{n.date}</span>
                        </div>
                        {n.description && (
                          <p style={{ fontSize: '0.85rem', color: '#a0aec0', margin: '0 0 0.4rem', lineHeight: '1.5' }}>{n.description}</p>
                        )}
                        <p style={{ fontSize: '0.75rem', color: n.importance === '최상' ? 'var(--danger)' : 'var(--accent-color)', margin: 0 }}>중요도: {n.importance} · 클릭하여 전체 기사 보기 →</p>
                      </div>
                    </a>
                  )) : <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>연관 개발 뉴스가 없습니다.</p>}
                </div>

                {/* 인구 */}
                <div className="detail-section">
                  <h3 style={{ color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    1. 수요 분석 - 최근 인구 및 세대수 변동
                  </h3>
                  {demandHistory.length > 0 && demandHistory.some(d => d.population > 0) ? (
                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer>
                        <LineChart data={demandHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="month" stroke="#a0aec0" tick={{ fontSize: 11 }} />
                          <YAxis yAxisId="left" stroke="#00f0ff" tickFormatter={v => (v/10000).toFixed(0)+'만'} domain={['dataMin - 1000', 'dataMax + 1000']} />
                          <YAxis yAxisId="right" orientation="right" stroke="#10b981" tickFormatter={v => (v/10000).toFixed(0)+'만'} domain={['dataMin - 500', 'dataMax + 500']} />
                          <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #333' }} formatter={v => v.toLocaleString()} />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="population" name="인구수(명)" stroke="#00f0ff" strokeWidth={3} dot={{ r: 4 }} />
                          <Line yAxisId="right" type="monotone" dataKey="households" name="세대수(가구)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>인구 데이터 수집 중 (API 권한 동기화 대기)</p>}
                </div>

                {/* 입주 수급 밸런스 - 연도별 막대그래프 */}
                <div className="detail-section">
                  <h3 style={{ color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    2. 입주 수급 밸런스 - 연도별 공급 세대수 (과거 3년 + 향후 3년)
                  </h3>
                  {(() => {
                    const data = selectedCity.yearlySupply || [];
                    const hasData = data.some(d => d.volume > 0);
                    return hasData ? (
                      <>
                        <div style={{ width: '100%', height: 280 }}>
                          <ResponsiveContainer>
                            <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis dataKey="year" stroke="#a0aec0" tickFormatter={v => v+'년'} />
                              <YAxis stroke="#a0aec0" tickFormatter={v => v.toLocaleString()} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #333' }}
                                formatter={(v, name) => [v.toLocaleString()+'세대', name]}
                                labelFormatter={label => label+'년'}
                              />
                              <Legend payload={[{ value: '과거 공급(준공)', type: 'square', color: '#eab308' }, { value: '미래 예정(입주)', type: 'square', color: '#00f0ff' }]} />
                              <Bar dataKey="volume" name="공급 세대수" radius={[6, 6, 0, 0]} label={{ position: 'top', fill: '#a0aec0', fontSize: 11, formatter: v => v > 0 ? v.toLocaleString() : '' }}>
                                {data.map((entry, i) => (
                                  <Cell key={i} fill={entry.type && entry.type.includes('미래') ? '#00f0ff' : '#eab308'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                          <div style={{ flex: 1, padding: '0.8rem', background: 'rgba(234,179,8,0.1)', borderRadius: '8px', border: '1px solid #eab308', textAlign: 'center' }}>
                            <p style={{ color: '#a0aec0', fontSize: '0.78rem', margin: '0 0 0.2rem' }}>과거 3년 합계</p>
                            <p style={{ color: '#eab308', fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>{data.filter(d => d.type?.includes('과거')).reduce((s, d) => s + d.volume, 0).toLocaleString()} 세대</p>
                          </div>
                          <div style={{ flex: 1, padding: '0.8rem', background: 'rgba(0,240,255,0.08)', borderRadius: '8px', border: '1px solid #00f0ff', textAlign: 'center' }}>
                            <p style={{ color: '#a0aec0', fontSize: '0.78rem', margin: '0 0 0.2rem' }}>향후 3년 예정</p>
                            <p style={{ color: '#00f0ff', fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>{data.filter(d => d.type?.includes('미래')).reduce((s, d) => s + d.volume, 0).toLocaleString()} 세대</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>입주 공급 데이터 수집 중입니다.</p>
                    );
                  })()}
                </div>

                {/* 미분양 */}
                <div className="detail-section">
                  <h3 style={{ color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    3. 재고 분석 - 미분양 누적 현황
                  </h3>
                  {supplyHistory.length > 0 && supplyHistory.some(d => d.preConstruction > 0) ? (
                    <>
                      <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer>
                          <BarChart data={supplyHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="month" stroke="#a0aec0" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#a0aec0" />
                            <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #333' }} formatter={(v, name) => [v.toLocaleString()+'세대', name]} />
                            <Legend />
                            <Bar dataKey="preConstruction" name="준공 전 미분양" stackId="a" fill="#eab308" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="postConstruction" name="준공 후 미분양(악성)" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      {/* 최신월 합계 요약 */}
                      {(() => {
                        const latest = supplyHistory[supplyHistory.length - 1];
                        const total = (latest.preConstruction || 0) + (latest.postConstruction || 0);
                        const post = latest.postConstruction || 0;
                        const pre = latest.preConstruction || 0;
                        return (
                          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, padding: '1rem', background: 'rgba(234,179,8,0.1)', borderRadius: '8px', border: '1px solid #eab308', textAlign: 'center' }}>
                              <p style={{ color: '#a0aec0', fontSize: '0.8rem', margin: '0 0 0.3rem' }}>준공 전 미분양</p>
                              <p style={{ color: '#eab308', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{pre.toLocaleString()} 세대</p>
                            </div>
                            <div style={{ flex: 1, padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid #ef4444', textAlign: 'center' }}>
                              <p style={{ color: '#a0aec0', fontSize: '0.8rem', margin: '0 0 0.3rem' }}>준공 후 미분양 (악성)</p>
                              <p style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{post.toLocaleString()} 세대</p>
                            </div>
                            <div style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid #555', textAlign: 'center' }}>
                              <p style={{ color: '#a0aec0', fontSize: '0.8rem', margin: '0 0 0.3rem' }}>총 미분양 합계</p>
                              <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{total.toLocaleString()} 세대</p>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  ) : <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>미분양 데이터 수집 중 (API 권한 동기화 대기)</p>}
                </div>

                {/* 청약 */}
                <div className="detail-section">
                  <h3 style={{ color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    4. 청약 시장 현황 - 최근 분양 프로젝트
                  </h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', textAlign: 'left', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <tr>
                        <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>단지명</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>공고일</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>1순위 경쟁률</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedCity.subscription?.tableData || []).map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                          <td style={{ padding: '1rem' }}>{row.projectName}</td>
                          <td style={{ padding: '1rem', color: '#a0aec0' }}>{row.date}</td>
                          <td style={{ padding: '1rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>{row.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 매매 가격 */}
                <div className="detail-section">
                  <h3 style={{ color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    5. 자산 가치 변화 - 아파트 매매 평균 실거래가 (만원)
                  </h3>
                  {priceHistory.length > 0 && priceHistory.some(d => d.saleIndex > 0) ? (
                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer>
                        <LineChart data={priceHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="month" stroke="#a0aec0" tick={{ fontSize: 11 }} />
                          <YAxis domain={['dataMin - 1000', 'dataMax + 1000']} stroke="#a0aec0" tickFormatter={v => (v/10000).toFixed(1)+'억'} />
                          <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #333' }} formatter={v => v.toLocaleString()+'만원'} />
                          <Legend />
                          <Line type="monotone" dataKey="saleIndex" name="매매 평균가(만원)" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="jeonseIndex" name="전세 추정가(만원)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>실거래가 데이터 수집 중 (API 권한 동기화 대기)</p>}
                </div>

                {/* AI 결론 */}
                <div style={{ background: 'rgba(0,240,255,0.04)', border: '1px solid var(--accent-color)', borderRadius: '12px', padding: '2rem' }}>
                  <h3 style={{ color: 'var(--accent-color)', marginBottom: '1rem', fontSize: '1.3rem' }}>🤖 BoomTown AI 최종 투자 결론</h3>
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#e2e8f0' }}>{selectedCity.aiSummary}</p>
                </div>

              </div>
            )}

            <div style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
              <p>BoomTown AI 알고리즘 자동 생성 리포트 | {new Date().toLocaleString('ko-KR')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
