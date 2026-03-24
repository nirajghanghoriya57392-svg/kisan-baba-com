import React from 'react';

export function getArticleSchema(crop, t) {
  const cropName = t(crop.nameKey);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `The Ultimate Guide to ${cropName} Commercial Farming Profitability`,
    "description": `An in-depth, data-driven analysis of ${cropName} commercial farming, covering setup costs, yield projections, and expected profit margins based on Indian agricultural standards.`,
    "author": {
      "@type": "Person",
      "name": "Niraj"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SlayCalculator",
      "logo": {
        "@type": "ImageObject",
        "url": "https://slaycalculator.com/logo.png"
      }
    },
    "datePublished": "2026-03-20",
    "dateModified": new Date().toISOString().split('T')[0]
  };
}

export default function SeoArticle({ crop, t }) {
  const cropName = t(crop.nameKey);
  const totalSetup = (crop.infraCost || 0) + ((crop.saplingCount || 0) * (crop.saplingPrice || 0));
  
  // Interpolation Variables globally injected across the article
  const articleVars = {
      cropName: cropName,
      setup: totalSetup.toLocaleString('en-IN'),
      opex: crop.defaultOpEx.toLocaleString('en-IN'),
      yield: crop.defaultYield.toLocaleString('en-IN'),
      price: crop.defaultPrice
  };

  return (
    <article className="seo-article" style={{marginTop: '50px', padding: '50px', background: '#ffffff', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.08)', textAlign: 'left', lineHeight: '1.8', color: '#334155', fontFamily: 'Inter, system-ui, sans-serif'}}>
      
      <header style={{borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '30px'}}>
        <h2 style={{color: '#0f172a', fontSize: '2.4rem', fontWeight: 800, margin: '0 0 15px 0', lineHeight: 1.2}}>{t('seoArticle.title', articleVars)}</h2>
        <p style={{fontSize: '1.1rem', color: '#64748b', margin: 0}}>{t('seoArticle.subtitle', articleVars)}</p>
      </header>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px'}}>
          
          {/* Left Column: Image + Intro + H1 */}
          <div>
              <img src={`/images/seo_${crop.id}_1.png`} alt={`Commercial ${cropName} farming modern setup`} title={`High density ${cropName} plantation`} style={{width: '100%', display: 'block', height: 'auto', borderRadius: '16px', marginBottom: '30px', boxShadow: '0 15px 40px rgba(0,0,0,0.12)'}} />
              
              {/* Featured Snippet / TL;DR Box for Google SEO */}
              <div style={{background: '#f8fafc', borderLeft: '5px solid var(--terra-cotta)', padding: '25px', borderRadius: '0 16px 16px 0', marginBottom: '30px'}}>
                  <h3 style={{marginTop: 0, color: '#0f172a', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px'}}>
                     <span style={{fontSize: '1.5rem'}}>💡</span> {t('seoArticle.takeawaysTitle', articleVars)}
                  </h3>
                  <ul style={{margin: 0, paddingLeft: '20px', color: '#475569', fontWeight: 500}}>
                      <li style={{marginBottom: '8px'}} dangerouslySetInnerHTML={{ __html: t('seoArticle.takeaways1', articleVars) }} />
                      <li style={{marginBottom: '8px'}} dangerouslySetInnerHTML={{ __html: t('seoArticle.takeaways2', articleVars) }} />
                      <li style={{marginBottom: '8px'}} dangerouslySetInnerHTML={{ __html: t('seoArticle.takeaways3', articleVars) }} />
                      <li dangerouslySetInnerHTML={{ __html: t('seoArticle.takeaways4', articleVars) }} />
                  </ul>
              </div>

              <p style={{fontSize: '1.1rem'}} dangerouslySetInnerHTML={{ __html: t('seoArticle.intro', articleVars) }} />
              
              <h3 style={{color: 'var(--forest-green)', marginTop: '40px', fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px'}}>{t('seoArticle.h1', articleVars)}</h3>
              <p dangerouslySetInnerHTML={{ __html: t('seoArticle.p1a', articleVars) }} />
              <p dangerouslySetInnerHTML={{ __html: t('seoArticle.p1b', articleVars) }} />
          </div>

          {/* Right Column: Table + Remaining Sections */}
          <div>
              {/* SEO Data Table */}
              <div style={{overflowX: 'auto', margin: '0 0 30px 0'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
                      <thead>
                          <tr style={{background: 'var(--terra-cotta)', color: 'white'}}>
                              <th style={{padding: '15px 20px', fontWeight: 600}}>{t('seoArticle.tableTitle1')}</th>
                              <th style={{padding: '15px 20px', fontWeight: 600}}>{t('seoArticle.tableTitle2')}</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr style={{background: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>
                              <td style={{padding: '15px 20px', fontWeight: 500, color: '#334155'}}>{t('seoArticle.tableRow1')}</td>
                              <td style={{padding: '15px 20px', color: '#0f172a', fontWeight: 600}}>₹ {totalSetup.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr style={{background: '#ffffff', borderBottom: '1px solid #e2e8f0'}}>
                              <td style={{padding: '15px 20px', fontWeight: 500, color: '#334155'}}>{t('seoArticle.tableRow2')}</td>
                              <td style={{padding: '15px 20px', color: '#0f172a', fontWeight: 600}}>₹ {crop.defaultOpEx.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr style={{background: '#f8fafc'}}>
                              <td style={{padding: '15px 20px', fontWeight: 500, color: '#334155'}}>{t('seoArticle.tableRow3')}</td>
                              <td style={{padding: '15px 20px', color: 'var(--forest-green)', fontWeight: 800}}>₹ {(crop.defaultYield * crop.defaultPrice).toLocaleString('en-IN')}</td>
                          </tr>
                      </tbody>
                  </table>
              </div>

              <h3 style={{color: 'var(--forest-green)', marginTop: '20px', fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px'}}>{t('seoArticle.h2', articleVars)}</h3>
              <p dangerouslySetInnerHTML={{ __html: t('seoArticle.p2a', articleVars) }} />
              <p dangerouslySetInnerHTML={{ __html: t('seoArticle.p2b', articleVars) }} />

              <h3 style={{color: 'var(--forest-green)', marginTop: '40px', fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px'}}>{t('seoArticle.h3', articleVars)}</h3>
              <p dangerouslySetInnerHTML={{ __html: t('seoArticle.p3a', articleVars) }} />
              <p dangerouslySetInnerHTML={{ __html: t('seoArticle.p3b', articleVars) }} />

              <h3 style={{color: 'var(--forest-green)', marginTop: '40px', fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px'}}>{t('seoArticle.h4', articleVars)}</h3>
              <p dangerouslySetInnerHTML={{ __html: t('seoArticle.p4a', articleVars) }} />
              <p dangerouslySetInnerHTML={{ __html: t('seoArticle.p4b', articleVars) }} />

              <h3 style={{color: 'var(--forest-green)', marginTop: '40px', fontSize: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px'}}>{t('seoArticle.h5', articleVars)}</h3>
              <p dangerouslySetInnerHTML={{ __html: t('seoArticle.p5a', articleVars) }} />
              <p dangerouslySetInnerHTML={{ __html: t('seoArticle.p5b', articleVars) }} />
          </div>
      </div>

      <div style={{background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: '30px', borderRadius: '16px', marginTop: '50px', border: '1px solid #fbbf24'}}>
          <h3 style={{color: '#92400e', margin: '0 0 10px 0', fontSize: '1.4rem'}}>{t('seoArticle.conclusionTitle', articleVars)}</h3>
          <p style={{color: '#b45309', margin: 0, fontWeight: 500, fontSize: '1.05rem', lineHeight: 1.6}} dangerouslySetInnerHTML={{ __html: t('seoArticle.conclusionText', articleVars) }} />
      </div>
    </article>
  );
}
