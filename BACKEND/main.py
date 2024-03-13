from io import BytesIO
from flask import jsonify, request, Flask
import subprocess
import tempfile
from flask_cors import CORS

fastQC = "../FastQC/fastqc"

app = Flask(__name__)
CORS(app) 

@app.route("/fastqc", methods=["POST"])
def upload_file():
    d = {}
    try:
        file = request.files['fastqc_file']
        d['status'] = 1
        
        with tempfile.NamedTemporaryFile(delete=True) as temp_file:
            temp_file.write(file.read())
            process = subprocess.Popen([fastQC, '-o', 'output_dir', temp_file.name], stdout=subprocess.PIPE) # AYUDAAAA D:
            output = temp_file.read().decode('utf-8')
            d['result'] = output
    
    except Exception as e:
        print(f"Couldn't upload file {e}")
        d['status'] = 0
        d['result'] = None # Mal procesamiento

    return jsonify(d)

if __name__ == '__main__':
    app.run(debug=True)
