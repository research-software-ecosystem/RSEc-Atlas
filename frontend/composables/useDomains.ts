export interface DomainCategory {
  name: string;
  color: string;
  subcategories: string[];
}

export const useDomains = () => {
  const domains: DomainCategory[] = [
    {
      name: "ASTRO",
      color: "gray",
      subcategories: ["Cosmology", "Exoplanets", "Galaxies", "Spectroscopy"],
    },
    {
      name: "GEO",
      color: "blue",
      subcategories: ["Geophysics", "Hydrology", "Climate", "Seismology"],
    },
    {
      name: "BIO",
      color: "green",
      subcategories: ["Genomics", "Proteomics", "Microbiome", "Bioinformatics"],
    },
    {
      name: "CHEM",
      color: "yellow",
      subcategories: ["Molecular", "Quantum", "Computational", "Materials"],
    },
    {
      name: "MATERIALS",
      color: "purple",
      subcategories: [
        "Crystallography",
        "Nanotechnology",
        "Polymers",
        "Metallurgy",
      ],
    },
    {
      name: "STATISTICS",
      color: "pink",
      subcategories: [
        "Machine Learning",
        "Data Mining",
        "Visualization",
        "Analytics",
      ],
    },
  ];

  return {
    domains,
  };
};
