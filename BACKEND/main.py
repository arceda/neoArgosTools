import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess

app = Flask(__name__)
CORS(app)


RNAseqs = []


@app.route('/preview_output', methods=['POST'])
def preview_output():
    try:
        data = request.json
        num_chars = data.get('lines', 2000)
        path = data.get('path')

        if not path:
            return jsonify({'error': 'No se proporcionó una ruta de archivo'}), 400

        full_path = os.path.join(path)
        if not os.path.exists(full_path):
            return jsonify({'error': 'Archivo no encontrado'}), 404

        preview_output = ''
        with open(full_path, 'r') as file:
            while len(preview_output) < num_chars:
                chunk_size = min(num_chars - len(preview_output), 8192)
                chunk = file.read(chunk_size)
                if not chunk:
                    break
                preview_output += chunk

        if len(preview_output) > num_chars:
            preview_output = preview_output[:num_chars]

        return jsonify({'output_preview': preview_output}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def save_file(file, folder, id_val):
    save_path = os.path.join('static/InputFiles', folder, id_val)
    if not os.path.exists(save_path):
        os.makedirs(save_path)
    file_path = os.path.join(save_path, file.filename)
    file.save(file_path)
    return file_path


def download_and_save_file(url, folder, id_val):
    response = requests.get(url)
    if response.status_code == 200:
        filename = url.rsplit('/', 1)[-1]
        save_path = os.path.join('static/InputFiles', folder, id_val)
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
    rna_type = request.form.get('rna_type', 'normal').lower()
    id_val = request.form.get('id', '0').lower()

    if rna_type not in ['rna normal', 'rna tumor']:
        print(rna_type)
        print(id_val)
        return jsonify({'error': 'Invalid RNA type'}), 400



    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        file_path = save_file(file, 'RNAnormal' if rna_type ==
                              'rna normal' else 'RNAtumor', id_val)
        return jsonify({'message': 'File uploaded successfully ', 'file_path': file_path}), 200

    elif 'url' in request.form:
        url = request.form['url']
        file_path = download_and_save_file(
            url, 'RNAnormal' if rna_type == 'rna normal' else 'RNAtumor', id_val)
        if file_path:
            return jsonify({'message': 'File downloaded and saved successfully', 'file_path': file_path}), 200
        else:
            return jsonify({'error': 'Failed to download file from URL'}), 400

    return jsonify({'error': 'No file or URL provided'}), 400


@app.route("/fastqc", methods=["POST"])
def fastqc():
    try:
        file_name = request.json.get('file_name')
        id_val = request.form.get('id', '0').lower()

        base_path = os.path.join(os.getcwd(), 'static', 'InputFiles')
        rna_normal_path = os.path.join(
            base_path, 'RNAnormal', id_val, file_name)
        rna_tumor_path = os.path.join(base_path, 'RNAtumor', id_val, file_name)

        if os.path.exists(rna_normal_path):
            file_path = rna_normal_path
        elif os.path.exists(rna_tumor_path):
            file_path = rna_tumor_path
        else:
            return jsonify({"error": "File not found"}), 404

        fastqc_command = f"fastqc {file_path}"

        subprocess.run(fastqc_command, shell=True, check=True)

        output_html_dir = os.path.join(os.getcwd(), 'static', 'OutputFiles')
        if not os.path.exists(output_html_dir):
            os.makedirs(output_html_dir)

        result_html = os.path.join(
            output_html_dir, file_name.replace(".fastq", "_fastqc.html"))

        generated_html_path = file_path.replace(".fastq", "_fastqc.html")
        if os.path.exists(generated_html_path):
            os.rename(generated_html_path, result_html)
            relative_html_path = os.path.relpath(
                result_html, os.path.join(os.getcwd(), 'static'))
            return jsonify({"html_path": relative_html_path}), 200
        else:
            return jsonify({"error": "HTML file not found"}), 404

    except Exception as e:
        print(f"Couldn't process file {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=3000)
