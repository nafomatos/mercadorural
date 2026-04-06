export type CityGroup = {
  state: string;
  cities: string[];
};

export const CITY_GROUPS: CityGroup[] = [
  {
    state: "São Paulo",
    cities: [
      "Araçatuba",
      "Araraquara",
      "Barretos",
      "Bauru",
      "Bebedouro",
      "Botucatu",
      "Fernandópolis",
      "Franca",
      "Guara",
      "Guaira",
      "Ituverava",
      "Jaboticabal",
      "Jaú",
      "Marília",
      "Olímpia",
      "Orlandia",
      "Presidente Prudente",
      "Ribeirão Preto",
      "São Carlos",
      "São Joaquim Da Barra",
      "São José do Rio Preto",
      "Sertãozinho",
      "Votuporanga",
    ],
  },
  {
    state: "Minas Gerais",
    cities: [
      "Araguari",
      "Araxá",
      "Frutal",
      "Ituiutaba",
      "Patos de Minas",
      "Patrocínio",
      "Sacramento",
      "Uberaba",
      "Uberlândia",
    ],
  },
];

// Flat list of all cities (for filter comparisons)
export const ALL_CITIES = CITY_GROUPS.flatMap((g) => g.cities);
