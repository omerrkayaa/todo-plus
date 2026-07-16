(function registerQuickAddParser(global) {
  const WEEKDAYS = {
    pazartesi: 1,
    sali: 2,
    "salı": 2,
    carsamba: 3,
    "çarsamba": 3,
    "carşamba": 3,
    "çarşamba": 3,
    persembe: 4,
    "perşembe": 4,
    cuma: 5,
    cumartesi: 6,
    pazar: 0,
  };

  const PRIORITY_WORDS = {
    dusuk: "dusuk",
    "düşük": "dusuk",
    orta: "orta",
    yuksek: "yuksek",
    "yüksek": "yuksek",
  };

  const WEEKDAY_PATTERN = "pazartesi|sal[ıi]|[çc]ar[şs]amba|per[şs]embe|cuma|cumartesi|pazar";

  // JS's \b is ASCII-only even with the `u` flag, so it silently fails at the edge of any
  // Turkish word ending/starting with ı, ğ, ş, ç, ö, ü (e.g. "salı", "çarşamba"). Unicode
  // letter/number lookaround gives a boundary check that actually works for Turkish text.
  function turkishWord(pattern) {
    return `(?<![\\p{L}\\p{N}])(${pattern})(?![\\p{L}\\p{N}])`;
  }

  const REPEAT_PHRASES = [
    { regex: new RegExp(turkishWord("her\\s+g[üu]n"), "iu"), value: "daily" },
    { regex: new RegExp(turkishWord("her\\s+hafta"), "iu"), value: "weekly" },
    { regex: new RegExp(turkishWord("her\\s+ay"), "iu"), value: "monthly" },
  ];

  function toISODate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
  }

  function addMonths(date, amount) {
    const next = new Date(date);
    next.setMonth(next.getMonth() + amount);
    return next;
  }

  function resolveWeekday(base, targetDay) {
    const currentDay = base.getDay();
    let delta = targetDay - currentDay;
    if (delta <= 0) delta += 7;
    return addDays(base, delta);
  }

  // Extracts and removes the first regex match from state.text, calling onMatch(match) to
  // compute the parsed value. Leaves text untouched when nothing matches, or onMatch
  // signals the match should be ignored by returning null/undefined.
  function extract(state, regex, type, onMatch) {
    const match = regex.exec(state.text);
    if (!match) return null;
    const value = onMatch(match);
    if (value === undefined || value === null) return null;
    state.matches.push({ type, raw: match[0] });
    state.text = state.text.slice(0, match.index) + state.text.slice(match.index + match[0].length);
    return value;
  }

  function parseQuickAddText(rawText, referenceDate) {
    const state = { text: String(rawText || ""), matches: [] };

    const priority = extract(
      state,
      new RegExp(`!\\s*${turkishWord("dusuk|düşük|orta|yuksek|yüksek")}`, "iu"),
      "priority",
      (match) => PRIORITY_WORDS[match[1].toLocaleLowerCase("tr-TR")] || null,
    );

    let repeatInterval = null;
    for (const phrase of REPEAT_PHRASES) {
      const found = extract(state, phrase.regex, "repeat", () => phrase.value);
      if (found) {
        repeatInterval = found;
        break;
      }
    }

    const projectName = extract(state, /#(\S+)/u, "project", (match) => match[1]);

    const tags = [];
    state.text = state.text.replace(/@(\S+)/gu, (full, word) => {
      tags.push(word);
      state.matches.push({ type: "tag", raw: full });
      return "";
    });

    const dueDate =
      extract(state, new RegExp(turkishWord("gelecek\\s+hafta"), "iu"), "date", () => toISODate(addDays(referenceDate, 7))) ||
      extract(state, new RegExp(turkishWord("gelecek\\s+ay"), "iu"), "date", () => toISODate(addMonths(referenceDate, 1))) ||
      extract(state, new RegExp(turkishWord("yar[ıi]n"), "iu"), "date", () => toISODate(addDays(referenceDate, 1))) ||
      extract(state, new RegExp(turkishWord("bug[üu]n"), "iu"), "date", () => toISODate(referenceDate)) ||
      extract(state, new RegExp(turkishWord(WEEKDAY_PATTERN), "iu"), "date", (match) => {
        const targetDay = WEEKDAYS[match[1].toLocaleLowerCase("tr-TR")];
        if (targetDay === undefined) return null;
        return toISODate(resolveWeekday(referenceDate, targetDay));
      });

    const title = state.text.replace(/\s{2,}/g, " ").trim();

    return { title, dueDate: dueDate || "", repeatInterval, priority, projectName, tags, matches: state.matches };
  }

  global.TODO_PLUS_QUICK_ADD_PARSER = Object.freeze({ parseQuickAddText });
})(window);
