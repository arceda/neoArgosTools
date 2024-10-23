import { Rna } from "./Rna";
import { FastQc } from "./FastQC";

export const TOOLS = {
  "RNA tumor": {
    Component: Rna,
    props: { type: "RNA tumor" },
  },
  "RNA normal": {
    Component: Rna,
    props: { type: "RNA normal" },
  },
  FastQC: {
    Component: FastQc,
    props: {},
  },
};
