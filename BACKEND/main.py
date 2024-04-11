import os
from flask import jsonify, request, Flask
import subprocess
import tempfile
from flask_cors import CORS

fastqc_path = "./FastQC/fastqc"
new_permissions = 0o755

def fastQCLinux():
    pass

app = Flask(__name__)
CORS(app) 

@app.route("/fastqc", methods=["POST"])
def upload_file():
    d = {}
    options = ['--extract',]
    
    try:
        os.chmod(fastqc_path, new_permissions)
        print("Permissions changed to 755 successfully!")
        
        file = request.files['fastqc_file']
        file_name = file.name
        fastqc_command = "./fastqc {file}"
        d['status'] = 1
        
        with tempfile.NamedTemporaryFile(delete=True) as temp_file:
            '''
                Aqui va el codigo para ejecutar los comandos de fastqc en base a la plataforma que se quiera
                y se retorna dentro de un json para abrirlo en el navegador
            '''
            
            subprocess.run(fastqc_command, shell=True)
            output = temp_file.read().decode('utf-8')
            d['result'] = output
    
    except Exception as e:
        print(f"Couldn't upload file {e}")
        d['status'] = 0
        d['result'] = None
    
    except OSError as error:
        print("Error changing permissions:", error)

    return jsonify(d)

if __name__ == '__main__':
    app.run(debug=True)
