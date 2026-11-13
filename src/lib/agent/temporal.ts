/**
 * Deterministic Temporal Grounding & Resolution Engine
 * Handles absolute/relative calendar conversions, temporal anchors,
 * and time-diff calculations.
 */

export interface TemporalResolution {
  phrase: string;
  type: 'relative_day' | 'exact_date' | 'relative_period' | 'since_marker';
  resolvedDate?: string; // YYYY-MM-DD
  resolvedDateObj?: Date;
  daysAgo?: number;
  description: string;
}

const MONTHS: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sept: 8, sep: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

const DAY_OF_WEEK: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

export class TemporalResolver {
  private baseDate: Date;

  constructor(overrideDate?: Date | string) {
    if (overrideDate) {
      this.baseDate = new Date(overrideDate);
    } else if (process.env.SIMULATED_CURRENT_DATE) {
      this.baseDate = new Date(process.env.SIMULATED_CURRENT_DATE);
    } else {
      this.baseDate = new Date();
    }
  }

  public getBaseDate(): Date {
    return new Date(this.baseDate);
  }

  public formatCurrentDateTime(): string {
    const d = this.baseDate;
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  public toISODate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * Scans text for temporal references (e.g. "on Monday", "3 November", "last Tuesday")
   */
  public extractTemporalAnchors(text: string): TemporalResolution[] {
    const results: TemporalResolution[] = [];
    const lower = text.toLowerCase();

    // 1. Exact dates: "3 November", "November 3", "3rd of November"
    const exactDateRegex = /\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)\b|\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?\b/gi;
    let match;

    while ((match = exactDateRegex.exec(lower)) !== null) {
      let day = 1;
      let monthStr = '';
      if (match[1] && match[2]) {
        day = parseInt(match[1], 10);
        monthStr = match[2];
      } else if (match[3] && match[4]) {
        monthStr = match[3];
        day = parseInt(match[4], 10);
      }

      const monthIndex = MONTHS[monthStr];
      if (monthIndex !== undefined) {
        const year = this.baseDate.getFullYear();
        const candidate = new Date(year, monthIndex, day);
        // If candidate date is ahead of base date by more than a week, it likely refers to previous year
        if (candidate.getTime() > this.baseDate.getTime() + 7 * 86400000) {
          candidate.setFullYear(year - 1);
        }

        const iso = this.toISODate(candidate);
        const diffMs = this.baseDate.getTime() - candidate.getTime();
        const daysAgo = Math.round(diffMs / (1000 * 60 * 60 * 24));

        results.push({
          phrase: match[0],
          type: 'exact_date',
          resolvedDate: iso,
          resolvedDateObj: candidate,
          daysAgo,
          description: `${candidate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} (${daysAgo} days ago)`,
        });
      }
    }

    // 2. Named weekdays: "On Monday", "last Tuesday", "this Wednesday"
    const weekdayRegex = /\b(last|this|on|past)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi;
    while ((match = weekdayRegex.exec(lower)) !== null) {
      const modifier = (match[1] || 'on').trim();
      const dayName = match[2].trim();
      const targetDayIndex = DAY_OF_WEEK[dayName];

      if (targetDayIndex !== undefined) {
        const candidate = new Date(this.baseDate);
        const currentDayIndex = candidate.getDay();

        let diff = (currentDayIndex - targetDayIndex + 7) % 7;
        if (diff === 0) {
          // If the phrase is "last Tuesday" or just "Tuesday" and today is Tuesday,
          // it almost always means the previous week's Tuesday (7 days ago).
          diff = 7;
        } else if (modifier === 'last' && diff < 7) {
          // "last Tuesday" when today is Friday could mean 3 days ago or 10 days ago.
          // In standard English convention, if diff <= 3, "last Tuesday" often refers to the previous week (diff + 7).
          if (diff <= 3) {
            diff += 7;
          }
        }

        candidate.setDate(candidate.getDate() - diff);
        const iso = this.toISODate(candidate);
        const diffMs = this.baseDate.getTime() - candidate.getTime();
        const daysAgo = Math.round(diffMs / (1000 * 60 * 60 * 24));

        results.push({
          phrase: match[0],
          type: 'relative_day',
          resolvedDate: iso,
          resolvedDateObj: candidate,
          daysAgo,
          description: `${candidate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} (${daysAgo} days ago)`,
        });
      }
    }

    // 3. Temporal delta markers: "since then", "changed since", "still correct today"
    if (/\b(since then|changed since|changed pricing|shipped something big since|still correct today|has anything changed)\b/i.test(lower)) {
      results.push({
        phrase: 'since then / change detection',
        type: 'since_marker',
        description: `Temporal delta requested relative to previous baseline facts up to ${this.formatCurrentDateTime()}`,
      });
    }

    return results;
  }

  /**
   * Formats a human-readable temporal prompt header
   */
  public getSystemTemporalContext(): string {
    return `Current Absolute Time: ${this.formatCurrentDateTime()} (ISO: ${this.toISODate(this.baseDate)})`;
  }
}
