// Heuristics to detect sensitive page categories (banking, medical, government, etc.)

export interface ThreatAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  warnings: string[];
}

export function analyzePageRisk(url: string, title: string, textSnippet: string): ThreatAnalysis {
  const warnings: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  
  const normUrl = url.toLowerCase();
  const normTitle = title.toLowerCase();
  const normText = textSnippet.toLowerCase();

  // 1. Financial / Banking portals
  const isFinancial = 
    normUrl.includes('bank') || 
    normUrl.includes('checkout') || 
    normUrl.includes('payment') || 
    normUrl.includes('paypal') || 
    normUrl.includes('stripe') || 
    normUrl.includes('billing') ||
    /credit[- ]?card|transaction|invoice|bank account/i.test(normText);

  if (isFinancial) {
    riskLevel = 'high';
    warnings.push('Financial or payment portal indicators detected. Extracted context may contain billing or transactional logs.');
  }

  function maxRisk(r1: 'low' | 'medium' | 'high', r2: 'low' | 'medium' | 'high'): 'low' | 'medium' | 'high' {
    const levels = { low: 0, medium: 1, high: 2 };
    return levels[r1] >= levels[r2] ? r1 : r2;
  }

  // 2. Medical / Health portals
  const isMedical = 
    normUrl.includes('medical') || 
    normUrl.includes('patient') || 
    normUrl.includes('health') || 
    normUrl.includes('clinic') || 
    normUrl.includes('epic') || 
    /prescription|medical record|diagnosis|patient info/i.test(normText);

  if (isMedical) {
    riskLevel = maxRisk(riskLevel, 'medium');
    warnings.push('Medical or patient portal indicators detected. Extracted context may contain HIPAA-sensitive personal details.');
  }

  // 3. Government / Legal portals
  const isGovernment = 
    normUrl.includes('.gov') || 
    normUrl.includes('government') || 
    normUrl.includes('court') || 
    normUrl.includes('tax') || 
    normUrl.includes('passport');

  if (isGovernment) {
    riskLevel = maxRisk(riskLevel, 'medium');
    warnings.push('Government or tax portal indicators detected. Extracted context may contain official registration details.');
  }

  // 4. Authentication / Account portals
  const isAuth = 
    normUrl.includes('login') || 
    normUrl.includes('signin') || 
    normUrl.includes('oauth') || 
    normUrl.includes('settings/account') || 
    normTitle.includes('sign in') || 
    normTitle.includes('log in');

  if (isAuth) {
    riskLevel = maxRisk(riskLevel, 'high');
    warnings.push('Authentication or sign-in page detected. Be careful not to expose credentials or access tokens.');
  }

  // 5. Private Dashboard
  const isDashboard = 
    normUrl.includes('dashboard') || 
    normUrl.includes('console') || 
    normUrl.includes('admin') || 
    normTitle.includes('dashboard') || 
    /welcome back|my account|settings|analytics|metrics/i.test(normText);

  if (isDashboard && riskLevel === 'low') {
    riskLevel = 'medium';
    warnings.push('Private account dashboard detected. Extracted content may contain internal usage metrics.');
  }

  return {
    riskLevel,
    warnings
  };
}
