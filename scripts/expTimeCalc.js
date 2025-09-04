// The moffat distribution describes the photon noise from the speckles, not the speckle noise which we've assumed has been perfectly canceled out by 
// our differential subtraction of two polametric observations (which is why we can model it as a simple sqrt(N) photon noise). See the strehl info from Becky
// for proper scaling of this photon noise as a function of filter. This is the value that we then scale by the 20% of the strehl ratio. This photon noise is 
// just another noise contribution term to the SNR measurement, so we don't need to have a separate plot for it. We'll forget about contrast for now. 

// This is the code to preload the images
var imageList = Array();
for (var i = 1; i <= 3; i++) {
    imageList[i] = new Image(200, 200);
    imageList[i].src = "/home/mmnguyen/Research/ExpTimeCalc/etc_pic" + i + ".png";
}


function switchImage() {
    var selectedImage = document.myForm.instrument.options[document.myForm.instrument.selectedIndex].value;
    document.myImage.src = imageList[selectedImage].src;
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


var spectraClear;
var spectraCloudy; 

document.getElementById('spectraClear').addEventListener('change', function selectedFileChanged() {
    if (this.files.length === 0) {
        console.log('No file selected.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function fileReadCompleted() {
        // when the reader is done, the content is in reader.result.
        spectraClear = reader.result.split(/\r?\n/);
        console.log(reader.result);
    };
    reader.readAsText(this.files[0]);
});

document.getElementById('spectraCloudy').addEventListener('change', function selectedFileChanged() {
    if (this.files.length === 0) {
        console.log('No file selected.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function fileReadCompleted() {
        // when the reader is done, the content is in reader.result.
        spectraCloudy = reader.result.split(/\r?\n/);
        console.log(reader.result);
    };
    reader.readAsText(this.files[0]);
});



$(document).ready(function() {
        
    $("#Target").change(function() {
        var val = $(this).val();
        if (val == "HR 8799 b") {
            $("#targetFilter").html("<option name='J' value=16.52> J </option><option name='H' value=15.08> H </option><option name='K' value=14.05> K </option><option name='Lp' value=12.68> L' </option><option name='Ms' value=13.07> M' </option>");
        } else if (val == "HR 8799 c") {
            $("#targetFilter").html("<option name='J' value=14.65> J </option><option name='H' value=14.18> H </option><option name='K' value=13.13> K </option><option name='Lp' value=11.83> L' </option><option name='Ms' value=12.05> M' </option>");

        } else if (val == "HR 8799 d") {
            $("#targetFilter").html("<option name='J' value=15.26> J </option><option name='H' value=14.23> H </option><option name='K' value=13.11> K </option><option name='Lp' value=11.50> L' </option><option name='Ms' value=11.67> M' </option>");

        } else if (val == "HR 8799 e") {
            $("#targetFilter").html("<option name='H' value=13.88> H </option><option name='K' value=12.89> K </option><option name='Lp' value=11.61> L' </option><option name='Ms' value=10.09> M' </option>");

        } else if (val == "kappa And b") {
            $("#targetFilter").html("<option name='J' value=12.7> J </option><option name='H' value=11.7> H </option><option name='K' value=11.0> K </option><option name='Lp' value=9.54> L' </option>");
        
        } else if (val == "1RXJ 1609 B") {
            $("#targetFilter").html("<option name='J' value=12.09> J </option><option name='H' value=11.06> H </option><option name='K' value=10.38> K </option><option name='Lp' value=8.99> L' </option>");

        } else if (val == "GSC 06214 B") {
            $("#targetFilter").html("<option name='J' value=10.43> J </option><option name='H' value=9.74> H </option><option name='K' value=9.14> K </option><option name='Lp' value=7.94> L' </option><option name='Ms' value=7.94> M' </option>");

        } else if (val == "USco CTIO108 B") {
            $("#targetFilter").html("<option name='J' value=10.72> J </option><option name='H' value=9.94> H </option><option name='K' value=9.30> K </option>");

        } else if (val == "HIP 78530 B") {
            $("#targetFilter").html("<option name='J' value=9.25> J </option><option name='H' value=8.58> H </option><option name='K' value=8.36> K </option><option name='Lp' value=7.99> L' </option>");

        } else if (val == "2M 1207 B") {
            $("#targetFilter").html("<option name='J' value=16.40> J </option><option name='H' value=14.49> H </option><option name='K' value=13.31> K </option><option name='Lp' value=11.68> L' </option>");

        } else if (val == "2M 1207 A") {
            $("#targetFilter").html("<option name='J' value=9.35> J </option><option name='H' value=8.74> H </option><option name='K' value=8.30> K </option><option name='Lp' value=7.73> L' </option>");

        } else if (val == "TWA 5 B") {
            $("#targetFilter").html("<option name='J' value=9.1> J </option><option name='H' value=8.65> H </option><option name='K' value=7.91> K </option>");

        } else if (val == "HR 7329 B") {
            $("#targetFilter").html("<option name='J' value=8.64> J </option><option name='H' value=8.33> H </option><option name='K' value=8.18> K </option><option name='Lp' value=7.69> L' </option>");

        } else if (val == "PZ Tel B") {
            $("#targetFilter").html("<option name='J' value=8.70> J </option><option name='H' value=8.31> H </option><option name='K' value=7.86> K </option>");

        } else if (val == "2M0103AB B") {
            $("#targetFilter").html("<option name='J' value=12.1> J </option><option name='H' value=10.9> H </option><option name='K' value=10.3> K </option><option name='Lp' value=9.3> L' </option>");

        } else if (val == "AB Pic B") {
            $("#targetFilter").html("<option name='J' value=12.80> J </option><option name='H' value=11.31> H </option><option name='K' value=10.76> K </option><option name='Lp' value=9.9> L' </option>");

        } else if (val == "Luhman 16 B") {
            $("#targetFilter").html("<option name='J' value=14.69> J </option><option name='H' value=13.86> H </option><option name='K' value=13.20> K </option>");

        } else if (val == "Luhman 16 A") {
            $("#targetFilter").html("<option name='J' value=15.00> J </option><option name='H' value=13.84> H </option><option name='K' value=12.91> K </option>");

        } else if (val == "CD-35 2722 B") {
            $("#targetFilter").html("<option name='J' value=11.99> J </option><option name='H' value=11.14> H </option><option name='K' value=10.37> K </option>");

        }
    });

});


//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

var beta = 4.765;
var FWHM = 2.9207*beta;
var alpha = FWHM/(2*Math.sqrt(2**(1/beta) - 1));


function moffat(I_0, r, alpha, beta) {
    var Intensity = I_0 * (1 + (r / alpha)**2)**(-1 * beta);

    return Intensity;
}


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
////////////  Official NIRC2 functions  //////////////
//////////////////////////////////////////////////////

function tmin(x, y, samp_mode, n_reads)
{
	samp_rate = 200;
	overhead = 6.001;
	y = y + 8;
	ticks = 5000000/(samp_rate*1000);
	n_pause = ticks - 8;
	start_time = 240 * (1324 - y);
	rows_time = 25 * y * (n_pause * (8 + x / 4) + (864 + 1.25 * x));
	// Add overhead, scale from nanoseconds
	min_time = start_time + rows_time;
	min_time = (1+overhead/100)*min_time/1000000000;
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

    var snr1 = document.getElementById("snr1");
    var snr2 = document.getElementById("snr2");
    var snr3 = document.getElementById("snr3");
    var snr4 = document.getElementById("snr4");
    var snr5 = document.getElementById("snr5");
    var snr6 = document.getElementById("snr6");
    var snr7 = document.getElementById("snr7");
    var snr8 = document.getElementById("snr8");

    var polFrac1 = document.getElementById("polFrac1");
    var polFrac2 = document.getElementById("polFrac2");
    var polFrac3 = document.getElementById("polFrac3");
    var polFrac4 = document.getElementById("polFrac4");
    var polFrac5 = document.getElementById("polFrac5");
    var polFrac6 = document.getElementById("polFrac6");
    var polFrac7 = document.getElementById("polFrac7");
    var polFrac8 = document.getElementById("polFrac8");

    var minExpTime1 = document.getElementById("minExpTime1");
    var minExpTime2 = document.getElementById("minExpTime2");
    var minExpTime3 = document.getElementById("minExpTime3");
    var minExpTime4 = document.getElementById("minExpTime4");
    var minExpTime5 = document.getElementById("minExpTime5");
    var minExpTime6 = document.getElementById("minExpTime6");
    var minExpTime7 = document.getElementById("minExpTime7");
    var minExpTime8 = document.getElementById("minExpTime8");

    var totalInt = document.getElementById("totalInt");

    var spectraClear1 = document.getElementById("spectraClear1");
    var spectraClear2 = document.getElementById("spectraClear2");
    var spectraClear3 = document.getElementById("spectraClear3");
    var spectraClear4 = document.getElementById("spectraClear4");
    var spectraClear5 = document.getElementById("spectraClear5");
    var spectraClear6 = document.getElementById("spectraClear6");
    var spectraClear7 = document.getElementById("spectraClear7");
    var spectraClear8 = document.getElementById("spectraClear8");
    var spectraClear9 = document.getElementById("spectraClear9");
    var spectraClear10 = document.getElementById("spectraClear10");
    var spectraClear11 = document.getElementById("spectraClear11");
    var spectraClear12 = document.getElementById("spectraClear12");
    var spectraClear13 = document.getElementById("spectraClear13");
    var spectraClear14 = document.getElementById("spectraClear14");
    var spectraClear15 = document.getElementById("spectraClear15");
    var spectraClear16 = document.getElementById("spectraClear16");
    var spectraClear17 = document.getElementById("spectraClear17");
    var spectraClear18 = document.getElementById("spectraClear18");
    var spectraClear19 = document.getElementById("spectraClear19");
    var spectraClear20 = document.getElementById("spectraClear20");
    var spectraClear21 = document.getElementById("spectraClear21");
    var spectraClear22 = document.getElementById("spectraClear22");
    var spectraClear23 = document.getElementById("spectraClear23");
    var spectraClear24 = document.getElementById("spectraClear24");
    var spectraClear25 = document.getElementById("spectraClear25");
    var spectraClear26 = document.getElementById("spectraClear26");
    var spectraClear27 = document.getElementById("spectraClear27");
    var spectraClear28 = document.getElementById("spectraClear28");
    var spectraClear29 = document.getElementById("spectraClear29");
    var spectraClear30 = document.getElementById("spectraClear30");
    var spectraClear31 = document.getElementById("spectraClear31");
    var spectraClear32 = document.getElementById("spectraClear32");
    var spectraClear33 = document.getElementById("spectraClear33");
    var spectraClear34 = document.getElementById("spectraClear34");
    var spectraClear35 = document.getElementById("spectraClear35");
    var spectraClear36 = document.getElementById("spectraClear36");
    var spectraClear37 = document.getElementById("spectraClear37");
    var spectraClear38 = document.getElementById("spectraClear38");
    var spectraClear39 = document.getElementById("spectraClear39");
    var spectraClear40 = document.getElementById("spectraClear40");

    var spectraCloudy1 = document.getElementById("spectraCloudy1");
    var spectraCloudy2 = document.getElementById("spectraCloudy2");
    var spectraCloudy3 = document.getElementById("spectraCloudy3");
    var spectraCloudy4 = document.getElementById("spectraCloudy4");
    var spectraCloudy5 = document.getElementById("spectraCloudy5");
    var spectraCloudy6 = document.getElementById("spectraCloudy6");
    var spectraCloudy7 = document.getElementById("spectraCloudy7");
    var spectraCloudy8 = document.getElementById("spectraCloudy8");
    var spectraCloudy9 = document.getElementById("spectraCloudy9");
    var spectraCloudy10 = document.getElementById("spectraCloudy10");
    var spectraCloudy11 = document.getElementById("spectraCloudy11");
    var spectraCloudy12 = document.getElementById("spectraCloudy12");
    var spectraCloudy13 = document.getElementById("spectraCloudy13");
    var spectraCloudy14 = document.getElementById("spectraCloudy14");
    var spectraCloudy15 = document.getElementById("spectraCloudy15");
    var spectraCloudy16 = document.getElementById("spectraCloudy16");
    var spectraCloudy17 = document.getElementById("spectraCloudy17");
    var spectraCloudy18 = document.getElementById("spectraCloudy18");
    var spectraCloudy19 = document.getElementById("spectraCloudy19");
    var spectraCloudy20 = document.getElementById("spectraCloudy20");
    var spectraCloudy21 = document.getElementById("spectraCloudy21");
    var spectraCloudy22 = document.getElementById("spectraCloudy22");
    var spectraCloudy23 = document.getElementById("spectraCloudy23");
    var spectraCloudy24 = document.getElementById("spectraCloudy24");
    var spectraCloudy25 = document.getElementById("spectraCloudy25");
    var spectraCloudy26 = document.getElementById("spectraCloudy26");
    var spectraCloudy27 = document.getElementById("spectraCloudy27");
    var spectraCloudy28 = document.getElementById("spectraCloudy28");
    var spectraCloudy29 = document.getElementById("spectraCloudy29");
    var spectraCloudy30 = document.getElementById("spectraCloudy30");
    var spectraCloudy31 = document.getElementById("spectraCloudy31");
    var spectraCloudy32 = document.getElementById("spectraCloudy32");
    var spectraCloudy33 = document.getElementById("spectraCloudy33");
    var spectraCloudy34 = document.getElementById("spectraCloudy34");
    var spectraCloudy35 = document.getElementById("spectraCloudy35");
    var spectraCloudy36 = document.getElementById("spectraCloudy36");
    var spectraCloudy37 = document.getElementById("spectraCloudy37");
    var spectraCloudy38 = document.getElementById("spectraCloudy38");
    var spectraCloudy39 = document.getElementById("spectraCloudy39");
    var spectraCloudy40 = document.getElementById("spectraCloudy40");

    var contrast1 = document.getElementById("contrast1");
    var contrast2 = document.getElementById("contrast2");
    var contrast3 = document.getElementById("contrast3");
    var contrast4 = document.getElementById("contrast4");
    var contrast5 = document.getElementById("contrast5");
    var contrast6 = document.getElementById("contrast6");
    var contrast7 = document.getElementById("contrast7");
    var contrast8 = document.getElementById("contrast8");
    var contrast9 = document.getElementById("contrast9");
    var contrast10 = document.getElementById("contrast10");
    var contrast11 = document.getElementById("contrast11");
    var contrast12 = document.getElementById("contrast12");
    var contrast13 = document.getElementById("contrast13");
    var contrast14 = document.getElementById("contrast14");
    var contrast15 = document.getElementById("contrast15");
    var contrast16 = document.getElementById("contrast16");
    var contrast17 = document.getElementById("contrast17");
    var contrast18 = document.getElementById("contrast18");
    var contrast19 = document.getElementById("contrast19");
    var contrast20 = document.getElementById("contrast20");


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
    

    // Update the div variables to display in html 
	snr_div.innerHTML = "<h2>SNR = " + SNR[0].toFixed(1).toString() + "</h2>";
	N_obj_div.innerHTML = "Total signal = " + SNR[1].toFixed(1).toString() + " DN";
	npix_div.innerHTML = "Aperture area = " + SNR[2].toFixed(1).toString() + " pix";
	noise_div.innerHTML = "Total noise = " + SNR[3].toFixed(1).toString() + " DN";
	sky_bkg_div.innerHTML = "Background per frame = " + SNR[4].toFixed(1).toString() + " DN";

    Eff_div.innerHTML = "<h2>Efficiency = " + Eff[0].toFixed(1).toString() + "</h2>";
    tel_overhead_div.innerHTML = "AO/Tel overhead = " + Eff[1].toFixed(1).toString() + " sec";
    nirc2_overhead_div.innerHTML = "NIRC2 overhead = " + Eff[2].toFixed(1).toString() + " sec";
    total_int_div.innerHTML = "Total integration = " + Eff[3].toFixed(1).toString() + " sec";
    total_elapsed_div.innerHTML = "Total elapsed time = " + Eff[4].toFixed(1).toString() + " sec";

    snr1.value = snrList[1];
    snr2.value = snrList[2];
    snr3.value = snrList[3];
    snr4.value = snrList[4];
    snr5.value = snrList[5];
    snr6.value = snrList[6];
    snr7.value = snrList[7];
    snr8.value = snrList[8];

    polFrac1.value = polFracList[1];
    polFrac2.value = polFracList[2];
    polFrac3.value = polFracList[3];
    polFrac4.value = polFracList[4];
    polFrac5.value = polFracList[5];
    polFrac6.value = polFracList[6];
    polFrac7.value = polFracList[7];
    polFrac8.value = polFracList[8];

    // Older simplistic formula (no noise terms)
    // minExpTime1.value = ((minDetection/polFracList[0])**2)/signalPerUnitTime;

    minExpTime1.value = ((-((minDetection/polFracList[0])**2)*signalPerUnitTime) + Math.sqrt(((minDetection/polFracList[0])**2) - 4*(-1*signalPerUnitTime**2)*(minDetection*noisePerUnitTime/polFracList[0])))/(2*(-1*signalPerUnitTime**2))
    minExpTime2.value = ((-((minDetection/polFracList[1])**2)*signalPerUnitTime) + Math.sqrt(((minDetection/polFracList[1])**2) - 4*(-1*signalPerUnitTime**2)*(minDetection*noisePerUnitTime/polFracList[1])))/(2*(-1*signalPerUnitTime**2))
    minExpTime3.value = ((-((minDetection/polFracList[2])**2)*signalPerUnitTime) + Math.sqrt(((minDetection/polFracList[2])**2) - 4*(-1*signalPerUnitTime**2)*(minDetection*noisePerUnitTime/polFracList[2])))/(2*(-1*signalPerUnitTime**2))
    minExpTime4.value = ((-((minDetection/polFracList[3])**2)*signalPerUnitTime) + Math.sqrt(((minDetection/polFracList[3])**2) - 4*(-1*signalPerUnitTime**2)*(minDetection*noisePerUnitTime/polFracList[3])))/(2*(-1*signalPerUnitTime**2))
    minExpTime5.value = ((-((minDetection/polFracList[4])**2)*signalPerUnitTime) + Math.sqrt(((minDetection/polFracList[4])**2) - 4*(-1*signalPerUnitTime**2)*(minDetection*noisePerUnitTime/polFracList[4])))/(2*(-1*signalPerUnitTime**2))
    minExpTime6.value = ((-((minDetection/polFracList[5])**2)*signalPerUnitTime) + Math.sqrt(((minDetection/polFracList[5])**2) - 4*(-1*signalPerUnitTime**2)*(minDetection*noisePerUnitTime/polFracList[5])))/(2*(-1*signalPerUnitTime**2))
    minExpTime7.value = ((-((minDetection/polFracList[6])**2)*signalPerUnitTime) + Math.sqrt(((minDetection/polFracList[6])**2) - 4*(-1*signalPerUnitTime**2)*(minDetection*noisePerUnitTime/polFracList[6])))/(2*(-1*signalPerUnitTime**2))
    minExpTime8.value = ((-((minDetection/polFracList[7])**2)*signalPerUnitTime) + Math.sqrt(((minDetection/polFracList[7])**2) - 4*(-1*signalPerUnitTime**2)*(minDetection*noisePerUnitTime/polFracList[7])))/(2*(-1*signalPerUnitTime**2))

    totalInt.value = totalIntTime;

    spectraClear1.value = spectraClear[0];
    spectraClear2.value = spectraClear[1];
    spectraClear3.value = spectraClear[2];
    spectraClear4.value = spectraClear[3];
    spectraClear5.value = spectraClear[4];
    spectraClear6.value = spectraClear[5];
    spectraClear7.value = spectraClear[6];
    spectraClear8.value = spectraClear[7];
    spectraClear9.value = spectraClear[8];
    spectraClear10.value = spectraClear[9];
    spectraClear11.value = spectraClear[10];
    spectraClear12.value = spectraClear[11];
    spectraClear13.value = spectraClear[12];
    spectraClear14.value = spectraClear[13];
    spectraClear15.value = spectraClear[14];
    spectraClear16.value = spectraClear[15];
    spectraClear17.value = spectraClear[16];
    spectraClear18.value = spectraClear[17];
    spectraClear19.value = spectraClear[18];
    spectraClear20.value = spectraClear[19];
    spectraClear21.value = spectraClear[20];
    spectraClear22.value = spectraClear[21];
    spectraClear23.value = spectraClear[22];
    spectraClear24.value = spectraClear[23];
    spectraClear25.value = spectraClear[24];
    spectraClear26.value = spectraClear[25];
    spectraClear27.value = spectraClear[26];
    spectraClear28.value = spectraClear[27];
    spectraClear29.value = spectraClear[28];
    spectraClear30.value = spectraClear[29];
    spectraClear31.value = spectraClear[30];
    spectraClear32.value = spectraClear[31];
    spectraClear33.value = spectraClear[32];
    spectraClear34.value = spectraClear[33];
    spectraClear35.value = spectraClear[34];
    spectraClear36.value = spectraClear[35];
    spectraClear37.value = spectraClear[36];
    spectraClear38.value = spectraClear[37];
    spectraClear39.value = spectraClear[38];
    spectraClear40.value = spectraClear[39];


    spectraCloudy1.value = spectraCloudy[0];
    spectraCloudy2.value = spectraCloudy[1];
    spectraCloudy3.value = spectraCloudy[2];
    spectraCloudy4.value = spectraCloudy[3];
    spectraCloudy5.value = spectraCloudy[4];
    spectraCloudy6.value = spectraCloudy[5];
    spectraCloudy7.value = spectraCloudy[6];
    spectraCloudy8.value = spectraCloudy[7];
    spectraCloudy9.value = spectraCloudy[8];
    spectraCloudy10.value = spectraCloudy[9];
    spectraCloudy11.value = spectraCloudy[10];
    spectraCloudy12.value = spectraCloudy[11];
    spectraCloudy13.value = spectraCloudy[12];
    spectraCloudy14.value = spectraCloudy[13];
    spectraCloudy15.value = spectraCloudy[14];
    spectraCloudy16.value = spectraCloudy[15];
    spectraCloudy17.value = spectraCloudy[16];
    spectraCloudy18.value = spectraCloudy[17];
    spectraCloudy19.value = spectraCloudy[18];
    spectraCloudy20.value = spectraCloudy[19];
    spectraCloudy21.value = spectraCloudy[20];
    spectraCloudy22.value = spectraCloudy[21];
    spectraCloudy23.value = spectraCloudy[22];
    spectraCloudy24.value = spectraCloudy[23];
    spectraCloudy25.value = spectraCloudy[24];
    spectraCloudy26.value = spectraCloudy[25];
    spectraCloudy27.value = spectraCloudy[26];
    spectraCloudy28.value = spectraCloudy[27];
    spectraCloudy29.value = spectraCloudy[28];
    spectraCloudy30.value = spectraCloudy[29];
    spectraCloudy31.value = spectraCloudy[30];
    spectraCloudy32.value = spectraCloudy[31];
    spectraCloudy33.value = spectraCloudy[32];
    spectraCloudy34.value = spectraCloudy[33];
    spectraCloudy35.value = spectraCloudy[34];
    spectraCloudy36.value = spectraCloudy[35];
    spectraCloudy37.value = spectraCloudy[36];
    spectraCloudy38.value = spectraCloudy[37];
    spectraCloudy39.value = spectraCloudy[38];
    spectraCloudy40.value = spectraCloudy[39];

    contrast1.value = Math.sqrt(moffat(SNR[1], 1, alpha, beta));
    contrast2.value = Math.sqrt(moffat(SNR[1], 2, alpha, beta));
    contrast3.value = Math.sqrt(moffat(SNR[1], 3, alpha, beta));
    contrast4.value = Math.sqrt(moffat(SNR[1], 4, alpha, beta));
    contrast5.value = Math.sqrt(moffat(SNR[1], 5, alpha, beta));
    contrast6.value = Math.sqrt(moffat(SNR[1], 6, alpha, beta));
    contrast7.value = Math.sqrt(moffat(SNR[1], 7, alpha, beta));
    contrast8.value = Math.sqrt(moffat(SNR[1], 8, alpha, beta));
    contrast9.value = Math.sqrt(moffat(SNR[1], 9, alpha, beta));
    contrast10.value = Math.sqrt(moffat(SNR[1], 10, alpha, beta));
    contrast11.value = Math.sqrt(moffat(SNR[1], 11, alpha, beta));
    contrast12.value = Math.sqrt(moffat(SNR[1], 12, alpha, beta));
    contrast13.value = Math.sqrt(moffat(SNR[1], 13, alpha, beta));
    contrast14.value = Math.sqrt(moffat(SNR[1], 14, alpha, beta));
    contrast15.value = Math.sqrt(moffat(SNR[1], 15, alpha, beta));
    contrast16.value = Math.sqrt(moffat(SNR[1], 16, alpha, beta));
    contrast17.value = Math.sqrt(moffat(SNR[1], 17, alpha, beta));
    contrast18.value = Math.sqrt(moffat(SNR[1], 18, alpha, beta));
    contrast19.value = Math.sqrt(moffat(SNR[1], 19, alpha, beta));
    contrast20.value = Math.sqrt(moffat(SNR[1], 20, alpha, beta));
    
}


