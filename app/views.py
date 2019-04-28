from flask import render_template,request, url_for, jsonify, redirect, Response, send_from_directory
from app import app
from app import APP_STATIC
from app import APP_ROOT
from os import path
from os.path import splitext
import json
import csv
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

@app.route('/demoKDE', methods=['POST','GET'])
def demoKDE():
    kde_path = path.join(APP_STATIC,'assets/kdeMesh3d.csv')
    csvfile = open(kde_path)
    reader = csv.DictReader(csvfile,fieldnames = ('x','y','z','3dKDE'))
    kde = json.dumps([row for row in reader])
    ridge_path = path.join(APP_STATIC, 'assets/ridge.csv')
    csvfile = open(ridge_path)
    reader = csv.DictReader(csvfile,fieldnames = ('x','y','3dKDE','z'))
    ridge = json.dumps([row for row in reader])
    big_dump = {}
    big_dump['kde'] = kde

    return json.dumps({'kde' :kde,'ridge' : ridge})
