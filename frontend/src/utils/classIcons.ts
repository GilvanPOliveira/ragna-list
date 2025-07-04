/* Colunas = ramos (mesma ordem Divine-Pride)
   Linhas = [1ª, 2ª, R1, R2, 3ª, 4ª] — sempre 6
   Cada célula pode ter vários IDs.
*/

export type StageRow = number[];         // lista de ícones
export interface Branch {
  key: string;
  pt:  string;
  stages: StageRow[];                    // length = 6
}

/* helper para URL  */
export const iconUrl = (id: number, enabled: boolean) =>
  `https://static.divine-pride.net/images/jobs/${enabled ? "" : "disabled/"}icon_jobs_${id}.png`;

export const BRANCHES: Branch[] = [
  /* Novice */
  { key: "novice", pt: "Aprendizes",
    stages: [
      [0],
      [23],
      [4190],
      [],
      [],
      [4307],
    ]},

  /* Acolyte */
  { key: "acolyte", pt: "Sacerdotes",
    stages: [
      [4],
      [8, 15],
      [4005],
      [4009, 4016],
      [4057, 4070],
      [4256, 4262],
    ]},

  /* Archer */
  { key: "archer", pt: "Arqueiros",
    stages: [
      [3],
      [11, 19, 20],
      [4004],
      [4012, 4020, 4021],       // Atirador / Menestrel / Cigana
      [4056, 4068, 4069],       // Sentinela / Trovador / Musa
      [4257, 4263, 4264],       // Windhawk / Troubadour / Trouvere
    ]},

  /* Magician */
  { key: "magician", pt: "Magos",
    stages: [
      [2],
      [9, 16],
      [4003],
      [4010, 4017],
      [4055, 4067],             // Arcano / Feiticeiro  ← novo
      [4255, 4261],
    ]},

  /* Merchant */
  { key: "merchant", pt: "Mercadores",
    stages: [
      [5],
      [10, 18],
      [4006],
      [4011, 4019],
      [4058, 4071],             // Mecânico / Bioquímico  ← novo
      [4253, 4259],
    ]},

  /* Swordman */
  { key: "swordman", pt: "Espadachins",
    stages: [
      [1],
      [7, 14],
      [4002],
      [4008, 4015],
      [4054, 4066],             // RK / Guardião Real  ← novo
      [4252, 4258],
    ]},

  /* Thief */
  { key: "thief", pt: "Gatunos",
    stages: [
      [6],
      [12, 17],
      [4007],
      [4013, 4018],
      [4059, 4072],             // Sicário / Renegado  ← novo
      [4254, 4260],
    ]},

  /* Taekwon (agora só Taekwon-line) */
  { key: "taekwon", pt: "Taekwons",
    stages: [
      [4046],
      [4047],
      [4239],                   // Star Emperor
      [],
      [4302],                   // Sky Emperor
      [],
    ]},

  /* Espiritualista (Soul-linker-line separada) */
  { key: "espiritualista", pt: "Espiritualistas",
    stages: [
      [],
      [4049],                   // Espiritualista
      [],
      [4240],                   // Soul Reaper
      [4303],                   // Soul Ascetic
      [],
    ]},

  /* Ninja */
  { key: "ninja", pt: "Ninjas",
    stages: [
      [25],
      [4211, 4212],
      [],
      [],
      [4304, 4305],
      [],
    ]},

  /* Gunslinger */
  { key: "gunslinger", pt: "Justiceiros",
    stages: [
      [24],
      [4215],
      [],
      [],
      [],
      [4306],
    ]},

  /* Doram */
  { key: "doram", pt: "Summoners",
    stages: [
      [4218],
      [],
      [],
      [],
      [],
      [4308],
    ]},
];

/* -------------------------------------------------------------
   retorna Set de IDs permitidos (equipJobs do backend)
-------------------------------------------------------------- */
export interface ItemLike { equipJobs?: (number | string)[] }
export function allowedIdSet(item: ItemLike): Set<number> {
  return Array.isArray(item.equipJobs)
    ? new Set(item.equipJobs.filter((v): v is number => typeof v === "number"))
    : new Set<number>();
}
