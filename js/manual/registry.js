/* Busca, normalização, pesos e ordenação preservados da baseline 0.1.0. */
SimCore.createManualRegistry = (content) => {
  const { categories, topics, aliases } = content;
  const byId = new Map(topics.map((t) => [t.id, t]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const resolve = (id) => byId.get(aliases[id] || id);
  const normalize = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9Δ]+/gi, " ")
      .trim();
  const stem = (word) =>
    word.length > 4
      ? word.replace(/oes$/, "ao").replace(/ais$/, "al").replace(/s$/, "")
      : word;
  const stop = new Set([
    "a",
    "o",
    "as",
    "os",
    "de",
    "do",
    "da",
    "dos",
    "das",
    "um",
    "uma",
    "e",
    "como",
    "para",
    "no",
    "na",
    "com",
    "meu",
    "minha",
  ]);
  const tokens = (value) =>
    normalize(value)
      .split(/\s+/)
      .filter((w) => w && !stop.has(w))
      .map(stem);
  const index = topics.map((topic) => ({
    topic,
    title: normalize(topic.title),
    keys: normalize(topic.keywords.join(" ")),
    words: tokens(
      [
        topic.title,
        topic.summary,
        topic.purpose,
        ...topic.keywords,
        ...topic.steps,
        topic.example,
        ...topic.details.map((d) => d.title + " " + d.text),
      ].join(" "),
    ),
  }));
  function search(query) {
    const clean = normalize(String(query).slice(0, 120)),
      terms = tokens(clean);
    if (!terms.length) return [];
    return index
      .map((x) => ({
        topic: x.topic,
        score: terms.every((t) =>
          x.words.some((w) => w === t || (t.length > 2 && w.startsWith(t))),
        )
          ? 1 +
            (x.title === clean ? 100 : 0) +
            (x.title.includes(clean) ? 30 : 0) +
            (x.keys.includes(clean) ? 20 : 0) +
            terms.reduce(
              (n, t) =>
                n + (tokens(x.title).some((w) => w.startsWith(t)) ? 5 : 0),
              0,
            )
          : 0,
      }))
      .filter((x) => x.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          topics.indexOf(a.topic) - topics.indexOf(b.topic),
      )
      .map((x) => x.topic);
  }
  return {
    categories,
    topics,
    aliases,
    resolve,
    category: (id) => categoryMap.get(id),
    search,
    normalize,
    index,
  };
};
