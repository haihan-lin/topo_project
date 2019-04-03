#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Apr  1 21:36:47 2019

@author: youjia
"""

import numpy as np
import pandas as pd
import matplotlib.image as mpimg 
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from scipy import stats
#from mayavi import mlab


def read_path(file_path):
    f = open(file_path)
    long_array = f.readlines()
    output_array = []
    new_array = []
    for entry in long_array:
        if (not 'id' in entry) and (not '#' in entry) :
            number_array  = entry.split()
            new_array.append({'x':float(number_array[0]), 'y': float(number_array[1]), 'z': float (number_array[2]) })
        else:
            output_array.append(new_array)
            new_array = []
    result = list(filter(lambda x: x!=[],output_array))
    return result

path = "/Users/youjia/Documents/Utah-Soc/Spring2019/CS6170/final project/"
curves = read_path(path+'GL3D_Xfieldramp_inter_0080_cop.dat.vortex')

curves_new = []
for i in range(len(curves)):
    curve = curves[i]
    curve_new = np.repeat(0,4)
    for c in curve:
        curve_new = np.vstack([curve_new,np.array([i,c["x"],c["y"],c["z"]])])
    curve_new = curve_new[1:,:]
    curves_new.append(curve_new)
    
curves_list = curves_new[0]
for i in range(1,len(curves_new)):
    curves_list = np.vstack([curves_list,curves_new[i]])

## plot
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')
ax.scatter(curves_list[:,1], curves_list[:,2], curves_list[:,3], c='b', marker='o',s=5)
#plt.savefig(path+"screen_shots/shape")

curves_list1 = pd.DataFrame(curves_list)
curves_list1.columns = ["id","x","y","z"]

## 2d KDE 
data  = curves_list[:,1:3]
data = data.T
kde = stats.gaussian_kde(data)
density = kde(data)
x,y=data
plt.scatter(x,y,c=density)

fig, ax = plt.subplots(subplot_kw=dict(projection='3d'))
ax.scatter(x, y,density, c=density)

curves_list1["2dKDE"] = density


## 3d KDE
data  = curves_list[:,1:]
data = data.T

kde = stats.gaussian_kde(data)
density1 = kde(data)

fig, ax = plt.subplots(subplot_kw=dict(projection='3d'))
x, y, z = data
ax.scatter(x, y, z, c=density1)
#plt.show()
plt.savefig(path+"3dKDE")

curves_list1["3dKDE"] = density1

curves_list1.to_csv(path+"kde.csv",index=False)



### the following is just reference code

mu=np.array([1,10,20])
sigma=np.matrix([[4,10,0],[10,25,0],[0,0,100]])
data=np.random.multivariate_normal(mu,sigma,1000)
values = data.T

kde = stats.gaussian_kde(values)
density = kde(values)

fig, ax = plt.subplots(subplot_kw=dict(projection='3d'))
x, y, z = values
ax.scatter(x, y, z, c=density)
plt.show()


xmin, ymin, zmin = curves_list.min(axis=0)
xmax, ymax, zmax = curves_list.max(axis=0)
xi, yi, zi = np.mgrid[xmin:xmax:50j, ymin:ymax:50j, zmin:zmax:50j]

# Evaluate the KDE on a regular grid...
coords = np.vstack([item.ravel() for item in [xi, yi, zi]])
density = kde(coords).reshape(xi.shape)

# Visualize the density estimate as isosurfaces
mlab.contour3d(xi, yi, zi, density, opacity=0.5)
mlab.axes()
mlab.show()

#https://stackoverflow.com/questions/21918529/multivariate-kernel-density-estimation-in-python