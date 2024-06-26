import json
from flask import jsonify, request, Flask
from flask_cors import CORS, cross_origin
import os

fastqc_path = "./FastQC/fastqc"
new_permissions = 0o755

#os.chdir("FastQC")
#os.chmod("fastqc", 0o755)


app = Flask(__name__)
CORS(app)

#path_fastq_files = "../FASTQs/"

@app.route("/fastqc", methods=["POST"])
@cross_origin()
def fastqc():
    d = {}

    try:
        data = request.get_data()
        jsonData = json.loads(data)  # Data en formato json para usar con fastqc <3
        os.system("fastqc ../FASTQs/*fastq.gz")
        os.system("mv ../FASTQs/*.html ../RESULTS/FASTQC")
        os.system("mv ../FASTQs/*.zip ../RESULTS/FASTQC")

        d["status"] = 1

        """
        PROCEDE LA EJECUCION DE FASTQC
        os.chmod(fastqc_path, new_permissions)
        print("Permissions changed to 755 successfully!")
        
        file = request.files['fastqc_file']
        file_name = file.name
        fastqc_command = "./fastqc {file}"
        d['status'] = 1
        
        with tempfile.NamedTemporaryFile(delete=True) as temp_file:
            
            subprocess.run(fastqc_command, shell=True)
            output = temp_file.read().decode('utf-8')
            d['result'] = output"""

    except Exception as e:
        print(f"Couldn't upload file {e}")
        d["status"] = 0
        d["result"] = None

    return jsonify(d)


if __name__ == "__main__":
    app.run(debug=True)
