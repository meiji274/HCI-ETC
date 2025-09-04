// The moffat distribution describes the photon noise from the speckles, not the speckle noise which we've assumed has been perfectly canceled out by 
// our differential subtraction of two polametric observations (which is why we can model it as a simple sqrt(N) photon noise). See the strehl info from Becky
// for proper scaling of this photon noise as a function of filter. This is the value that we then scale by the 20% of the strehl ratio. This photon noise is 
// just another noise contribution term to the SNR measurement, so we don't need to have a separate plot for it. We'll forget about contrast for now. 

/////////////////////////////////////////////
// This is the code to preload the images
/////////////////////////////////////////////
var imageList = Array();
for (let i = 0; i < 3; i++) {
    imageList[i] = new Image(200, 200);
    imageList[i].src = `etc_pic${i+1}.png`;
}


function switchImage() {
  const sel = document.getElementById('instrument');
  const idx = Number(sel.value);       // 0,1,2 as in your HTML
  document.getElementById('myImage').src = imageList[idx].src;
}


function chooseInstrument() {
    var instrumentName = document.getElementById("instrument");
    var instrumentNameText = instrumentName.options[instrumentName.selectedIndex].text;
}


function changeButton() {
    var presetButton = document.getElementById("usePreset");
    var presetBox = document.getElementById('presetBox');
    if (presetButton.value=="Use Preset Target") {
        presetButton.value = "Don't Use Preset Target";
        presetBox.className='shown margin-auto align-text';
    }   
    else {
        presetButton.value = "Use Preset Target";
        presetBox.className='hidden';
    }
}



//////////////////////////////////////////////////////////////////////
// Helper functions to get and set arrays of elements with ids like 
// `${prefix}1`, `${prefix}2`, ..., `${prefix}{count}`
//////////////////////////////////////////////////////////////////////
function getElems(prefix, count) {
  return Array.from({ length: count }, (_, i) =>
    document.getElementById(`${prefix}${i + 1}`)
  );
}

// Helper: set values from an array into a list of inputs
function setValues(elems, values) {
  elems.forEach((el, i) => {
    if (el && values[i] != null) el.value = values[i];
  });
}

/////////////////////////////////////////////////////////////////////
// Target dictionary with photometric values for a range of filters
/////////////////////////////////////////////////////////////////////
const targets = {
  "HR 8799 b":  { J:16.52, H:15.08, K:14.05, "Lp":12.68, "Ms":13.07 },
  "HR 8799 c":  { J:14.65, H:14.18, K:13.13, "Lp":11.83, "Ms":12.05 },
  "HR 8799 d":  { J:15.26, H:14.23, K:13.11, "Lp":11.50, "Ms":11.67 },
  "HR 8799 e":  { H:13.88, K:12.89, "Lp":11.61, "Ms":10.09 },
  "kappa And b":  {J:12.7, H:11.7, K:11.0, "Lp":9.54},
  "1RXJ 1609 B":  {J:12.09, H:11.06, K:10.38, "Lp":8.99},
  "GSC 06214 B":  {J:10.43, H:9.74, K:9.14, "Lp":7.94, "Ms":7.94},
  "USco CTIO108 B":  {J:10.72, H:9.94, K:9.30},
  "HIP 78530 B":  {J:9.25, H:8.58, K:8.36, "Lp":7.99},
  "2M 1207 B":  {J:16.40, H:14.49, K:13.31, "Lp":11.68},
  "2M 1207 A":  {J:9.35, H:8.74, K:8.30, "Lp":7.73},
  "TWA 5 B":  {J:9.1, H:8.65, K:7.91},
  "HR 7329 B":  {J:8.64, H:8.33, K:8.18, "Lp":7.69},
  "PZ Tel B":  {J:8.70, H:8.31, K:7.86},
  "2M0103AB B":  {J:12.1, H:10.9, K:10.3, "Lp":9.3},
  "AB Pic B":  {J:12.80, H:11.31, K:10.76, "Lp":9.9},
  "Luhman 16 B":  {J:14.69, H:13.86, K:13.20},
  "Luhman 16 A":  {J:15.00, H:13.84, K:12.91},
  "CD-35 2722 B":  {J:11.99, H:11.14, K:10.37}
};

$("#Target").change(function () {
  const t = $(this).val();
  const bandMap = targets[t] || {};
  const html = Object.entries(bandMap)
    .map(([name, val]) => `<option name='${name}' value=${val}> ${name} </option>`)
    .join("");
  $("#targetFilter").html(html);
});


///////////////////////////////////////////////////////////////////
// Global variables and Helper functions for the main calculation
///////////////////////////////////////////////////////////////////

// Global app state
const G = {
  totalInt: 0,
  ExpTimeList: [],
  snrList: [],         // length 9 (index 0..8) from your loop
  polFracList: [],     // length 9 (index 0..8) from your loop
  minExpValues: [],    // length 8
  spectraClear: [],    // up to 40 lines (numbers)
  spectraCloudy: [],   // up to 40 lines (numbers)
  contrastList: []     // length 20
};

// Keep chart instances to destroy/recreate cleanly
let snrChartInst, snrPolChartInst, spectraClearChartInst, contrastChartInst;

// label helper
function getTargetLabel(){
  const sel = document.getElementById('Target');
  return sel ? sel.value : '';
}


// Sets values from elements list
function setValuesFrom(list, startIndex, elems) {
  const take = Math.min(elems.length, Math.max(0, list.length - startIndex));
  setValues(elems, list.slice(startIndex, startIndex + take));
}

// Read in the spectra files
let spectraClear = [];
let spectraCloudy = [];

function attachSpectrumReader(inputId, setter) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('change', function () {
    if (this.files.length === 0) return;
    const reader = new FileReader();
    reader.onload = () => {
      const arr = reader.result.split(/\r?\n/).map(Number).filter(v => !Number.isNaN(v));
      setter(arr);
    };
    reader.readAsText(this.files[0]);
  });
}

attachSpectrumReader('spectraClear',  arr => { G.spectraClear  = arr.slice(0, 40); });
attachSpectrumReader('spectraCloudy', arr => { G.spectraCloudy = arr.slice(0, 40); });

// Define Moffat distribution
var beta = 4.765;
var FWHM = 2.9207*beta;
var alpha = FWHM/(2*Math.sqrt(2**(1/beta) - 1));

function moffat(I_0, r, alpha, beta) {
    var Intensity = I_0 * (1 + (r / alpha)**2)**(-1 * beta);

    return Intensity;
}


// Calculation functions
function convert_mag_to_counts(mag, zp) {
    // """
    // mag: magnitude 
    // zp: photometric zeropoint
    
    // output: counts * s^-1 * m^-2 * micron^-1 
    
    // See link for calculation of flux from photometric zeropoint: 
    //     https://www.stsci.edu/documents/dhb/web/c32_wfpc2dataanal.fm1.html
    // """    
    return 10**(.4*(zp - mag));
}


function calculate_N_obj(mag, zp, filter_band, exp_time, Eff, SA) {
    // """
    // calculate total counts for object given various parameters
    
    // mag: magnitude
    // zp: photometric zeropoint 
    // filter_band: filter band width (e.g. J,H,K,etc.) [micron]
    // exp_time: exposure time [s]
    // Eff: detector quantum efficiency 
    // SA: primary mirror surface area [m^2]
    // """
    return convert_mag_to_counts(mag, zp) * filter_band * exp_time * Eff * SA;
}


function calculate_Z(mag, zp, filter_band, strehl, Eff, SA) {

    return mag + 2.5*Math.log10(convert_mag_to_counts(mag, zp)*filter_band*Eff*SA);

    //return mag + 2.5*Math.log10(convert_mag_to_counts(mag, zp)*filter_band*Eff*SA) - 2.5*Math.log10(strehl);
}


function calculate_sky_bkg(Z, S, arcsec_per_px) {
    // """
    // output: sky background in counts/s/px
    // """
    return (arcsec_per_px**2) * (10**(.4*(Z - S)));
}


function calculate_SNR(N_obj, npix, sky_bkg, nreads, exp_time, readout_noise, dark_current) {
    // """
    // calculate signal-to-noise (SNR) ratio for object given flux counts and various noise parameters
    
    // N_obj: total photon counts from object [e-]
    // npix: number of pixels in detector image
    // sky_bkg: photon counts from sky background per pixel per second [e-/px/s]
    // nreads: number of reads
    // dark_current: dark current noise [e-/px/s]; default value is .1 e-/px/s (see table above) which 
    //                 is a conservative upper limit
    // exp_time: exposure time
    // readout_noise: base readout noise in CDS mode (2 reads) per pixel [e-/px]; default value is 38 e-/px
    //                 see link: https://www2.keck.hawaii.edu/koa/public/nirc2/nirc2_data_form.html
    // """
    var readout_noise_reduced = readout_noise/Math.sqrt(nreads)
    
    var snr_output = N_obj/Math.sqrt(N_obj + npix*sky_bkg*exp_time + npix*(readout_noise_reduced**2) + npix*dark_current*exp_time);
    
    return snr_output;
}


//////////////////////////////////////////////////////
// Plot functions that read from G, not the DOM
//////////////////////////////////////////////////////

function plot_snr_from_state() {
  const totalInt = Number(G.totalInt) || 0;
  // You previously used snr indices 1..8 at x = 1/4..2 * totalInt
  const points = [
    { x: 0, y: 0 },
    ...G.snrList.slice(1, 9).map((y, i) => ({
      x: totalInt * ((i + 1) / 4),
      y: Number(y) || 0
    }))
  ];

  const ctx = document.getElementById('snrChart').getContext('2d');
  if (snrChartInst) snrChartInst.destroy();
  snrChartInst = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: getTargetLabel(),
        data: points,
        showLine: true,
        pointStyle: 'line',
        borderColor: 'black',
        pointBackgroundColor: 'black',
        fill: false
      }]
    },
    options: {
      title: { display: true, text: 'SNR v. Exposure Time (s)', fontSize: 20 },
      responsive: false,
      scales: {
        xAxes: [{ type: 'linear', position: 'bottom', scaleLabel: { display: true, labelString: 'Exposure Time (s)' } }],
        yAxes: [{ type: 'linear', position: 'left',   scaleLabel: { display: true, labelString: 'SNR' } }]
      }
    }
  });
}

function plot_pol_snr_from_state() {
  const data = G.minExpValues.map((t, i) => ({
    x: Number(t) / 3600,                   // sec → hr
    y: Number(G.polFracList[i + 1]) * 100  // you used indices 1..8 for polFrac
  }));

  const ctx = document.getElementById('snrPolChart').getContext('2d');
  if (snrPolChartInst) snrPolChartInst.destroy();
  snrPolChartInst = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: getTargetLabel(),
        data,
        showLine: true,
        borderColor: 'red',
        pointBackgroundColor: 'red',
        fill: false
      }]
    },
    options: {
      title: { display: true, text: 'Polarization Fraction (%) vs. Minimum Detection Exposure Time (hr)', fontSize: 20 },
      responsive: false,
      scales: {
        xAxes: [{ type: 'linear', position: 'bottom', scaleLabel: { display: true, labelString: 'Minimum Detection Threshold Exposure Time (hr)' } }],
        yAxes: [{ type: 'linear', position: 'left',   scaleLabel: { display: true, labelString: 'Polarization Fraction (%)' } }]
      }
    }
  });
}

function plot_spectra_from_state() {
  // Build wavelengths 600 → 850 nm (40 points)
  const xs = Array.from({ length: 40 }, (_, i) => 600 + (250 * i) / 39);
  const clearData  = xs.map((x, i) => ({ x, y: Number(G.spectraClear[i])  || 0 }));
  const cloudyData = xs.map((x, i) => ({ x, y: Number(G.spectraCloudy[i]) || 0 }));

  const ctx = document.getElementById('spectraClearChart').getContext('2d');
  if (spectraClearChartInst) spectraClearChartInst.destroy();
  spectraClearChartInst = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        { label: 'Clear target atmosphere',  data: clearData,  showLine: true, pointStyle: 'line', borderColor: 'blue',  pointBackgroundColor: 'blue',  fill: false },
        { label: 'Cloudy target atmosphere', data: cloudyData, showLine: true, pointStyle: 'line', borderColor: 'gray',  pointBackgroundColor: 'gray',  fill: false }
      ]
    },
    options: {
      title: { display: true, text: 'Target Spectrum (R band)', fontSize: 20 },
      responsive: false,
      scales: {
        xAxes: [{ type: 'linear', position: 'bottom', scaleLabel: { display: true, labelString: 'Wavelength (nm)' } }],
        yAxes: [{ type: 'linear', position: 'left',   scaleLabel: { display: true, labelString: 'Flux (counts) * 1e22' } }]
      }
    }
  });
}

function plot_contrast_from_state() {
  const data = G.contrastList.map((y, i) => ({ x: i + 1, y: Number(y) || 0 }));

  const ctx = document.getElementById('contrastChart').getContext('2d');
  if (contrastChartInst) contrastChartInst.destroy();
  contrastChartInst = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: getTargetLabel(),
        data,
        showLine: true,
        pointStyle: 'line',
        borderColor: 'orange',
        pointBackgroundColor: 'orange',
        fill: false
      }]
    },
    options: {
      title: { display: true, text: 'Speckle noise vs. angular separation', fontSize: 20 },
      responsive: false,
      scales: {
        xAxes: [{ type: 'linear', position: 'bottom', scaleLabel: { display: true, labelString: 'Angular separation (λ/D)' } }],
        yAxes: [{ type: 'linear', position: 'left',   scaleLabel: { display: true, labelString: 'Speckle noise (counts)' } }]
      }
    }
  });
}


//////////////////////////////////////////////////////
////////////  Official NIRC2 functions  //////////////
//////////////////////////////////////////////////////

function tmin(x, y, samp_mode, n_reads)
{
	const samp_rate = 200;
	const overhead = 6.001;
	y = y + 8;
	const ticks = 5000000/(samp_rate*1000);
	const n_pause = ticks - 8;
	const start_time = 240 * (1324 - y);
	const rows_time = 25 * y * (n_pause * (8 + x / 4) + (864 + 1.25 * x));
	// Add overhead, scale from nanoseconds
	let min_time = start_time + rows_time;
	min_time = (1 + overhead / 100) * min_time / 1000000000;
	if (samp_mode == 3) min_time = min_time * n_reads;
	// Trap for values less than 2.5 millisec
	if (min_time < 0.0025) min_time = 0.0025;
	return min_time;
}


function n2_eff(ExpTime, coadds, n_images, samp_mode, n_reads, window, ao_mode, n_dither_pos, lgs_dither)
{
	// The total time spent integrating and reading out the detector (not including the time
	// to transfer data around) should be:
	//     tread = [ExpTime + (readmin * nreads)] * coadds
	// where readmin is the minimum integration time for a given array format in CDS.
	// If I subtract this from each measured time/frame, assume that there is a fixed-length
	// overhead A associated with gathering and writing the FITS header data, plus extra
	// overhead per pixel B due to opening the file and writing the data, I get:
	//     A = 3.05 seconds per frame
	//     B = 4.65e-6 seconds per pixel
	// The final formula for total time per frame is:
	//     time/frame = (ExpTime + (tmin * samp) * coadd + A + (B * Xsubc * Ysubc))
	var nirc2_a_parm = 3.05;
	var nirc2_b_parm = 0.00000465;
	// See function tmin for more information
	var read_min = tmin(window, window, 2, 2);
	// Other variables and parms
	// We assume the dither overhead for FSM than for TSS, which is true within 1 or 2 sec
	var ao_dither_overhead = 6;
	var laser_dither_overhead = 15;
	// Set the number of AO moves.  They are equal to n_dither_pos + 1 unless they are
	// equal to 5 or 9
	var n_moves = n_dither_pos + 1;
	if (n_dither_pos == 5 || n_dither_pos == 9) n_moves = n_dither_pos;
	if (n_dither_pos == 1) n_moves = 0;

	var lgs_dither = 1;
	if (ao_mode == 0) lgs_dither = 0;

	var dither_overhead = ao_dither_overhead + laser_dither_overhead * lgs_dither;
	var time_per_coadd = ExpTime + (n_reads * read_min);
	var write_overhead = nirc2_a_parm + (nirc2_b_parm * window * window);
	var move_overhead = dither_overhead * n_moves;
	var t_obs_time = move_overhead + n_dither_pos * n_images * ((time_per_coadd * coadds) + write_overhead);
	var t_dit_pos = n_images *((time_per_coadd*coadds)+write_overhead);
	var os_time = n_dither_pos * n_images * coadds * ExpTime;
	var eff = 100*(os_time/t_obs_time);
	var nirc2_overhead = t_obs_time - move_overhead - os_time;

    return [eff, move_overhead, nirc2_overhead, os_time, t_obs_time];
}


// Strehl ratios by filter band
// Band (central wavelength, microns): J(1.25) H(1.64) K(2.2) L(3.5) Ms(4.7) 
// Strehl ratio: 0.21 0.36 0.53 0.78 0.87 


function nirc2_s2n(mag, filter, camera, n_exp, tint, strehl, n_reads)
{
	// Read noise in electrons (CDS, 40 electrons per read)
	var r_noise = 56;
	if (n_reads > 2) r_noise = r_noise / Math.sqrt(n_reads);
	// Number of pixels in aperture
	var n_pix = 50.0;
	// Background rate, electrons/sec (Ms=8.7e4*4.0)(j=634)
	var background = 634;
	// Zero point magnitude (from electrons/sec)
	var m_zero = 25.1;
	// Electrons per DN
	var gain = 4.0;

	if (camera == "Wide")
	{
		var background = {J:0.5, H:4.0, K:5.7, Kp:5.6, Lp:78535, Ms:78535};
		// var zero_point = {J:26.90, H:26.96, K:26.18, Kp:26.30, Lp:25.08, Ms:22.87};
		// ZPs in e-/s converted from ZPs in DN/s shown in
		// filters.html (CAAI: 20200828)
		var zero_point = {J:26.85, H:26.94, K:26.13, Kp:26.24, Lp:24.70, Ms:22.70};
		var n_pix = {J:12.5, H:12.5, K:12.5, Kp:12.5, Lp:28.4, Ms:38.5};
	}
	if (camera == "Narrow")
	{
		var background = {J:0.5, H:4.0, K:5.7, Kp:5.6, Lp:18535, Ms:18535};
		// var zero_point = {J:26.90, H:26.96, K:26.18, Kp:26.30, Lp:25.08, Ms:22.87};
		// ZPs in e-/s converted from ZPs in DN/s shown in
		// filters.html (CAAI: 20200828)
		var zero_point = {J:26.85, H:26.94, K:26.13, Kp:26.24, Lp:24.70, Ms:22.70};
		var n_pix = {J:78.5, H:50.2, K:95.2, Kp:95.2, Lp:283.5, Ms:490.8};
	}

	var bg = background[filter] * gain;
	if (camera != "Narrow") bg = bg * 16;

	var m_zero = zero_point[filter] + 2.5 * Math.log10(strehl);

	var sig = n_exp * tint * Math.pow(10, (0.4 * (m_zero - mag)));
	var noise = Math.sqrt((n_exp * Math.pow(r_noise, 2) * n_pix[filter]) + (n_pix[filter] * bg * n_exp * tint) + sig);

	var snr_div = document.getElementById("SNR_div");
	var snr = sig / noise;
	snr_div.innerHTML = "<h3>SNR = " + snr.toFixed(1).toString() + "</h3>";
	var total_signal_div = document.getElementById("N_obj_div");
	var signal = sig / gain;
	total_signal_div.innerHTML = "Total signal = " + signal.toFixed(1).toString() + " DN";
	var aperture_area_div = document.getElementById("npix_div");
	var ap = n_pix[filter];
	aperture_area_div.innerHTML = "Aperture area = " + ap.toFixed(1).toString() + " pix";
	var total_noise_div = document.getElementById("noise_div");
	var totn = noise / gain;
	total_noise_div.innerHTML = "Total noise = " + totn.toFixed(1).toString() + " DN";
	var bg_per_frame_div = document.getElementById("sky_bkg_div");
	var bgf = bg * tint / gain;
	bg_per_frame_div.innerHTML = "Background per frame = " + bgf.toFixed(1).toString() + " DN";

    return [snr, signal, ap, totn, bgf];

}


//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
// Main function to do calculation
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

function doCalc() {

    // Filter wavelengths (microns)
    var J_nirc2 = [1.166, 1.330];
    var H_nirc2 = [1.485, 1.781];
    var K_nirc2 = [2.028, 2.364];
    var Kp_nirc2 = [1.948, 2.299];
    var Lp_nirc2 = [3.426, 4.126];
    var Ms_nirc2 = [4.549, 4.790];

    var dI_J = 1.330 - 1.166;
    var dI_H = 1.781 - 1.485;
    var dI_K = 2.364 - 2.028;
    var dI_Kp = 2.299 - 1.948;
    var dI_Lp = 4.126 - 3.426;
    var dI_Ms = 4.790 - 4.549;

    // photometric zeropoints (Note: This is for Strehl = 1!)
    var z_J = 25.35;
    var z_H = 25.44;
    var z_K = 24.63;
    var z_Kp = 24.74;
    var z_Lp = 23.2;
    var z_Ms = 21.2;

    // sky background (mag./sq. arcsec)
    var S_J = 14.9;
    var S_H = 13.6;
    var S_K = 12.6;
    var S_Kp = 12.2;
    var S_Lp = 2.91;
    var S_Ms = -0.12;

    // just let efficiency be one for now 
    // The detector QE is ~ 80% at 1.7 microns. https://www2.keck.hawaii.edu/koa/public/nirc2/nirc2_data_form.html
    // var Eff = .8;

    // Keck primary mirror surface area (from Wikipedia page)
    var SA = 75.76; // units = [m^2]

    // number of pixels
    var npix = 100;

    // read out noise and dark current noise for Keck
    var readout_noise_keck=38;
    var dark_current_keck=.1;

    var Mag;
    var filter;
    var filter_text;

    var presetButton = document.getElementById("usePreset");
    if (presetButton.value=="Don't Use Preset Target") {
        // var Mag = parseFloat(document.getElementById("targetFilter").value);
        Mag = parseFloat($("#targetFilter :selected").val());
        document.getElementById("Mag").value = Mag;
        filter_text = $("#targetFilter :selected").attr('name');
        document.getElementById("filter").value = filter_text;
    }
        else {
            Mag = parseFloat(document.getElementById("Mag").value);
            filter = document.getElementById("filter"); 
            filter_text = filter.options[filter.selectedIndex].value;
        }  
    

    // Form inputs
    var polFrac = parseFloat(document.getElementById("polFrac").value)/100.;
    var minDetection = parseFloat(document.getElementById("minDetection").value);
    var ExpTime = parseFloat(document.getElementById("ExpTime").value); 
    var Ndither = parseInt(document.getElementById("Ndither").value); 
    var strehl = parseFloat(document.getElementById("strehl").value); 
    var coadds = parseInt(document.getElementById("coadds").value); 
    var repeats = parseInt(document.getElementById("repeats").value); 
    
    var camera = document.getElementById("camera");  
    var nreads = parseInt(document.getElementById("nreads").value); 
    var array_size = parseFloat(document.getElementById("array_size").value); 
    var aomode = parseInt(document.getElementById("aomode").value); 
    var laser_motion = parseInt(document.getElementById("laser_motion").value);

    var camera_text = camera.options[camera.selectedIndex].value;

    var n_exp = coadds * Ndither * repeats;
    
    // arcseconds per pixel for different cameras
    var arcsec_per_px;

    if (camera_text == 'Narrow') {
        arcsec_per_px = .01;
    }   else if (camera_text == 'Medium') {
        arcsec_per_px = .02;
    }   else if (camera_text == 'Wide') {
        arcsec_per_px = .04;
    }

    // Assigns variables based on filter
    if (filter_text == 'J') {
        var dI = dI_J;
        var zeropoint = z_J;
        var Sky_background = S_J;
    }   else if (filter_text == 'H') {
        var dI = dI_H;
        var zeropoint = z_H;
        var Sky_background = S_H;
    }   else if (filter_text == 'K') {
        var dI = dI_K;
        var zeropoint = z_K;
        var Sky_background = S_K;
    }   else if (filter_text == 'Kp') {
        var dI = dI_Kp;
        var zeropoint = z_Kp;
        var Sky_background = S_Kp;
    }   else if (filter_text == 'Lp') {
        var dI = dI_Lp;
        var zeropoint = z_Lp;
        var Sky_background = S_Lp;
    }   else if (filter_text == 'Ms') {
        var dI = dI_Ms;
        var zeropoint = z_Ms;
        var Sky_background = S_Ms;
    }


    // set samp_mode based on number of reads
    var samp_mode;
    if (nreads > 2) samp_mode = 3;
    	else samp_mode = 2;
    

    // read in html div variables
    var snr_div = document.getElementById("SNR_div");
    var N_obj_div = document.getElementById("N_obj_div");
    var npix_div = document.getElementById("npix_div");
    var noise_div = document.getElementById("noise_div");
    var sky_bkg_div = document.getElementById("sky_bkg_div");

    var Eff_div = document.getElementById("Eff_div");
    var tel_overhead_div = document.getElementById("tel_overhead_div");
    var nirc2_overhead_div = document.getElementById("nirc2_overhead_div");
    var total_int_div = document.getElementById("total_int_div");
    var total_elapsed_div = document.getElementById("total_elapsed_div");

    // Plot elements
    const spectraClearEls  = getElems('spectraClear', 40);
    const spectraCloudyEls = getElems('spectraCloudy', 40);
    const contrastEls      = getElems('contrast', 20);
    const snrEls           = getElems('snr', 8);
    const polFracEls       = getElems('polFrac', 8);
    const minExpTimeEls    = getElems('minExpTime', 8);

    // Calculate SNR and efficiency. These functions output arrays containing the different output elements. (ie the variables SNR and Eff should be arrays)
    var SNR = nirc2_s2n(Mag, filter_text, camera_text, n_exp, ExpTime, strehl, nreads);
    var Eff = n2_eff(ExpTime, coadds, repeats, samp_mode, nreads, array_size, aomode, Ndither, laser_motion);
    
    var totalIntTime = Eff[3];
    var signalPerUnitTime = SNR[1]/totalIntTime;
    var noisePerUnitTime = Math.sqrt((SNR[3]**2)/totalIntTime)                           

    // Calculate SNR as function of ExpTime for plotting purposes
    var snrList = [];
    var ExpTimeList = [];
    var polFracList = [];

    var i;
    for (i = 0; i < 9; i++) {
        var nirc2_output = nirc2_s2n(Mag, filter_text, camera_text, n_exp, ExpTime*i/4, strehl, nreads);

        snrList.push(nirc2_output[0]);
        ExpTimeList.push(totalIntTime*i/4);
        polFracList.push(polFrac*(i+1)/4);
    }

    // set the values from the SNR and polarization fraction lists
    setValuesFrom(snrList,      1, snrEls);
    setValuesFrom(polFracList,  1, polFracEls);

    // Min exposure times: compute in a loop instead of 8 separate lines
    const minExpValues = polFracList.slice(0, 8).map((pf) => {
        const A = -Math.pow(minDetection / pf, 2) * signalPerUnitTime;
        const B = Math.pow(minDetection / pf, 2) - 4 * (-1 * signalPerUnitTime ** 2) * (minDetection * noisePerUnitTime / pf);
        const denom = 2 * (-1 * signalPerUnitTime ** 2);
        return (A + Math.sqrt(B)) / denom; // your quadratic solution
    });
    setValues(minExpTimeEls, minExpValues);

    // Fill spectra inputs
    setValues(spectraClearEls,  spectraClear.slice(0, spectraClearEls.length));
    setValues(spectraCloudyEls, spectraCloudy.slice(0, spectraCloudyEls.length));

    // Save to state instead of writing to DOM inputs
    G.totalInt      = Eff[3];
    G.ExpTimeList   = ExpTimeList;
    G.snrList       = snrList.slice();           // 0..8
    G.polFracList   = polFracList.slice();       // 0..8
    G.minExpValues  = minExpValues.slice(0, 8);  // ensure 8
    G.contrastList  = Array.from({length: 20}, (_, i) =>
    Math.sqrt(moffat(SNR[1], i + 1, alpha, beta))
    );

    // If files were selected, readers already populated G.spectraClear/Cloudy

    // Update the div variables to display in html 
    SNR_div.innerHTML            = `<h2>SNR = ${SNR[0].toFixed(1)}</h2>`;
    N_obj_div.innerHTML          = `Total signal = ${SNR[1].toFixed(1)} DN`;
    npix_div.innerHTML           = `Aperture area = ${SNR[2].toFixed(1)} pix`;
    noise_div.innerHTML          = `Total noise = ${SNR[3].toFixed(1)} DN`;
    sky_bkg_div.innerHTML        = `Background per frame = ${SNR[4].toFixed(1)} DN`;

    Eff_div.innerHTML            = `<h2>Efficiency = ${Eff[0].toFixed(1)}</h2>`;
    tel_overhead_div.innerHTML   = `AO/Tel overhead = ${Eff[1].toFixed(1)} sec`;
    nirc2_overhead_div.innerHTML = `NIRC2 overhead = ${Eff[2].toFixed(1)} sec`;
    total_int_div.innerHTML      = `Total integration = ${Eff[3].toFixed(1)} sec`;
    total_elapsed_div.innerHTML  = `Total elapsed time = ${Eff[4].toFixed(1)} sec`;

    // Plot from state
    plot_snr_from_state();
    plot_pol_snr_from_state();
    plot_spectra_from_state();
    plot_contrast_from_state();
}

