from io import BytesIO
from flask import jsonify, request, Flask
import os
import subprocess
from flask_cors import CORS

FASTQC = "./scripts/fastqc.sh" #Ubicacion del SH de FastQC
app = Flask(__name__)
CORS(app) 

@app.route("/fastqc", methods=["POST"])
def upload_file():
    d = {}
    try:
        file = request.files['fastqc_file']
        filename = file.filename
        print(f"Uploading file {filename}")
        d['status'] = 1
        
        # Guardar el archivo en el servidor
        archivo_guardado = os.path.join(app.root_path, filename)
        file.save(archivo_guardado)
        subprocess.run(['bash', 'tu_script.sh', archivo_guardado]) # TEMPLATE PARA EJECUTAR


    except Exception as e:
        print(f"Couldn't upload file {e}")
        d['status'] = 0

    return jsonify(d)  # Temporal

if __name__ == '__main__':
    app.run(debug=True)
