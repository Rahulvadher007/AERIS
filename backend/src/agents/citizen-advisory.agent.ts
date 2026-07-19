import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { VulnerabilityService } from '../modules/vulnerability/vulnerability.service';

const LANG_BY_CITY: Record<string, string> = {
  Delhi: 'hi', Mumbai: 'hi', Kolkata: 'bn', Chennai: 'ta', Bengaluru: 'kn',
};

@Injectable()
export class CitizenAdvisoryAgent {
  private readonly logger = new Logger(CitizenAdvisoryAgent.name);
  constructor(private readonly prisma: PrismaService, private readonly vulnerability: VulnerabilityService) {}

  private riskLevel(aqi: number) {
    if (aqi > 300) return 'EXTREME';
    if (aqi > 200) return 'HIGH';
    if (aqi > 100) return 'MODERATE';
    return 'LOW';
  }

  private async callLLM(prompt: string): Promise<string | null> {
    const key = process.env.LLM_API_KEY;
    if (!key) return null;
    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + key, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const json = await res.json();
      return json.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch (e) {
      this.logger.warn(`LLM failed: ${e.message}`);
      return null;
    }
  }

  async generateAdvisories(zones: any[], avgCityAqi: Record<string, number>, avgCityForecast: Record<string, number>) {
    const out = [];
    for (const zone of zones) {
      const aqi = avgCityAqi[zone.city] ?? 120;
      const fAQI = avgCityForecast[zone.city] ?? 150;
      const lang = LANG_BY_CITY[zone.city] ?? 'en';
      const vuln = await this.vulnerability.computeScore(zone).catch(() => ({ score: 0.5 }));
      const risk = this.riskLevel(fAQI);

      const prompt = `Write a ${lang}-language public health advisory for ${zone.zoneName}, ${zone.city}. Forecast AQI ${fAQI} (${risk}). Vulnerability score ${vuln.score}. Include 2 actions.`;
      let message = await this.callLLM(prompt);
      if (!message) {
        message = `Advisory for ${zone.zoneName}: forecast AQI ${fAQI} (${risk}). Limit outdoor exposure; sensitive groups stay indoors.`;
      }

      const record = {
        zoneId: zone.id, city: zone.city, language: lang, riskLevel: risk,
        message, ttsScript: message, recommendedActions: ['Limit outdoor exertion', 'Use masks if outside'],
        forecastAQI: fAQI, vulnerabilityScore: vuln.score,
      };
      await this.prisma.advisory.create({ data: record }).catch(() => null);
      out.push(record);
    }
    return out;
  }
}
