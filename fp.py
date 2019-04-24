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
from astropy.io import fits
import cv2

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
plt.savefig(path+"curves")

plt.scatter(curves_list[:,1], curves_list[:,2],c='b', marker='o',s=5)
plt.savefig(path+"curves2d")


curves_list1 = pd.DataFrame(curves_list)
curves_list1.columns = ["id","x","y","z"]

## 2d KDE 
data  = curves_list[:,1:3]
data = data.T

X = np.arange(-70, 70, 1)
Y = np.arange(-30, 30, 1)

mesh = np.zeros(2)
for i in range(len(X)):
    for j in range(len(Y)):
        mesh = np.vstack((mesh,[X[i],Y[j]]))
mesh = mesh[1:,:]

kde = stats.gaussian_kde(data)
density = kde(mesh.T)
x,y=mesh.T
plt.scatter(x,y,c=density)
plt.savefig(path+"kdeColor")

fig, ax = plt.subplots(subplot_kw=dict(projection='3d'))
ax.scatter(x, y,density, c=density)

mesh = pd.DataFrame(mesh)
mesh.columns = ["x","y"]
mesh["2dKDE"] = density
mesh.to_csv(path+"kdeMesh.csv",index=False)


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

#img = cv2.imread(path+"kdeColor.jpg",0)
#img1 = img[:,:,0]
#high_thresh, thresh_im = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
#lowThresh = 0.5*high_thresh
#edges = cv2.Canny(img1,20,20)
#plt.imshow(edges,cmap = 'gray')
#
##plt.subplot(121),plt.imshow(img,cmap = 'gray')
##plt.title('Original Image'), plt.xticks([]), plt.yticks([])
##plt.subplot(122),plt.imshow(edges,cmap = 'gray')
##plt.title('Edge Image'), plt.xticks([]), plt.yticks([])
##
##plt.show()
#plt.imshow(img)
#
#
#plt.imshow(edges,cmap = 'gray')

def constructSp(df): # construct simplices
    df = np.array(df)
    sp = []
    fmax = np.max(df[:,2])
    for i in range(0,140):
        for j in range(0,60):
            # print(i,j)
            idx = 60*j+i
            pt1 = df[idx,:]
            pt2 = df[idx+1,:]
            pt3 = df[idx+60,:]
            pt4 = df[idx+61,:]
            line1 = str(int(round(pt1[0]*100)))+" "+str(int(round(pt1[1]*100)))+" "+str(int(round(pt2[0]*100)))+" "+str(int(round(pt2[1]*100)))+" "+str(int(round(pt3[0]*100)))+" "+str(int(round(pt3[1]*100)))+" "+str(int(round((fmax-pt1[2])*1000000000)+1))+"\n"
            line2 = str(int(round(pt2[0]*100)))+" "+str(int(round(pt2[1]*100)))+" "+str(int(round(pt3[0]*100)))+" "+str(int(round(pt3[1]*100)))+" "+str(int(round(pt4[0]*100)))+" "+str(int(round(pt4[1]*100)))+" "+str(int(round((fmax-pt4[2])*1000000000)+1))+"\n" 
            sp.append(line1)
            sp.append(line2)
    return sp

mesh_persis = constructSp(mesh)
#temp = []
#for i in mesh_persis:
#    i=i.split(" ")
#    if i[6] not in temp:
#        temp.append(i[6])
#    else:
#        print(i[6])
with open(path+"mesh.txt","w") as f:
    for line in mesh_persis:
        f.write(line)
    f.close()
    
sp = pd.read_csv(path+"mesh.txt",sep=" ",header=None)
sp = sp.sort_values(by=[6]) # sort by birth time
with open(path+"mesh_new.txt","w") as f:
    f.write("2\n")
    f.write("2\n")
    for i in range(0,len(sp)):
        line = list(sp.iloc[i,:])
        s = ""
        for e in line:
            s+= str(e)+" "
        s += "\n"
        f.write(s)
f.close()

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