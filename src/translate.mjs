export async function translateIssue(issue, { key, previousItems = [], request = fetch } = {}) {
  const cached = new Map(previousItems.map(item => [item.id, item]));
  const items = issue.items.map(item => {
    const old = cached.get(item.id);
    return old?.text === item.text && old.textZh ? { ...item, textZh: old.textZh } : { ...item };
  });
  const pending = items.filter(item => !item.textZh);
  if (!key || !pending.length) return { ...issue, items };
  try {
    const response = await request('https://translation.googleapis.com/language/translate/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key },
      body: JSON.stringify({ q: pending.map(item => item.text), target: 'zh-CN', format: 'text' }),
      signal: AbortSignal.timeout(60000)
    });
    if (!response.ok) throw new Error('translation_failed');
    const translations = (await response.json()).data?.translations;
    if (!Array.isArray(translations) || translations.length !== pending.length || translations.some(t => typeof t.translatedText !== 'string' || !t.translatedText.trim())) throw new Error('invalid_translation');
    translations.forEach((t, i) => { pending[i].textZh = t.translatedText; });
  } catch {
    // Never log response bodies or credentials. Publish source text when translation fails.
    console.warn('中文翻译暂时不可用，本期保留原文及已有译文。');
  }
  return { ...issue, items };
}
