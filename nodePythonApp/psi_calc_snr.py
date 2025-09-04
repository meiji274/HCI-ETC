from psisim import telescope,instrument,observation,spectrum,universe,plots
import numpy as np
import matplotlib.pylab as plt
import copy
import time
import sys
from astropy.io import fits

# mag = sys.argv[1] 

# print('Magnitude = {}'.format(mag))

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
for planet in planet_table[rand_planets]:

    #INSERT PLANET SELECTION RULES HERE
    planet_type = "Gas"
    planet_types.append(planet_type)

    time1 = time.time()
    #Generate the spectrum and downsample to intermediate resolution
    atmospheric_parameters = spectrum.generate_picaso_inputs(planet,planet_type, clouds=True)
    planet_spectrum = spectrum.simulate_spectrum(planet, model_wvs, intermediate_R, atmospheric_parameters)
    planet_spectra.append(planet_spectrum)
    
    time2 = time.time()
    print('Spectrum took {0:.3f} s'.format((time2-time1)))

print("Done generating planet spectra")

print("\n Starting to simulate observations")

planet_spectra = np.array(planet_spectra)

post_processing_gain=1000
sim_F_lambda, sim_F_lambda_errs,sim_F_lambda_stellar, noise_components = observation.simulate_observation_set(tmt, psi_blue,
    planet_table[rand_planets], planet_spectra, model_wvs, intermediate_R, inject_noise=False,
    post_processing_gain=post_processing_gain,return_noise_components=True)


speckle_noises = noise_components[:,0,:]
photon_noises = noise_components[:,3,:]

flux_ratios = sim_F_lambda/sim_F_lambda_stellar
detection_limits = sim_F_lambda_errs/sim_F_lambda_stellar
snrs = sim_F_lambda/sim_F_lambda_errs

detected = psi_blue.detect_planets(planet_table[rand_planets],snrs,tmt)

# get the best SNR Planet
avg_snrs = np.mean(snrs, axis=1)
print(avg_snrs)
argsort_snrs = np.argsort(np.abs(avg_snrs - 6))
bestsnr = argsort_snrs[0] #np.argmax(avg_snrs)

# Generate the cloudy spectrum of this planet
planet = planet_table[rand_planets[bestsnr]]
atmospheric_parameters_clear = spectrum.generate_picaso_inputs(planet, planet_type, clouds=False)
planet_spectrum_clear = spectrum.simulate_spectrum(planet, model_wvs, intermediate_R, atmospheric_parameters_clear)

# Generate noisy spectra for cloudy and clear
clear_F_lambda, clear_F_lambda_errs, _ = observation.simulate_observation(tmt, psi_blue,
   planet_table[rand_planets[bestsnr]], planet_spectrum_clear, model_wvs, intermediate_R, inject_noise=True,post_processing_gain=post_processing_gain)
cloudy_F_lambda, cloudy_F_lambda_errs, _ = observation.simulate_observation(tmt, psi_blue,
   planet_table[rand_planets[bestsnr]], planet_spectra[bestsnr], model_wvs, intermediate_R, inject_noise=True,post_processing_gain=post_processing_gain)

np.set_printoptions(formatter={'float_kind':'{:f}'.format})

np.savetxt('spectra_clear_test.txt', clear_F_lambda/1e22, fmt='%1.3f')
np.savetxt('spectra_cloudy_test.txt', cloudy_F_lambda/1e22, fmt='%1.3f')

np.savez('sim_F_lambda.npz', sim_F_lambda)
np.savez('sim_F_lambda_errs.npz', sim_F_lambda_errs)
np.savez('sim_F_lambda_stellar.npz', sim_F_lambda_stellar)
print('Saving output.')

print(sim_F_lambda)