import { Button } from "@mui/material";
import React, { useState } from "react";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css"
// import { exec } from "child_process";

const fqcCommand = "../tools_scripts/fastqc.sh"; //Archivo sh para ejecutar el FASTQC

export const SidepanelComponent = ({ formTemplate, isOpen, onClose }) => {
    const { handleChange } = formTemplate[0];
    const [data, setData] = useState(false);

    return (
        <SlidingPane
            className="sliding-pane"
            overlayClassName="sliding-pane-overlay"
            isOpen={isOpen}
            width="600px"
            onRequestClose={onClose}
        >
            {formTemplate.map((item) => { //Renderiza por cada item, solucionar que sea personalizado
                const { name, type, label } = item
                return (
                    <div key={name}>
                        <label htmlFor={name}>{label}</label>
                        {(
                            <input
                                type={type}
                                id={name}
                                name={name}
                                value={""}
                                onChange={(e) => handleChange(e, data, setData)} //Finalizada subida de archivos
                                accept=".fastq,.fq,.fastq.gz,.fq.gz,.bam,.sam,.cram,.sra,.srx,.fast,.fasta,.fa,.gff,.gtf,.vcf,.vcf.gz,.tsv,.txt,.bed,.wig,.bw,.bb"
                                />)}
                    </div>
                )
            })}
            <Button variant="outlined">Execute Tool</Button>
        </SlidingPane>
    );
};
