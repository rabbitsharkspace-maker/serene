// On-device AI via Chrome's Built-in AI (Gemini Nano, Prompt API).
//
// Why this exists: the 急救包/First-Aid Kit matters most in exactly the moment you have no
// network — a real personal-safety emergency abroad. When the device is offline (or the server
// is unreachable), Chrome Built-in AI can still generate a scenario-tailored 000 call script
// entirely on-device, with zero data leaving the phone. This is pure progressive enhancement:
// if the API isn't present (most browsers today), callers fall back to server + static presets,
// so behaviour is unchanged where it's unsupported.
//
// The Prompt API surface has shifted across Chrome versions; we defensively support both the
// current global `LanguageModel` and the older `window.ai.languageModel`, and swallow all errors.

export type OnDeviceGuide = {
  scenarioTitle: string;
  englishTalk: string;
  chineseTalk: string;
  actions: string[];
  tisTips: string;
};

type LanguageModelLike = {
  availability?: () => Promise<string>;
  capabilities?: () => Promise<{ available: string }>;
  create: (opts?: any) => Promise<{ prompt: (input: string) => Promise<string>; destroy?: () => void }>;
};

function getLanguageModel(): LanguageModelLike | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  // Chrome 138+ exposes a top-level `LanguageModel`; earlier origin-trial builds used `window.ai`.
  if (w.LanguageModel && typeof w.LanguageModel.create === 'function') return w.LanguageModel;
  if (w.ai?.languageModel && typeof w.ai.languageModel.create === 'function') return w.ai.languageModel;
  return null;
}

// 'unavailable' | 'downloadable' | 'downloading' | 'available'
export async function onDeviceAIStatus(): Promise<string> {
  try {
    const lm = getLanguageModel();
    if (!lm) return 'unavailable';
    if (lm.availability) return await lm.availability();
    if (lm.capabilities) {
      const c = await lm.capabilities();
      // older API: 'readily' | 'after-download' | 'no'
      return c.available === 'readily' ? 'available'
        : c.available === 'after-download' ? 'downloadable'
        : 'unavailable';
    }
    return 'unavailable';
  } catch {
    return 'unavailable';
  }
}

// True only when a prompt can run right now without a network round-trip.
export async function isOnDeviceAIReady(): Promise<boolean> {
  return (await onDeviceAIStatus()) === 'available';
}

function stripToJson(text: string): any {
  const s = text.indexOf('{');
  const e = text.lastIndexOf('}');
  if (s !== -1 && e !== -1 && e > s) return JSON.parse(text.slice(s, e + 1));
  return JSON.parse(text);
}

export type EmergencyCtx = {
  countryName: string;
  emergencyNumber: string;
  langName: string;
  interpreterLang: string;
};

// Generate a scenario-tailored emergency plan fully on-device. Returns null if unavailable or
// if the model output can't be parsed, so the caller can fall back to server / static presets.
export async function generateEmergencyGuideOnDevice(
  scenario: string,
  ctx: EmergencyCtx,
): Promise<OnDeviceGuide | null> {
  try {
    const lm = getLanguageModel();
    if (!lm) return null;
    if ((await onDeviceAIStatus()) !== 'available') return null;

    const session = await lm.create({
      initialPrompts: [{
        role: 'system',
        content: `You are a calm life-safety expert helping a non-native-English international student in ${ctx.countryName} who may freeze up in English during a real emergency. Output ONLY compact raw JSON, no markdown.`,
      }],
    });

    const prompt = `Emergency situation: "${scenario}".
Produce a plan for calling ${ctx.emergencyNumber} (emergency number in ${ctx.countryName}).
Return ONLY this JSON shape:
{
  "scenarioTitle": "short title in ${ctx.langName}",
  "englishTalk": "one or two plain-English sentences to read aloud to the ${ctx.emergencyNumber} operator, stating the core crisis and including a location cue like 'I am at [address]'. KEEP IN ENGLISH.",
  "chineseTalk": "the meaning of englishTalk in ${ctx.langName}",
  "actions": ["3 highest-priority self-protection actions in ${ctx.langName}, survival-first"],
  "tisTips": "one or two sentences in ${ctx.langName} on requesting the free phone interpreter — include the exact cue phrase to say (e.g. '${ctx.interpreterLang}, please')"
}`;

    const raw = await session.prompt(prompt);
    session.destroy?.();

    const parsed = stripToJson(raw);
    if (!parsed?.englishTalk || !Array.isArray(parsed?.actions)) return null;
    return {
      scenarioTitle: String(parsed.scenarioTitle || scenario),
      englishTalk: String(parsed.englishTalk),
      chineseTalk: String(parsed.chineseTalk || ''),
      actions: parsed.actions.map((a: any) => String(a)).slice(0, 5),
      tisTips: String(parsed.tisTips || ''),
    };
  } catch {
    return null;
  }
}
