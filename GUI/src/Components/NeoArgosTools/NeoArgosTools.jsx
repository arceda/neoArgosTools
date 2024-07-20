import HelpIcon from "@mui/icons-material/Help";
import {
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Dialog,
} from "@mui/material";
const baseURL = "http://127.0.0.1:3000";
let files = {
  rna: {
    file: "",
  },
  bwa: {
    file: "",
  },
};

const uploadFile = (event) => {
  let step = event.target.name;
  files[step].file = event.target.files[0];
};

const fastQC = async () => {
  const formData = new FormData();
  formData.append("fastqc_file", files.rna.file);

  try {
    let response = await fetch(baseURL + "/fastqc", {
      method: "post",
      body: formData,
    });

    if (response.ok) {
      let htmlBlob = await response.blob();
      let htmlResponseUrl = URL.createObjectURL(htmlBlob);
      let fastqcResponseIframe = document.getElementById("fastqcResponse");
      if (fastqcResponseIframe) {
        fastqcResponseIframe.src = htmlResponseUrl;
      } else {
        console.error("Element with id 'fastqcResponse' not found");
      }
    } else {
      console.error("Failed to fetch fastqc data");
    }
  } catch (error) {
    console.error("Error fetching fastqc data", error);
  }
};

const bwa = async () => {
  const formData = new FormData();
  formData.append("fastqc_file2", files.bwa.file);

  let response = await fetch(baseURL + "/bwa", {
    method: "post",
    body: formData,
  });
};

const samtools = async () => {
  let response = await fetch(baseURL + "/samtools", {
    method: "post",
  });
};

const gatk = async () => {
  let response = await fetch(baseURL + "/gatk", {
    method: "post",
  });
};

const vcf = async () => {
  let response = await fetch(baseURL + "/vcf", {
    method: "post",
  });
};

const annovar = async () => {
  let response = await fetch(baseURL + "/annovar", {
    method: "post",
  });
};

export const Tools = {
  RNA: (
    <div
      key={0}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <label htmlFor={"rna"}>Upload File for Analysis</label>
      <input
        type={"file"}
        id={0}
        name={"rna"}
        onChange={uploadFile}
        accept=".fastq,.fq,.fastq.gz,.fq.gz,.bam,.sam,.cram,.sra,.srx,.fast,.fasta,.fa,.gff,.gtf,.vcf,.vcf.gz,.tsv,.txt,.bed,.wig,.bw,.bb"
      />
      <Button
        variant="outlined"
        onClick={() => console.log("Archivo subido al local storage")}
      >
        Upload File
      </Button>
      <div id="fastqcResponse"></div>
    </div>
  ),
  FastQC: (
    <div key={1}>
      <div
        style={{
          alignItems: "center",
          gap: "5px",
        }}
      >
        <p>Name of the Selected File:</p>
        {files.rna.file.name ? files.rna.file.name : "No file selected yet"}
      </div>
      <Button variant="outlined" onClick={fastQC}>
        Analyze Data with FastQC
      </Button>
      <iframe
        id="fastqcResponse"
        title="FastQC Response"
        style={{ width: "100%", height: "500px", border: "none" }}
      ></iframe>
    </div>
  ),
  BWA: (
    <Box>
      <Typography variant="h5">Índices ya generados</Typography>
      <Select value={"0"}>
        <MenuItem value={"0"}>Hg38</MenuItem>
        <MenuItem value={"1"}>Hg381</MenuItem>
        <MenuItem value={"2"}>Hg382</MenuItem>
      </Select>
      <Button
        sx={{ marginLeft: "20px" }}
        variant="contained"
        onClick={() => {
          setOpenDialogBWA(true);
        }}
      >
        Crear nuevo Índice
      </Button>
      <Typography variant="h5">Mapeo</Typography>
      <TextField
        sx={{ marginTop: "20px" }}
        label="Number of threads"
        variant="outlined"
        type="number"
        InputLabelProps={{
          shrink: true,
        }}
        defaultValue="8"
        name="t"
      />
      <TextField
        sx={{ marginTop: "20px" }}
        label="Read group header line"
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
        defaultValue="@RG\tID:foo\tSM:bar\tLB:library1"
        name="R"
      />
      <TextField
        sx={{ marginTop: "20px" }}
        label="RNA-seq file 1"
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
        name="rna1"
      />
      <TextField
        sx={{ marginTop: "20px" }}
        label="RNA-seq file 2"
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
        name="rna2"
      />
      <TextField
        sx={{ marginTop: "20px" }}
        label="Output file"
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
        defaultValue="outfile1/sample.sam"
        name="output"
      />

      <Button variant="contained">Analizar con BWA</Button>

      {/* <Dialog open={openDialogBWA} onClose={() => setOpenDialogBWA(false)}>
        <DialogTitle>Crear un nuevo index</DialogTitle>
        <DialogContent>
          <InputLabel>Sequencia RNA</InputLabel>
          <Input placeholder="Sequence" type="file" />
          <Box>
            <FormControlLabel
              control={
                <Checkbox checked={isChecked} onChange={handleCheckboxChange} />
              }
              label="Algorithm for constructing BWT index"
            />
            <Select value={"0"} disabled={!isChecked}>
              <MenuItem value={"0"}>is</MenuItem>
              <MenuItem value={"1"}>bwtsw</MenuItem>
            </Select>
            <Tooltip
              title={
                <div>
                  <p>
                    <b>is:</b> IS linear-time algorithm for constructing suffix
                    array. It requires 5.37N memory where N is the size of the
                    database. IS is moderately fast, but does not work with
                    database larger than 2GB. IS is the default algorithm due to
                    its simplicity. The current codes for IS algorithm are
                    reimplemented by Yuta Mori.
                  </p>
                  <p>
                    <b>bwtsw:</b> Algorithm implemented in BWT-SW. This method
                    works with the whole human genome.
                  </p>
                </div>
              }
            >
              <HelpIcon />
            </Tooltip>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogBWA(false)}>Cancelar</Button>
          <Button>Crear</Button>
        </DialogActions>
      </Dialog> */}
    </Box>
  ),
  Samtools: (
    <div key={3}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <p>Name of the Selected File:</p>
        {files.length > 0 ? files[0].name : "No file selected yet"}
      </div>
      <Button variant="outlined" onClick={samtools}>
        Samtools
      </Button>
    </div>
  ),
  GATK: (
    <div key={4}>
      <Button variant="outlined" onClick={gatk}>
        Analyze Data with GATK
      </Button>
    </div>
  ),
  BCFtools: (
    <div key={5}>
      <Button variant="outlined" onClick={vcf}>
        Analyze Data with VCF
      </Button>
    </div>
  ),
  ANNOVAR: (
    <div key={6}>
      <Button variant="outlined" onClick={annovar}>
        Analyze Data with Annovar
      </Button>
    </div>
  ),
};
