from io import BytesIO
from flask import jsonify, request, Flask
import subprocess
import tempfile
from flask_cors import CORS

fastqc_path = "../FastQC/fastqc"

app = Flask(__name__)
CORS(app) 

@app.route("/fastqc", methods=["POST"])
def upload_file():
    d = {}
    options = ['--extract',]
    
    try:
        file = request.files['fastqc_file']
        file_name = file.name
        fastqc_command = "fastqc {} -o {} {}".format(fastqc_path, "fastqc", " ".join(options))
        d['status'] = 1
        
        with tempfile.NamedTemporaryFile(delete=True) as temp_file:
            subprocess.run(fastqc_command, shell=True) # No puedo ejecutar el comando en Windows ("fastqc" no se reconoce como un comando interno o externo,)
            output = temp_file.read().decode('utf-8')
            d['result'] = output
    
    except Exception as e:
        print(f"Couldn't upload file {e}")
        d['status'] = 0
        d['result'] = None # Mal procesamiento

    return jsonify(d)

if __name__ == '__main__':
    app.run(debug=True)