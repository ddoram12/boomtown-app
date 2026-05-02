import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import './index.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('전국 40개 도시 실시간 데이터를 수집하고 있습니다...');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingMsg('정부 공공 API에서 실시간 데이터를 수집 중입니다... (최초 1회 약 60초 소요)');
        const response = await fetch('/api/cities');
        if (response.ok) {
          const data = await response.json();
          setCities(data);
        } else {
          // fallback: 로컬 json 시도
          const fallback = await fetch('/boomtown_data.json');
          if (fallback.ok) setCities(await fallback.json());
          else setCities([]);
        }
      } catch (err) {
        console.error('Data fetch error:', err);
        // fallback: 로컬 json 시도
        try {
          const fallback = await fetch('/boomtown_data.json');
          if (fallback.ok) setCities(await fallback.json());
        } catch (_) {}
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (cities.length === 0 || !window.kakao || !window.kakao.maps) return;

    window.kakao.maps.load(() => {
      const container = document.getElementById('kakao-map');
      if (!container) return;
      
      const options = {
        center: new window.kakao.maps.LatLng(36.1, 127.5),
        level: 13
      };
      
      const map = new window.kakao.maps.Map(container, options);

      cities.forEach(city => {
        if(!city.lat || !city.lng) return;
        
        const content = document.createElement('div');
        content.className = city.isBoomTown ? 'marker-boom' : 'marker-normal';
        content.innerHTML = `<div class="marker-label">${city.name}</div>`;
        content.onclick = () => setSelectedCity(city);

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(city.lat, city.lng),
          content: content,
          yAnchor: 1
        });

        customOverlay.setMap(map);
      });
    });
  }, [cities]);

  const exportPDF = async (elementId, filename) => {
    setPdfLoading(true);
    const element = document.getElementById(elementId);
    if (!element) {
      setPdfLoading(false);
      return;
    }

    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;
    const originalOverflowY = element.style.overflowY;
    element.style.height = 'auto';
    element.style.overflow = 'visible';
    element.style.overflowY = 'visible';

    try {
      const canvas = await html2canvas(element, { 
        scale: 2,
        backgroundColor: '#0b0f19',
        useCORS: true,
        windowHeight: element.scrollHeight
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error("PDF generation failed", error);
      alert('PDF 생성에 실패했습니다.');
    } finally {
      element.style.height = originalHeight;
      element.style.overflow = originalOverflow;
      element.style.overflowY = originalOverflowY;
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <h2 style={{ color: 'var(--accent-color)', letterSpacing: '2px' }}>🔍 LIVE DATA PROCESSING...</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: '400px', textAlign: 'center', lineHeight: '1.6' }}>{loadingMsg}</p>
        <p style={{ color: '#555', marginTop: '1rem', fontSize: '0.85rem' }}>정부 공공 API를 통해 100% 실제 데이터만을 수집합니다.</p>
      </div>
    );
  }

  const boomTowns = cities.filter(c => c.isBoomTown);
  const otherTowns = cities.filter(c => !c.isBoomTown);

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      
      {/* 1. 왼쪽: 전국 지도 영역 (Absolute 제어 방식) */}
      <main className="map-section" style={{ position: 'relative', flex: 1, height: '100%' }}>
        <div id="kakao-map" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}></div>
        <div style={{ position: 'absolute', top: 30, left: 30, zIndex: 10, background: 'rgba(0,0,0,0.7)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--accent-color)' }}>KOREA REAL ESTATE AI</h2>
          <p style={{ color: 'var(--text-muted)' }}>전국 10만 이상 도시 40개 실시간 분석 맵</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="marker-boom" style={{ width: '12px', height: '12px', display: 'inline-block', position: 'static', animation: 'none' }}></span>
              <span style={{ fontSize: '0.85rem', color: '#fff' }}>활황 예상 지역</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="marker-normal" style={{ width: '12px', height: '12px', display: 'inline-block', position: 'static' }}></span>
              <span style={{ fontSize: '0.85rem', color: '#fff' }}>일반 관망 지역</span>
            </div>
          </div>
        </div>
      </main>

      {/* 2. 오른쪽: 대시보드 영역 (독립 스크롤) */}
      <aside className="dashboard-section" id="dashboard-content" style={{ width: '550px', height: '100%', overflowY: 'auto' }}>
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="dashboard-title">BOOMTOWN</h1>
            <p className="dashboard-subtitle">분위기 좋은 지역 TOP 및 전체 목록</p>
          </div>
          <button className="action-btn" onClick={() => exportPDF('dashboard-content', 'BoomTown_Dashboard')}>
            📄 PDF 출력
          </button>
        </div>

        {/* 활황 예상 지역 리스트 */}
        <h2 style={{ color: 'var(--accent-color)', fontSize: '1.2rem', marginBottom: '1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🔥 분위기 좋은 활황 예상 지역 ({boomTowns.length})
        </h2>
        <div className="city-list" style={{ marginBottom: '2rem' }}>
          {boomTowns.map(city => (
            <div key={city.id} className="city-card boomtown" onClick={() => setSelectedCity(city)}>
              <div className="city-header" style={{ marginBottom: '0.5rem' }}>
                <span className="city-name">{city.name}</span>
                <span className="boom-badge">투자가망 1순위</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{city.demand.value} / {city.supply.value}</p>
            </div>
          ))}
        </div>

        {/* 전체 관망 지역 리스트 */}
        <h2 style={{ color: '#a0aec0', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📊 전체 모니터링 지역 ({otherTowns.length})
        </h2>
        <div className="city-list">
          {otherTowns.map(city => (
            <div key={city.id} className="city-card" onClick={() => setSelectedCity(city)}>
              <div className="city-header" style={{ marginBottom: '0.5rem' }}>
                <span className="city-name">{city.name}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{city.demand.value} / {city.supply.value}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* 3. 도시 세부 내역 모달 */}
      {selectedCity && (
        <div className="modal-overlay" onClick={() => setSelectedCity(null)}>
          <div className="modal-content" id="city-detail-content" onClick={e => e.stopPropagation()} style={{ width: '900px' }}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '2.5rem', color: selectedCity.isBoomTown ? 'var(--accent-color)' : '#fff', marginBottom: '0.5rem' }}>
                  {selectedCity.name} 심층 분석 리포트
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                  {new Date().getFullYear()}년 {new Date().getMonth()+1}월 기준 최신 데이터
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="action-btn" onClick={() => exportPDF('city-detail-content', `${selectedCity.name}_Report`)}>
                  📄 {pdfLoading ? '생성 중...' : '리포트 PDF 저장'}
                </button>
                <button className="close-btn" onClick={() => setSelectedCity(null)}>✕</button>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '2rem' }}>
              
              {/* 호재 및 뉴스 섹션 (링크 포함) */}
              <div className="detail-section">
                <h3 style={{ color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📰 핵심 부동산 개발 및 호재 뉴스 (제목 클릭 시 기사 이동)
                </h3>
                {selectedCity.news.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {selectedCity.news.map((n, i) => (
                      <a key={i} href={n.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `4px solid ${n.importance === '최상' ? 'var(--danger)' : n.importance === '상' ? 'var(--accent-color)' : '#a0aec0'}`, transition: 'all 0.2s', cursor: 'pointer' }}
                             onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                             onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#fff' }}>{n.title}</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{n.date}</span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#a0aec0', margin: 0 }}>중요도: <span style={{ color: n.importance === '최상' ? 'var(--danger)' : '#fff' }}>{n.importance}</span></p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>최근 등록된 확실한 연관 뉴스가 없습니다.</p>
                )}
              </div>

              {/* 1. 인구/세대수 */}
              <div className="detail-section">
                <h3 style={{ color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  1. 수요 분석 (최근 1개년 인구 및 세대수 변동)
                </h3>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart data={selectedCity.demand.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="month" stroke="#a0aec0" tick={{fontSize: 12}} />
                      <YAxis yAxisId="left" stroke="#00f0ff" tickFormatter={(val) => (val/10000).toFixed(0)+'만'} domain={['dataMin - 1000', 'dataMax + 1000']} />
                      <YAxis yAxisId="right" orientation="right" stroke="#10b981" tickFormatter={(val) => (val/10000).toFixed(0)+'만'} domain={['dataMin - 1000', 'dataMax + 1000']} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #333' }} labelStyle={{ color: '#fff' }} formatter={(val) => val.toLocaleString() + ' 명/가구'} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="population" name="총 인구수 (명)" stroke="#00f0ff" strokeWidth={3} dot={{r: 4}} />
                      <Line yAxisId="right" type="monotone" dataKey="households" name="총 세대수 (가구)" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2. 공급 현황 (막대 그래프로 변경) */}
              <div className="detail-section">
                <h3 style={{ color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  2. 물량 분석 (최근 3개년 공급 및 향후 3개년 입주 예정물량)
                </h3>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={selectedCity.yearlySupply}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="year" stroke="#a0aec0" tickFormatter={v => v+'년'} />
                      <YAxis stroke="#a0aec0" />
                      <Tooltip cursor={{fill: 'rgba(255,255,255,0.1)'}} contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #333' }} formatter={val => val.toLocaleString() + '세대'} />
                      <Legend payload={[
                        { value: '과거 공급(준공)', type: 'square', color: '#eab308' }, 
                        { value: '미래 입주예정', type: 'square', color: '#00f0ff' }
                      ]} />
                      <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                        {selectedCity.yearlySupply.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.type.includes('미래') ? '#00f0ff' : '#eab308'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 3. 미분양 (스택형 BarChart) */}
              <div className="detail-section">
                <h3 style={{ color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  3. 재고 분석 (최근 1개년 미분양 누적 현황)
                </h3>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={selectedCity.supply.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="month" stroke="#a0aec0" tick={{fontSize: 12}} />
                      <YAxis stroke="#a0aec0" />
                      <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #333' }} />
                      <Legend />
                      <Bar dataKey="preConstruction" name="준공 전 일반 미분양" stackId="a" fill="#eab308" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="postConstruction" name="준공 후 악성 미분양" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 4. 청약 시장 현황 */}
              <div className="detail-section">
                <h3 style={{ color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  4. 시장 흥행 현황 (최근 주요 분양 프로젝트 청약 결과)
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', textAlign: 'left', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <tr>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>단지(프로젝트)명</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>공고일자</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>전체 평형 평균 1순위 경쟁률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCity.subscription.tableData.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                        <td style={{ padding: '1rem' }}>{row.projectName}</td>
                        <td style={{ padding: '1rem', color: '#a0aec0' }}>{row.date}</td>
                        <td style={{ padding: '1rem', color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '1.1rem' }}>{row.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 5. 가격 지수 */}
              <div className="detail-section">
                <h3 style={{ color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  5. 자산 가치 변화 (최근 1개년 매매 및 전세 가격 지수)
                </h3>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart data={selectedCity.price.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="month" stroke="#a0aec0" tick={{fontSize: 12}} />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#a0aec0" />
                      <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #333' }} />
                      <Legend />
                      <Line type="monotone" dataKey="saleIndex" name="매매 가격 지수" stroke="#ec4899" strokeWidth={3} dot={{r: 4}} />
                      <Line type="monotone" dataKey="jeonseIndex" name="전세 가격 지수" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI 최종 결론 요약 */}
              <div className="ai-summary" style={{
                background: selectedCity.isBoomTown ? 'rgba(0, 240, 255, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${selectedCity.isBoomTown ? 'var(--accent-color)' : '#444'}`,
                borderRadius: '12px',
                padding: '2rem',
                marginTop: '1rem'
              }}>
                <h3 style={{ color: selectedCity.isBoomTown ? 'var(--accent-color)' : '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem' }}>
                  🤖 BoomTown AI 최종 투자 결론
                </h3>
                <p style={{ fontSize: '1.15rem', lineHeight: '1.7', color: '#e2e8f0' }}>
                  {selectedCity.aiSummary}
                </p>
              </div>

            </div>
            
            <div style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
              <p>본 프리미엄 리포트는 BoomTown AI 알고리즘에 의해 실시간으로 자동 생성되었습니다.</p>
              <p style={{ marginTop: '0.3rem' }}>생성 일시: {new Date().toLocaleString('ko-KR')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
