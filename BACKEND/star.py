import json
import requests
import os
from flask import jsonify, request, Flask
from flask_cors import CORS, cross_origin

# Define paths
star_path = "/usr/local/bin/STAR"  # Ensure this path is correct in your container
#fastq_input_dir = "./static/InputFiles/RNAnormal"  # Use the absolute path in the container
star_results = "./static/OutputFiles/STAR"  # Use the absolute path in the container
genome_dir = "./reference_chr15"  # Ensure this path is correct in your container

app = Flask(__name__)
CORS(app)

def check_files(directory, extensions):
    # List files in the directory and check if any end with the specified extensions
    matching_files = [f for f in os.listdir(directory) if any(f.endswith(ext) for ext in extensions)]
    
    # Return 1 if files are found, else 0
    if matching_files:
        return 1
    else:
        return 0


r'''
 ______     ______   ______     ______    
/\  ___\   /\__  _\ /\  __ \   /\  == \   
\ \___  \  \/_/\ \/ \ \  __ \  \ \  __<   
 \/\_____\    \ \_\  \ \_\ \_\  \ \_\ \_\ 
  \/_____/     \/_/   \/_/\/_/   \/_/ /_/ 
                                                                                                        
'''

@app.route("/star", methods=["POST"])
@cross_origin()
def run_star():
    data = request.json
    threads = data.get('threads', '')
    fastaqc_output = data.get('fastaqcoutput', '') 
    indexing = data.get('indexing', genome_dir)
    star_options = data.get('star_options', '')
    star_node_id = data.get('nodeid', '')
    node_type = data.get('rnatype', '')

    results_output_dir = os.path.join(star_results, node_type, star_node_id)

    print(threads)
    print(indexing)
    print(results_output_dir)

    d = {}
    try:
        # Ensure the output directory exists
        if not os.path.exists(results_output_dir):
            os.makedirs(results_output_dir)

        # List FASTQ files in the input directory
        fastq_files = [f for f in os.listdir(fastaqc_output) if f.endswith(".fastq.gz")]
        if not fastq_files:
            raise FileNotFoundError(f"No FASTQ files found in {fastaqc_output}")

        for file in fastq_files:
            name = file.split('.')[0]

            # Construct the STAR command with additional options
            star_command = (
                f"{star_path} "
                f"--runThreadN {threads} "
                f"--genomeDir {indexing} "
                f"--readFilesIn {fastaqc_output}/{file} "
                f"--readFilesCommand zcat "
                f"--twopassMode Basic "
                f"--outSAMtype BAM SortedByCoordinate "
                f"--outFileNamePrefix {results_output_dir}/{name} "
                f"{star_options} "
                f"> {results_output_dir}/{name}_STAR.log 2>&1"
            )

            # Print command for debugging
            print("Running command:", star_command)
            result = os.system(star_command)
            if result != 0:
                raise Exception(f"STAR command failed with status {result}")

            # Determine the correct BAM file name
            bam_file = f"{results_output_dir}/{name}Aligned.sortedByCoord.out.bam"
            index_command = f"samtools index {bam_file} > {results_output_dir}/{name}_index.log 2>&1"
            print("Indexing BAM file:", index_command)
            result = os.system(index_command)
            if result != 0:
                raise Exception(f"Samtools index command failed with status {result}")

        d["status"] = 1
        d["message"] = "STAR alignment and indexing completed successfully."
        d["output"] = results_output_dir

    except Exception as e:
        print(f"Error running STAR: {e}")
        d["status"] = 0
        d["message"] = str(e)

    return jsonify(d)

def save_file(dir_name, file, folder):
    save_path = os.path.join(dir_name, folder) # ./static/InputFiles/STAR/other
    if not os.path.exists(save_path):
        os.makedirs(save_path)
    file_path = os.path.join(save_path, file.filename)
    file.save(file_path)
    return file_path

def download_and_save_file(dir_name, url, folder):
    response = requests.get(url)
    if response.status_code == 200:
        filename = url.rsplit('/', 1)[-1]
        save_path = os.path.join(dir_name, folder) # ./static/InputFiles/STAR/other
        if not os.path.exists(save_path):
            os.makedirs(save_path)
        file_path = os.path.join(save_path, filename)
        with open(file_path, 'wb') as f:
            f.write(response.content)
        return file_path
    else:
        return None

@app.route('/upload', methods=['POST'])
def upload_file():
    id_folder_name = request.form.get('id_folder_name', '')
    dir_name = request.form.get('dir_name', '')

    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        file_path = save_file(dir_name, file, id_folder_name)
        return jsonify({'message': 'File uploaded successfully', 'file_path': file_path}), 200

    elif 'url' in request.form:
        url = request.form['url']
        file_path = download_and_save_file(dir_name, url, id_folder_name)
        if file_path:
            return jsonify({'message': 'File downloaded and saved successfully', 'file_path': file_path}), 200
        else:
            return jsonify({'error': 'Failed to download file from URL'}), 400

    return jsonify({'error': 'No file or URL provided'}), 400


indexing_files_dir = "./static/InputFiles/STAR/other"  # Use the absolute path in the container
@app.route("/indexing", methods=["POST"])
@cross_origin()
def run_indexing():
    data = request.json
    node_name = data.get('node_name', '')
    sjdbGTF_file = data.get('sjdbGTF_file', '')
    genome_fasta_file = data.get('genome_fasta_file', '')

    folder_name = node_name

    d = {}
    try:
        # List FASTQ files in the input directory
        fasta_files = [f for f in os.listdir(f"{indexing_files_dir}/{folder_name}") if f.endswith(".fasta")]
        if not fasta_files:
            raise FileNotFoundError(f"No FASTA files found in {indexing_files_dir}/{folder_name}")

        gtf_files = [f for f in os.listdir(f"{indexing_files_dir}/{folder_name}") if f.endswith(".gtf")]
        if not gtf_files:
            raise FileNotFoundError(f"No GTF files found in {indexing_files_dir}/{folder_name}")

        # Construct the STAR for indexing
        star_command = (
            f"{star_path} "
            f"--runThreadN 6 "
            f"--runMode genomeGenerate --genomeDir {indexing_files_dir}/{folder_name} "
            f"--genomeFastaFiles {indexing_files_dir}/{folder_name}/{genome_fasta_file} "
            f"--sjdbGTFfile {indexing_files_dir}/{folder_name}/{sjdbGTF_file} "
            f"--genomeSAindexNbases 12 "
            f"--sjdbOverhang 50 --outFileNamePrefix index_other"
        )

        # Print command for debugging
        print("Running command:", star_command)
        result = os.system(star_command)
        if result != 0:
            raise Exception(f"STAR command failed with status {result}")

        d["status"] = 1
        d["message"] = "STAR indexing completed successfully."

    except Exception as e:
        print(f"Error running STAR: {e}")
        d["status"] = 0
        d["message"] = str(e)

    return jsonify(d)

r'''
 ______     __     __     ______    
/\  == \   /\ \  _ \ \   /\  __ \   
\ \  __<   \ \ \/ ".\ \  \ \  __ \  
 \ \_____\  \ \__/".~\_\  \ \_\ \_\ 
  \/_____/   \/_/   \/_/   \/_/\/_/                                                                     
'''

bwa_results = "./static/OutputFiles/BWA"
@app.route("/bwa_alignment", methods=["POST"])
@cross_origin()
def bwa_alignment():
    data = request.json
    threads = data.get('threads', '')
    rnatype = data.get('rnatype', '')
    fasta_file = data.get('fasta_dir', '')
    req1_file = data.get('req1_dir', '')
    req2_file = data.get('req2_dir', '')
    node_id = data.get('node_id', '')

    file_name = req1_file.split('/')
    file_name_info = file_name[-1].split('.')
    name = file_name_info[0]

    print(name)

    fasta_dir = os.path.dirname(fasta_file)
    req1_dir = os.path.dirname(req1_file)
    req2_dir = os.path.dirname(req2_file)

    fasta_file_name = fasta_file.split('/')
    fasta_file_name_info = fasta_file_name[-1].split('.')
    fasta_name = fasta_file_name_info[0]

    bam_concat = f"{name}.bam"
    results_output_dir = os.path.join(bwa_results, rnatype, node_id)

    d = {}
    try:
        # Ensure the output directory exists
        if not os.path.exists(results_output_dir):
            os.makedirs(results_output_dir)

        # Check for FASTA files
        fasta_result = check_files(fasta_dir, [".fa", ".fasta"])
        if fasta_result == 0:
            raise FileNotFoundError(f"No FASTA files found in {fasta_dir}")

        # Check for indexed files
        index_files_extension = [".amb", ".ann", ".bwt", ".pac", ".sa"]
        for ext in index_files_extension:
            fasta_index_result = check_files(fasta_dir, ext)

            if fasta_index_result == 0:
                # Run bwa index command
                bwa_indexing_command = f"bwa index {fasta_file}"
                print("Running command:", bwa_indexing_command)
                index_result = os.system(bwa_indexing_command)
                if index_result != 0:
                    raise Exception(f"BWA indexing command failed with status {index_result}")
                break

        # Check for req1 and req2 files
        req1_result = check_files(req1_dir, [".fastq.gz"])
        if req1_result == 0:
            raise FileNotFoundError(f"No req1 files found in {req1_dir}")

        req2_result = check_files(req2_dir, [".fastq.gz"])
        if req2_result == 0:
            raise FileNotFoundError(f"No req2 files found in {req2_dir}")

        # Run bwa mem command
        bwa_mem_command = f"bwa mem -t {threads} {fasta_file} -R '@RG\\tID:COLO829\\tSM:{name}\\tLB:COLO829\\tPL:ILLUMINA' {req1_file} {req2_file} > {bwa_results}/{rnatype}/{node_id}/{name}.bam"
        print("Running command:", bwa_mem_command)
        mem_result = os.system(bwa_mem_command)
        if mem_result != 0:
            raise Exception(f"BWA mem command failed with status {mem_result}")
        
        results_output_dir = os.path.join(results_output_dir, bam_concat)

        d["status"] = 1
        d["message"] = "BWA alignment completed successfully."
        d["output"] = results_output_dir

    except Exception as e:
        print(f"Error running BWA: {e}")
        d["status"] = 0
        d["message"] = str(e)

    return jsonify(d)

r''' 
 ______     ______     __    __        ______   ______     ______     __         ______    
/\  ___\   /\  __ \   /\ "-./  \      /\__  _\ /\  __ \   /\  __ \   /\ \       /\  ___\   
\ \___  \  \ \  __ \  \ \ \-./\ \     \/_/\ \/ \ \ \/\ \  \ \ \/\ \  \ \ \____  \ \___  \  
 \/\_____\  \ \_\ \_\  \ \_\ \ \_\       \ \_\  \ \_____\  \ \_____\  \ \_____\  \/\_____\ 
  \/_____/   \/_/\/_/   \/_/  \/_/        \/_/   \/_____/   \/_____/   \/_____/   \/_____/ 

'''
sam_results = "./static/OutputFiles/SAMTOOLS"

@app.route("/samtools", methods=["POST"])
@cross_origin()
def samtools():
    data = request.json
    bam_file = data.get('bam_dir', '')
    rnatype = data.get('rnatype', '')
    node_id = data.get('node_id', '')

    file_name = bam_file.split('/')
    file_name_info = file_name[-1].split('.')
    name = file_name_info[0]

    print(name)

    bam_dir = os.path.dirname(bam_file)

    sam_concat = f"{name}.sorted.bam"
    results_output_dir = os.path.join(sam_results, rnatype, node_id)

    d = {}
    try:
        # Ensure the output directory exists
        if not os.path.exists(results_output_dir):
            os.makedirs(results_output_dir)

        # Check for BAM files
        bam_result = check_files(bam_dir, [".bam"])
        if bam_result == 0:
            raise FileNotFoundError(f"No BAM files found in {bam_dir}")

        # Run sam sort command
        sam_sort_command = f"samtools sort {bam_file} -o {results_output_dir}/{name}.sorted.bam"
        print("Running command:", sam_sort_command)
        sort_result = os.system(sam_sort_command)
        if sort_result != 0:
            raise Exception(f"SAM sort command failed with status {sort_result}")

        # Run sam index command
        sam_index_command = f"samtools index {results_output_dir}/{name}.sorted.bam"
        print("Running command:", sam_index_command)
        index_result = os.system(sam_index_command)
        if index_result != 0:
            raise Exception(f"SAM index command failed with status {index_result}")
        
        results_output_dir = os.path.join(results_output_dir, sam_concat)

        d["status"] = 1
        d["message"] = "SAM alignment completed successfully."
        d["output"] = results_output_dir

    except Exception as e:
        print(f"Error running SAM: {e}")
        d["status"] = 0
        d["message"] = str(e)

    return jsonify(d)

r''' 
 ______   __     ______     ______     ______     _____    
/\  == \ /\ \   /\  ___\   /\  __ \   /\  == \   /\  __-.  
\ \  _-/ \ \ \  \ \ \____  \ \  __ \  \ \  __<   \ \ \/\ \ 
 \ \_\    \ \_\  \ \_____\  \ \_\ \_\  \ \_\ \_\  \ \____- 
  \/_/     \/_/   \/_____/   \/_/\/_/   \/_/ /_/   \/____/  

'''
picard_results = "./static/OutputFiles/PICARD"

@app.route("/picard", methods=["POST"])
@cross_origin()
def picard():
    data = request.json
    bam_file = data.get('bam_dir', '')
    rnatype = data.get('rnatype', '')
    node_id = data.get('node_id', '')

    file_name = bam_file.split('/')
    file_name_info = file_name[-1].split('.')
    name = file_name_info[0]

    print(name)

    bam_dir = os.path.dirname(bam_file)

    picard_bam_concat = f"{name}.sorted.dupmarked.bam"
    picard_txt_concat = f"{name}_dupmarked_metrics.txt"
    results_output_dir = os.path.join(picard_results, rnatype, node_id)

    d = {}
    try:
        # Ensure the output directory exists
        if not os.path.exists(results_output_dir):
            os.makedirs(results_output_dir)

        # Check for BAM files
        bam_result = check_files(bam_dir, [".bam"])
        if bam_result == 0:
            raise FileNotFoundError(f"No BAM files found in {bam_dir}")
        
        # Run sam sort command
        picard_command = (
            f"java -jar /usr/local/bin/picard.jar MarkDuplicates "
            f"I={bam_file} "
            f"O={results_output_dir}/{picard_bam_concat} "
            f"M={results_output_dir}/{picard_txt_concat} "
        )
        print("Running command:", picard_command)
        picard_result = os.system(picard_command)
        if picard_result != 0:
            raise Exception(f"PICARD command failed with status {picard_result}")
        
        results_output_dir = os.path.join(results_output_dir, picard_bam_concat)

        # Run samtools index command
        sam_indexing_command = f"samtools index {results_output_dir}"
        print("Running command:", sam_indexing_command)
        index_result = os.system(sam_indexing_command)
        if index_result != 0:
            raise Exception(f"SAM indexing command failed with status {index_result}")

        d["status"] = 1
        d["message"] = "PICARD vcf completed successfully."
        d["output"] = results_output_dir

    except Exception as e:
        print(f"Error running PICARD: {e}")
        d["status"] = 0
        d["message"] = str(e)

    return jsonify(d)

r'''
 __    __     __  __     ______   ______     ______     ______  
/\ "-./  \   /\ \/\ \   /\__  _\ /\  ___\   /\  ___\   /\__  _\ 
\ \ \-./\ \  \ \ \_\ \  \/_/\ \/ \ \  __\   \ \ \____  \/_/\ \/ 
 \ \_\ \ \_\  \ \_____\    \ \_\  \ \_____\  \ \_____\    \ \_\ 
  \/_/  \/_/   \/_____/     \/_/   \/_____/   \/_____/     \/_/ 
                                                                                                                                                                            
'''
mutect_results = "./static/OutputFiles/MUTECT"

@app.route("/mutect_pileup", methods=["POST"])
@cross_origin()
def mutect_pileup_summary():
    data = request.json
    bam_file = data.get('bam_dir', '')
    v_file = data.get('v_dir', '')
    chr_config = data.get('chr_config', '')

    rnatype = data.get('rnatype', '')
    node_id = data.get('node_id', '')

    file_name = bam_file.split('/')
    file_name_info = file_name[-1].split('.')
    name = file_name_info[0]

    print(name)

    bam_dir = os.path.dirname(bam_file)
    v_dir = os.path.dirname(v_file)

    mutect_tables_concat = f"{name}.pileups.table"
    results_output_dir = os.path.join(mutect_results, rnatype, node_id)

    d = {}
    try:
        # Ensure the output directory exists
        if not os.path.exists(results_output_dir):
            os.makedirs(results_output_dir)

        # ----------------------------Pileup
        # Check for BAM files
        bam_result = check_files(bam_dir, [".bam"])
        if bam_result == 0:
            raise FileNotFoundError(f"No BAM files found in {bam_dir}")
        
        # Check for GZ files
        gz_result = check_files(v_dir, [".gz"])
        if gz_result == 0:
            raise FileNotFoundError(f"No GZ files found in {v_dir}")

        # Check for indexed files
        bai_result = check_files(bam_dir, [".bai"])
        if bai_result == 0:
            # Run samtools index command
            sam_indexing_command = f"samtools index {bam_file}"
            print("Running command:", sam_indexing_command)
            index_result = os.system(sam_indexing_command)
            if index_result != 0:
                raise Exception(f"SAM indexing command failed with status {index_result}")

        # Run sam sort command
        mutect_pileup_command = (
            f"/biotools/GATK/gatk-4.6.1.0/gatk GetPileupSummaries -I {bam_file} -V {v_file} -L {chr_config} -O {results_output_dir}/{mutect_tables_concat} "
        )
        print("Running command:", mutect_pileup_command)
        print(bam_file)
        print(v_file)
        print(chr_config)
        print(results_output_dir)
        print(mutect_tables_concat)

        mutect_pileup_result = os.system(mutect_pileup_command)
        if mutect_pileup_result != 0:
            raise Exception(f"GATK pileup command failed with status {mutect_pileup_result}")
        
        # ----------------------------Pileup
        
        results_output_dir = os.path.join(results_output_dir, mutect_tables_concat)

        d["status"] = 1
        d["message"] = "GATK pileup completed successfully."
        d["output"] = results_output_dir

    except Exception as e:
        print(f"Error running GATK: {e}")
        d["status"] = 0
        d["message"] = str(e)

    return jsonify(d)

@app.route("/mutect_contamination", methods=["POST"])
@cross_origin()
def mutect_estimate_contamination():
    data = request.json
    table_normal_file = data.get('table_normal_file', '')
    table_tumor_file = data.get('table_tumor_file', '')

    node_id = data.get('node_id', '')

    table_normal_dir = os.path.dirname(table_normal_file)
    table_tumor_dir = os.path.dirname(table_tumor_file)

    results_output_dir = os.path.join(mutect_results, node_id)

    d = {}
    try:
        # Ensure the output directory exists
        if not os.path.exists(results_output_dir):
            os.makedirs(results_output_dir)

        # ----------------------------Pileup
        # Check for BAM files
        table_normal_result = check_files(table_normal_dir, [".table"])
        if table_normal_result == 0:
            raise FileNotFoundError(f"No TABLE files found in {table_normal_dir}")
        
        # Check for GZ files
        table_tumor_result = check_files(table_tumor_dir, [".table"])
        if table_tumor_result == 0:
            raise FileNotFoundError(f"No TABLE files found in {table_tumor_dir}")

        # Run sam sort command
        mutect_contamination_command = (
            f'gatk --java-options "-Xmx30G" '
            f"CalculateContamination "
            f"-I {table_tumor_file} "
            f"-matched {table_normal_file} "
            f"-O {results_output_dir}/contamination.table"
        )

        print("Running command:", mutect_contamination_command)
        mutect_contamination_result = os.system(mutect_contamination_command)
        if mutect_contamination_result != 0:
            raise Exception(f"GATK contamination command failed with status {mutect_contamination_result}")
        
        # ----------------------------Pileup
        
        results_output_dir = os.path.join(results_output_dir, "contamination.table")

        d["status"] = 1
        d["message"] = "GATK contamination completed successfully."
        d["output"] = results_output_dir

    except Exception as e:
        print(f"Error running GATK: {e}")
        d["status"] = 0
        d["message"] = str(e)

    return jsonify(d)

@app.route("/mutect_coverage", methods=["POST"])
@cross_origin()
def mutect_depth_coverage():
    data = request.json
    fasta_file = data.get('fasta_file', '')
    bam_tumor_file = data.get('bam_tumor_file', '')
    bam_normal_file = data.get('bam_normal_file', '')
    chr_config = data.get('chr_config', '')

    node_id = data.get('node_id', '')

    fasta_dir = os.path.dirname(fasta_file)
    bam_tumor_dir = os.path.dirname(bam_tumor_file)
    bam_normal_dir = os.path.dirname(bam_normal_file)

    results_output_dir = os.path.join(mutect_results, node_id)

    d = {}
    try:
        # Ensure the output directory exists
        if not os.path.exists(results_output_dir):
            os.makedirs(results_output_dir)

        # Check for FASTA files
        fasta_result = check_files(fasta_dir, [".fa", ".fasta"])
        if fasta_result == 0:
            raise FileNotFoundError(f"No FASTA files found in {fasta_dir}")
        
        # Check for BAM files
        bam_tumor_result = check_files(bam_tumor_dir, [".bam"])
        if bam_tumor_result == 0:
            raise FileNotFoundError(f"No BAM files found in {bam_tumor_result}")
        
        # Check for BAM files
        bam_normal_result = check_files(bam_normal_dir, [".bam"])
        if bam_normal_result == 0:
            raise FileNotFoundError(f"No BAM files found in {bam_normal_result}")

        # Check for indexed files
        index_result = check_files(fasta_dir, [".fai"])
        if index_result == 0:
            # Run samtools index command
            sam_indexing_command = f"samtools faidx {fasta_file}"
            print("Running command:", sam_indexing_command)
            index_result = os.system(sam_indexing_command)
            if index_result != 0:
                raise Exception(f"SAM indexing command failed with status {index_result}")
        
        dict_result = check_files(fasta_dir, [".dict"])
        if dict_result == 0:
            file_name = fasta_file.split('/')
            file_name_info = file_name[-1].split('.')
            name = file_name_info[0]
            print(name)
            # Run samtools index command
            dict_command = (
                f"gatk CreateSequenceDictionary "
                f"-R {fasta_file} "
                f"-O {fasta_dir}/{name}.dict "
            )
            print("Running command:", dict_command)
            index_result = os.system(dict_command)
            if index_result != 0:
                raise Exception(f"GATK dict command failed with status {dict_command}")

        # Run sam sort command
        mutect_coverage_command = (
            f'gatk --java-options "-Xmx30G" DepthOfCoverage '
            f"-R {fasta_file} "
            f"-L {chr_config} "
            f"-O {results_output_dir}/Coverage "
            f"-I {bam_tumor_file} "
            f"-I {bam_normal_file} "
            f"--omit-interval-statistics "
            f"--omit-depth-output-at-each-base "
        )
        print("Running command:", mutect_coverage_command)

        mutect_coverage_result = os.system(mutect_coverage_command)
        if mutect_coverage_result != 0:
            raise Exception(f"GATK coverage command failed with status {mutect_coverage_result}")
        
        results_output_dir = os.path.join(results_output_dir, "Coverage")

        d["status"] = 1
        d["message"] = "GATK coverage completed successfully."
        d["output"] = results_output_dir

    except Exception as e:
        print(f"Error running GATK: {e}")
        d["status"] = 0
        d["message"] = str(e)

    return jsonify(d)

@app.route("/mutect", methods=["POST"])
@cross_origin()
def mutect():
    data = request.json
    fasta_file = data.get('fasta_file', '')
    bam_tumor_file = data.get('bam_tumor_file', '')
    bam_normal_file = data.get('bam_normal_file', '')
    chr_config = data.get('chr_config', '')
    germline_resources = data.get('germline_resources', '')
    panel_normals = data.get('panel_normals', '')

    node_id = data.get('node_id', '')

    fasta_dir = os.path.dirname(fasta_file)
    bam_tumor_dir = os.path.dirname(bam_tumor_file)
    bam_normal_dir = os.path.dirname(bam_normal_file)

    normal_name = bam_normal_file.split('/')
    normal_name_info = normal_name[-1].split('.')
    n_name = normal_name_info[0]
    print(n_name)

    tumor_name = bam_tumor_file.split('/')
    tumor_name_info = tumor_name[-1].split('.')
    t_name = tumor_name_info[0]
    print(t_name)

    germline_resources_dir = os.path.dirname(germline_resources)
    panel_normals_dir = os.path.dirname(panel_normals)

    results_output_dir = os.path.join(mutect_results, node_id)

    d = {}
    try:
        # Ensure the output directory exists
        if not os.path.exists(results_output_dir):
            os.makedirs(results_output_dir)

        # Check for FASTA files
        fasta_result = check_files(fasta_dir, [".fa", ".fasta"])
        if fasta_result == 0:
            raise FileNotFoundError(f"No FASTA files found in {fasta_dir}")
        
        # Check for BAM files
        bam_tumor_result = check_files(bam_tumor_dir, [".bam"])
        if bam_tumor_result == 0:
            raise FileNotFoundError(f"No BAM files found in {bam_tumor_result}")
        
        # Check for BAM files
        bam_normal_result = check_files(bam_normal_dir, [".bam"])
        if bam_normal_result == 0:
            raise FileNotFoundError(f"No BAM files found in {bam_normal_result}")
        
        # Check for GZ files
        germline_resources_result = check_files(germline_resources_dir, [".vcf.gz"])
        if germline_resources_result == 0:
            raise FileNotFoundError(f"No .VCF.GZ files found in {germline_resources_result}")
        
        # Check for GZ files
        panel_normals_result = check_files(panel_normals_dir, [".vcf.gz"])
        if panel_normals_result == 0:
            raise FileNotFoundError(f"No .VCF.GZ files found in {panel_normals_result}")

        # Check for indexed files
        index_result = check_files(fasta_dir, [".fai"])
        if index_result == 0:
            # Run samtools index command
            sam_indexing_command = f"samtools faidx {fasta_file}"
            print("Running command:", sam_indexing_command)
            index_result = os.system(sam_indexing_command)
            if index_result != 0:
                raise Exception(f"SAM indexing command failed with status {index_result}")
        
        dict_result = check_files(fasta_dir, [".dict"])
        if dict_result == 0:
            file_name = fasta_file.split('/')
            file_name_info = file_name[-1].split('.')
            name = file_name_info[0]
            print(name)
            # Run samtools index command
            dict_command = (
                f"gatk CreateSequenceDictionary "
                f"-R {fasta_file} "
                f"-O {fasta_dir}/{name}.dict "
            )
            print("Running command:", dict_command)
            index_result = os.system(dict_command)
            if index_result != 0:
                raise Exception(f"GATK dict command failed with status {dict_command}")

        # Run sam sort command
        mutect_coverage_command = (
            f'gatk --java-options "-Xmx30G" Mutect2 '
            f"-R {fasta_file} "
            f"-I {bam_tumor_file} "
            f"-I {bam_normal_file} "
            f"-normal {n_name} "
            f"-tumor {t_name} "
            f"--germline-resource {germline_resources} "
            f"--panel-of-normals {panel_normals} "
            f"-O {results_output_dir}/mutect2.vcf "
            f"-L {chr_config} "
        )
        print("Running command:", mutect_coverage_command)

        mutect_coverage_result = os.system(mutect_coverage_command)
        if mutect_coverage_result != 0:
            raise Exception(f"MUTECT2 command failed with status {mutect_coverage_result}")
        
        results_output_dir = os.path.join(results_output_dir, "mutect2.vcf")

        d["status"] = 1
        d["message"] = "MUTECT2 completed successfully."
        d["output"] = results_output_dir

    except Exception as e:
        print(f"Error running MUTECT: {e}")
        d["status"] = 0
        d["message"] = str(e)

    return jsonify(d)

@app.route("/mutect_filtercalls", methods=["POST"])
@cross_origin()
def mutect_filtercalls():
    data = request.json
    fasta_file = data.get('fasta_file', '')
    v_file = data.get('v_file', '')
    contamination_table_file = data.get('contamination_table_file', '')

    node_id = data.get('node_id', '')

    fasta_dir = os.path.dirname(fasta_file)
    v_dir = os.path.dirname(v_file)
    contamination_table_dir = os.path.dirname(contamination_table_file)

    results_output_dir = os.path.join(mutect_results, node_id)

    d = {}
    try:
        # Ensure the output directory exists
        if not os.path.exists(results_output_dir):
            os.makedirs(results_output_dir)

        # Check for FASTA files
        fasta_result = check_files(fasta_dir, [".fa", ".fasta"])
        if fasta_result == 0:
            raise FileNotFoundError(f"No FASTA files found in {fasta_dir}")
        
        # Check for VCF files
        v_result = check_files(v_dir, [".vcf"])
        if v_result == 0:
            raise FileNotFoundError(f"No VCF files found in {v_result}")
        
        # Check for table files
        table_result = check_files(contamination_table_dir, [".table"])
        if table_result == 0:
            raise FileNotFoundError(f"No table files found in {table_result}")

        # Run sam sort command
        mutect_filtercalls_command = (
            f'gatk --java-options "-Xmx30G" '
            f"FilterMutectCalls "
            f"-R {fasta_file} "
            f"-V {v_file} "
            f"--contamination-table {contamination_table_file} "
            f"--min-allele-fraction 0.01 "
            f"-O {results_output_dir}/mutect2.filtered.vcf "
        )
        print("Running command:", mutect_filtercalls_command)

        mutect_filtercalls_result = os.system(mutect_filtercalls_command)
        if mutect_filtercalls_result != 0:
            raise Exception(f"GATK filtercalls command failed with status {mutect_filtercalls_result}")
        
        results_output_dir = os.path.join(results_output_dir, "mutect2.filtered.vcf")

        d["status"] = 1
        d["message"] = "GATK filtercalls completed successfully."
        d["output"] = results_output_dir

    except Exception as e:
        print(f"Error running GATK: {e}")
        d["status"] = 0
        d["message"] = str(e)

    return jsonify(d)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)