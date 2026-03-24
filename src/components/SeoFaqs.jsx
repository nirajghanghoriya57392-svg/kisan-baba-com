import React from 'react';

export function getFaqSchema(crop, t) {
  const cropName = t(crop.nameKey);
  const totalSetup = (crop.infraCost || 0) + ((crop.saplingCount || 0) * (crop.saplingPrice || 0));
  const setup = totalSetup.toLocaleString('en-IN');
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `How much does it cost to set up 1 acre of ${cropName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `According to NABARD guidelines and Indian market averages, setting up 1 acre of ${cropName} costs approximately ₹${setup}. This includes initial infrastructure, drip irrigation, and saplings. Government subsidies can reduce this out-of-pocket expense.`
        }
      },
      {
        "@type": "Question",
        "name": `What is the expected yield for ${cropName} per acre?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `A mature 1-acre commercial farm of ${cropName} typically yields around ${crop.defaultYield.toLocaleString('en-IN')} kg per year, provided standard agricultural practices and fertigation schedules are maintained.`
        }
      },
      {
        "@type": "Question",
        "name": `Is ${cropName} farming profitable in India?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, highly profitable. With a 3-year average Mandi price of ₹${crop.defaultPrice}/kg and a mature yield of ${crop.defaultYield} kg, commercial farmers can see substantial ROI by Year 3 after recovering their initial Capital Expenditure.`
        }
      },
      {
        "@type": "Question",
        "name": `Can I get a bank loan for ${cropName} cultivation?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Absolutely. Most Indian banks provide term loans for high-value crops like ${cropName} under NABARD refinance schemes. Interest rates typically hover between 8% to 10%, and tenures range from 5 to 7 years depending on the crop gestation period.`
        }
      },
      {
        "@type": "Question",
        "name": `How does intercropping help with ${cropName} farming?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Because ${cropName} requires time to reach full maturity, farmers often plant short-cycle crops like marigold, ginger, or leafy greens in the empty spaces during Year 1 and Year 2. This generates immediate cash flow to cover the initial running expenses before the main crop matures.`
        }
      }
    ]
  };
}

export default function SeoFaqs({ crop, t }) {
  const schema = getFaqSchema(crop, t);
  
  return (
    <div className="seo-faqs glass-container" style={{marginTop: '40px', padding: '40px', textAlign: 'left'}}>
      <h2 style={{color: 'var(--soil-brown)', marginBottom: '25px'}}>Frequently Asked Questions about {t(crop.nameKey)} Farming</h2>
      {schema.mainEntity.map((faq, index) => (
        <div key={index} style={{marginBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '15px'}}>
          <h3 style={{fontSize: '1.1rem', color: 'var(--terra-cotta)', margin: '0 0 10px 0'}}>Q: {faq.name}</h3>
          <p style={{margin: 0, color: 'var(--text-primary)', lineHeight: '1.6', fontSize: '0.95rem'}}>{faq.acceptedAnswer.text}</p>
        </div>
      ))}
    </div>
  );
}
