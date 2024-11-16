import { Rna } from "./Rna";
import { FastQc } from "./FastQC";
import { STAR } from "./STAR";
import BWA from "./BWAForm";
import SamTools from "./SamToolsForm";
import Mutect from "./MutectForm";
import Picard from "./Picard";

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
  Star: {
    Component: STAR,
    props: {},
  },
  BWA: {
    Component: BWA,
    props: {},
  },
  Samtools: {
    Component: SamTools,
    props: {},
  },
  Picard: {
    Component: Picard,
    props: {},
  },
  Mutect: {
    Component: Mutect,
    props: {},
  },
};
