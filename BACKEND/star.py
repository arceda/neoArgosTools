import json
import requests
import os
from flask import jsonify, request, Flask
from flask_cors import CORS, cross_origin

# Define paths
star_path = "/usr/local/bin/STAR"  # Ensure this path is correct in your container
fastq_input_dir = "../FASTQs/"  # Use the absolute path in the container
results_output_dir = "../RESULTS/STAR/"  # Use the absolute path in the container
genome_dir = "./reference_chr15"  # Ensure this path is correct in your container

app = Flask(__name__)
CORS(app)

@app.route("/star", methods=["POST"])
@cross_origin()
def run_star():
    data = request.json
    threads = data.get('threads', '')
    indexing = data.get('indexing', genome_dir)
    star_options = data.get('star_options', '')

    print(threads)
    print(indexing)

    d = {}
    try:
        # Ensure the output directory exists
        if not os.path.exists(results_output_dir):
            os.makedirs(results_output_dir)

        # List FASTQ files in the input directory
        fastq_files = [f for f in os.listdir(fastq_input_dir) if f.endswith(".fastq.gz")]
        if not fastq_files:
            raise FileNotFoundError(f"No FASTQ files found in {fastq_input_dir}")

        for file in fastq_files:
            name = file.split('.')[0]

            # Construct the STAR command with additional options
            star_command = (
                f"{star_path} "
                f"--runThreadN {threads} "
                f"--genomeDir {indexing} "
                f"--readFilesIn {fastq_input_dir}/{file} "
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

    except Exception as e:
        print(f"Error running STAR: {e}")
        d["status"] = 0
        d["message"] = str(e)

    return jsonify(d)

def save_file(file, folder):
    save_path = os.path.join('./other', folder)
    if not os.path.exists(save_path):
        os.makedirs(save_path)
    file_path = os.path.join(save_path, file.filename)
    file.save(file_path)
    return file_path

def download_and_save_file(url, folder):
    response = requests.get(url)
    if response.status_code == 200:
        filename = url.rsplit('/', 1)[-1]
        save_path = os.path.join('./other', folder)
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
    save_dir_name = request.form.get('save_dir_name', '')
    
    folder_name = save_dir_name

    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        file_path = save_file(file, folder_name)
        return jsonify({'message': 'File uploaded successfully', 'file_path': file_path}), 200

    elif 'url' in request.form:
        url = request.form['url']
        file_path = download_and_save_file(url, folder_name)
        if file_path:
            return jsonify({'message': 'File downloaded and saved successfully', 'file_path': file_path}), 200
        else:
            return jsonify({'error': 'Failed to download file from URL'}), 400

    return jsonify({'error': 'No file or URL provided'}), 400


indexing_files_dir = "./other"  # Use the absolute path in the container
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)