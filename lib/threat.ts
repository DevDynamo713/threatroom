export type Severity = 'low' | 'medium' | 'high' | 'critical';
export interface Threat { id: string; title: string; source: string; severity: Severity; mitreId?: string; acknowledged: boolean; timestamp: string }
export function scoreToSeverity(score: number): Severity {
  if (score >= 9) return 'critical';
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}
export function severityColor(s: Severity): string {
  return s === 'critical' ? '#f87171' : s === 'high' ? '#fb923c' : s === 'medium' ? '#fbbf24' : '#60a5fa';
}
export function formatThreat(t: Threat): string { return `[${t.severity.toUpperCase()}] ${t.title} from ${t.source}${t.mitreId ? ` (${t.mitreId})` : ''} ack:${t.acknowledged}`; }