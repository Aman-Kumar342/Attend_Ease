const QRCode = require('qrcode');

// Generate QR code for booking
const generateBookingQR = async (bookingId) => {
  try {
    // Create QR data object
    const qrData = {
      type: 'booking',
      bookingId: bookingId,
      timestamp: new Date().toISOString(),
      action: 'checkin' // or 'checkout'
    };

    // Convert to string
    const qrString = JSON.stringify(qrData);

    // Generate QR code as base64 data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });

    return {
      qrCode: qrCodeDataURL,
      qrData: qrString
    };

  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Generate QR code as SVG string
const generateBookingQRSVG = async (bookingId) => {
  try {
    const qrData = {
      type: 'booking',
      bookingId: bookingId,
      timestamp: new Date().toISOString()
    };

    const qrString = JSON.stringify(qrData);
    const qrCodeSVG = await QRCode.toString(qrString, { type: 'svg' });

    return {
      qrCode: qrCodeSVG,
      qrData: qrString
    };

  } catch (error) {
    console.error('Error generating QR SVG:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Parse QR code data
const parseQRData = (qrString) => {
  try {
    const qrData = JSON.parse(qrString);
    
    // Validate QR data structure
    if (!qrData.type || !qrData.bookingId) {
      throw new Error('Invalid QR code format');
    }

    if (qrData.type !== 'booking') {
      throw new Error('QR code is not for booking');
    }

    return qrData;

  } catch (error) {
    throw new Error('Invalid QR code data');
  }
};

module.exports = {
  generateBookingQR,
  generateBookingQRSVG,
  parseQRData
};
