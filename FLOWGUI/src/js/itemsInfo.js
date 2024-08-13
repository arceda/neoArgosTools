import { samples, quality, aligment, aligmentQuality, variantCalling, filtering, annotations} from "./nodesInfo";

export const items = [
    { name: 'Samples', nodes: samples },
    { name: 'Quality', nodes: quality },
    { name: 'Alignment', nodes: aligment },
    { name: 'Alignment Quality', nodes: aligmentQuality },
    { name: 'Variant Calling', nodes: variantCalling },
    { name: 'VCF Filter', nodes: filtering },
    { name: 'Anotations', nodes: annotations },
];