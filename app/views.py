from flask import render_template,request, url_for, jsonify, redirect, Response, send_from_directory
from app import app
from app import APP_STATIC
from app import APP_ROOT
from os import path
from os.path import splitext
import json
# import pandas
import numpy as np
import pandas as pd
import os

@app.route('/')
@app.route('/vis_msvf')
def index():
    return render_template('visUncertainty.html')

@app.route('/import', methods = ['POST', 'GET'])
def importFile():
    jsdata = request.files['files']
    filename = path.join(APP_STATIC, 'assets/',jsdata.filename)
    with open(filename) as f:
        data = json.load(f)
        print(data)
        f.close()

    return jsonify(data)
