import { Button } from "@mui/material";
import React, { useState } from "react";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css"

const baseURL= "http://127.0.0.1:5000"

const uploadFile = async (file) => {
    console.log(file)
    if (file != null) {
        const form = new FormData();
        form.append("fastqc_file", file);

        let response = await fetch(baseURL + "/fastqc",
            {
                method: 'post',
                body: form,
            }
        );
        let res = await response.json();
        console.log(res)
        if (res.status !== 1) {
            alert('Error uploading file');
        }
    }
}

export const SidepanelComponent = ({ formTemplate, isOpen, onClose }) => {
    const { handleChange } = formTemplate[0];
    const [data, setData] = useState("");

    return (
        <SlidingPane
            className="sliding-pane"
            overlayClassName="sliding-pane-overlay"
            isOpen={isOpen}
            width="600px"
            onRequestClose={onClose}
        >
            <div>
            {formTemplate.map((item) => { //Renderiza por cada item, solucionar que sea personalizado
                const { name, type, label, style } = item
                return (
                    <div key={name} style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "20px"
                    }}>
                        <label htmlFor={name}>{label}</label>
                        {(
                            <input
                                style={style}
                                type={type}
                                id={name}
                                name={name}
                                value={""}
                                onChange={(e) => handleChange(e, setData)} //Finalizada subida de archivos
                                accept=".fastq,.fq,.fastq.gz,.fq.gz,.bam,.sam,.cram,.sra,.srx,.fast,.fasta,.fa,.gff,.gtf,.vcf,.vcf.gz,.tsv,.txt,.bed,.wig,.bw,.bb"
                            />)}
                    </div>
                )
            })}
            <Button variant="outlined" onClick={() => uploadFile(data)}>Execute Tool</Button>
            </div>
        </SlidingPane>
    );
};
