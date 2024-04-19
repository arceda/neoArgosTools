from flask import Flask
from flask import request
from flask import jsonify
from flask_cors import CORS, cross_origin 
import subprocess

app = Flask(__name__) #instancia

@app.route('/fastqc', methods=['GET', 'POST']) #wrap (decorator)
@cross_origin()
def index():
    result = subprocess.run(['fastqc', '--version'], stdout=subprocess.PIPE)
    result_str = result.stdout.decode('UTF-8')
    print(result.stdout)
    return jsonify( {"content":result_str} )

if __name__ == '__main__':
    app.run(debug=True, port=8002)



#@app.route('/task', methods=['PUT'])
#@cross_origin()
#def create_task():
#    content = model.create_task(request.json['task_title'], request.json['task_description'], request.json['user_id'])    
#    return jsonify(content)
