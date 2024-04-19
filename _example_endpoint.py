from flask import Flask
from flask import request
from flask import jsonify
from flask_cors import CORS, cross_origin 
import subprocess
import os

app = Flask(__name__) #instancia

@app.route('/fastqc', methods=['GET', 'POST']) #wrap (decorator)
@cross_origin()
def index():
    os.system("fastqc FASTQs/*fastq.gz")
    os.system("mv FASTQs/*.html RESULTS/FASTQC")
    os.system("mv FASTQs/*.zip RESULTS/FASTQC")
    
    """
    #result = subprocess.run(['fastqc', '--version'], stdout=subprocess.PIPE)
    result = subprocess.run(['fastqc', '*fastq.gz'], stdout=subprocess.PIPE)
    #result = subprocess.run(['ls', '-lh'], stdout=subprocess.PIPE)
    result_str = result.stdout.decode('UTF-8')
    print(result.stdout)
    result = subprocess.run(['mv', '*.html RESULTS/FASTQC'], stdout=subprocess.PIPE)
    result = subprocess.run(['mv', '*.zip RESULTS/FASTQC'], stdout=subprocess.PIPE)
    
    """

    return jsonify( {"content":"OK"} )

if __name__ == '__main__':
    app.run(debug=True, port=8002)



#@app.route('/task', methods=['PUT'])
#@cross_origin()
#def create_task():
#    content = model.create_task(request.json['task_title'], request.json['task_description'], request.json['user_id'])    
#    return jsonify(content)
