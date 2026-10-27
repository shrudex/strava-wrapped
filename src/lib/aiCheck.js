const nums = s => (String(s).match(/\d[\d,]*(?:\.\d+)?/g) || []).map(n => n.replace(/,/g, ''));

/** True only if every number in `text` appears in `facts` and the text has no links. */
export function isGrounded(text, facts) {
  if (!text || text.length > 800 || /https?:|www\./i.test(text)) return false;
  const ok = new Set(nums(facts.join(' ')));
  return nums(text).every(n => ok.has(n));
}
