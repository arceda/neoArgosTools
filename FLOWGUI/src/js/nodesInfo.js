export const samples = [
  {
    type: "customNode",
    data: {
      name: "RNA normal",
      icon: "🔍",
      color: "#f2ffc1",
      connectors: ["input"],
      formData: {
        name_file: "",
        output: ["normal"],
      },
    },
  },
  {
    type: "customNode",
    data: {
      name: "RNA tumor",
      icon: "🔍",
      color: "#f2ffc1",
      connectors: ["input"],
      formData: {
        name_file: "",
        output: ["tumor"],
      },
    },
  },
];

export const quality = [
  {
    type: "customNode",
    data: {
      name: "FastQC",
      icon: "✨",
      color: "#beffa4",
      connectors: ["default"],
      formData: {
        input: ["./static/InputFiles/FASTA/chr7.fa"],
        output: ["./static/InputFiles/RNAnormal/dnd_node0", "./static/InputFiles/RNAtumor/dnd_node1"], /* ["./static/InputFiles/RNAnormal/dnd_node0", "./static/InputFiles/RNAnormal/dnd_node1"] */
      },
    },
  },
  {
    type: "customNode",
    data: {
      name: "Trinometric",
      icon: "✨",
      color: "#beffa4",
      connectors: ["default"],
    },
  },
];

export const aligment = [
  {
    type: "customNode",
    data: {
      name: "BWA",
      icon: "🔗",
      color: "#8ff2af",
      connectors: ["default"],
      formData: {
        threads: "",
        reqsnormal: [],
        reqstumor: [],
        output: [],
      },
    },
  },
  {
    type: "customNode",
    data: {
      name: "Star",
      icon: "🔗",
      color: "#8ff2af",
      connectors: ["default"],
      formData: {
        threads: "",
        star_options: "",
        indexing: "",
        sjdbGTF: "",
        genomefasta: "",
        output: [],
      },
    },
  },
];

export const aligmentQuality = [
  {
    type: "customNode",
    data: {
      name: "Samtools",
      icon: "⚡",
      color: "#ffd3b6",
      connectors: ["default"],
      formData: {
        output: [],
      },
    },
  },

  {
    type: "customNode",
    data: {
      name: "Picard",
      icon: "⚡",
      color: "#ffd3b6",
      connectors: ["default"],
      formData: {
        output: [],
      },
    },
  },
  {
    type: "customNode",
    data: {
      name: "GATK quality",
      icon: "⚡",
      color: "#ffd3b6",
      connectors: ["default"],
      formData: {
        output: [],
      },
    },
  },
];

export const variantCalling = [
  {
    type: "customNode",
    data: {
      name: "BCFTools",
      icon: "🕹️",
      color: "#bae1ff",
      connectors: ["default"],
      formData: {
        output: [],
      },
    },
  },
  {
    type: "customNode",
    data: {
      name: "Mutect",
      icon: "🕹️",
      color: "#bae1ff",
      connectors: ["default"],
      formData: {
        chrconfig: "",
        output: [],
      },
    },
  },
  {
    type: "customNode",
    data: {
      name: "Strelka",
      icon: "🕹️",
      color: "#bae1ff",
      connectors: ["default"],
    },
  },
];

export const filtering = [
  {
    type: "customNode",
    data: {
      name: "GATK filtering",
      icon: "🪢",
      color: "#ffffba",
      connectors: ["default"],
    },
  },
];

export const annotations = [
  {
    type: "customNode",
    data: {
      name: "Annovar annotation",
      icon: "📑",
      color: "#f1cbff",
      connectors: ["output"],
    },
  },
];
