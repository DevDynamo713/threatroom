import { describe, it, expect } from 'vitest';
import { scoreToSeverity, severityColor, formatThreat } from './threat';
describe('threat', () => {
  it('score 10 → critical', () => { expect(scoreToSeverity(10)).toBe('critical'); });
  it('score 7 → high', () => { expect(scoreToSeverity(7)).toBe('high'); });
  it('score 5 → medium', () => { expect(scoreToSeverity(5)).toBe('medium'); });
  it('score 2 → low', () => { expect(scoreToSeverity(2)).toBe('low'); });
  it('severityColor critical is red', () => { expect(severityColor('critical')).toBe('#f87171'); });
  it('severityColor low is blue', () => { expect(severityColor('low')).toBe('#60a5fa'); });
  it('formats with mitre', () => {
    const t = { id: '1', title: 'Brute force', source: 'ssh', severity: 'high', mitreId: 'T1110', acknowledged: false, timestamp: '2026-10-19T12:00:00Z' };
    expect(formatThreat(t)).toBe('[HIGH] Brute force from ssh (T1110) ack:false');
  });
  it('formats without mitre', () => {
    const t = { id: '2', title: 'Port scan', source: 'firewall', severity: 'low', acknowledged: true, timestamp: '2026-10-19T12:00:00Z' };
    expect(formatThreat(t)).toBe('[LOW] Port scan from firewall ack:true');
  });
});