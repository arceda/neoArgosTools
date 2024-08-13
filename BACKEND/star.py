import json
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
    star_options = data.get('star_options', '')

    print(threads)

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
                f"--genomeDir {genome_dir} "
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)