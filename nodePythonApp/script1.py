from psisim import telescope,instrument,observation,spectrum,universe,plots
import numpy as np
import matplotlib.pylab as plt
import copy
import time
import sys
from astropy.io import fits

print('Starting PSISIM script')

tmt = telescope.TMT()
psi_blue = instrument.PSI_Blue()
psi_blue.set_observing_mode(3600,10,'z',50, np.linspace(0.60,0.85,40)) #60s, 40 exposures,z-band, R of 10

exosims_config_filename = "forBruceandDimitri_EXOCAT1.json" #Some filename here
uni = universe.ExoSims_Universe(exosims_config_filename)
uni.simulate_EXOSIMS_Universe()

planet_table = uni.planets
full_planet_table = copy.deepcopy(uni.planets)
#Down select the planets whose separations are less than lambda/D
min_iwa = np.min(psi_blue.current_wvs)*1e-6/tmt.diameter*206265
planet_table = planet_table[planet_table['AngSep']/1000 > min_iwa]
planet_table = planet_table[planet_table['Flux Ratio'] > 1e-10] # this is a rough planet contrast estimated by EXOSIMS
n_planets = len(planet_table)

planet_types = []
planet_spectra = []

n_planets_now = 2 # how many 

rand_planets = np.random.randint(0, n_planets, n_planets_now)

# We're going to generate a model spectrum at a resolution twice the 
# requested resolution
intermediate_R = psi_blue.current_R*2
#Choose the model wavelength range to be just a little bigger than 
#the observation wavelengths
model_wv_low = 0.9*np.min(psi_blue.current_wvs) 
model_wv_high = 1.1*np.max(psi_blue.current_wvs)

#Figure out a good wavelength spacing for the model
wv_c = 0.5*(model_wv_low+model_wv_high) #Central wavelength of the model
dwv_c = wv_c/intermediate_R #The delta_lambda at the central wavelength
#The number of wavelengths to generate. Divide by two for nyquist in the d_wv. 
#Multiply the final number by 2 just to be safe.
n_model_wv = int((model_wv_high-model_wv_low)/(dwv_c/2))*2
#Generate the model wavelenths
model_wvs = np.linspace(model_wv_low, model_wv_high, n_model_wv) #Choose some wavelengths

print("\n Starting to generate planet spectra")
