import csv
import pandas as pd
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

def plotAccelerometer(filename):
    fig = plt.figure()
    df1 = pd.read_csv(filename)
    ax = plt.axes(projection = '3d')
    ax.scatter3D(df1['accelerometer.x'], df1['accelerometer.y'], df1['accelerometer.z'], 'red')
    plt.show()

def plotAccelerometer(filename):
    fig = plt.figure()
    df1 = pd.read_csv(filename)
    ax = plt.axes(projection = '3d')
    ax.scatter3D(df1['gyroscope.x'], df1['gyroscope.y'], df1['gyroscope.z'], 'green')
    plt.show()

plotAccelerometer('~/Downloads/final.csv')
plotGyroscope('~/Downloads/final.csv')
