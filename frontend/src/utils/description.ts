/* 1) Remove códigos de cor ^RRGGBB
   2) Normaliza quebras e múltiplos espaços
   3) Elimina qualquer linha que comece por "Usable By" ou "Job"
*/

export function cleanDescription(raw = ""): string {
  const noColor = raw.replace(/\^[0-9A-Fa-f]{6}/g, "");

  return (
    noColor
      .split(/\r\n|\r|\n/)                // quebra em linhas
      .filter(
        (ln) =>
          !/^usable by[: ]/i.test(ln) &&  // remove "Usable By …"
          !/^job[: ]/i.test(ln)           // remove "Job : …"
      )
      .join("\n")                         // recompõe
      .replace(/[ \t]+/g, " ")            // colapsa espaços
      .trim()
  );
}
