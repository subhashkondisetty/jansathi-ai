import { describe, it, expect } from 'vitest';
import { detectLanguage } from '../../src/utils/scriptDetect.js';

describe('scriptDetect - detectLanguage', () => {
  it('detects English for predominantly Latin text', () => {
    const text =
      'This is an official government notification regarding scholarship eligibility for students.';
    expect(detectLanguage(text)).toBe('en');
  });

  it('detects Telugu for Telugu script text', () => {
    const text = 'రైతు బంధు పథకం ద్వారా తెలంగాణ ప్రభుత్వం రైతులకు ఆర్థిక సహాయం అందిస్తుంది.';
    expect(detectLanguage(text)).toBe('te');
  });

  it('detects Hindi for Devanagari script text', () => {
    const text =
      'प्रधानमंत्री किसान सम्मान निधि योजना के तहत किसानों को वित्तीय सहायता प्रदान की जाती है।';
    expect(detectLanguage(text)).toBe('hi');
  });

  it('detects Tamil for Tamil script text', () => {
    const text =
      'முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் ஏழை எளிய மக்களுக்கு பயனளிக்கிறது.';
    expect(detectLanguage(text)).toBe('ta');
  });

  it('detects vernacular language when English terms/numbers are mixed in', () => {
    const mixedTelugu =
      'PM-KISAN పథకం ద్వారా ₹6000 సహాయం DBT ద్వారా రైతుల bank account లో జమ అవుతుంది.';
    expect(detectLanguage(mixedTelugu)).toBe('te');

    const mixedHindi =
      'PM Awas Yojana 2026 के अंतर्गत सभी नागरिकों को आवास subsidy प्रदान की जाएगी।';
    expect(detectLanguage(mixedHindi)).toBe('hi');
  });

  it('returns unknown for empty, short, or symbolic text', () => {
    expect(detectLanguage('')).toBe('unknown');
    expect(detectLanguage('12345 67890')).toBe('unknown');
    expect(detectLanguage('--- *** ---')).toBe('unknown');
    expect(detectLanguage('Hi')).toBe('unknown'); // Too short to determine reliably (< 10 letters)
  });
});
