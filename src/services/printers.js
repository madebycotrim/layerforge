// src/services/printers.js

export function loadUserPrinters() {
  // Simula um banco de dados local
  return [
    {
      id: "p1",
      name: "Bambu Lab X1C",
      consumoKw: 0.35, // 350W
      tecnologia: "FDM"
    },
    {
      id: "p2",
      name: "Creality Ender 3",
      consumoKw: 0.15, // 150W
      tecnologia: "FDM"
    },
    {
      id: "p3",
      name: "Elegoo Saturn 3",
      consumoKw: 0.12, // 120W (Resina)
      tecnologia: "SLA"
    }
  ];
}